const form = document.getElementById("loginForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch("http://localhost:5000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (data.token) {
      localStorage.setItem("token", data.token);

      alert("✅ Login Successful");

      window.location.href = "index.html";

    } else {
      alert("❌ " + data.message);
    }

  } catch (err) {
    console.error(err);
    alert("⚠️ Server error");
  }
});