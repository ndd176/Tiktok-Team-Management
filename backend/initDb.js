import pkg from "pg";
const { Client } = pkg;

// Kết nối bằng user postgres mặc định (admin)
const client = new Client({
  user: "team_user",   // user mặc định khi cài postgres
  host: "localhost",
  database: "teamdb", // DB mặc định
  password: "team_pass", // mật khẩu bạn đặt khi cài
  port: 5432,
});

async function init() {
  try {
    await client.connect();

    // Tạo user
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'team_user') THEN
          CREATE USER team_user WITH PASSWORD 'team_pass';
        END IF;
      END
      $$;
    `);

    // Tạo database
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'teamdb') THEN
          CREATE DATABASE teamdb OWNER team_user;
        END IF;
      END
      $$;
    `);

    console.log("✅ Database teamdb & user team_user created (nếu chưa có).");
  } catch (err) {
    console.error("❌ Error creating DB:", err);
  } finally {
    await client.end();
  }
}

init();
