// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod models;
mod schema;
mod services;

use app::establish_connection;
use chrono::NaiveDateTime;
use diesel::PgConnection;
use models::{NewBatchDetail, NewProduct, UpdateBatchDetail, UpdateProduct};
use services::{
    batch_details_service, client_service, product_service,
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
        Ok(products) => Ok(serde_json::json!({ "data": products })),
        Err(err) => Err(err.error),
    }
}

#[tauri::command]
fn update_product(
    state: tauri::State<AppState>,
    product_id: Uuid,
    product_name: Option<String>,
    total_quantity: Option<i32>,
    total_shipper_boxes: Option<i32>,
    updated_at: Option<NaiveDateTime>,
) -> Result<serde_json::Value, String> {
    let mut conn = state.conn.lock().unwrap();
    let product_data = UpdateProduct {
        product_name: product_name.as_deref(),
        total_quantity,
        total_shipper_boxes,
        updated_at,
    };
    match product_service::update_product(&mut *conn, product_id, product_data) {
        Ok(product) => Ok(serde_json::json!({"data": product})),
        Err(err) => Err(err.error),
    }
}

#[tauri::command]
fn delete_product(
    state: tauri::State<AppState>,
    product_id: Uuid,
) -> Result<serde_json::Value, String> {
    let mut conn = state.conn.lock().unwrap();
    match product_service::delete_product(&mut *conn, product_id) {
        Ok(rows) => Ok(serde_json::json!({ "deleted": rows })),
        Err(err) => Err(err.error),
    }
}

#[tauri::command]
fn create_batch_detail(
    state: tauri::State<AppState>,
    product_id: Uuid,
    batch_no: String,
    mfg_date: chrono::NaiveDate,
    exp_date: chrono::NaiveDate,
    boxes: i32,
    units_per_box: i32,
    units_per_pack: i32,
    packs_per_box: i32,
    packages_configuration: String,
    total_packs: i32,
) -> Result<serde_json::Value, String> {
    let mut conn = state.conn.lock().unwrap();
    let new_batch_detail = NewBatchDetail {
        product_id,
        batch_no: &batch_no,
        mfg_date,
        exp_date,
        boxes,
        units_per_box,
        units_per_pack,
        packs_per_box,
        packages_configuration: &packages_configuration,
        total_packs,
    };
    match batch_details_service::create_batch_detail(&mut *conn, new_batch_detail) {
        Ok(batch_detail) => Ok(serde_json::json!({ "batch_detail": batch_detail })),
        Err(err) => Err(err.error),
    }
}

#[tauri::command]
fn get_batch_detail(
    state: tauri::State<AppState>,
    batch_detail_id: Uuid,
) -> Result<serde_json::Value, String> {
    let mut conn = state.conn.lock().unwrap();
    match batch_details_service::get_batch_detail(&mut *conn, batch_detail_id) {
        Ok(batch_detail) => Ok(serde_json::json!({ "batch_detail": batch_detail })),
        Err(err) => Err(err.error),
    }
}

#[tauri::command]
fn update_batch_detail(
    state: tauri::State<AppState>,
    batch_detail_id: Uuid,
    batch_no: Option<String>,
    mfg_date: Option<chrono::NaiveDate>,
    exp_date: Option<chrono::NaiveDate>,
    boxes: Option<i32>,
    units_per_box: Option<i32>,
    units_per_pack: Option<i32>,
    packs_per_box: Option<i32>,
    packages_configuration: Option<String>,
    total_packs: Option<i32>,
) -> Result<serde_json::Value, String> {
    let mut conn = state.conn.lock().unwrap();
    let batch_detail_data = UpdateBatchDetail {
        batch_no: batch_no.as_deref(),
        mfg_date,
        exp_date,
        boxes,
        units_per_box,
        units_per_pack,
        packs_per_box,
        packages_configuration: packages_configuration.as_deref(),
        total_packs,
    };
    match batch_details_service::update_batch_detail(&mut *conn, batch_detail_id, batch_detail_data)
    {
        Ok(batch_detail) => Ok(serde_json::json!({ "batch_detail": batch_detail })),
        Err(err) => Err(err.error),
    }
}

#[tauri::command]
fn delete_batch_detail(
    state: tauri::State<AppState>,
    batch_detail_id: Uuid,
) -> Result<serde_json::Value, String> {
    let mut conn = state.conn.lock().unwrap();
    match batch_details_service::delete_batch_detail(&mut *conn, batch_detail_id) {
        Ok(rows) => Ok(serde_json::json!({ "deleted": rows })),
        Err(err) => Err(err.error),
    }
}

#[tauri::command]
fn fetch_all_batches_for_product(
    state: tauri::State<AppState>,
    product_id: Uuid,
) -> Result<serde_json::Value, String> {
    let mut conn = state.conn.lock().unwrap();
    match batch_details_service::fetch_all_batches_for_product(&mut *conn, product_id) {
        Ok(products) => Ok(serde_json::json!({ "batch_detail": products })),
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
            get_all_products_for_client,
            update_product,
            delete_product,
            create_batch_detail,
            get_batch_detail,
            update_batch_detail,
            delete_batch_detail,
            fetch_all_batches_for_product
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
