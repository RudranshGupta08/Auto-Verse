document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("car-container");

  try {
    const res = await fetch("http://localhost:5000/api/cars?brand=Maruti%20Suzuki&type=SUV");
    const cars = await res.json();

    if (!cars || cars.length === 0) {
      container.innerHTML = "<p class='error'>No cars found.</p>";
      return;
    }

    const formatValue = val => Array.isArray(val) ? val.join(", ") : (val || "N/A");

    container.innerHTML = cars.map(car => {
      // ✅ Handle images properly
      let imagesArray = [];
      if (Array.isArray(car.images)) {
        // If one string contains commas, split it into multiple
        if (car.images.length === 1 && car.images[0].includes(",")) {
          imagesArray = car.images[0].split(",").map(s => s.trim());
        } else {
          imagesArray = car.images;
        }
      }

      return `
        <div class="car-card">
        
          <div class="image-gallery">
            ${
              imagesArray.length > 0
                ? imagesArray.map(img => `<img src="http://localhost:5000/images/${img}" alt="${car.model}">`).join("")
                : `<img src="http://localhost:5000/images/placeholder.jpg" alt="No image">`
            }
          </div>

          <div class="car-info">
            <h2>${car.brand} ${car.model}</h2>
            <div class="details">
              <span><strong>Price:</strong> ${car.priceRange || "N/A"}</span>
              <span><strong>Engine:</strong> ${formatValue(car.engineOptions)}</span>
              <span><strong>Mileage:</strong> ${car.mileage || "N/A"}</span>
              <span><strong>Fuel:</strong> ${formatValue(car.fuelType)}</span>
              <span><strong>Transmission:</strong> ${formatValue(car.transmission)}</span>
              <span><strong>Seats:</strong> ${car.seatingCapacity || "N/A"}</span>
            </div>
          </div>

        </div>
      `;
    }).join("");

  } catch (err) {
    console.error(err);
    container.innerHTML = "<p class='error'>⚠️ Failed to load cars. Backend not running.</p>";
  }
});

