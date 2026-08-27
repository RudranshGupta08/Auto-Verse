(() => {
  const API = typeof API_BASE_URL !== "undefined"
    ? API_BASE_URL
    : "https://auto-verse-hcp5.onrender.com/api";

  const IMAGE_BASE = "https://auto-verse-hcp5.onrender.com/images/";
  const PAGE_SIZE = 12;

  const state = {
    allCars: [],
    filtered: [],
    visibleCount: PAGE_SIZE
  };

  const $ = (id) => document.getElementById(id);

  const escapeHTML = (value) => String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  const values = (value) => Array.isArray(value) ? value : (value ? [value] : []);

  const normalise = (value) => String(value ?? "").trim().toLowerCase();

  const uniqueValues = (cars, getter) => {
    const set = new Set();
    cars.forEach(car => values(getter(car)).forEach(v => {
      if (String(v).trim()) set.add(String(v).trim());
    }));
    return [...set].sort((a, b) => a.localeCompare(b));
  };

  const priceInLakh = (car) => {
    if (Number(car.minPrice) > 0) return Number(car.minPrice) / 100000;
    const matches = String(car.priceRange || "").match(/\d+(?:\.\d+)?/g);
    if (!matches?.length) return Infinity;
    return Math.min(...matches.map(Number));
  };

  const modelYear = (car) => {
    const raw = car.modelYear ?? car.year ?? car.launchYear ?? car.launchDate;
    const match = String(raw ?? "").match(/20\d{2}/);
    return match ? Number(match[0]) : 0;
  };

  const firstImage = (car) => {
    const image = Array.isArray(car.images) && car.images.length
      ? car.images[0]
      : "placeholder.jpg";
    return `${IMAGE_BASE}${image}`;
  };

  const bodyType = (car) => car.bodyType || car.type || "Automobile";

  const fuelText = (car) => values(car.fuelType).join(" / ") || "—";

  const transmissionText = (car) => values(car.transmission).join(" / ") || "—";

  const seatsText = (car) => car.seatingCapacity || "—";

  const rating = (car) => Math.max(1, Math.min(5, Math.round(Number(car.rating) || 3)));

  function populateFilters() {
    const brand = $("brandFilter");
    const type = $("typeFilter");
    const fuel = $("fuelFilter");
    const transmission = $("transmissionFilter");
    const seats = $("seatsFilter");

    uniqueValues(state.allCars, c => c.brand).forEach(v => {
      brand.insertAdjacentHTML("beforeend", `<option value="${escapeHTML(v)}">${escapeHTML(v)}</option>`);
    });

    uniqueValues(state.allCars, c => bodyType(c)).forEach(v => {
      type.insertAdjacentHTML("beforeend", `<option value="${escapeHTML(v)}">${escapeHTML(v)}</option>`);
    });

    uniqueValues(state.allCars, c => c.fuelType).forEach(v => {
      fuel.insertAdjacentHTML("beforeend", `<option value="${escapeHTML(v)}">${escapeHTML(v)}</option>`);
    });

    uniqueValues(state.allCars, c => c.transmission).forEach(v => {
      transmission.insertAdjacentHTML("beforeend", `<option value="${escapeHTML(v)}">${escapeHTML(v)}</option>`);
    });

    uniqueValues(state.allCars, c => c.seatingCapacity).forEach(v => {
      seats.insertAdjacentHTML("beforeend", `<option value="${escapeHTML(v)}">${escapeHTML(v)}</option>`);
    });
  }

  function readFilters() {
    return {
      search: normalise($("vehicleSearch").value),
      brand: normalise($("brandFilter").value),
      type: normalise($("typeFilter").value),
      fuel: normalise($("fuelFilter").value),
      transmission: normalise($("transmissionFilter").value),
      minPrice: Number($("minPrice").value) || 0,
      maxPrice: Number($("maxPrice").value) || 0
    };
  }

  function matches(car, f) {
    const haystack = [
      car.brand,
      car.model,
      car.type,
      car.bodyType,
      car.priceRange,
      car.description
    ].map(normalise).join(" ");

    if (f.search && !haystack.includes(f.search)) return false;
    if (f.brand && normalise(car.brand) !== f.brand) return false;
    if (f.type && normalise(bodyType(car)) !== f.type) return false;

    if (f.fuel && !fuelText(car).toLowerCase().includes(f.fuel)) return false;
    if (f.transmission && !transmissionText(car).toLowerCase().includes(f.transmission)) return false;

    const price = priceInLakh(car);
    if (f.minPrice && (price === Infinity || price < f.minPrice)) return false;
    if (f.maxPrice && (price === Infinity || price > f.maxPrice)) return false;

    return true;
  }

  function sortCars(cars, sort) {
    return [...cars].sort((a, b) => {
      switch (sort) {
        case "newest":
          return modelYear(b) - modelYear(a);
        case "oldest":
          return modelYear(a) - modelYear(b);
        case "priceAsc":
          return priceInLakh(a) - priceInLakh(b);
        case "priceDesc":
          return priceInLakh(b) - priceInLakh(a);
        case "rating":
          return (Number(b.rating) || 0) - (Number(a.rating) || 0);
        default:
          return (Number(b.rating) || 0) - (Number(a.rating) || 0)
            || priceInLakh(a) - priceInLakh(b);
      }
    });
  }

  function renderCard(car, index) {
    const stars = "★".repeat(rating(car)) + "☆".repeat(5 - rating(car));
    const isEV = car.isEV === true ||
      fuelText(car).toLowerCase().includes("electric") ||
      normalise(fuelText(car)) === "ev";

    return `
      <article class="vehicle-card" data-id="${escapeHTML(car._id)}">
        <a class="vehicle-image" href="vehicle.html?id=${encodeURIComponent(car._id)}" aria-label="Explore ${escapeHTML(car.brand)} ${escapeHTML(car.model)}">
          <img
            src="${firstImage(car)}"
            alt="${escapeHTML(car.brand)} ${escapeHTML(car.model)}"
            loading="${index < 4 ? "eager" : "lazy"}"
            onerror="this.src='${IMAGE_BASE}placeholder.jpg'"
          >
          ${isEV ? `<span class="vehicle-badge">ELECTRIC</span>` : ""}
          <span class="image-index">${String(index + 1).padStart(2, "0")}</span>
        </a>

        <div class="vehicle-info">
          <div class="vehicle-topline">
            <span>${escapeHTML(car.brand || "AUTOVERSE")}</span>
            <b>${stars}</b>
          </div>

          <h3>${escapeHTML(car.model || "Unknown")}</h3>
          <p class="vehicle-price">${escapeHTML(car.priceRange || "Price on request")}</p>

          <div class="vehicle-specs">
            <span>${escapeHTML(bodyType(car))}</span>
            <span>${escapeHTML(fuelText(car))}</span>
            <span>${escapeHTML(seatsText(car))} SEATS</span>
          </div>

          <a class="vehicle-link" href="vehicle.html?id=${encodeURIComponent(car._id)}">
            EXPLORE VEHICLE <span>→</span>
          </a>
        </div>
      </article>
    `;
  }

  function renderActiveFilters(f) {
    const chips = [];
    if (f.search) chips.push(["Search", f.search]);
    if (f.brand) chips.push(["Brand", f.brand]);
    if (f.type) chips.push(["Type", f.type]);
    if (f.fuel) chips.push(["Powertrain", f.fuel]);
    if (f.transmission) chips.push(["Transmission", f.transmission]);
    if (f.minPrice) chips.push(["Min", `₹${f.minPrice}L`]);
    if (f.maxPrice) chips.push(["Max", `₹${f.maxPrice}L`]);

    $("activeFilters").innerHTML = chips.map(([label, value]) =>
      `<span>${escapeHTML(label)}: <b>${escapeHTML(value)}</b></span>`
    ).join("");
  }

  function render() {
    const sort = $("sortFilter").value;
    state.filtered = sortCars(state.filtered, sort);

    const visible = state.filtered.slice(0, state.visibleCount);
    const grid = $("vehicleGrid");

    if (!visible.length) {
      grid.innerHTML = `
        <div class="empty-state">
          <span>00</span>
          <h3>No machine matched.</h3>
          <p>Try widening your filters or searching another model.</p>
          <button type="button" id="emptyClear">CLEAR FILTERS →</button>
        </div>
      `;
      $("emptyClear")?.addEventListener("click", clearFilters);
    } else {
      grid.innerHTML = visible.map(renderCard).join("");
    }

    $("resultsMeta").textContent =
      `${state.filtered.length} vehicle${state.filtered.length === 1 ? "" : "s"} found`;

    $("showingText").textContent =
      `Showing ${Math.min(state.visibleCount, state.filtered.length)} of ${state.filtered.length} vehicles`;

    $("exploreMore").style.display =
      state.visibleCount < state.filtered.length ? "inline-flex" : "none";
  }

  function applyFilters() {
    const f = readFilters();
    state.visibleCount = PAGE_SIZE;
    state.filtered = state.allCars.filter(car => matches(car, f));
    renderActiveFilters(f);

    $("resultsTitle").textContent =
      f.search || f.brand || f.type || f.fuel || f.transmission || f.minPrice || f.maxPrice
        ? "Your filtered universe."
        : "All vehicles.";

    render();
  }

  function clearFilters() {
    $("vehicleSearch").value = "";
    $("brandFilter").value = "";
    $("typeFilter").value = "";
    $("fuelFilter").value = "";
    $("transmissionFilter").value = "";
    $("seatsFilter").value = "";
    $("minPrice").value = "";
    $("maxPrice").value = "";
    $("sortFilter").value = "featured";
    applyFilters();
  }

  async function loadCars() {
    try {
      const response = await fetch(`${API}/cars`);
      if (!response.ok) throw new Error(`Catalogue request failed: ${response.status}`);

      const cars = await response.json();
      state.allCars = Array.isArray(cars) ? cars : [];

      $("totalVehicles").textContent = state.allCars.length;
      $("totalBrands").textContent =
        new Set(state.allCars.map(c => c.brand).filter(Boolean)).size;
      $("totalTypes").textContent =
        new Set(state.allCars.map(c => bodyType(c)).filter(Boolean)).size;

      populateFilters();
      applyFilters();
    } catch (error) {
      console.error("AutoVerse Vehicles:", error);
      $("vehicleGrid").innerHTML = `
        <div class="empty-state error-state">
          <span>!</span>
          <h3>The catalogue is unavailable.</h3>
          <p>AutoVerse could not reach the vehicle database.</p>
          <button type="button" onclick="location.reload()">TRY AGAIN →</button>
        </div>
      `;
      $("resultsMeta").textContent = "Unable to load the live catalogue";
    }
  }

  $("applyFilters").addEventListener("click", applyFilters);
  $("clearFilters").addEventListener("click", clearFilters);
  $("sortFilter").addEventListener("change", () => {
    state.visibleCount = PAGE_SIZE;
    render();
  });

  $("vehicleSearch").addEventListener("keydown", e => {
    if (e.key === "Enter") applyFilters();
  });

  $("exploreMore").addEventListener("click", () => {
    state.visibleCount += PAGE_SIZE;
    render();

    setTimeout(() => {
      const cards = document.querySelectorAll(".vehicle-card");
      cards[Math.max(0, state.visibleCount - PAGE_SIZE)]?.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }, 50);
  });

  $("mobileFilterBtn").addEventListener("click", () => {
    $("filtersPanel").classList.add("open");
    document.body.classList.add("filters-open");
  });

  $("closeFilters").addEventListener("click", () => {
    $("filtersPanel").classList.remove("open");
    document.body.classList.remove("filters-open");
  });

  addEventListener("scroll", () => {
    $("vehiclesNav").classList.toggle("scrolled", scrollY > 30);
    const max = document.documentElement.scrollHeight - innerHeight;
    $("scrollProgress").style.height = `${max > 0 ? (scrollY / max) * 100 : 0}%`;
  }, { passive: true });

  // Locked AutoVerse cursor.
  if (matchMedia("(pointer:fine)").matches &&
      !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.body.classList.add("cursor-ready");
    const dot = document.querySelector(".cursor-dot");
    const ring = document.querySelector(".cursor-ring");
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;

    addEventListener("pointermove", e => {
      mx = e.clientX; my = e.clientY;
      dot.style.left = `${mx}px`; dot.style.top = `${my}px`;
    }, { passive: true });

    const tick = () => {
      rx += (mx - rx) * .18;
      ry += (my - ry) * .18;
      ring.style.left = `${rx}px`; ring.style.top = `${ry}px`;
      requestAnimationFrame(tick);
    };
    tick();

    document.addEventListener("pointerover", e => {
      if (e.target.closest("a,button,select,input,.vehicle-card")) {
        document.body.classList.add("cursor-hover");
      }
    });
    document.addEventListener("pointerout", e => {
      if (e.target.closest("a,button,select,input,.vehicle-card")) {
        document.body.classList.remove("cursor-hover");
      }
    });
  }

  loadCars();
})();
