const API = "http://localhost:3000/api";
let allNotesData = []; // Biến lưu trữ tạm danh sách ghi chú để không phải tải lại nhiều lần

// ================= TRANG CHỦ =================
function showHome() {
  document.getElementById("content").innerHTML = `
    <div style="text-align:center; margin-top: 50px;">
        <h1>Chào mừng đến với không gian học tập</h1>
        <p style="color:#666; font-size: 18px;">"Học, học nữa, học mãi."</p>
        <div style="margin-top: 30px; display: flex; gap: 20px; justify-content: center;">
            <div onclick="showAdd()" style="background:white; padding: 20px; border-radius: 10px; width: 200px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); cursor:pointer;">
                <h3 style="color: #4f46e5; font-size: 30px; margin: 0;">✍️</h3>
                <p>Viết bài mới</p>
            </div>
            <div onclick="openHelperPopup()" style="background:white; padding: 20px; border-radius: 10px; width: 200px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); cursor:pointer;">
                <h3 style="color: #10b981; font-size: 30px; margin: 0;">💡</h3>
                <p>Tra cứu lệnh</p>
            </div>
        </div>
    </div>
  `;
}

// ================= QUẢN LÝ NHẬT KÝ (DANH SÁCH CHÍNH) =================
async function loadNotes() {
  document.getElementById("content").innerHTML =
    "<h2>⏳ Đang tải dữ liệu...</h2>";
  try {
    const res = await fetch(API + "/notes");
    allNotesData = await res.json(); // Lưu vào biến toàn cục

    let html = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px;">
            <h2>📖 Nhật ký của tôi</h2>
            <button onclick="showAdd()" class="primary-btn">➕ Viết mới</button>
        </div>
        <ul>`;

    if (allNotesData.length === 0)
      html +=
        "<div style='text-align:center; padding: 40px; color: #888;'>Chưa có nhật ký nào. Hãy viết bài đầu tiên!</div>";
    else {
      allNotesData.forEach((n) => {
        const groupTag = n.group_name
          ? `<span class="tag">${n.group_name}</span>`
          : "";
        const time = new Date(n.created_at).toLocaleString("vi-VN", {
          hour12: false,
        });

        // Chỉ hiển thị tối đa 150 ký tự đầu tiên
        let preview =
          n.content.length > 150
            ? n.content.substring(0, 150) + "..."
            : n.content;

        html += `
          <li class="note-item" onclick="viewNoteDetail(${n.id})">
            <div style="flex:1">
              <h3>${n.title} ${groupTag}</h3>
              <small style="color:#888; margin-bottom:5px; display:block;">📅 ${time}</small>
              <div class="note-preview">${preview}</div>
            </div>
            <button onclick="event.stopPropagation(); deleteNote(${n.id})" class="delete-btn" title="Xóa">🗑️</button>
          </li>
        `;
      });
    }
    html += "</ul>";
    document.getElementById("content").innerHTML = html;
  } catch (e) {
    console.error(e);
    document.getElementById("content").innerHTML =
      `<h3 style="color:red">Lỗi tải dữ liệu. Hãy kiểm tra server!</h3>`;
  }
}

async function deleteNote(id) {
  if (confirm("Bạn chắc chắn muốn xóa bài học này?")) {
    await fetch(API + "/notes/" + id, { method: "DELETE" });
    loadNotes(); // Tải lại danh sách
  }
}

// ================= VIẾT NHẬT KÝ =================
async function showAdd() {
  const res = await fetch(API + "/groups");
  const groups = await res.json();

  let options = '<option value="">-- Chọn nhóm bài học --</option>';
  groups.forEach((g) => {
    options += `<option value="${g.id}">${g.name}</option>`;
  });

  document.getElementById("content").innerHTML = `
    <div style="max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <h2>✍️ Viết nhật ký mới</h2>
        <input id="title" placeholder="Tiêu đề (VD: Học CSS Flexbox...)">
        <select id="groupId">${options}</select>
        <textarea id="contentText" class="big-textarea" placeholder="Nội dung bài học..."></textarea>
        <div style="text-align: right;">
            <button onclick="loadNotes()" style="background: transparent; border: 1px solid #ccc; padding: 10px 20px; border-radius: 8px; margin-right: 10px; cursor: pointer;">Hủy</button>
            <button onclick="addNote()" class="primary-btn">💾 Lưu nhật ký</button>
        </div>
    </div>
  `;
}

async function addNote() {
  const title = document.getElementById("title").value;
  const content = document.getElementById("contentText").value;
  const group_id = document.getElementById("groupId").value || null;

  if (!title) return alert("Đừng để trống tiêu đề nhé!");

  await fetch(API + "/notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, content, group_id }),
  });
  loadNotes();
}

// ================= QUẢN LÝ NHÓM (CẬP NHẬT TÍNH NĂNG XỔ XUỐNG) =================
async function loadGroups() {
  document.getElementById("content").innerHTML = "<h2>⏳ Đang tải...</h2>";

  // Lấy danh sách nhóm
  const gRes = await fetch(API + "/groups");
  const groups = await gRes.json();

  // Lấy TOÀN BỘ nhật ký để phân loại
  const nRes = await fetch(API + "/notes");
  allNotesData = await nRes.json();

  let html = `
      <div style="max-width: 700px; margin: 0 auto;">
        <h2>📂 Nhóm & Bài học</h2>
        <div style="display: flex; gap: 10px; margin-bottom: 20px;">
            <input id="newGroupName" placeholder="Tên nhóm mới..." style="margin-bottom: 0;">
            <button onclick="addGroup()" class="primary-btn" style="white-space: nowrap;">Thêm nhóm</button>
        </div>
        <div id="accordion-container">`;

  if (groups.length === 0) {
    html += "<p style='text-align:center'>Chưa có nhóm nào.</p>";
  } else {
    groups.forEach((g) => {
      // Lọc các bài học thuộc nhóm này
      const groupNotes = allNotesData.filter((n) => n.group_id === g.id);
      const count = groupNotes.length;

      html += `
            <div class="group-container">
                <div class="group-header" onclick="toggleGroupAccordion(${g.id})">
                    <span style="font-weight:600; font-size:16px;">📁 ${g.name} <span style="font-weight:normal; font-size:13px; color:#666">(${count} bài)</span></span>
                    <div>
                        <button onclick="event.stopPropagation(); deleteGroup(${g.id})" class="delete-btn">Xóa nhóm</button>
                    </div>
                </div>
                <div id="g-content-${g.id}" class="group-content">
                    ${groupNotes.length === 0 ? '<div style="font-style:italic; color:#999; padding:5px;">Trống</div>' : ""}
                    ${groupNotes
                      .map(
                        (n) => `
                        <div class="group-note-link" onclick="viewNoteDetail(${n.id})">
                            📄 ${n.title} <span style="font-size:11px; color:#999; float:right">${new Date(n.created_at).toLocaleDateString("vi-VN")}</span>
                        </div>
                    `,
                      )
                      .join("")}
                </div>
            </div>`;
    });
  }

  html += `</div></div>`;
  document.getElementById("content").innerHTML = html;
}

// Hàm hiệu ứng xổ xuống (Accordion)
function toggleGroupAccordion(id) {
  const contentDiv = document.getElementById(`g-content-${id}`);
  if (contentDiv.style.display === "block") {
    contentDiv.style.display = "none"; // Ẩn nếu đang hiện
  } else {
    // Ẩn tất cả các cái khác trước (nếu muốn chỉ mở 1 cái 1 lúc)
    // document.querySelectorAll('.group-content').forEach(d => d.style.display = 'none');
    contentDiv.style.display = "block"; // Hiện cái được chọn
  }
}

async function addGroup() {
  const name = document.getElementById("newGroupName").value;
  if (!name) return alert("Nhập tên nhóm đi bạn!");
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
      "Xóa nhóm này? Các bài viết trong nhóm sẽ không bị xóa mà chỉ mất phân loại.",
    )
  ) {
    await fetch(API + "/groups/" + id, { method: "DELETE" });
    loadGroups();
  }
}

// ================= MODAL XEM CHI TIẾT (TÍNH NĂNG MỚI) =================

// Hàm mở Modal và điền dữ liệu
function viewNoteDetail(noteId) {
  // Tìm bài viết trong mảng dữ liệu đã tải
  const note = allNotesData.find((n) => n.id === noteId);
  if (!note) return;

  const modal = document.getElementById("noteModal");
  const title = document.getElementById("modalTitle");
  const meta = document.getElementById("modalMeta");
  const body = document.getElementById("modalBody");

  // Điền dữ liệu
  title.innerText = note.title;
  const time = new Date(note.created_at).toLocaleString("vi-VN");
  const groupName = note.group_name || "Không thuộc nhóm";

  meta.innerHTML = `📅 Thời gian: ${time} | 📂 Nhóm: <strong>${groupName}</strong>`;

  // Xử lý xuống dòng cho đẹp
  body.innerHTML = note.content.replace(/\n/g, "<br>");

  // Hiển thị modal
  modal.style.display = "block";
}

// Hàm đóng Modal
function closeModal() {
  document.getElementById("noteModal").style.display = "none";
}

// Đóng modal khi click ra ngoài vùng trắng
window.onclick = function (event) {
  const modal = document.getElementById("noteModal");
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

// ================= GIỮ NGUYÊN PHẦN POPUP TRA CỨU CŨ =================
// (Phần openHelperPopup, fetchCommands... bạn giữ nguyên như code trước nhé)
// Tôi copy lại đoạn mở popup để đảm bảo nó không bị thiếu.

function openHelperPopup() {
  const width = 450;
  const height = 700;
  const left = (screen.width - width) / 2;
  const top = (screen.height - height) / 2;
  const popup = window.open(
    "",
    "HelperWindow",
    `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes,alwaysRaised=yes`,
  );

  if (!popup) {
    alert("Trình duyệt chặn popup. Hãy cho phép để dùng tính năng này!");
    return;
  }

  // ... (Code nội dung popup giống hệt bài trước, không cần thay đổi gì ở đây) ...
  // Để tiết kiệm không gian tôi không paste lại toàn bộ nội dung HTML của popup,
  // vì logic đó nằm trong hàm openHelperPopup của phiên bản trước.
  // Nếu bạn cần tôi paste lại toàn bộ thì bảo tôi nhé.

  // Gán lại reference để giao tiếp
  window.helperPopup = popup;
  renderPopupContent(popup);
}

// Hàm render nội dung cho Popup (đã tách ra để gọn code)
function renderPopupContent(popup) {
  const htmlContent = `
    <html>
    <head>
        <title>💡 Tra cứu lệnh</title>
        <style>
            body { font-family: sans-serif; padding: 15px; background: #f9fafb; margin: 0; }
            h3 { color: #4f46e5; margin-top: 0; text-align: center; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
            .search-box { position: sticky; top: 0; background: #f9fafb; padding: 10px 0; z-index: 10; border-bottom: 1px solid #eee; margin-bottom: 10px; }
            input, select { width: 100%; padding: 8px; margin-bottom: 8px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
            .cmd-card { background: white; padding: 10px; border-radius: 6px; border-left: 4px solid #10b981; margin-bottom: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); font-size: 14px; }
            code { background: #eee; padding: 2px 5px; color: #d63384; border-radius: 4px; display: block; margin: 5px 0; white-space: pre-wrap; font-family: monospace; }
            .btn { width: 100%; padding: 8px; background: #4f46e5; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 5px; }
            .btn:hover { background: #4338ca; }
            .delete-btn { float: right; cursor: pointer; border: none; background: none; }
        </style>
    </head>
    <body>
        <div class="search-box">
            <select id="popupLang" onchange="window.opener.searchPopup(this.value, document.getElementById('popupInput').value)">
                <option value="">Tất cả ngôn ngữ</option>
                <option value="Python">Python</option>
                <option value="C++">C++</option>
                <option value="Java">Java</option>
                <option value="SQL">SQL</option>
            </select>
            <input id="popupInput" placeholder="🔍 Tìm lệnh..." onkeyup="window.opener.searchPopup(document.getElementById('popupLang').value, this.value)">
        </div>

        <div id="popupResult">Loading...</div>

        <hr style="margin: 20px 0; border: 0; border-top: 1px solid #ccc;">
        
        <h4 style="margin: 0 0 10px 0;">➕ Thêm lệnh nhanh</h4>
        <input id="newLang" placeholder="Ngôn ngữ (VD: Python)">
        <input id="newCmd" placeholder="Tên lệnh">
        <input id="newSyntax" placeholder="Cú pháp">
        <input id="newEx" placeholder="Ví dụ">
        <button class="btn" onclick="window.opener.addCommandFromPopup()">Lưu lệnh</button>
    </body>
    </html>
    `;
  popup.document.write(htmlContent);
  popup.document.close();
  fetchAndRenderPopup();
}

// CÁC HÀM HỖ TRỢ POPUP (Giữ nguyên)
async function fetchAndRenderPopup(langFilter = "", keyword = "") {
  if (!window.helperPopup || window.helperPopup.closed) return;
  try {
    const res = await fetch(API + "/commands");
    const allCommands = await res.json();
    const filtered = allCommands.filter((c) => {
      const matchText = c.command.toLowerCase().includes(keyword.toLowerCase());
      const matchLang = langFilter === "" || c.language === langFilter;
      return matchText && matchLang;
    });
    const html = filtered.length
      ? filtered
          .map(
            (c) => `
            <div class="cmd-card">
                <button class="delete-btn" onclick="window.opener.deleteCommand(${c.id})">❌</button>
                <div style="font-weight:bold; color:#333">[${c.language}] ${c.command}</div>
                <div style="font-size: 12px; color: #666; margin-top:4px;">Cú pháp:</div>
                <code>${c.syntax}</code>
                <div style="font-size: 12px; color: #666;">Ví dụ:</div>
                <div style="color: #059669; font-style: italic; margin-top:2px;">${c.example}</div>
            </div>
        `,
          )
          .join("")
      : "<p style='text-align:center; color:#999'>Không tìm thấy lệnh nào.</p>";
    const resultDiv = window.helperPopup.document.getElementById("popupResult");
    if (resultDiv) resultDiv.innerHTML = html;
  } catch (e) {
    console.error("Lỗi popup", e);
  }
}
window.searchPopup = function (lang, key) {
  fetchAndRenderPopup(lang, key);
};
window.addCommandFromPopup = async function () {
  const popupDoc = window.helperPopup.document;
  const payload = {
    language: popupDoc.getElementById("newLang").value,
    command: popupDoc.getElementById("newCmd").value,
    syntax: popupDoc.getElementById("newSyntax").value,
    example: popupDoc.getElementById("newEx").value,
  };
  if (!payload.command) return alert("Thiếu tên lệnh!");
  await fetch(API + "/commands", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  popupDoc.getElementById("newCmd").value = "";
  popupDoc.getElementById("newSyntax").value = "";
  popupDoc.getElementById("newEx").value = "";
  fetchAndRenderPopup(
    popupDoc.getElementById("popupLang").value,
    popupDoc.getElementById("popupInput").value,
  );
};
window.deleteCommand = async function (id) {
  if (confirm("Xóa lệnh này?")) {
    await fetch(API + "/commands/" + id, { method: "DELETE" });
    const popupDoc = window.helperPopup?.document;
    if (popupDoc)
      fetchAndRenderPopup(
        popupDoc.getElementById("popupLang").value,
        popupDoc.getElementById("popupInput").value,
      );
  }
};
