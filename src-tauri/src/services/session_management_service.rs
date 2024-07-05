use super::key_management_service::{decrypt, encrypt};
use base64::{engine::general_purpose, Engine};
use serde::{Deserialize, Serialize};
use std::time::{Duration, SystemTime, UNIX_EPOCH};
use uuid::Uuid;

#[derive(Serialize, Deserialize)]
struct Session {
    token: String,
    client_id: Uuid,
    expires_at: u64,
}

fn generate_session(client_id: Uuid) -> Session {
    let token = Uuid::new_v4().to_string();
    // 3 Hours
    let expiration_time =
        SystemTime::now().duration_since(UNIX_EPOCH).unwrap() + Duration::from_secs(10800);
    let expires_at = expiration_time.as_secs();

    Session {
        token,
        client_id,
        expires_at,
    }
}

fn encrypt_session(session: &Session) -> String {
    let serialized_session = serde_json::to_string(session).unwrap();
    let encrypted_data = encrypt(serialized_session.as_bytes());
    general_purpose::STANDARD.encode(&encrypted_data)
}

fn store_session(session: &Session) {
    let encrypted_session = encrypt_session(session);
}
