document.addEventListener("DOMContentLoaded", async () => {

  const container = document.getElementById("car-container");

  // 🔥 AUTO DETECT FROM H1
  const title = document.querySelector("h1").innerText.toLowerCase();

  console.log("Page Title:", title);

  // 🔥 EXTRACT BRAND + TYPE
  let brand = "";
  let type = "";

  // TYPE DETECTION
  if (title.includes("suv")) type = "SUV";
  else if (title.includes("sedan")) type = "Sedan";
  else if (title.includes("hatchback")) type = "Hatchback";

  // BRAND DETECTION
  if (title.includes("maruti")) brand = "Maruti";
  else if (title.includes("tata")) brand = "Tata";
  else if (title.includes("hyundai")) brand = "Hyundai";
  else if (title.includes("mahindra")) brand = "Mahindra";
  else if (title.includes("kia")) brand = "Kia";
  else if (title.includes("toyota")) brand = "Toyota";
  else if (title.includes("ford")) brand = "Ford";
  else if (title.includes("jeep")) brand = "Jeep";
  else if (title.includes("honda")) brand = "Honda";
  else if (title.includes("audi")) brand = "Audi";
  else if (title.includes("bmw")) brand = "BMW";
  else if (title.includes("mercedes")) brand = "Mercedes";

  console.log("Detected Brand:", brand);
  console.log("Detected Type:", type);

  try {
    const res = await fetch(
      `http://localhost:5000/api/cars?brand=${encodeURIComponent(brand)}&type=${encodeURIComponent(type)}`
    );

    const cars = await res.json();

    console.log("Cars:", cars);

    if (!cars.length) {
      container.innerHTML = "<h2>No cars found</h2>";
      return;
    }

    const formatValue = val =>
      Array.isArray(val) ? val.join(", ") : (val || "N/A");

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

          <div class="details">
            <span><strong>Price:</strong> ${car.priceRange}</span>
            <span><strong>Engine:</strong> ${formatValue(car.engineOptions)}</span>
            <span><strong>Mileage:</strong> ${car.mileage}</span>
            <span><strong>Fuel:</strong> ${formatValue(car.fuelType)}</span>
            <span><strong>Transmission:</strong> ${formatValue(car.transmission)}</span>
            <span><strong>Seats:</strong> ${car.seatingCapacity}</span>
          </div>
        </div>

      </div>
    `).join("");

    // 🔥 CLICK EVENT
    document.querySelectorAll(".car-card").forEach(card => {
      card.addEventListener("click", () => {
        const id = card.getAttribute("data-id");
        window.location.href = `carr.html?id=${id}`;
      });
    });

  } catch (err) {
    console.error(err);
    container.innerHTML = "<h2>⚠️ Error loading cars</h2>";
  }

});