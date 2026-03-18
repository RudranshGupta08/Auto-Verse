document.getElementById("carForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const updateModel = document.getElementById("updateModel").value;

  const images = document.getElementById("images").value
    .split(",")
    .map(img => img.trim());

  try {

    // ✅ IF MODEL PROVIDED → UPDATE IMAGES
    if (updateModel) {

      const res = await fetch(`http://localhost:5000/api/cars/add-images/${updateModel}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ images })
      });

      const data = await res.json();

      alert("Images added to existing car ✅");
      console.log(data);

    } else {
      // ➕ NORMAL ADD CAR
      const carData = {
        brand: document.getElementById("brand").value,
        model: document.getElementById("model").value,
        type: document.getElementById("type").value,

        priceRange: document.getElementById("price").value,

        engineOptions: document.getElementById("engine").value.split(","),
        mileage: document.getElementById("mileage").value,

        fuelType: document.getElementById("fuel").value.split(","),
        transmission: document.getElementById("transmission").value.split(","),

        seatingCapacity: document.getElementById("seats").value,

        images
      };

      const res = await fetch("http://localhost:5000/api/cars", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(carData)
      });

      alert("Car Added Successfully 🚀");
    }

  } catch (err) {
    console.error(err);
    alert("Error occurred ❌");
  }
});