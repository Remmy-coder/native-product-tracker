use aes_gcm::{
    aead::{
        consts::{U12, U32},
        generic_array::GenericArray,
        rand_core::RngCore,
        Aead, OsRng,
    },
    Aes256Gcm, KeyInit, Nonce,
};
use base64::{engine::general_purpose, Engine};
use core::panic;
use dirs::data_dir;
use dotenvy::dotenv;
use ring::{rand, signature};
use std::{
    env,
    fs::{self, File},
    io::Write,
    path::PathBuf,
};
use uuid::Uuid;

pub fn get_app_dir() -> PathBuf {
    data_dir()
        .expect("Unable to get data directory")
        .join("product-tracker-app")
}

fn get_encryption_key() -> GenericArray<u8, U32> {
    dotenv().ok();
    let key = env::var("ENCRYPTION_KEY").expect("ENCRYPTON_KEY must be set");
    let key_bytes = key.as_bytes();

    if key_bytes.len() != 32 {
        panic!("ENCRYPTION_KEY must be exactly 32 bytes long");
    }

    GenericArray::clone_from_slice(&key_bytes)
}

pub fn generate_nonce() -> Nonce<U12> {
    let mut nonce = [0u8; 12];
    OsRng.fill_bytes(&mut nonce);
    Nonce::clone_from_slice(&nonce)
}

pub fn encrypt(data: &[u8]) -> Vec<u8> {
    let key = get_encryption_key();
    let cipher = Aes256Gcm::new(&key);
    let nonce = generate_nonce();
    let mut ciphertext = nonce.as_slice().to_vec();
    ciphertext.extend(cipher.encrypt(&nonce, data).expect("encryption failure!"));
    ciphertext
}

pub fn decrypt(data: &[u8]) -> Vec<u8> {
    let key = get_encryption_key();
    let cipher = Aes256Gcm::new(&key);
    let (nonce, ciphertext) = data.split_at(12);
    let nonce = Nonce::<U12>::from_slice(nonce);
    cipher
        .decrypt(nonce, ciphertext)
        .expect("decryption failure!")
}

pub fn store_private_key(private_key: &[u8], client_id: Uuid) -> String {
    let app_data_dir = get_app_dir();
    let client_dir = app_data_dir.join(client_id.to_string());
    fs::create_dir_all(&client_dir).expect("Failed to create client directory");

    let encrypted_key = encrypt(private_key);
    let encoded_key = general_purpose::STANDARD.encode(encrypted_key);

    let key_path = client_dir.join("private_key");
    let mut file = File::create(&key_path).expect("Failed to create private key file");
    file.write_all(encoded_key.as_bytes())
        .expect("Failed to write private key");

    key_path.to_str().unwrap().to_string()
}

pub fn load_private_key(path: &str) -> Vec<u8> {
    let encoded_key = fs::read_to_string(path).expect("Failed to read private key file");
    let encrypted_key = general_purpose::STANDARD
        .decode(&encoded_key)
        .expect("Failed to decode private key");
    decrypt(&encrypted_key)
}

pub fn generate_key_pair(client_id: Uuid) -> String {
    let rng = rand::SystemRandom::new();
    let key_pair =
        signature::Ed25519KeyPair::generate_pkcs8(&rng).expect("Failed to generate key pair");

    let private_key_path = store_private_key(key_pair.as_ref(), client_id);

    private_key_path
}
