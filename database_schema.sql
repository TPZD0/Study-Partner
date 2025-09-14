-- Study Partner Database Schema
-- Run this script to create the necessary tables

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    tel VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create pdf_files table
CREATE TABLE IF NOT EXISTS pdf_files (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    summary TEXT,
    summary_generated_at TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_pdf_files_user_id ON pdf_files(user_id);
CREATE INDEX IF NOT EXISTS idx_pdf_files_uploaded_at ON pdf_files(uploaded_at);

-- Insert a test user (password is 'testpassword123')
-- You can use this to test the login functionality
INSERT INTO users (username, password_hash, email, first_name, last_name) 
VALUES (
    'testuser', 
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXzgVrqUfLrm', -- bcrypt hash of 'testpassword123'
    'test@example.com', 
    'Test', 
    'User'
) ON CONFLICT (username) DO NOTHING;

-- Alternative test user with email login
INSERT INTO users (username, password_hash, email, first_name, last_name) 
VALUES (
    'student1', 
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXzgVrqUfLrm', -- same password hash
    'student@kmitl.ac.th', 
    'Student', 
    'One'
) ON CONFLICT (username) DO NOTHING;
