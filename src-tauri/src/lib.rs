use serde::{Deserialize, Serialize};
use {
    chrono::NaiveDate,
    diesel::{pg::PgConnection, prelude::*},
    dotenvy::dotenv,
    std::env,
};

#[derive(Serialize)]
pub struct ErrorResponse {
    pub error: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BatchInput {
    pub batch_no: String,
    pub mfg_date: NaiveDate,
    pub exp_date: NaiveDate,
    pub boxes: i32,
    pub units_per_box: i32,
    pub units_per_pack: i32,
    pub packs_per_box: i32,
    pub packages_configuration: String,
    pub total_packs: i32,
}

pub fn establish_connection() -> PgConnection {
    dotenv().ok();

    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    PgConnection::establish(&database_url)
        .unwrap_or_else(|_| panic!("Error connecting to {}", database_url))
}
