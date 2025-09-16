// Simple database initialization script
const { Pool } = require('pg');
require('dotenv').config();

// Tạo pool connection trực tiếp với database chính
const pool = new Pool({
  user: process.env.DB_USER || 'team_user',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'teamdb',
  password: process.env.DB_PASS || 'team_pass',
  port: process.env.DB_PORT || 5432,
});

async function initTables() {
  try {
    console.log('🔧 Creating tables...');
    
    // Drop tables if they exist to recreate with correct structure
    await pool.query('DROP TABLE IF EXISTS users CASCADE');
    await pool.query('DROP TABLE IF EXISTS shops CASCADE');
    await pool.query('DROP TABLE IF EXISTS channels CASCADE');
    
    // Tạo bảng users
    await pool.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tạo bảng shops
    await pool.query(`
      CREATE TABLE shops (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tạo bảng channels
    await pool.query(`
      CREATE TABLE channels (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ Tables created successfully!');
    
    // Thêm dữ liệu mẫu
    await pool.query(`
      INSERT INTO users (name, email) VALUES 
      ('John Doe', 'john@example.com'),
      ('Jane Smith', 'jane@example.com'),
      ('Bob Johnson', 'bob@example.com'),
      ('Alice Brown', 'alice@example.com'),
      ('Charlie Wilson', 'charlie@example.com')
    `);
    
    await pool.query(`
      INSERT INTO shops (name, description) VALUES 
      ('Tech Store', 'Electronics and gadgets for technology enthusiasts'),
      ('Fashion Hub', 'Trendy clothing and accessories for modern lifestyle'),
      ('Book Corner', 'Books, magazines and educational materials'),
      ('Health & Wellness', 'Health supplements and wellness products'),
      ('Home Decor', 'Beautiful home decoration items and furniture')
    `);
    
    await pool.query(`
      INSERT INTO channels (name, description) VALUES 
      ('Main Channel', 'Primary content channel for general audience'),
      ('Gaming', 'Gaming content, reviews and live streaming'),
      ('Lifestyle', 'Lifestyle content and daily vlogs'),
      ('Tech Reviews', 'Technology product reviews and tutorials'),
      ('Food & Cooking', 'Cooking recipes and food-related content')
    `);
    
    console.log('✅ Sample data inserted successfully!');
    
  } catch (err) {
    console.error('❌ Database Error:', err.message);
    console.log('💡 Make sure PostgreSQL is running and database credentials are correct');
  }
}

module.exports = { pool, initTables };