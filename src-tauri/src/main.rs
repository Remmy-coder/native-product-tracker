// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod models;
mod schema;
mod services;

use app::establish_connection;
use diesel::PgConnection;
use models::Client;
use std::sync::Mutex;
use tauri::Manager;

struct AppState {
    conn: Mutex<PgConnection>,
}

#[tauri::command]
fn create_client(state: tauri::State<AppState>) -> Client {
    let mut conn = state.conn.lock().unwrap();
    services::client_service::create_client(&mut *conn).expect("Failed to create client")
}

fn main() {
    let state = AppState {
        conn: Mutex::new(establish_connection()),
    };

    tauri::Builder::default()
        .manage(state)
        .invoke_handler(tauri::generate_handler![create_client])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
