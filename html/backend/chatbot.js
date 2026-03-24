async function sendMessage() {
  const input = document.getElementById("chat-input");
  const message = input.value.trim();

  if (!message) return;

  const chatBox = document.getElementById("chat-box");

  chatBox.innerHTML += `<p><strong>You:</strong> ${message}</p>`;

  const res = await fetch("http://localhost:5000/api/ai/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ message })
  });

  const data = await res.json();

  chatBox.innerHTML += `<p><strong>AI:</strong> ${data.reply}</p>`;

  // =========================
  // 🔥 ACTION HANDLER
  // =========================
  if (data.action === "open_car") {
    window.location.href = `carr.html?id=${data.id}`;
  }

  if (data.action === "search") {
    window.location.href = `search.html?query=${encodeURIComponent(data.query)}`;
  }

  input.value = "";
}