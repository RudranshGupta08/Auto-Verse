// =========================
// 🤖 AI GLOBAL SCRIPT
// =========================

document.addEventListener("DOMContentLoaded", () => {

  const panel = document.getElementById("ai-panel");
  const mini = document.getElementById("ai-mini");
  const menu = document.getElementById("ai-menu");
  const chatBox = document.getElementById("chat-box");

  // ===== OPEN / CLOSE =====
  window.openAI = function () {
    panel.style.display = "flex";
    mini.style.display = "none";
  };

  window.closeAI = function () {
    panel.style.display = "none";
    mini.style.display = "flex";
  };

  window.toggleMenu = function () {
    menu.style.display = menu.style.display === "block" ? "none" : "block";
  };

  window.handleKey = function (e) {
    if (e.key === "Enter") sendMessage();
  };

  window.restartChat = function () {
    chatBox.innerHTML = "";
  };

  window.quickAsk = function (text) {
    document.getElementById("chat-input").value = text;
    sendMessage();
  };

  // ===== UI =====
  function addMessage(text, type) {
    const msg = document.createElement("div");
    msg.classList.add("chat-msg", type);
    msg.innerText = text;
    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  function showTyping() {
    const typing = document.createElement("div");
    typing.classList.add("typing");
    typing.id = "typing";
    typing.innerText = "AI is typing...";
    chatBox.appendChild(typing);
  }

  function removeTyping() {
    const t = document.getElementById("typing");
    if (t) t.remove();
  }

  // ===== MAIN FUNCTION =====
  async function sendMessage() {
    const input = document.getElementById("chat-input");
    const message = input.value.trim();
    if (!message) return;

    addMessage(message, "user-msg");
    input.value = "";

    showTyping();

    try {
      const res = await fetch("http://localhost:5000/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message })
      });

      const data = await res.json();

      removeTyping();
      addMessage(data.reply, "ai-msg");

      // ===== ACTIONS =====
      if (data.action === "open_car") {
        setTimeout(() => {
          window.location.href = `carr.html?id=${data.id}`;
        }, 2000);
      }

      if (data.action === "search") {
        setTimeout(() => {
          window.location.href = `search.html?query=${encodeURIComponent(data.query)}`;
        }, 2000);
      }

    } catch {
      removeTyping();
      addMessage("⚠️ Server error", "ai-msg");
    }
  }

  // expose globally
  window.sendMessage = sendMessage;

});