use app::ErrorResponse;
use diesel::{ExpressionMethods, PgConnection, QueryDsl, RunQueryDsl};
use uuid::Uuid;

use crate::schema::batch_details::dsl::*;
use crate::{
    models::{BatchDetail, NewBatchDetail, UpdateBatchDetail},
    schema::batch_details,
};

pub fn create_batch_detail(
    conn: &mut PgConnection,
    new_batch_detail: NewBatchDetail,
) -> Result<BatchDetail, ErrorResponse> {
    diesel::insert_into(batch_details::table)
        .values(&new_batch_detail)
        .get_result::<BatchDetail>(conn)
        .map_err(|e| ErrorResponse {
            error: e.to_string(),
        })
}

pub fn get_batch_detail(
    conn: &mut PgConnection,
    batch_detail_id: Uuid,
) -> Result<BatchDetail, ErrorResponse> {
    batch_details
        .find(batch_detail_id)
        .get_result::<BatchDetail>(conn)
        .map_err(|e| ErrorResponse {
            error: e.to_string(),
        })
}

pub fn update_batch_detail(
    conn: &mut PgConnection,
    batch_detail_id: Uuid,
    batch_detail_data: UpdateBatchDetail,
) -> Result<BatchDetail, ErrorResponse> {
    diesel::update(batch_details.find(batch_detail_id))
        .set(&batch_detail_data)
        .get_result::<BatchDetail>(conn)
        .map_err(|e| ErrorResponse {
            error: e.to_string(),
        })
}

pub fn delete_batch_detail(
    conn: &mut PgConnection,
    batch_detail_id: Uuid,
) -> Result<usize, ErrorResponse> {
    diesel::delete(batch_details.find(batch_detail_id))
        .execute(conn)
        .map_err(|e| ErrorResponse {
            error: e.to_string(),
        })
}

pub fn fetch_all_batches_for_product(
    conn: &mut PgConnection,
    _product_id: Uuid,
) -> Result<Vec<BatchDetail>, ErrorResponse> {
    batch_details
        .filter(product_id.eq(_product_id))
        .load::<BatchDetail>(conn)
        .map_err(|e| ErrorResponse {
            error: e.to_string(),
        })
}
