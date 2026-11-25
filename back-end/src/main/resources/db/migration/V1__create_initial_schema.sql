CREATE TABLE tb_users(
	user_id BIGINT NOT NULL AUTO_INCREMENT,
    user_name VARCHAR(100) NOT NULL,
    user_email VARCHAR(100) UNIQUE NOT NULL,
    user_password VARCHAR(100) NOT NULL,
    user_role ENUM('ADMIN', 'COOK', 'CASHIER', 'WAITER') NOT NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,

    PRIMARY KEY(user_id)
);

CREATE TABLE tb_restaurant_tables(
	restaurant_table_id BIGINT NOT NULL AUTO_INCREMENT,
    restaurant_table_number INT UNIQUE NOT NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,

    PRIMARY KEY(restaurant_table_id)
);

CREATE TABLE tb_product_categories (
	category_id BIGINT NOT NULL AUTO_INCREMENT,
    category_name VARCHAR(50) UNIQUE NOT NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,

    PRIMARY KEY(category_id)
);

CREATE TABLE tb_products (
	product_id BIGINT NOT NULL AUTO_INCREMENT,
    product_name VARCHAR(100) UNIQUE NOT NULL,
    product_description VARCHAR(255) NOT NULL,
    image_url VARCHAR(2048) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    category_id BIGINT NOT NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,

    PRIMARY KEY(product_id),
    FOREIGN KEY(category_id) REFERENCES tb_product_categories(category_id)
);

CREATE TABLE tb_bills (
    bill_id BIGINT NOT NULL AUTO_INCREMENT,
    customer_name VARCHAR(100) NOT NULL,
    bill_status ENUM('OPEN', 'CLOSED', 'PAID', 'CANCELLED') NOT NULL DEFAULT 'OPEN',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    paid_at DATETIME,
    restaurant_table_id BIGINT NOT NULL,

    PRIMARY KEY(bill_id),
    FOREIGN KEY(restaurant_table_id) REFERENCES tb_restaurant_tables(restaurant_table_id)
);

CREATE TABLE tb_orders (
    order_id BIGINT NOT NULL AUTO_INCREMENT,
    order_status ENUM('WAITING', 'PREPARING', 'DELIVERED', 'CANCELLED') NOT NULL DEFAULT 'WAITING',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delivered_at DATETIME,
    bill_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,

    PRIMARY KEY(order_id),
    FOREIGN KEY(bill_id) REFERENCES tb_bills(bill_id),
    FOREIGN KEY(user_id) REFERENCES tb_users(user_id)
);

CREATE TABLE tb_order_products (
    order_product_id BIGINT NOT NULL AUTO_INCREMENT,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    note VARCHAR(255),
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,

    PRIMARY KEY(order_product_id),
    FOREIGN KEY(order_id) REFERENCES tb_orders(order_id),
    FOREIGN KEY(product_id) REFERENCES tb_products(product_id)
);