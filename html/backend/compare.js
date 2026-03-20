document.addEventListener("DOMContentLoaded", async () => {

  const container = document.getElementById("compare-container");

  let compare = JSON.parse(localStorage.getItem("compare")) || [];

  if (compare.length < 2) {
    container.innerHTML = `
      <h2 class="loading">⚠️ Please select 2 cars to compare</h2>
    `;
    return;
  }

  try {
    const cars = await Promise.all(
      compare.map(id =>
        fetch(`http://localhost:5000/api/cars/${id}`)
          .then(res => res.json())
      )
    );

    const [car1, car2] = cars;

    container.innerHTML = `
      <table class="compare-table">

        <tr>
          <th>Feature</th>
          <th>
            <img src="http://localhost:5000/images/${car1.images[0]}" class="car-img">
            <div class="car-title">${car1.brand} ${car1.model}</div>
            <button class="remove-btn" data-id="${car1._id}">Remove</button>
          </th>
          <th>
            <img src="http://localhost:5000/images/${car2.images[0]}" class="car-img">
            <div class="car-title">${car2.brand} ${car2.model}</div>
            <button class="remove-btn" data-id="${car2._id}">Remove</button>
          </th>
        </tr>

        <tr>
          <td>Price</td>
          <td>${car1.priceRange}</td>
          <td>${car2.priceRange}</td>
        </tr>

        <tr>
          <td>Engine</td>
          <td>${car1.engineOptions?.join(", ")}</td>
          <td>${car2.engineOptions?.join(", ")}</td>
        </tr>

        <tr>
          <td>Mileage</td>
          <td>${car1.mileage}</td>
          <td>${car2.mileage}</td>
        </tr>

        <tr>
          <td>Fuel Type</td>
          <td>${car1.fuelType?.join(", ")}</td>
          <td>${car2.fuelType?.join(", ")}</td>
        </tr>

        <tr>
          <td>Transmission</td>
          <td>${car1.transmission?.join(", ")}</td>
          <td>${car2.transmission?.join(", ")}</td>
        </tr>

        <tr>
          <td>Seating</td>
          <td>${car1.seatingCapacity}</td>
          <td>${car2.seatingCapacity}</td>
        </tr>

        <tr>
          <td>NCAP Rating</td>
          <td>${car1.ncapRating || "N/A"}</td>
          <td>${car2.ncapRating || "N/A"}</td>
        </tr>

        <tr>
          <td>User Rating</td>
          <td>${"★".repeat(car1.rating || 3)}</td>
          <td>${"★".repeat(car2.rating || 3)}</td>
        </tr>

        <tr>
          <td>Best For</td>
          <td>${car1.bestFor || "N/A"}</td>
          <td>${car2.bestFor || "N/A"}</td>
        </tr>

      </table>
    `;

    // =========================
    // 🔥 REMOVE CAR
    // =========================
    document.querySelectorAll(".remove-btn").forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute("data-id");

        compare = compare.filter(c => c !== id);

        localStorage.setItem("compare", JSON.stringify(compare));

        location.reload();
      };
    });

  } catch (err) {
    console.error(err);
    container.innerHTML = "<h2 class='loading'>⚠️ Error loading comparison</h2>";
  }

});