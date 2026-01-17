const API = "http://localhost:3000/api";

// ================= TRANG CHỦ =================
function showHome() {
  document.getElementById("content").innerHTML = `
    <div style="text-align:center; margin-top: 50px;">
        <h1>Chào mừng đến với không gian học tập</h1>
        <p style="color:#666; font-size: 18px;">"Học, học nữa, học mãi."</p>
        <div style="margin-top: 30px; display: flex; gap: 20px; justify-content: center;">
            <div style="background:white; padding: 20px; border-radius: 10px; width: 200px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <h3 style="color: #4f46e5; font-size: 30px; margin: 0;">📚</h3>
                <p>Ghi chép bài học</p>
            </div>
            <div style="background:white; padding: 20px; border-radius: 10px; width: 200px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <h3 style="color: #10b981; font-size: 30px; margin: 0;">💡</h3>
                <p>Tra cứu nhanh</p>
            </div>
        </div>
    </div>
  `;
}

// ================= QUẢN LÝ NHẬT KÝ =================
async function loadNotes() {
  document.getElementById("content").innerHTML =
    "<h2>⏳ Đang tải dữ liệu...</h2>";
  try {
    const res = await fetch(API + "/notes");
    const notes = await res.json();

    let html = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px;">
            <h2>📖 Danh sách bài học</h2>
            <button onclick="showAdd()" class="primary-btn">➕ Viết mới</button>
        </div>
        <ul>`;

    if (notes.length === 0)
      html +=
        "<div style='text-align:center; padding: 40px; color: #888;'>Chưa có nhật ký nào. Hãy viết bài đầu tiên!</div>";
    else {
      notes.forEach((n) => {
        const groupTag = n.group_name
          ? `<span class="tag">${n.group_name}</span>`
          : "";
        const time = new Date(n.created_at).toLocaleString("vi-VN", {
          hour12: false,
        });
        html += `
          <li class="note-item">
            <div style="flex:1">
              <h3>${n.title} ${groupTag}</h3>
              <small>📅 ${time}</small>
              <p>${n.content.replace(/\n/g, "<br>")}</p>
            </div>
            <button onclick="deleteNote(${n.id})" class="delete-btn" title="Xóa">🗑️</button>
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
    loadNotes();
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
        
        <label><strong>Tiêu đề bài học:</strong></label>
        <input id="title" placeholder="VD: Tìm hiểu về vòng lặp For trong Python...">
        
        <label><strong>Phân loại nhóm:</strong></label>
        <select id="groupId">${options}</select>

        <label><strong>Nội dung chi tiết:</strong></label>
        <textarea id="contentText" class="big-textarea" placeholder="Ghi lại những gì bạn đã học được..."></textarea>
        
        <div style="text-align: right;">
            <button onclick="loadNotes()" style="background: transparent; border: 1px solid #ccc; padding: 12px 20px; border-radius: 8px; margin-right: 10px; cursor: pointer;">Hủy</button>
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

// ================= QUẢN LÝ NHÓM =================
async function loadGroups() {
  const res = await fetch(API + "/groups");
  const groups = await res.json();

  let listHtml = groups
    .map(
      (g) => `
    <li class="group-item">
      <span>📁 <b>${g.name}</b></span> 
      <button onclick="deleteGroup(${g.id})" class="delete-btn">Xóa</button>
    </li>`,
    )
    .join("");

  document.getElementById("content").innerHTML = `
    <div style="max-width: 600px; margin: 0 auto;">
        <h2>📂 Quản lý nhóm</h2>
        <div style="display: flex; gap: 10px; margin-bottom: 20px;">
            <input id="newGroupName" placeholder="Nhập tên nhóm mới (VD: ReactJS, Docker...)" style="margin-bottom: 0;">
            <button onclick="addGroup()" class="primary-btn" style="white-space: nowrap;">Thêm nhóm</button>
        </div>
        <ul>${listHtml || "<p style='text-align:center'>Chưa có nhóm nào</p>"}</ul>
    </div>
  `;
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
      "Lưu ý: Các bài viết thuộc nhóm này sẽ không bị xóa, nhưng sẽ mất nhãn nhóm. Tiếp tục?",
    )
  ) {
    await fetch(API + "/groups/" + id, { method: "DELETE" });
    loadGroups();
  }
}

// ================= TÍNH NĂNG CỬA SỔ RỜI (POPUP) =================
// Đây là giải pháp cho yêu cầu "Luôn hiển thị" của bạn
function openHelperPopup() {
  // Tạo một cửa sổ mới với kích thước nhỏ gọn
  const width = 450;
  const height = 700;
  const left = (screen.width - width) / 2;
  const top = (screen.height - height) / 2;

  // Mở cửa sổ popup
  const popup = window.open(
    "",
    "HelperWindow",
    `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes,alwaysRaised=yes`,
  );

  if (!popup) {
    alert(
      "Trình duyệt đã chặn cửa sổ bật lên. Hãy cho phép popup để dùng tính năng này!",
    );
    return;
  }

  // Viết nội dung HTML vào cửa sổ mới này
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

  // Lưu reference cửa sổ popup vào biến toàn cục để JS chính có thể điều khiển
  window.helperPopup = popup;

  // Tải dữ liệu lần đầu cho popup
  fetchAndRenderPopup();
}

// Hàm lấy dữ liệu và hiển thị lên Popup
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

// Hàm được gọi từ Popup khi gõ phím
window.searchPopup = function (lang, key) {
  fetchAndRenderPopup(lang, key);
};

// Hàm thêm lệnh từ Popup
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

  // Clear input trong popup
  popupDoc.getElementById("newCmd").value = "";
  popupDoc.getElementById("newSyntax").value = "";
  popupDoc.getElementById("newEx").value = "";

  fetchAndRenderPopup(
    popupDoc.getElementById("popupLang").value,
    popupDoc.getElementById("popupInput").value,
  );
};

// Xóa lệnh (dùng chung cho cả popup và main)
window.deleteCommand = async function (id) {
  if (confirm("Xóa lệnh này?")) {
    await fetch(API + "/commands/" + id, { method: "DELETE" });
    // Refresh popup nếu đang mở
    const popupDoc = window.helperPopup?.document;
    if (popupDoc) {
      fetchAndRenderPopup(
        popupDoc.getElementById("popupLang").value,
        popupDoc.getElementById("popupInput").value,
      );
    }
  }
};
