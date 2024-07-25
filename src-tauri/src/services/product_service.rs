use app::ErrorResponse;
use chrono::Utc;
use diesel::{
    BelongingToDsl, ExpressionMethods, GroupedBy, PgConnection, QueryDsl, RunQueryDsl,
    SelectableHelper,
};
use uuid::Uuid;

use crate::models::{BatchDetail, NewProduct, Product, ProductWithBatches, UpdateProduct};
use crate::schema::products;
use crate::schema::products::dsl::*;

pub fn create_product(
    conn: &mut PgConnection,
    new_product: NewProduct,
) -> Result<Product, ErrorResponse> {
    diesel::insert_into(products::table)
        .values(&new_product)
        .get_result::<Product>(conn)
        .map_err(|e| ErrorResponse {
            error: e.to_string(),
        })
}

pub fn get_product(conn: &mut PgConnection, product_id: Uuid) -> Result<Product, ErrorResponse> {
    products
        .find(product_id)
        .get_result::<Product>(conn)
        .map_err(|e| ErrorResponse {
            error: e.to_string(),
        })
}

pub fn get_all_products(conn: &mut PgConnection) -> Result<Vec<Product>, ErrorResponse> {
    products.load::<Product>(conn).map_err(|e| ErrorResponse {
        error: e.to_string(),
    })
}

pub fn get_all_products_for_client(
    conn: &mut PgConnection,
    _client_id: Uuid,
) -> Result<Vec<ProductWithBatches>, ErrorResponse> {
    let products_for_client = products::table
        .filter(products::client_id.eq(_client_id))
        .select(Product::as_select())
        .load(conn)
        .map_err(|e| ErrorResponse {
            error: e.to_string(),
        })?;

    let all_batches = BatchDetail::belonging_to(&products_for_client)
        .select(BatchDetail::as_select())
        .load(conn)
        .map_err(|e| ErrorResponse {
            error: e.to_string(),
        })?;

    let grouped_batches = all_batches
        .grouped_by(&products_for_client)
        .into_iter()
        .zip(products_for_client)
        .map(|(batches, product)| ProductWithBatches {
            product,
            batch_details: batches,
        })
        .collect();

    Ok(grouped_batches)
}

pub fn update_product(
    conn: &mut PgConnection,
    product_id: Uuid,
    product_data: UpdateProduct,
) -> Result<Product, ErrorResponse> {
    let product_data = UpdateProduct {
        updated_at: Some(Utc::now().naive_utc()),
        ..product_data
    };

    diesel::update(products.find(product_id))
        .set(&product_data)
        .get_result::<Product>(conn)
        .map_err(|e| ErrorResponse {
            error: e.to_string(),
        })
}

pub fn delete_product(conn: &mut PgConnection, product_id: Uuid) -> Result<usize, ErrorResponse> {
    diesel::delete(products.find(product_id))
        .execute(conn)
        .map_err(|e| ErrorResponse {
            error: e.to_string(),
        })
}
