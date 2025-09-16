const express = require("express");
const router = express.Router();
const { pool } = require("../simple-db");

// Validation middleware
const validateShop = (req, res, next) => {
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

// GET all shops with pagination
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100; // Tăng limit để frontend lấy được tất cả data
    const offset = (page - 1) * limit;

    const result = await pool.query(
      "SELECT * FROM shops ORDER BY id DESC LIMIT $1 OFFSET $2",
      [limit, offset]
    );

    const countResult = await pool.query("SELECT COUNT(*) FROM shops");
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
      .json({ error: "Failed to fetch shops", details: error.message });
  }
});

// GET shop by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM shops WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Shop not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch shop", details: error.message });
  }
});

// POST add shop
router.post("/", validateShop, async (req, res) => {
  try {
    const { name, description } = req.body;

    // Check if shop name already exists
    const existingShop = await pool.query(
      "SELECT id FROM shops WHERE name = $1",
      [name]
    );
    if (existingShop.rows.length > 0) {
      return res.status(409).json({ error: "Shop name already exists" });
    }

    const result = await pool.query(
      "INSERT INTO shops (name, description) VALUES ($1, $2) RETURNING *",
      [name.trim(), description ? description.trim() : null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to create shop", details: error.message });
  }
});

// PUT update shop
router.put("/:id", validateShop, async (req, res) => {
  try {
    const { name, description } = req.body;
    const { id } = req.params;

    // Check if shop exists
    const shopExists = await pool.query("SELECT id FROM shops WHERE id = $1", [
      id,
    ]);
    if (shopExists.rows.length === 0) {
      return res.status(404).json({ error: "Shop not found" });
    }

    // Check if shop name already exists for another shop
    const existingShop = await pool.query(
      "SELECT id FROM shops WHERE name = $1 AND id != $2",
      [name, id]
    );
    if (existingShop.rows.length > 0) {
      return res.status(409).json({ error: "Shop name already exists" });
    }

    const result = await pool.query(
      "UPDATE shops SET name=$1, description=$2 WHERE id=$3 RETURNING *",
      [name.trim(), description ? description.trim() : null, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to update shop", details: error.message });
  }
});

// DELETE shop
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM shops WHERE id=$1 RETURNING id",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Shop not found" });
    }

    res.json({ success: true, message: "Shop deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to delete shop", details: error.message });
  }
});

module.exports = router;
