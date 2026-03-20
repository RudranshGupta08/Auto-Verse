document.addEventListener("DOMContentLoaded", async () => {

  const container = document.getElementById("car-container");
  if (!container) return;

  // =========================
  // 🔥 AUTO DETECT BRAND & TYPE (FROM BODY ATTRIBUTES)
  // =========================
  const brand = document.body.dataset.brand || "";
  const type = document.body.dataset.type || "";

  console.log("Brand:", brand);
  console.log("Type:", type);

  try {
    // =========================
    // 🔥 FETCH ALL CARS
    // =========================
    const res = await fetch("http://localhost:5000/api/cars");
    const allCars = await res.json();

    // =========================
    // 🔥 FILTER LOGIC (FIXED)
    // =========================
    const cars = allCars.filter(car =>
      car.brand.toLowerCase().includes(brand.toLowerCase()) &&
      car.type.toLowerCase().includes(type.toLowerCase())
    );

    console.log("Filtered Cars:", cars);

    if (!cars.length) {
      container.innerHTML = "<h2>No cars found</h2>";
      return;
    }

    // =========================
    // 🔥 RENDER UI
    // =========================
    container.innerHTML = cars.map((car, index) => `
      <div class="car-card" data-id="${car._id}">

        <!-- 🔥 IMAGE SLIDER -->
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

        <!-- 🔥 INFO -->
        <div class="car-info">
          <h2>${car.brand} ${car.model}</h2>

          <!-- ⭐ RATING -->
          <p class="rating">
            ${"★".repeat(car.rating || 3)}
            ${"☆".repeat(5 - (car.rating || 3))}
          </p>

          <!-- DETAILS -->
          <div class="details">
            <span><strong>Price:</strong> ${car.priceRange || "N/A"}</span>
            <span><strong>Engine:</strong> ${car.engineOptions?.join(", ") || "N/A"}</span>
            <span><strong>Mileage:</strong> ${car.mileage || "N/A"}</span>
            <span><strong>Fuel:</strong> ${car.fuelType?.join(", ") || "N/A"}</span>
            <span><strong>Transmission:</strong> ${car.transmission?.join(", ") || "N/A"}</span>
            <span><strong>Seats:</strong> ${car.seatingCapacity || "N/A"}</span>
          </div>

          <!-- 🔥 ACTION BUTTONS -->
          <div class="actions">
            <button class="wishlist" data-id="${car._id}">❤️</button>
            <button class="compare" data-id="${car._id}">⚖️</button>
          </div>
        </div>

      </div>
    `).join("");

    // =========================
    // 🔥 SLIDER LOGIC
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
    // 🔥 CARD CLICK → DETAILS PAGE
    // =========================
    document.querySelectorAll(".car-card").forEach(card => {
      card.addEventListener("click", () => {
        const id = card.getAttribute("data-id");
        window.location.href = `carr.html?id=${id}`;
      });
    });

    // =========================
    // ❤️ WISHLIST LOGIC
    // =========================
    document.querySelectorAll(".wishlist").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();

        const id = btn.dataset.id;
        let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

        if (!wishlist.includes(id)) {
          wishlist.push(id);
          localStorage.setItem("wishlist", JSON.stringify(wishlist));
          alert("❤️ Added to Wishlist");
        } else {
          alert("⚠️ Already in Wishlist");
        }
      });
    });

    // =========================
    // ⚖️ COMPARE LOGIC
    // =========================
    document.querySelectorAll(".compare").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();

        const id = btn.dataset.id;
        let compare = JSON.parse(localStorage.getItem("compare")) || [];

        if (compare.length >= 2) {
          alert("⚠️ You can compare only 2 cars");
          return;
        }

        if (!compare.includes(id)) {
          compare.push(id);
          localStorage.setItem("compare", JSON.stringify(compare));
          alert("⚖️ Added for Comparison");
        } else {
          alert("⚠️ Already added");
        }
      });
    });

  } catch (err) {
    console.error(err);
    container.innerHTML = "<h2>Error loading cars</h2>";
  }

  // =========================
  // 🔥 FLOATING COMPARE BUTTON
  // =========================
  const compareBtn = document.createElement("a");
  compareBtn.href = "compare.html";
  compareBtn.className = "compare-float";
  compareBtn.innerText = "⚖️ Compare Cars";

  document.body.appendChild(compareBtn);

});