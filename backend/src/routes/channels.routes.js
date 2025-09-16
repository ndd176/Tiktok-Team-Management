const express = require("express");
const router = express.Router();
const { pool } = require("../simple-db");

// Validation middleware
const validateChannel = (req, res, next) => {
  const { name, description } = req.body;

  if (!name || name.trim().length < 2) {
    return res.status(400).json({
      error: "Name is required and must be at least 2 characters",
    });
  }

  if (description && description.length > 500) {
    return res.status(400).json({
      error: "Description must not exceed 500 characters",
    });
  }

  next();
};

// GET all channels with pagination
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100; // Tăng limit để frontend lấy được tất cả data
    const offset = (page - 1) * limit;

    const result = await pool.query(
      "SELECT * FROM channels ORDER BY id DESC LIMIT $1 OFFSET $2",
      [limit, offset]
    );

    const countResult = await pool.query("SELECT COUNT(*) FROM channels");
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
      .json({ error: "Failed to fetch channels", details: error.message });
  }
});

// GET channel by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM channels WHERE id = $1", [
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Channel not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch channel", details: error.message });
  }
});

// POST add channel
router.post("/", validateChannel, async (req, res) => {
  try {
    const { name, description } = req.body;

    // Check if channel name already exists
    const existingChannel = await pool.query(
      "SELECT id FROM channels WHERE name = $1",
      [name]
    );
    if (existingChannel.rows.length > 0) {
      return res.status(409).json({ error: "Channel name already exists" });
    }

    const result = await pool.query(
      "INSERT INTO channels (name, description) VALUES ($1, $2) RETURNING *",
      [name.trim(), description ? description.trim() : null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to create channel", details: error.message });
  }
});

// PUT update channel
router.put("/:id", validateChannel, async (req, res) => {
  try {
    const { name, description } = req.body;
    const { id } = req.params;

    // Check if channel exists
    const channelExists = await pool.query(
      "SELECT id FROM channels WHERE id = $1",
      [id]
    );
    if (channelExists.rows.length === 0) {
      return res.status(404).json({ error: "Channel not found" });
    }

    // Check if channel name already exists for another channel
    const existingChannel = await pool.query(
      "SELECT id FROM channels WHERE name = $1 AND id != $2",
      [name, id]
    );
    if (existingChannel.rows.length > 0) {
      return res.status(409).json({ error: "Channel name already exists" });
    }

    const result = await pool.query(
      "UPDATE channels SET name=$1, description=$2 WHERE id=$3 RETURNING *",
      [name.trim(), description ? description.trim() : null, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to update channel", details: error.message });
  }
});

// DELETE channel
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM channels WHERE id=$1 RETURNING id",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Channel not found" });
    }

    res.json({ success: true, message: "Channel deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to delete channel", details: error.message });
  }
});

module.exports = router;
