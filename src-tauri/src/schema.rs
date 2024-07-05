// @generated automatically by Diesel CLI.

diesel::table! {
    clients (id) {
        id -> Uuid,
        private_key_path -> Text,
    }
}
