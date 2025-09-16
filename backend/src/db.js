import pkg from "pg";
import dotenv from "dotenv";
const { Client, Pool } = pkg;

dotenv.config();

// Config từ .env
const {
  DB_USER = "team_user",
  DB_PASS = "team_pass",
  DB_HOST = "localhost",
  DB_PORT = 5432,
  DB_NAME = "teamdb",
  DB_ADMIN_USER = "postgres",     // 👈 thêm biến admin vào .env
  DB_ADMIN_PASS = "postgres"      // 👈 thêm biến admin vào .env
} = process.env;

// Client admin để tạo DB/User
const adminClient = new Client({
  user: DB_ADMIN_USER,
  host: DB_HOST,
  database: "postgres", // connect vào postgres để tạo db khác
  password: DB_ADMIN_PASS,
  port: DB_PORT,
});

// Pool app để thao tác với DB chính
const pool = new Pool({
  user: DB_USER,
  host: DB_HOST,
  database: DB_NAME,
  password: DB_PASS,
  port: DB_PORT,
});

async function init() {
  try {
    await adminClient.connect();

    // Tạo user nếu chưa có
    await adminClient.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${DB_USER}') THEN
          CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASS}';
        END IF;
      END
      $$;
    `);

    // Tạo DB nếu chưa có
    await adminClient.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT FROM pg_database WHERE datname = '${DB_NAME}') THEN
          CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};
        END IF;
      END
      $$;
    `);

    console.log("✅ User & Database checked/created.");
    await adminClient.end();

    // Dùng pool (kết nối teamdb) để tạo bảng
    await pool.query(`
      CREATE TABLE IF NOT EXISTS shops (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS channels (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT
      );
    `);

    console.log("✅ Tables checked/created (shops, users, channels).");
  } catch (err) {
    console.error("❌ DB Init Error:", err);
  }
}

// chạy init khi start
init();

export default pool;
