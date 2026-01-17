const API = "http://localhost:3000/api";

async function loadNotes() {
  const res = await fetch(API + "/notes");
  const notes = await res.json();

  let html = "<h2>Danh sách nhật ký</h2><ul>";
  notes.forEach((n) => {
    html += `<li>
      <b>${n.title}</b> - ${n.created_at} - Nhóm: ${n.group_name || "Không"}
      <button onclick="deleteNote(${n.id})">Xóa</button>
    </li>`;
  });
  html += "</ul>";

  document.getElementById("content").innerHTML = html;
}

async function deleteNote(id) {
  await fetch(API + "/notes/" + id, { method: "DELETE" });
  loadNotes();
}

function showAdd() {
  document.getElementById("content").innerHTML = `
    <h2>Thêm nhật ký</h2>
    <input id="title" placeholder="Tiêu đề">
    <textarea id="contentText"></textarea>
    <button onclick="addNote()">Lưu</button>
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

  loadNotes();
}
