document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("car-container");

  try {
    const res = await fetch("http://localhost:5000/api/cars?brand=Maruti%20Suzuki&type=SUV");
    const cars = await res.json();

    if (!cars.length) {
      container.innerHTML = "<p>No cars found</p>";
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
            <span><strong>Price:</strong> ${car.priceRange || "N/A"}</span>
            <span><strong>Engine:</strong> ${formatValue(car.engineOptions)}</span>
            <span><strong>Mileage:</strong> ${car.mileage || "N/A"}</span>
            <span><strong>Fuel:</strong> ${formatValue(car.fuelType)}</span>
            <span><strong>Transmission:</strong> ${formatValue(car.transmission)}</span>
            <span><strong>Seats:</strong> ${car.seatingCapacity || "N/A"}</span>
          </div>
        </div>

      </div>
    `).join("");

    // CLICK → OPEN DETAIL PAGE
    document.querySelectorAll(".car-card").forEach(card => {
      card.addEventListener("click", () => {
        const id = card.getAttribute("data-id");
        window.location.href = `carr.html?id=${id}`;
      });
    });

    // AUTO SLIDER
    let interval = setInterval(slideAll, 2000);

    function slideAll() {
      document.querySelectorAll('.slider').forEach(slider => {
        moveSlide(slider, 1);
      });
    }

    function moveSlide(slider, step) {
      let index = parseInt(slider.dataset.index);
      const total = slider.children.length;

      index = (index + step + total) % total;

      slider.style.transform = `translateX(-${index * 100}%)`;
      slider.dataset.index = index;
    }

    // BUTTON CONTROLS
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();

        const slider = document.getElementById(`slider-${btn.dataset.index}`);
        moveSlide(slider, btn.classList.contains('left') ? -1 : 1);
      });
    });

    // PAUSE ON HOVER
    document.querySelectorAll('.slider-container').forEach(container => {
      container.addEventListener('mouseenter', () => clearInterval(interval));
      container.addEventListener('mouseleave', () => interval = setInterval(slideAll, 2000));
    });

  } catch (err) {
    console.error(err);
    container.innerHTML = "<p>⚠️ Failed to load cars</p>";
  }
});