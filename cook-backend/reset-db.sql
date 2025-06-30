-- Reset Database Script for CookBook App
-- Run this script to reset your database and ensure proper schema

-- Drop existing tables if they exist
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS recipes CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    token VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create recipes table
CREATE TABLE recipes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    instructions TEXT NOT NULL,
    thumbnail VARCHAR(2000),
    ingredients TEXT[],
    posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    posted_by_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- Create favorites table
CREATE TABLE favorites (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    UNIQUE(user_id, recipe_id)
);

-- Create indexes for better performance
CREATE INDEX idx_recipes_posted_by_id ON recipes(posted_by_id);
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_recipe_id ON favorites(recipe_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_token ON users(token);

-- Insert a test user (optional)
-- INSERT INTO users (name, email, password) VALUES ('Test User', 'test@example.com', '$2b$10$test'); 