document.addEventListener("DOMContentLoaded", async () => {

  const container = document.getElementById("car-details");
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    container.innerHTML = "<h2>❌ No Car Selected</h2>";
    return;
  }

  try {
    const res = await fetch(`http://localhost:5000/api/cars/${id}`);
    const car = await res.json();

    if (!car || car.message) {
      container.innerHTML = "<h2>❌ Car not found</h2>";
      return;
    }

    // =========================
    // 🔥 DEFAULT FALLBACK DATA
    // =========================

    const features = car.features?.length ? car.features : [
      "Modern infotainment system",
      "Comfortable seating",
      "Safety features included"
    ];

    const pros = car.pros?.length ? car.pros : [
      "Good performance",
      "Reliable brand",
      "Value for money"
    ];

    const cons = car.cons?.length ? car.cons : [
      "Mileage could be better",
      "Limited premium features"
    ];

    const verdict = car.verdict || 
      `${car.model} is a well-balanced car offering great practicality and comfort.`;

    const bestFor = car.bestFor?.length ? car.bestFor : [
      "Daily commuting",
      "Family usage"
    ];

    const ncap = car.ncapRating || "Not Rated";

    const stars = "★".repeat(car.rating || 3) + "☆".repeat(5 - (car.rating || 3));

    const formatValue = val =>
      Array.isArray(val) ? val.join(", ") : (val || "N/A");

    // =========================
    // 🔥 UI RENDER
    // =========================

    container.innerHTML = `
      <!-- HEADER -->
      <div class="car-header slide-up">
        <h1>${car.brand} ${car.model}</h1>
        <p class="price">${car.priceRange}</p>
        <div class="rating">${stars} ${car.rating || 3}/5</div>
      </div>

      <!-- ACTION BUTTONS -->
      <div class="actions slide-up">
        <button class="wishlist">❤️ Add to Wishlist</button>
        <button class="compare">⚖️ Compare</button>
      </div>

      <!-- IMAGE SLIDER -->
      <div class="image-slider-container slide-up">
        <button class="nav-btn left">❮</button>

        <div class="image-slider" id="slider">
          ${
            car.images?.length
              ? car.images.map(img =>
                  `<img src="http://localhost:5000/images/${img}">`
                ).join("")
              : `<img src="http://localhost:5000/images/placeholder.jpg">`
          }
        </div>

        <button class="nav-btn right">❯</button>
      </div>

      <!-- SPECIFICATIONS -->
      <div class="section slide-up">
        <h2>Specifications</h2>
        <p><strong>Engine:</strong> ${formatValue(car.engineOptions)}</p>
        <p><strong>Mileage:</strong> ${car.mileage}</p>
        <p><strong>Fuel Type:</strong> ${formatValue(car.fuelType)}</p>
        <p><strong>Transmission:</strong> ${formatValue(car.transmission)}</p>
        <p><strong>Seating Capacity:</strong> ${car.seatingCapacity}</p>
        <p><strong>NCAP Safety Rating:</strong> ⭐ ${ncap}</p>
      </div>

      <!-- FEATURES -->
      <div class="section slide-up">
        <h2>Key Features</h2>
        <ul>
          ${features.map(f => `<li>${f}</li>`).join("")}
        </ul>
      </div>

      <!-- PROS -->
      <div class="section slide-up">
        <h2>Pros 👍</h2>
        <ul>
          ${pros.map(p => `<li>${p}</li>`).join("")}
        </ul>
      </div>

      <!-- CONS -->
      <div class="section slide-up">
        <h2>Cons 👎</h2>
        <ul>
          ${cons.map(c => `<li>${c}</li>`).join("")}
        </ul>
      </div>

      <!-- BEST FOR -->
      <div class="section slide-up">
        <h2>Best For</h2>
        <ul>
          ${bestFor.map(b => `<li>${b}</li>`).join("")}
        </ul>
      </div>

      <!-- VERDICT -->
      <div class="section verdict slide-up">
        <h2>Final Verdict</h2>
        <p>${verdict}</p>
      </div>
    `;

    // =========================
    // 🔥 IMAGE SLIDER
    // =========================

    let index = 0;
    const slider = document.getElementById("slider");
    const total = slider.children.length;

    function showSlide(i) {
      index = (i + total) % total;
      slider.style.transform = `translateX(-${index * 100}%)`;
    }

    document.querySelector(".left").onclick = () => showSlide(index - 1);
    document.querySelector(".right").onclick = () => showSlide(index + 1);

    // =========================
    // ❤️ WISHLIST
    // =========================

    document.querySelector(".wishlist").onclick = () => {
      let list = JSON.parse(localStorage.getItem("wishlist")) || [];

      if (!list.includes(id)) {
        list.push(id);
        localStorage.setItem("wishlist", JSON.stringify(list));
        alert("❤️ Added to Wishlist");
      } else {
        alert("⚠️ Already in Wishlist");
      }
    };

    // =========================
    // ⚖️ COMPARE
    // =========================

    document.querySelector(".compare").onclick = () => {
      let compare = JSON.parse(localStorage.getItem("compare")) || [];

      if (compare.length >= 2) {
        alert("⚠️ You can compare only 2 cars");
        return;
      }

      if (!compare.includes(id)) {
        compare.push(id);
        localStorage.setItem("compare", JSON.stringify(compare));
        alert("⚖️ Added for Comparison");
        window.location.href = "compare.html";
      } else {
        alert("⚠️ Already added");
      }
    };

  } catch (err) {
    console.error(err);
    container.innerHTML = "<h2>⚠️ Failed to load car details</h2>";
  }

});