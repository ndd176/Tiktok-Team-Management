const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET all channels
router.get("/", async (req, res) => {
  const result = await pool.query("SELECT * FROM channels ORDER BY id DESC");
  res.json(result.rows);
});

// POST add channel
router.post("/", async (req, res) => {
  const { name, description } = req.body;
  const result = await pool.query(
    "INSERT INTO channels (name, description) VALUES ($1, $2) RETURNING *",
    [name, description]
  );
  res.json(result.rows[0]);
});

// PUT update channel
router.put("/:id", async (req, res) => {
  const { name, description } = req.body;
  const { id } = req.params;
  const result = await pool.query(
    "UPDATE channels SET name=$1, description=$2 WHERE id=$3 RETURNING *",
    [name, description, id]
  );
  res.json(result.rows[0]);
});

// DELETE channel
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  await pool.query("DELETE FROM channels WHERE id=$1", [id]);
  res.json({ success: true });
});

module.exports = router;
