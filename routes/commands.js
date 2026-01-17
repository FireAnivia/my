const express = require("express");

module.exports = function (db) {
  const router = express.Router();

  // Lấy tất cả lệnh hỗ trợ
  router.get("/", (req, res) => {
    const sql = "SELECT * FROM commands ORDER BY language, command";
    db.query(sql, (err, results) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json(results);
      }
    });
  });

  // Thêm lệnh mới
  router.post("/", (req, res) => {
    const { language, command, syntax, example } = req.body;

    const sql =
      "INSERT INTO commands (language, command, syntax, example) VALUES (?,?,?,?)";

    db.query(sql, [language, command, syntax, example], (err, result) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({
          message: "Đã thêm lệnh hỗ trợ",
          id: result.insertId,
        });
      }
    });
  });

  // Xóa lệnh theo id
  router.delete("/:id", (req, res) => {
    const sql = "DELETE FROM commands WHERE id = ?";
    db.query(sql, [req.params.id], (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ message: "Đã xóa lệnh" });
      }
    });
  });

  return router;
};
