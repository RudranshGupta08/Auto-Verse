const params = new URLSearchParams(window.location.search);
const carId = params.get("id");

const container = document.getElementById("car-details");

async function loadCar() {
  try {
    const res = await fetch("http://localhost:5000/api/cars");
    const cars = await res.json();

    const car = cars.find(c => c._id === carId);

    if (!car) {
      container.innerHTML = "<p>Car not found</p>";
      return;
    }

    const formatValue = val =>
      Array.isArray(val) ? val.join(", ") : (val || "N/A");

    const isFronx = car.model.toLowerCase() === "fronx";

    container.innerHTML = `
      <!-- Car Description -->
      <div class="car-description">
        <h2>${car.brand} ${car.model}</h2>
        <h3>Overview</h3>
        <p>
          The ${car.brand} ${car.model} is a modern compact SUV that combines style, comfort, and
          technology in a practical urban package. With its bold stance, sleek LED lighting, and
          coupe-inspired roofline, it stands out in traffic while maintaining excellent aerodynamics.
        </p>
        <p>
          Designed for both city driving and weekend getaways, the ${car.model} offers multiple
          engine options with optimized fuel efficiency and smooth acceleration. The cabin is
          spacious with ergonomic seats, premium materials, and ambient lighting to enhance the
          driving experience.
        </p>
        <p>
          Technology features include a large infotainment display with Android Auto/Apple CarPlay,
          wireless connectivity, navigation, and a heads-up display for essential driving information.
        </p>
        <p>
          Safety is top priority: equipped with multiple airbags, ABS with EBD, ESP, hill-hold assist,
          and a 360-degree camera. The ${car.model} ensures peace of mind for drivers and passengers
          alike.
        </p>
        <p>
          Overall, the ${car.brand} ${car.model} is a stylish, reliable, and feature-packed SUV ideal
          for modern urban lifestyles.
        </p>
      </div>

      <!-- Car Specifications -->
      <div class="car-specs">
        <h3>Specifications</h3>
        <p><strong>Price Range:</strong> ${car.priceRange}</p>
        <p><strong>Engine Options:</strong> ${formatValue(car.engineOptions)}</p>
        <p><strong>Mileage:</strong> ${car.mileage}</p>
        <p><strong>Fuel Type:</strong> ${formatValue(car.fuelType)}</p>
        <p><strong>Transmission:</strong> ${formatValue(car.transmission)}</p>
        <p><strong>Seating Capacity:</strong> ${car.seatingCapacity}</p>
      </div>

      <!-- Image Slider -->
      <div class="image-slider-container">
        <button class="nav-btn left" data-index="0">❮</button>
        <div class="image-slider" id="slider">
          ${
            car.images?.length
              ? car.images.map(img => `<img src="http://localhost:5000/images/${img}">`).join("")
              : `<img src="http://localhost:5000/images/placeholder.jpg">`
          }
        </div>
        <button class="nav-btn right" data-index="0">❯</button>
      </div>
    `;

    // Slider functionality
    const slider = document.getElementById("slider");
    let currentIndex = 0;

    const totalImages = slider.children.length;

    function showSlide(index) {
      slider.style.transform = `translateX(-${index * 100}%)`;
    }

    document.querySelector(".nav-btn.left").addEventListener("click", () => {
      currentIndex = (currentIndex - 1 + totalImages) % totalImages;
      showSlide(currentIndex);
    });

    document.querySelector(".nav-btn.right").addEventListener("click", () => {
      currentIndex = (currentIndex + 1) % totalImages;
      showSlide(currentIndex);
    });

  } catch (err) {
    console.error(err);
    container.innerHTML = "<p>Error loading car details</p>";
  }
}

loadCar();