-- 001_init.sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'food' CHECK (category IN ('food', 'medicine', 'chemistry', 'other')),
    location VARCHAR(100) NOT NULL DEFAULT 'fridge',
    expires_at TIMESTAMPTZ NOT NULL,
    remind_days_before INT NOT NULL DEFAULT 3,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_user_id ON products(user_id);
CREATE INDEX idx_products_expires_at ON products(expires_at);

-- Seed demo user (password: demo1234)
INSERT INTO users (id, email, password_hash, name)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'demo@freshtrack.app',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lihO',
    'Демо пользователь'
);

-- Seed demo products
INSERT INTO products (user_id, name, category, location, expires_at, remind_days_before) VALUES
('a0000000-0000-0000-0000-000000000001', 'Молоко 3,2%', 'food', 'Холодильник', NOW() - INTERVAL '2 days', 3),
('a0000000-0000-0000-0000-000000000001', 'Йогурт клубничный', 'food', 'Холодильник', NOW() - INTERVAL '5 days', 3),
('a0000000-0000-0000-0000-000000000001', 'Парацетамол 500мг', 'medicine', 'Аптечка', NOW() + INTERVAL '3 days', 7),
('a0000000-0000-0000-0000-000000000001', 'Гречка', 'food', 'Шкаф', NOW() + INTERVAL '7 days', 3),
('a0000000-0000-0000-0000-000000000001', 'Оливковое масло', 'food', 'Шкаф', NOW() + INTERVAL '42 days', 7),
('a0000000-0000-0000-0000-000000000001', 'Отбеливатель', 'chemistry', 'Кладовая', NOW() + INTERVAL '180 days', 14),
('a0000000-0000-0000-0000-000000000001', 'Витамин C', 'medicine', 'Аптечка', NOW() + INTERVAL '25 days', 7),
('a0000000-0000-0000-0000-000000000001', 'Кефир', 'food', 'Холодильник', NOW() + INTERVAL '1 day', 2);
