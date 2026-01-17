const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// Kết nối MySQL
const db = mysql.createConnection({
  host: "localhost",
  user: "root", // ← đổi nếu bạn dùng user khác
  password: "123456", // ← đổi thành mật khẩu MySQL của bạn
  database: "study_log",
});

db.connect((err) => {
  if (err) {
    console.error("Lỗi kết nối MySQL:", err);
  } else {
    console.log("Đã kết nối MySQL!");
  }
});

// Gắn routes
app.use("/api/notes", require("./routes/notes")(db));
app.use("/api/groups", require("./routes/groups")(db));
app.use("/api/commands", require("./routes/commands")(db));

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server chạy tại http://localhost:${PORT}`);
});
