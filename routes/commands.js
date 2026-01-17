const express = require("express");

module.exports = function (db) {
  const router = express.Router();

  // Lấy danh sách lệnh
  router.get("/", (req, res) => {
    db.query(
      "SELECT * FROM commands ORDER BY language, command",
      (err, results) => {
        if (err) res.status(500).json({ error: err.message });
        else res.json(results);
      },
    );
  });

  // Thêm lệnh mới
  router.post("/", (req, res) => {
    const { language, command, syntax, example } = req.body;
    const sql =
      "INSERT INTO commands (language, command, syntax, example) VALUES (?,?,?,?)";
    db.query(sql, [language, command, syntax, example], (err, result) => {
      if (err) res.status(500).json({ error: err.message });
      else res.json({ message: "Đã thêm lệnh", id: result.insertId });
    });
  });

  // Xóa lệnh
  router.delete("/:id", (req, res) => {
    db.query("DELETE FROM commands WHERE id = ?", [req.params.id], (err) => {
      if (err) res.status(500).json({ error: err.message });
      else res.json({ message: "Đã xóa lệnh" });
    });
  });

  return router;
};
