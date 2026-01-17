const express = require("express");

module.exports = function (db) {
  const router = express.Router();

  router.get("/", (req, res) => {
    db.query("SELECT * FROM study_groups", (err, results) => {
      res.json(results);
    });
  });

  router.post("/", (req, res) => {
    db.query(
      "INSERT INTO study_groups (name) VALUES (?)",
      [req.body.name],
      () => res.json({ message: "Đã thêm nhóm" }),
    );
  });

  router.delete("/:id", (req, res) => {
    db.query("DELETE FROM study_groups WHERE id=?", [req.params.id], () =>
      res.json({ message: "Đã xóa nhóm" }),
    );
  });

  return router;
};
