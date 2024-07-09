use super::key_management_service::{get_app_dir, load_private_key};
use ring::signature::{self, KeyPair, UnparsedPublicKey};
use serde::{Deserialize, Serialize};
use std::{
    fs,
    time::{Duration, SystemTime, UNIX_EPOCH},
};
use uuid::Uuid;

#[derive(Serialize, Deserialize)]
pub struct Session {
    pub token: String,
    pub client_id: Uuid,
    pub expires_at: u64,
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

pub fn get_client_id_from_private_key() -> Result<Uuid, String> {
    let app_data_dir = get_app_dir();
    let entries = fs::read_dir(app_data_dir).map_err(|_| "Failed to read app data directory")?;
    for entry in entries {
        if let Ok(entry) = entry {
            if entry.file_type().map(|ft| ft.is_dir()).unwrap_or(false) {
                if let Ok(client_id) = Uuid::parse_str(&entry.file_name().to_string_lossy()) {
                    return Ok(client_id);
                }
            }
        }
    }
    Err("Client ID not found".to_string())
}

pub fn authenticate_client() -> Result<Session, String> {
    let client_id = get_client_id_from_private_key()?;

    let private_key_path = get_app_dir()
        .join(client_id.to_string())
        .join("private_key");
    let private_key_path_str = private_key_path
        .to_str()
        .ok_or("Invalid private key path")?;

    let private_key = load_private_key(private_key_path_str);

    let key_pair = signature::Ed25519KeyPair::from_pkcs8(&private_key)
        .map_err(|_| "Failed to create key pair")?;

    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs()
        .to_string();
    let sig = key_pair.sign(timestamp.as_bytes());

    let peer_public_key =
        UnparsedPublicKey::new(&signature::ED25519, key_pair.public_key().as_ref());
    peer_public_key
        .verify(timestamp.as_bytes(), sig.as_ref())
        .map_err(|_| "Invalid signature")?;

    let session = generate_session(client_id);

    Ok(session)
}

pub fn validate_session(session: &Session) -> bool {
    let current_time = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs();
    session.expires_at > current_time
}
