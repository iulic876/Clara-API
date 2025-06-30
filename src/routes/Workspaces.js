const express = require("express");
const router = express.Router();

module.exports = (db) => {
  // GET all workspaces
  router.get("/", async (req, res) => {
    try {
      const { rows } = await db.query(
        "SELECT * FROM workspaces ORDER BY created_at DESC"
      );
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch workspaces" });
    }
  });

  // POST create workspace
  router.post("/", async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });

    try {
      const { rows } = await db.query(
        `INSERT INTO workspaces (name) VALUES ($1) RETURNING *`,
        [name]
      );
      res.json(rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to create workspace" });
    }
  });

  // PUT update workspace
  router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });

    try {
      const { rows } = await db.query(
        `UPDATE workspaces SET name=$1 WHERE id=$2 RETURNING *`,
        [name, id]
      );
      res.json(rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to update workspace" });
    }
  });

  // DELETE workspace
  router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    try {
      await db.query(`DELETE FROM workspaces WHERE id=$1`, [id]);
      res.json({ ok: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to delete workspace" });
    }
  });

  return router;
};
