// @generated automatically by Diesel CLI.

diesel::table! {
    batch_details (id) {
        id -> Uuid,
        product_id -> Uuid,
        #[max_length = 50]
        batch_no -> Varchar,
        mfg_date -> Date,
        exp_date -> Date,
        boxes -> Int4,
        units_per_box -> Int4,
        units_per_pack -> Int4,
        packs_per_box -> Int4,
        #[max_length = 255]
        packages_configuration -> Varchar,
        total_packs -> Int4,
        created_at -> Timestamptz,
        updated_at -> Timestamptz,
    }
}

diesel::table! {
    clients (id) {
        id -> Uuid,
        private_key_path -> Text,
    }
}

diesel::table! {
    products (id) {
        id -> Uuid,
        client_id -> Uuid,
        #[max_length = 255]
        product_name -> Varchar,
        total_quantity -> Int4,
        total_shipper_boxes -> Int4,
        created_at -> Timestamptz,
        updated_at -> Timestamptz,
    }
}

diesel::joinable!(batch_details -> products (product_id));
diesel::joinable!(products -> clients (client_id));

diesel::allow_tables_to_appear_in_same_query!(
    batch_details,
    clients,
    products,
);
