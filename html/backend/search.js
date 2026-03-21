// =========================
// 🔍 UNIVERSAL SEARCH BAR (NO OVERLAP)
// =========================
document.addEventListener("DOMContentLoaded", () => {

  // Prevent duplicate
  if (document.querySelector(".search-box")) return;

  const searchBox = document.createElement("div");
  searchBox.classList.add("search-box");

  searchBox.innerHTML = `
    <input type="text" id="searchInput" placeholder="Search cars...">
    <button id="searchBtn">🔍</button>
  `;

  // 🔥 FIND NAVBAR OR HEADER
  let container = document.querySelector(".navbar");

  if (!container) {
    const header = document.querySelector("header");

    // create navbar if not exists
    container = document.createElement("div");
    container.classList.add("navbar");
    header.appendChild(container);
  }

  container.appendChild(searchBox);

  // =========================
  // SEARCH FUNCTION
  // =========================
  const input = document.getElementById("searchInput");
  const btn = document.getElementById("searchBtn");

  function search() {
    const query = input.value.trim();

    if (!query) {
      alert("⚠️ Enter car name or brand");
      return;
    }

    window.location.href = `search.html?query=${encodeURIComponent(query)}`;
  }

  btn.addEventListener("click", search);
  input.addEventListener("keypress", e => {
    if (e.key === "Enter") search();
  });

});