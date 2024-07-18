use app::ErrorResponse;
use diesel::{ExpressionMethods, PgConnection, QueryDsl, RunQueryDsl};

use crate::{models::Client, schema::clients, schema::clients::dsl::*};

use super::{
    key_management_service::generate_key_pair,
    session_management_service::get_client_id_from_private_key,
};



pub fn create_client(conn: &mut PgConnection) -> Result<Client, ErrorResponse> {
    match get_client_id_from_private_key() {
        Ok(_) => {
            return Err(ErrorResponse {
                error: "Client with private key already exists".to_string(),
            });
        }
        Err(_) => {}
    }

    let placeholder_path = "placeholder";
    let new_client = diesel::insert_into(clients::table)
        .values((private_key_path.eq(placeholder_path),))
        .get_result::<Client>(conn)
        .map_err(|e| ErrorResponse {
            error: e.to_string(),
        })?;

    let private_key_path_str = generate_key_pair(new_client.id);

    let _ = diesel::update(clients.find(new_client.id))
        .set(private_key_path.eq(&private_key_path_str))
        .execute(conn)
        .map_err(|e| ErrorResponse {
            error: e.to_string(),
        })?;

    let updated_client = clients
        .find(new_client.id)
        .get_result::<Client>(conn)
        .map_err(|e| ErrorResponse {
            error: e.to_string(),
        })?;

    Ok(updated_client)
}
