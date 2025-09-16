const express = require("express");
const router = express.Router();
const { pool } = require("../simple-db");

// Validation middleware
const validateUser = (req, res, next) => {
  const { name, email } = req.body;

  if (!name || name.trim().length < 2) {
    return res.status(400).json({
      error: "Name is required and must be at least 2 characters",
    });
  }

  if (!email || !email.includes("@")) {
    return res.status(400).json({
      error: "Valid email is required",
    });
  }

  next();
};

// GET all users with pagination
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100; // Tăng limit để frontend lấy được tất cả data
    const offset = (page - 1) * limit;

    const result = await pool.query(
      "SELECT * FROM users ORDER BY id DESC LIMIT $1 OFFSET $2",
      [limit, offset]
    );

    const countResult = await pool.query("SELECT COUNT(*) FROM users");
    const total = parseInt(countResult.rows[0].count);

    // Trả về format tương thích với frontend hiện tại
    if (req.query.page) {
      res.json({
        data: result.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } else {
      // Nếu không có pagination, trả về array trực tiếp
      res.json(result.rows);
    }
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch users", details: error.message });
  }
});

// GET user by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch user", details: error.message });
  }
});

// POST add user
router.post("/", validateUser, async (req, res) => {
  try {
    const { name, email } = req.body;

    // Check if email already exists
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: "Email already exists" });
    }

    const result = await pool.query(
      "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *",
      [name.trim(), email.trim()]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to create user", details: error.message });
  }
});

// PUT update user
router.put("/:id", validateUser, async (req, res) => {
  try {
    const { name, email } = req.body;
    const { id } = req.params;

    // Check if user exists
    const userExists = await pool.query("SELECT id FROM users WHERE id = $1", [
      id,
    ]);
    if (userExists.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if email already exists for another user
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1 AND id != $2",
      [email, id]
    );
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: "Email already exists" });
    }

    const result = await pool.query(
      "UPDATE users SET name=$1, email=$2 WHERE id=$3 RETURNING *",
      [name.trim(), email.trim(), id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to update user", details: error.message });
  }
});

// DELETE user
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM users WHERE id=$1 RETURNING id",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to delete user", details: error.message });
  }
});

module.exports = router;
