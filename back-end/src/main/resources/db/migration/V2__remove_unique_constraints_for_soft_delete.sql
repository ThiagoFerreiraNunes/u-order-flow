ALTER TABLE tb_users DROP INDEX user_email;
ALTER TABLE tb_users ADD INDEX idx_user_email (user_email);

ALTER TABLE tb_restaurant_tables DROP INDEX restaurant_table_number;
ALTER TABLE tb_restaurant_tables ADD INDEX idx_table_number (restaurant_table_number);

ALTER TABLE tb_product_categories DROP INDEX category_name;
ALTER TABLE tb_product_categories ADD INDEX idx_category_name (category_name);

ALTER TABLE tb_products DROP INDEX product_name;
ALTER TABLE tb_products ADD INDEX idx_product_name (product_name);