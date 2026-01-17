const express = require("express");

module.exports = function (db) {
  const router = express.Router();

  // Lấy tất cả nhật ký
  router.get("/", (req, res) => {
    const sql = `
      SELECT notes.id, title, content, created_at, study_groups.name AS group_name
      FROM notes
      LEFT JOIN study_groups ON notes.group_id = study_groups.id
      ORDER BY created_at DESC;
    `;
    db.query(sql, (err, results) => {
      res.json(results);
    });
  });

  // Thêm nhật ký
  router.post("/", (req, res) => {
    const { title, content, group_id } = req.body;
    const sql = "INSERT INTO notes (title, content, group_id) VALUES (?,?,?)";
    db.query(sql, [title, content, group_id || null], () => {
      res.json({ message: "Đã thêm nhật ký" });
    });
  });

  // Xóa nhật ký
  router.delete("/:id", (req, res) => {
    const sql = "DELETE FROM notes WHERE id=?";
    db.query(sql, [req.params.id], () => {
      res.json({ message: "Đã xóa nhật ký" });
    });
  });

  return router;
};
