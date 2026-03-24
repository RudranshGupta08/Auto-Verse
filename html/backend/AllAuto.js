document.addEventListener("DOMContentLoaded", async () => {

  const container = document.getElementById("car-container");
  if (!container) return;

  // =========================
  // 🔥 GET BRAND & TYPE
  // =========================
  const brand = (document.body.dataset.brand || "").toLowerCase().trim();
  const type = (document.body.dataset.type || "").toLowerCase().trim();

  try {
    // =========================
    // 🔥 FETCH DATA
    // =========================
    const res = await fetch("http://localhost:5000/api/cars");
    const allCars = await res.json();

    console.log("All Cars:", allCars);

    // =========================
    // 🔥 FIXED FILTER (CORRECT)
    // =========================
    const cars = allCars.filter(car => {

      const carBrand = (car.brand || "").toLowerCase().trim();
      const carType = (car.type || "").toLowerCase().trim();

      return (
        carBrand.includes(brand) &&   // flexible brand
        carType === type              // strict type (FIXED)
      );
    });

    // =========================
    // 🔥 NO FALLBACK (REMOVED)
    // =========================
    if (!cars.length) {
      container.innerHTML = "<h2>No cars found</h2>";
      return;
    }

    // =========================
    // 🔥 RENDER
    // =========================
    container.innerHTML = cars.map((car, index) => `

      <div class="car-card" data-id="${car._id}">

        <div class="slider-container">
          <button class="nav-btn left" data-index="${index}">❮</button>

          <div class="slider" id="slider-${index}" data-index="0">
            ${
              car.images?.length
                ? car.images.map(img =>
                    `<img src="http://localhost:5000/images/${img}">`
                  ).join("")
                : `<img src="http://localhost:5000/images/placeholder.jpg">`
            }
          </div>

          <button class="nav-btn right" data-index="${index}">❯</button>
        </div>

        <div class="car-info">
          <h2>${car.brand} ${car.model}</h2>

          <p class="rating">
            ${"★".repeat(car.rating || 3)}
            ${"☆".repeat(5 - (car.rating || 3))}
          </p>

          <div class="details">
            <span><strong>Price:</strong> ${car.priceRange || "N/A"}</span>
            <span><strong>Engine:</strong> ${car.engineOptions?.join(", ") || "N/A"}</span>
            <span><strong>Mileage:</strong> ${car.mileage || "N/A"}</span>
            <span><strong>Fuel:</strong> ${car.fuelType?.join(", ") || "N/A"}</span>
            <span><strong>Transmission:</strong> ${car.transmission?.join(", ") || "N/A"}</span>
            <span><strong>Seats:</strong> ${car.seatingCapacity || "N/A"}</span>
          </div>

          <div class="actions">
            <button class="wishlist" data-id="${car._id}">❤️</button>
            <button class="compare" data-id="${car._id}">⚖️</button>
          </div>
        </div>

      </div>

    `).join("");

    // =========================
    // 🔥 SLIDER
    // =========================
    document.querySelectorAll(".nav-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();

        const index = btn.dataset.index;
        const slider = document.getElementById(`slider-${index}`);

        let current = parseInt(slider.dataset.index);
        const total = slider.children.length;

        if (btn.classList.contains("left")) {
          current = (current - 1 + total) % total;
        } else {
          current = (current + 1) % total;
        }

        slider.style.transform = `translateX(-${current * 100}%)`;
        slider.dataset.index = current;
      });
    });

    // =========================
    // 🔥 CARD CLICK
    // =========================
    document.querySelectorAll(".car-card").forEach(card => {
      card.addEventListener("click", () => {
        const id = card.getAttribute("data-id");
        window.location.href = `carr.html?id=${id}`;
      });
    });

  } catch (err) {
    console.error(err);
    container.innerHTML = "<h2>Error loading cars</h2>";
  }

});