const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// KẾT NỐI MYSQL - BẠN NHỚ SỬA LẠI PASSWORD NẾU CẦN
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "123456", // <-- Đổi password của bạn ở đây
  database: "study_log",
});

db.connect((err) => {
  if (err) console.error("Lỗi kết nối MySQL:", err);
  else console.log("Đã kết nối MySQL thành công!");
});

// Gắn routes
app.use("/api/notes", require("./routes/notes")(db));
app.use("/api/groups", require("./routes/study_groups")(db));
app.use("/api/commands", require("./routes/commands")(db));

const PORT = 9999;
app.listen(PORT, () => {
  console.log(`Server chạy tại http://localhost:${PORT}`);
});
