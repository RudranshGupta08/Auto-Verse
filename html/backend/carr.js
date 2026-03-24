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
    // 🔥 SAFE DATA HANDLING
    // =========================
    const description = car.description || "No description available.";

    const features = Array.isArray(car.features) ? car.features : [];
    const pros = Array.isArray(car.pros) ? car.pros : [];
    const cons = Array.isArray(car.cons) ? car.cons : [];

    const verdict = car.verdict || "No final verdict available.";

    const bestFor = Array.isArray(car.bestFor)
      ? (car.bestFor.length ? car.bestFor : ["Not Specified"])
      : typeof car.bestFor === "string" && car.bestFor.trim().length
        ? car.bestFor.split(",").map(s => s.trim())
        : ["Not Specified"];

    const ncap = car.ncapRating || "Not Rated";
    const rating = car.rating || 3;

    const stars = "★".repeat(rating) + "☆".repeat(5 - rating);

    const formatValue = (val) =>
      Array.isArray(val)
        ? val.join(", ")
        : (val || "N/A");

    // =========================
    // 🔥 RENDER UI
    // =========================
    container.innerHTML = `
      <div class="car-header slide-up">
        <h1>${car.brand} ${car.model}</h1>
        <p class="price">${car.priceRange || "N/A"}</p>
        <div class="rating">${stars} ${rating}/5</div>
      </div>

      <div class="actions slide-up">
        <button class="wishlist">❤️ Add to Wishlist</button>
        <button class="compare">⚖️ Compare</button>
      </div>

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

      <div class="section slide-up">
        <h2>Description</h2>
        <p>${description}</p>
      </div>

      <div class="section slide-up">
        <h2>Specifications</h2>
        <p><strong>Engine:</strong> ${formatValue(car.engineOptions)}</p>
        <p><strong>Mileage:</strong> ${car.mileage || "N/A"}</p>
        <p><strong>Fuel Type:</strong> ${formatValue(car.fuelType)}</p>
        <p><strong>Transmission:</strong> ${formatValue(car.transmission)}</p>
        <p><strong>Seating Capacity:</strong> ${car.seatingCapacity || "N/A"}</p>
        <p><strong>NCAP Safety Rating:</strong> ⭐ ${ncap}</p>
      </div>

      <div class="section slide-up">
        <h2>Key Features</h2>
        <ul>
          ${features.length
            ? features.map(f => `<li>${f}</li>`).join("")
            : "<li>N/A</li>"
          }
        </ul>
      </div>

      <div class="section slide-up">
        <h2>Pros 👍</h2>
        <ul>
          ${pros.length
            ? pros.map(p => `<li>${p}</li>`).join("")
            : "<li>N/A</li>"
          }
        </ul>
      </div>

      <div class="section slide-up">
        <h2>Cons 👎</h2>
        <ul>
          ${cons.length
            ? cons.map(c => `<li>${c}</li>`).join("")
            : "<li>N/A</li>"
          }
        </ul>
      </div>

      <div class="section slide-up">
        <h2>Best For</h2>
        <ul>
          ${bestFor.map(b => `<li>${b || "N/A"}</li>`).join("")}
        </ul>
      </div>

      <div class="section verdict slide-up">
        <h2>Final Verdict</h2>
        <p>${verdict}</p>
      </div>
    `;

    // =========================
    // 🔥 ADDED: VARIANT RECOMMENDATION
    // =========================
    const bestVariant = car.variants?.find(v => v.isBestValue);

    if (bestVariant) {
      container.insertAdjacentHTML("beforeend", `
        <div class="variant-recommendation slide-up">
          <h2>🔥 Recommended Variant: ${bestVariant.name}</h2>
          <p>
            Ideal for ${bestFor.join(", ")}.
            Offers ${bestVariant.transmission} with ${bestVariant.mileage || "good mileage"}.
          </p>
        </div>
      `);
    }

    // =========================
    // 🔥 ADDED: VARIANTS LIST
    // =========================
    const variantContainer = document.getElementById("variant-container");

    if (variantContainer) {
      if (!car.variants || car.variants.length === 0) {
        variantContainer.innerHTML = "<p>No variants available</p>";
      } else {
        variantContainer.innerHTML = car.variants.map(v => `
          <div class="variant-card ${v.isBestValue ? "best" : ""}">
            <h3>
              ${v.name}
              ${v.isBestValue ? "🔥 Best Value" : ""}
            </h3>

            <p><strong>Price:</strong> ${v.price}</p>
            <p><strong>Fuel:</strong> ${v.fuelType}</p>
            <p><strong>Transmission:</strong> ${v.transmission}</p>
            <p><strong>Mileage:</strong> ${v.mileage || "N/A"}</p>

            <div class="features">
              ${v.features?.map(f => `<span>✔ ${f}</span>`).join("")}
            </div>
          </div>
        `).join("");
      }
    }

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