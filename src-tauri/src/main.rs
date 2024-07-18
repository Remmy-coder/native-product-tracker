// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod models;
mod schema;
mod services;

use app::establish_connection;
use diesel::PgConnection;
use models::NewProduct;
use services::{
    client_service, product_service,
    session_management_service::{authenticate_client, Session},
};
use std::sync::Mutex;
use uuid::Uuid;

struct AppState {
    conn: Mutex<PgConnection>,
}

#[tauri::command]
fn create_client(state: tauri::State<AppState>) -> Result<serde_json::Value, String> {
    let mut conn = state.conn.lock().unwrap();
    match client_service::create_client(&mut *conn) {
        Ok(client) => Ok(serde_json::json!({ "client": client })),
        Err(err) => Err(err.error),
    }
}

#[tauri::command]
fn sign_in() -> Result<serde_json::Value, String> {
    match authenticate_client() {
        Ok(session) => Ok(serde_json::json!({
            "token": session.token,
            "client_id": session.client_id,
            "expires_at": session.expires_at,
        })),
        Err(err) => Err(err.to_string()),
    }
}

#[tauri::command]
fn validate_session(session: Session) -> bool {
    services::session_management_service::validate_session(&session)
}

#[tauri::command]
fn create_product(
    state: tauri::State<AppState>,
    client_id: Uuid,
    product_name: String,
    total_quantity: i32,
    total_shipper_boxes: i32,
) -> Result<serde_json::Value, String> {
    let mut conn = state.conn.lock().unwrap();
    let new_product = NewProduct {
        client_id,
        product_name: &product_name,
        total_quantity,
        total_shipper_boxes,
    };
    match product_service::create_product(&mut *conn, new_product) {
        Ok(product) => Ok(serde_json::json!({ "product": product })),
        Err(err) => Err(err.error),
    }
}

#[tauri::command]
fn get_product(
    state: tauri::State<AppState>,
    product_id: Uuid,
) -> Result<serde_json::Value, String> {
    let mut conn = state.conn.lock().unwrap();
    match product_service::get_product(&mut *conn, product_id) {
        Ok(product) => Ok(serde_json::json!({ "product": product })),
        Err(err) => Err(err.error),
    }
}

#[tauri::command]
fn get_all_products(state: tauri::State<AppState>) -> Result<serde_json::Value, String> {
    let mut conn = state.conn.lock().unwrap();
    match product_service::get_all_products(&mut *conn) {
        Ok(products) => Ok(serde_json::json!({ "products": products })),
        Err(err) => Err(err.error),
    }
}

#[tauri::command]
fn get_all_products_for_client(
    state: tauri::State<AppState>,
    client_id: Uuid,
) -> Result<serde_json::Value, String> {
    let mut conn = state.conn.lock().unwrap();
    match product_service::get_all_products_for_client(&mut *conn, client_id) {
        Ok(products) => Ok(serde_json::json!({ "products": products })),
        Err(err) => Err(err.error),
    }
}

fn main() {
    let state = AppState {
        conn: Mutex::new(establish_connection()),
    };

    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .setup(|_app| {
            // let stores = app.app_handle().state::<StoreCollection<Wry>>();
            // let app_data_dir = get_app_dir();
            // let store_dir = app_data_dir.join("store.bin");
            //
            // let _builder = with_store(app.app_handle().clone(), stores, store_dir, |store| {
            //     store.save()?;
            //
            //     Ok(())
            // });
            Ok(())
        })
        .manage(state)
        .invoke_handler(tauri::generate_handler![
            create_client,
            sign_in,
            validate_session,
            create_product,
            get_product,
            get_all_products,
            get_all_products_for_client
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
