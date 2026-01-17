const API = "http://localhost:3000/api";

// ================= TRANG CHỦ =================
function showHome() {
  document.getElementById("content").innerHTML = `
    <h1>📖 Nhật ký học tập</h1>
    <p>Hệ thống quản lý kiến thức cá nhân.</p>
  `;
}

// ================= QUẢN LÝ NHẬT KÝ =================
async function loadNotes() {
  document.getElementById("content").innerHTML = "<h2>⏳ Đang tải...</h2>";
  try {
    const res = await fetch(API + "/notes");
    const notes = await res.json();

    let html = "<h2>📖 Danh sách nhật ký</h2><ul>";
    if (notes.length === 0) html += "<p>Chưa có nhật ký nào.</p>";
    else {
      notes.forEach((n) => {
        // Hiển thị Tên nhóm nếu có
        const groupTag = n.group_name
          ? `<span class="tag">${n.group_name}</span>`
          : "";
        const time = new Date(n.created_at).toLocaleString("vi-VN");

        html += `
          <li class="note-item">
            <div>
              <h3>${n.title} ${groupTag}</h3>
              <small>📅 ${time}</small>
              <p>${n.content}</p>
            </div>
            <button onclick="deleteNote(${n.id})">🗑️</button>
          </li>
        `;
      });
    }
    html += "</ul>";
    document.getElementById("content").innerHTML = html;
  } catch (e) {
    alert("Lỗi tải nhật ký!");
  }
}

async function deleteNote(id) {
  if (confirm("Bạn chắc chắn muốn xóa?")) {
    await fetch(API + "/notes/" + id, { method: "DELETE" });
    loadNotes();
  }
}

// ================= TẠO NHẬT KÝ (CÓ CHỌN NHÓM) =================
async function showAdd() {
  // Lấy danh sách nhóm để đưa vào dropdown
  const res = await fetch(API + "/groups");
  const groups = await res.json();

  let options = '<option value="">-- Không thuộc nhóm --</option>';
  groups.forEach((g) => {
    options += `<option value="${g.id}">${g.name}</option>`;
  });

  document.getElementById("content").innerHTML = `
    <h2>➕ Viết nhật ký mới</h2>
    <label>Tiêu đề:</label><br>
    <input id="title" class="wide-input" placeholder="Hôm nay học gì?"><br><br>
    
    <label>Thuộc nhóm:</label><br>
    <select id="groupId">${options}</select><br><br>

    <label>Nội dung:</label><br>
    <textarea id="contentText" class="big-textarea" placeholder="Nội dung chi tiết..."></textarea><br>
    
    <button onclick="addNote()" class="primary-btn">💾 Lưu lại</button>
  `;
}

async function addNote() {
  const title = document.getElementById("title").value;
  const content = document.getElementById("contentText").value;
  const group_id = document.getElementById("groupId").value || null;

  if (!title) return alert("Vui lòng nhập tiêu đề!");

  await fetch(API + "/notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, content, group_id }),
  });
  alert("Đã lưu!");
  loadNotes();
}

// ================= QUẢN LÝ NHÓM =================
async function loadGroups() {
  const res = await fetch(API + "/groups");
  const groups = await res.json();

  let listHtml = groups
    .map(
      (g) => `
    <li>
      <b>${g.name}</b> 
      <button onclick="deleteGroup(${g.id})">❌</button>
    </li>`,
    )
    .join("");

  document.getElementById("content").innerHTML = `
    <h2>📂 Quản lý nhóm học tập</h2>
    <div style="margin-bottom: 20px;">
      <input id="newGroupName" placeholder="Tên nhóm mới...">
      <button onclick="addGroup()">Thêm nhóm</button>
    </div>
    <ul>${listHtml || "<li>Chưa có nhóm nào</li>"}</ul>
  `;
}

async function addGroup() {
  const name = document.getElementById("newGroupName").value;
  if (!name) return;
  await fetch(API + "/groups", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  loadGroups();
}

async function deleteGroup(id) {
  if (
    confirm(
      "Xóa nhóm này sẽ giữ lại các nhật ký nhưng mất phân loại. Tiếp tục?",
    )
  ) {
    await fetch(API + "/groups/" + id, { method: "DELETE" });
    loadGroups();
  }
}

// ================= HỖ TRỢ TRA CỨU (QUAN TRỌNG) =================
let allCommands = []; // Biến lưu tạm danh sách lệnh để lọc nhanh

function toggleHelper() {
  const h = document.getElementById("helper");
  if (h.style.display === "none") {
    h.style.display = "block";
    fetchCommands(); // Tải dữ liệu mới nhất khi mở
  } else {
    h.style.display = "none";
  }
}

async function fetchCommands() {
  const res = await fetch(API + "/commands");
  allCommands = await res.json();
  searchCommands(); // Hiển thị luôn
}

function searchCommands() {
  const keyword = document.getElementById("searchInput").value.toLowerCase();
  const langFilter = document.getElementById("filterLang").value;

  // Lọc dữ liệu
  const filtered = allCommands.filter((c) => {
    const matchText = c.command.toLowerCase().includes(keyword);
    const matchLang = langFilter === "" || c.language === langFilter;
    return matchText && matchLang;
  });

  // Render ra HTML
  const resultDiv = document.getElementById("cmdResult");
  if (filtered.length === 0) {
    resultDiv.innerHTML = "<p>Không tìm thấy lệnh nào.</p>";
    return;
  }

  resultDiv.innerHTML = filtered
    .map(
      (c) => `
    <div class="cmd-card">
      <div style="display:flex; justify-content:space-between">
        <strong style="color: #007bff">[${c.language}] ${c.command}</strong>
        <button onclick="deleteCommand(${c.id})" class="sm-btn">🗑️</button>
      </div>
      <div><b>Cú pháp:</b> <code>${c.syntax}</code></div>
      <div><b>Ví dụ:</b> <span style="color:green">${c.example}</span></div>
    </div>
  `,
    )
    .join("");
}

async function addCommand() {
  const payload = {
    language: document.getElementById("newCmdLang").value,
    command: document.getElementById("newCmdName").value,
    syntax: document.getElementById("newCmdSyntax").value,
    example: document.getElementById("newCmdExample").value,
  };

  if (!payload.command) return alert("Nhập tên lệnh!");

  await fetch(API + "/commands", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  // Reset form
  document.getElementById("newCmdName").value = "";
  document.getElementById("newCmdSyntax").value = "";
  document.getElementById("newCmdExample").value = "";

  fetchCommands(); // Tải lại danh sách
}

async function deleteCommand(id) {
  if (confirm("Xóa lệnh này?")) {
    await fetch(API + "/commands/" + id, { method: "DELETE" });
    fetchCommands();
  }
}
