// =========================
// 🤖 AI GLOBAL SCRIPT
// =========================

document.addEventListener("DOMContentLoaded", () => {

  const panel = document.getElementById("ai-panel");
  const mini = document.getElementById("ai-mini");
  const menu = document.getElementById("ai-menu");
  const chatBox = document.getElementById("chat-box");

  // =========================
  // BACKEND API
  // =========================
  const API_URL = `${API_BASE_URL}/ai/chat`;
  
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
    menu.style.display =
      menu.style.display === "block"
        ? "none"
        : "block";
  };

  window.handleKey = function (e) {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  window.restartChat = function () {
    chatBox.innerHTML = "";
  };

  window.quickAsk = function (text) {
    document.getElementById("chat-input").value = text;
    sendMessage();
  };

  // =========================
  // UI HELPERS
  // =========================

  function addMessage(text, type) {

    const msg = document.createElement("div");

    msg.classList.add(
      "chat-msg",
      type
    );

    msg.innerText = text;

    chatBox.appendChild(msg);

    chatBox.scrollTop =
      chatBox.scrollHeight;
  }

  function showTyping() {

    removeTyping();

    const typing =
      document.createElement("div");

    typing.classList.add("typing");

    typing.id = "typing";

    typing.innerText =
      "AutoVerse AI is thinking...";

    chatBox.appendChild(typing);

    chatBox.scrollTop =
      chatBox.scrollHeight;
  }

  function removeTyping() {

    const t =
      document.getElementById("typing");

    if (t) {
      t.remove();
    }
  }

  // =========================
  // MAIN FUNCTION
  // =========================

  async function sendMessage() {

    const input =
      document.getElementById("chat-input");

    const message =
      input.value.trim();

    if (!message) return;

    addMessage(
      message,
      "user-msg"
    );

    input.value = "";

    showTyping();

    try {

      const res =
        await fetch(API_URL, {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            message
          })

        });

      if (!res.ok) {

        throw new Error(
          `HTTP Error ${res.status}`
        );

      }

      const data =
        await res.json();

      console.log(
        "AutoVerse AI Response:",
        data
      );

      removeTyping();

      addMessage(
        data.reply ||
        "No response received.",
        "ai-msg"
      );

      // =========================
      // OPEN CAR PAGE
      // =========================

      if (
        data.action === "open_car" &&
        data.id
      ) {

        setTimeout(() => {

          window.location.href =
            `carr.html?id=${data.id}`;

        }, 1500);

      }

      // =========================
      // SEARCH PAGE
      // =========================

      if (
        data.action === "search" &&
        data.query
      ) {

        setTimeout(() => {

          window.location.href =
            `search.html?query=${encodeURIComponent(
              data.query
            )}`;

        }, 1500);

      }

    } catch (err) {

      console.error(
        "AutoVerse AI Error:",
        err
      );

      removeTyping();

      addMessage(
        "⚠️ AutoVerse AI is currently unavailable. Please try again in a moment.",
        "ai-msg"
      );
    }
  }

  // =========================
  // GLOBAL ACCESS
  // =========================

  window.sendMessage =
    sendMessage;

});