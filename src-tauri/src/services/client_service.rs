use diesel::{ExpressionMethods, PgConnection, QueryDsl, RunQueryDsl};

use crate::{models::Client, schema::clients, schema::clients::dsl::*};

use super::key_management_service::generate_key_pair;

pub fn create_client(conn: &mut PgConnection) -> Result<Client, diesel::result::Error> {
    let placeholder_path = "placeholder";
    let new_client = diesel::insert_into(clients::table)
        .values((private_key_path.eq(placeholder_path),))
        .get_result::<Client>(conn)?;

    let private_key_path_str = generate_key_pair(new_client.id);

    let _ = diesel::update(clients.find(new_client.id))
        .set(private_key_path.eq(&private_key_path_str))
        .execute(conn);

    let updated_client = clients.find(new_client.id).get_result::<Client>(conn)?;

    Ok(updated_client)
}
