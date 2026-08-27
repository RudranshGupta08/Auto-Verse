(() => {
  const API = typeof API_BASE_URL !== "undefined"
    ? API_BASE_URL : "https://auto-verse-hcp5.onrender.com/api";
  const IMAGE_BASE = "https://auto-verse-hcp5.onrender.com/images/";

  const state = { cars: [], selected: [null, null, null] };
  const $ = id => document.getElementById(id);
  const normalise = v => String(v ?? "").toLowerCase().trim();
  const arr = v => Array.isArray(v) ? v : (v ? [v] : []);
  const text = v => arr(v).join(" / ") || "—";

  const escapeHTML = v => String(v ?? "")
    .replace(/&/g,"&amp;").replace(/</g,"&lt;")
    .replace(/>/g,"&gt;").replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");

  const price = car => car.priceRange || "Price on request";
  const body = car => car.bodyType || car.type || "Automobile";
  const image = car => IMAGE_BASE + (
    Array.isArray(car.images) && car.images.length ? car.images[0] : "placeholder.jpg"
  );
  const rating = car => Math.max(1, Math.min(5, Math.round(Number(car.rating) || 3)));
  const stars = car => "★".repeat(rating(car)) + "☆".repeat(5-rating(car));

  const field = (label, key, formatter = v => v) => {
    const cars = state.selected;
    return `
      <div class="compare-row">
        <div class="metric-name">${label}</div>
        ${cars.map(car => `<div class="metric-value">${formatter(car?.[key])}</div>`).join("")}
      </div>`;
  };

  function renderSelectors() {
    document.querySelectorAll(".selector-card").forEach((card, i) => {
      const car = state.selected[i];
      const empty = card.querySelector(".selector-empty");
      const search = card.querySelector(".selector-search");
      const input = search.querySelector("input");

      if (car) {
        empty.innerHTML = `
          <div class="selected-car">
            <img src="${image(car)}" alt="${escapeHTML(car.brand)} ${escapeHTML(car.model)}">
            <div>
              <span>${escapeHTML(car.brand)}</span>
              <strong>${escapeHTML(car.model)}</strong>
              <small>${escapeHTML(price(car))}</small>
            </div>
            <button class="remove-car" type="button">×</button>
          </div>`;
        empty.classList.add("has-car");
        input.value = "";
        search.classList.remove("open");
      } else {
        empty.innerHTML = `<b>ADD VEHICLE</b><p>Search brand or model</p>`;
        empty.classList.remove("has-car");
      }
    });

    $("selectionMeta").textContent =
      `${state.selected.filter(Boolean).length} / 3 vehicles selected`;
    $("compareBtn").disabled = state.selected.filter(Boolean).length < 2;
  }

  function suggestions(card, query) {
    const i = Number(card.dataset.slot);
    const box = card.querySelector(".suggestions");
    const q = normalise(query);

    if (!q) { box.innerHTML = ""; return; }

    const selectedIds = new Set(state.selected.filter(Boolean).map(c => c._id));
    const matches = state.cars
      .filter(c => !selectedIds.has(c._id))
      .filter(c => normalise(`${c.brand} ${c.model}`).includes(q))
      .slice(0, 6);

    box.innerHTML = matches.length ? matches.map(car => `
      <button class="suggestion" type="button" data-id="${escapeHTML(car._id)}">
        <img src="${image(car)}" alt="">
        <span><b>${escapeHTML(car.brand)} ${escapeHTML(car.model)}</b><small>${escapeHTML(price(car))} · ${escapeHTML(body(car))}</small></span>
      </button>
    `).join("") : `<div class="no-suggestion">No matching vehicle.</div>`;

    box.querySelectorAll(".suggestion").forEach(btn => {
      btn.addEventListener("click", () => {
        const car = state.cars.find(c => String(c._id) === String(btn.dataset.id));
        state.selected[i] = car || null;
        renderSelectors();
        renderComparison();
      });
    });
  }

  function renderComparison() {
    const cars = state.selected.filter(Boolean);
    const section = $("comparisonTable");

    if (cars.length < 2) {
      section.innerHTML = `<div class="compare-placeholder"><span>VS</span><h3>Your comparison is waiting.</h3><p>Choose two or three vehicles above.</p></div>`;
      $("comparisonNote").textContent = "Select at least two vehicles to reveal the comparison.";
      $("decisionCard").innerHTML = `<span>COMPARISON INSIGHT</span><h3>Add vehicles to unlock the AutoVerse take.</h3>`;
      return;
    }

    $("comparisonNote").textContent =
      `${cars.length} vehicles · side-by-side intelligence`;

    const header = `
      <div class="compare-row compare-header">
        <div class="metric-name">AUTOVERSE DATA</div>
        ${cars.map((car,i) => `
          <div class="metric-value car-heading">
            <img src="${image(car)}" alt="">
            <span>${String(i+1).padStart(2,"0")}</span>
            <strong>${escapeHTML(car.brand)} ${escapeHTML(car.model)}</strong>
            <small>${escapeHTML(price(car))}</small>
          </div>`).join("")}
      </div>`;

    const rows = [
      ["Body Type", c => body(c)],
      ["Powertrain", c => text(c.fuelType)],
      ["Transmission", c => text(c.transmission)],
      ["Mileage / Range", c => c.mileage || c.range || "—"],
      ["Seating", c => c.seatingCapacity ? `${c.seatingCapacity} seats` : "—"],
      ["Engine", c => text(c.engineOptions || c.engine)],
      ["Rating", c => `${stars(c)} ${Number(c.rating) ? Number(c.rating).toFixed(1) : "—"}`],
      ["Safety / NCAP", c => c.ncapRating || "—"],
      ["Best For", c => text(c.bestFor)],
      ["Verdict", c => c.verdict || "—"]
    ];

    section.innerHTML = `<div class="comparison-table">${header}${rows.map(([label, fn]) => `
      <div class="compare-row">
        <div class="metric-name">${label}</div>
        ${cars.map(car => `<div class="metric-value">${escapeHTML(fn(car))}</div>`).join("")}
      </div>`).join("")}</div>`;

    // Lightweight insight based only on fields available in the current catalogue.
    const ratings = cars.map(c => Number(c.rating) || 0);
    const bestIndex = ratings.indexOf(Math.max(...ratings));
    const best = cars[bestIndex];
    const priceText = cars.map(c => price(c)).join(" · ");

    $("decisionCard").innerHTML = `
      <span>AUTOVERSE INSIGHT</span>
      <h3>${escapeHTML(best.brand)} ${escapeHTML(best.model)} leads on current catalogue rating.</h3>
      <p>Compare the practical differences above before making the shortlist. Current prices: ${escapeHTML(priceText)}.</p>
      <a href="vehicle.html?id=${encodeURIComponent(best._id)}">EXPLORE THE LEADING VEHICLE →</a>`;
  }

  document.querySelectorAll(".selector-card").forEach(card => {
    const input = card.querySelector("input");
    input.addEventListener("focus", () => card.querySelector(".selector-search").classList.add("open"));
    input.addEventListener("input", () => suggestions(card, input.value));
  });

  document.addEventListener("click", e => {
    if (!e.target.closest(".selector-card")) {
      document.querySelectorAll(".selector-search").forEach(el => el.classList.remove("open"));
    }
    const remove = e.target.closest(".remove-car");
    if (remove) {
      const card = remove.closest(".selector-card");
      const i = Number(card.dataset.slot);
      state.selected[i] = null;
      renderSelectors();
      renderComparison();
    }
  });

  $("compareBtn").addEventListener("click", () => {
    $("comparisonSection").scrollIntoView({ behavior:"smooth", block:"start" });
    renderComparison();
  });

  addEventListener("scroll", () => {
    $("compareNav").classList.toggle("scrolled", scrollY > 30);
    const max = document.documentElement.scrollHeight - innerHeight;
    $("scrollProgress").style.height = `${max > 0 ? scrollY/max*100 : 0}%`;
  }, { passive:true });

  if (matchMedia("(pointer:fine)").matches && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.body.classList.add("cursor-ready");
    const dot = document.querySelector(".cursor-dot"), ring = document.querySelector(".cursor-ring");
    let mx=innerWidth/2,my=innerHeight/2,rx=mx,ry=my;
    addEventListener("pointermove",e=>{mx=e.clientX;my=e.clientY;dot.style.left=`${mx}px`;dot.style.top=`${my}px`},{passive:true});
    const tick=()=>{rx+=(mx-rx)*.18;ry+=(my-ry)*.18;ring.style.left=`${rx}px`;ring.style.top=`${ry}px`;requestAnimationFrame(tick)};tick();
    document.addEventListener("pointerover",e=>{if(e.target.closest("a,button,input,.selector-card"))document.body.classList.add("cursor-hover")});
    document.addEventListener("pointerout",e=>{if(e.target.closest("a,button,input,.selector-card"))document.body.classList.remove("cursor-hover")});
  }

  async function init() {
    try {
      const res = await fetch(`${API}/cars`);
      if (!res.ok) throw new Error(`Catalogue request failed: ${res.status}`);
      const data = await res.json();
      state.cars = Array.isArray(data) ? data : (data.cars || []);
      renderSelectors();
    } catch (err) {
      console.error("AutoVerse Compare:", err);
      document.querySelector(".studio-section").insertAdjacentHTML("beforeend",
        `<p class="load-error">Unable to connect to the AutoVerse vehicle catalogue.</p>`);
    }
  }

  init();
})();
