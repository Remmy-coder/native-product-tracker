use crate::schema::clients;
use diesel::prelude::*;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Queryable, Selectable, Serialize, Deserialize, Debug)]
#[diesel(table_name = clients)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct Client {
    pub id: Uuid,
    pub private_key_path: String,
}

#[derive(Insertable)]
#[diesel(table_name = clients)]
pub struct NewClient<'a> {
    pub private_key_path: &'a String,
}
