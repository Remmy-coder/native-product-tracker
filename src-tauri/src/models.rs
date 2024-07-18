use crate::schema::{batch_details, clients, products};
use chrono::{NaiveDate, NaiveDateTime};
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

#[derive(
    Queryable, Identifiable, Associations, Selectable, Serialize, Deserialize, Debug, PartialEq,
)]
#[diesel(belongs_to(Client))]
#[diesel(table_name = products)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct Product {
    pub id: Uuid,
    pub client_id: Uuid,
    pub product_name: String,
    pub total_quantity: i32,
    pub total_shipper_boxes: i32,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
}

#[derive(Insertable)]
#[diesel(table_name = products)]
pub struct NewProduct<'a> {
    pub client_id: Uuid,
    pub product_name: &'a str,
    pub total_quantity: i32,
    pub total_shipper_boxes: i32,
}

#[derive(AsChangeset)]
#[diesel(table_name = products)]
pub struct UpdateProduct<'a> {
    pub product_name: Option<&'a str>,
    pub total_quantity: Option<i32>,
    pub total_shipper_boxes: Option<i32>,
}

#[derive(
    Queryable, Selectable, Identifiable, Associations, Serialize, Deserialize, Debug, PartialEq,
)]
#[diesel(belongs_to(Product))]
#[diesel(table_name = batch_details)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct BatchDetail {
    pub id: Uuid,
    pub product_id: Uuid,
    pub batch_no: String,
    pub mfg_date: chrono::NaiveDate,
    pub exp_date: chrono::NaiveDate,
    pub boxes: i32,
    pub units_per_box: i32,
    pub units_per_pack: i32,
    pub packs_per_box: i32,
    pub packages_configuration: String,
    pub total_packs: i32,
    pub created_at: chrono::NaiveDateTime,
    pub updated_at: chrono::NaiveDateTime,
}

#[derive(Insertable)]
#[diesel(table_name = batch_details)]
pub struct NewBatchDetail<'a> {
    pub product_id: Uuid,
    pub batch_no: &'a str,
    pub mfg_date: NaiveDate,
    pub exp_date: NaiveDate,
    pub boxes: i32,
    pub units_per_box: i32,
    pub units_per_pack: i32,
    pub packs_per_box: i32,
    pub packages_configuration: &'a str,
    pub total_packs: i32,
}

#[derive(Serialize)]
pub struct ProductWithBatches {
    pub product: Product,
    pub batch_details: Vec<BatchDetail>,
}
