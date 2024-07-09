// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod models;
mod schema;
mod services;

use app::establish_connection;
use diesel::PgConnection;
use services::{
    client_service,
    session_management_service::{authenticate_client, Session},
};
use std::sync::Mutex;

struct AppState {
    conn: Mutex<PgConnection>,
}

#[tauri::command]
fn create_client(state: tauri::State<AppState>) -> Result<serde_json::Value, String> {
    let mut conn = state.conn.lock().unwrap();
    match client_service::create_client(&mut *conn) {
        Ok(client) => Ok(serde_json::json!({ "client": client })),
        Err(err) => Ok(serde_json::json!({ "error": err.error })),
    }
}

#[tauri::command]
fn sign_in() -> Result<serde_json::Value, String> {
    authenticate_client().map(|session| {
        serde_json::json!({
            "token": session.token,
            "client_id": session.client_id,
            "expires_at": session.expires_at,
        })
    })
}

#[tauri::command]
fn validate_session(session: Session) -> bool {
    services::session_management_service::validate_session(&session)
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
            validate_session
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
