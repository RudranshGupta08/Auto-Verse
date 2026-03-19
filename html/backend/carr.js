document.addEventListener("DOMContentLoaded", async () => {

  const container = document.getElementById("car-details");

  // 🔥 GET ID FROM URL
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

    // 🔥 DEFAULT DATA (if empty)
    const features = car.features?.length ? car.features : [
      "Modern infotainment system",
      "Comfortable seating",
      "Advanced safety features"
    ];

    const pros = car.pros?.length ? car.pros : [
      "Good performance",
      "Reliable brand",
      "Value for money"
    ];

    const cons = car.cons?.length ? car.cons : [
      "Could improve mileage",
      "Limited premium features"
    ];

    const verdict = car.verdict || 
      `${car.model} is a well-rounded vehicle offering a balance of performance, comfort, and practicality, making it a solid choice in its segment.`;

    const formatValue = val =>
      Array.isArray(val) ? val.join(", ") : (val || "N/A");

    // 🔥 HTML UI
    container.innerHTML = `
      <div class="car-header">
        <h1>${car.brand} ${car.model}</h1>
        <p class="price">${car.priceRange}</p>
      </div>

      <!-- 🔥 ACTION BUTTONS -->
      <div class="actions">
        <button class="wishlist">❤️ Wishlist</button>
        <button class="compare">⚖️ Compare</button>
      </div>

      <!-- 🔥 IMAGE SLIDER -->
      <div class="image-slider-container">
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

      <!-- 🔥 SPECIFICATIONS -->
      <div class="section specs">
        <h2>Specifications</h2>
        <p><strong>Engine:</strong> ${formatValue(car.engineOptions)}</p>
        <p><strong>Mileage:</strong> ${car.mileage}</p>
        <p><strong>Fuel Type:</strong> ${formatValue(car.fuelType)}</p>
        <p><strong>Transmission:</strong> ${formatValue(car.transmission)}</p>
        <p><strong>Seating Capacity:</strong> ${car.seatingCapacity}</p>
      </div>

      <!-- 🔥 FEATURES -->
      <div class="section">
        <h2>Key Features</h2>
        <ul>
          ${features.map(f => `<li>${f}</li>`).join("")}
        </ul>
      </div>

      <!-- 🔥 PROS -->
      <div class="section">
        <h2>Pros</h2>
        <ul>
          ${pros.map(p => `<li>${p}</li>`).join("")}
        </ul>
      </div>

      <!-- 🔥 CONS -->
      <div class="section">
        <h2>Cons</h2>
        <ul>
          ${cons.map(c => `<li>${c}</li>`).join("")}
        </ul>
      </div>

      <!-- 🔥 VERDICT -->
      <div class="section verdict">
        <h2>Final Verdict</h2>
        <p>${verdict}</p>
      </div>
    `;

    // =========================
    // 🔥 IMAGE SLIDER LOGIC
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
    // 🔥 WISHLIST
    // =========================

    document.querySelector(".wishlist").onclick = () => {
      let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

      if (!wishlist.includes(car._id)) {
        wishlist.push(car._id);
        localStorage.setItem("wishlist", JSON.stringify(wishlist));
        alert("❤️ Added to Wishlist");
      } else {
        alert("⚠️ Already in Wishlist");
      }
    };

    // =========================
    // 🔥 COMPARE
    // =========================

    document.querySelector(".compare").onclick = () => {
      let compare = JSON.parse(localStorage.getItem("compare")) || [];

      if (compare.length >= 2) {
        alert("⚠️ You can compare only 2 cars");
        return;
      }

      if (!compare.includes(car._id)) {
        compare.push(car._id);
        localStorage.setItem("compare", JSON.stringify(compare));
        alert("⚖️ Added for Comparison");
      } else {
        alert("⚠️ Already added");
      }
    };

  } catch (err) {
    console.error(err);
    container.innerHTML = "<h2>⚠️ Failed to load car details</h2>";
  }

});