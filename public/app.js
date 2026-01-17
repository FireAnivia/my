const API = "http://localhost:3000/api";

// ================= TRANG CHỦ =================
function showHome() {
  document.getElementById("content").innerHTML = `
    <h1>📖 Nhật ký học tập</h1>
    <p>Chọn chức năng bên trái để bắt đầu.</p>
  `;
}

// ================= NHẬT KÝ =================
async function loadNotes() {
  document.getElementById("content").innerHTML =
    "<h2>⏳ Đang tải nhật ký...</h2>";

  try {
    const res = await fetch(API + "/notes");
    const notes = await res.json();

    let html = "<h2>📖 Danh sách nhật ký</h2><ul>";

    if (notes.length === 0) {
      html += "<p>Chưa có nhật ký nào.</p>";
    } else {
      notes.forEach((n) => {
        html += `
          <li>
            <b>${n.title}</b> — ${n.created_at || ""}
            <button onclick="deleteNote(${n.id})">🗑️ Xóa</button>
          </li>
        `;
      });
    }

    html += "</ul>";
    document.getElementById("content").innerHTML = html;
  } catch (err) {
    document.getElementById("content").innerHTML =
      "<p style='color:red'>❌ Lỗi tải nhật ký! Kiểm tra server.</p>";
  }
}

async function deleteNote(id) {
  await fetch(API + "/notes/" + id, { method: "DELETE" });
  loadNotes();
}

// ================= TẠO NHẬT KÝ (SỬA GIAO DIỆN ĐẸP HƠN) =================
function showAdd() {
  document.getElementById("content").innerHTML = `
    <h2>➕ Tạo nhật ký mới</h2>

    <label>Tiêu đề:</label><br>
    <input id="title" class="wide-input" placeholder="Nhập tiêu đề bài học"><br><br>

    <label>Nội dung:</label><br>
    <textarea id="contentText" class="big-textarea"
      placeholder="Viết nội dung học tại đây..."></textarea><br>

    <button onclick="addNote()" class="primary-btn">💾 Lưu nhật ký</button>
  `;
}

async function addNote() {
  const title = document.getElementById("title").value;
  const content = document.getElementById("contentText").value;

  await fetch(API + "/notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, content }),
  });

  alert("Đã lưu nhật ký!");
  loadNotes();
}

// ================= QUẢN LÝ NHÓM (SỬA LỖI HIỂN THỊ) =================
async function loadGroups() {
  // Hiển thị UI TRƯỚC để không bị trống màn hình
  document.getElementById("content").innerHTML = `
    <h2>📂 Quản lý nhóm</h2>

    <input id="groupName" class="wide-input" placeholder="Tên nhóm mới">
    <button onclick="addGroup()" class="primary-btn">➕ Thêm nhóm</button>

    <h3>Danh sách nhóm:</h3>
    <ul id="groupList">
      <li>⏳ Đang tải...</li>
    </ul>
  `;

  try {
    const res = await fetch(API + "/groups");
    const groups = await res.json();

    let list = "";

    if (groups.length === 0) {
      list = "<li>Chưa có nhóm nào.</li>";
    } else {
      groups.forEach((g) => {
        list += `<li>${g.name}</li>`;
      });
    }

    document.getElementById("groupList").innerHTML = list;
  } catch (err) {
    document.getElementById("groupList").innerHTML =
      "<li style='color:red'>❌ Không thể tải nhóm!</li>";
  }
}

async function addGroup() {
  const name = document.getElementById("groupName").value;

  await fetch(API + "/groups", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });

  loadGroups();
}

// ================= HỖ TRỢ LỆNH (BẠN CÓ THỂ THÊM/XÓA) =================

// lưu tạm trong trình duyệt
let commands = JSON.parse(localStorage.getItem("commands") || "[]");

function toggleHelper() {
  const h = document.getElementById("helper");
  h.style.display =
    h.style.display === "none" || h.style.display === "" ? "block" : "none";

  renderCommands();
}

function renderCommands() {
  let html = "";

  if (commands.length === 0) {
    html = "<p>Chưa có lệnh nào. Hãy thêm bên dưới.</p>";
  } else {
    commands.forEach((c, i) => {
      html += `
        <div class="cmd-item">
          <b>[${c.lang}]</b> ${c.text}
          <button onclick="deleteCommand(${i})">🗑️</button>
        </div>
      `;
    });
  }

  document.getElementById("cmdResult").innerHTML = html;
}

function addCommand() {
  const lang = document.getElementById("cmdLang").value;
  const text = document.getElementById("cmdText").value;

  commands.push({ lang, text });
  localStorage.setItem("commands", JSON.stringify(commands));

  document.getElementById("cmdText").value = "";
  renderCommands();
}

function deleteCommand(i) {
  commands.splice(i, 1);
  localStorage.setItem("commands", JSON.stringify(commands));
  renderCommands();
}
