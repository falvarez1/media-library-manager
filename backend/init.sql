-- PostgreSQL initialization script for Media Library Manager
-- This script sets up the initial database structure

-- Create database if it doesn't exist (this is handled by docker-compose environment variables)
-- The database 'medialibrary' is created automatically by PostgreSQL based on POSTGRES_DB

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- Set timezone
SET timezone = 'UTC';

-- Create schema if needed (optional, we'll use public schema)
-- CREATE SCHEMA IF NOT EXISTS media;
-- SET search_path TO media, public;

-- Initial setup complete
-- Entity Framework will handle table creation through migrations