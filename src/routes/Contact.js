const express = require("express");
const router = express.Router();

module.exports = (db) => {
  // GET all contacts
  router.get("/", async (req, res) => {
    try {
      const { rows } = await db.query(
        "SELECT * FROM contacts ORDER BY created_at DESC"
      );
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch contacts" });
    }
  });

  // GET contact by id
  router.get("/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const { rows } = await db.query(
        "SELECT * FROM contacts WHERE id = $1",
        [id]
      );
      if (rows.length === 0) {
        return res.status(404).json({ error: "Contact not found" });
      }
      res.json(rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch contact" });
    }
  });

  // POST create contact
  router.post("/", async (req, res) => {
    const { name, email, phone, workspace_id } = req.body;
    try {
      const { rows } = await db.query(
        `INSERT INTO contacts (name, email, phone, workspace_id) 
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [name, email, phone, workspace_id]
      );
      res.json(rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to create contact" });
    }
  });

  // PUT update contact
  router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { name, email, phone } = req.body;
    try {
      const { rows } = await db.query(
        `UPDATE contacts SET name=$1, email=$2, phone=$3 WHERE id=$4 RETURNING *`,
        [name, email, phone, id]
      );
      res.json(rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to update contact" });
    }
  });

  // DELETE contact
  router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    try {
      await db.query(`DELETE FROM contacts WHERE id=$1`, [id]);
      res.json({ ok: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to delete contact" });
    }
  });

  return router;
};
