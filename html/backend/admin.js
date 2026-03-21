console.log("🔥 ADMIN JS LOADED");

const form = document.getElementById("form");
const input = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const dropArea = document.getElementById("dropArea");
const carsList = document.getElementById("carsList");

let filesArray = [];
let editId = null;

// =========================
// 📂 FILE UPLOAD HANDLING
// =========================
if (dropArea && input) {
  dropArea.addEventListener("click", () => input.click());

  input.addEventListener("change", () => {
    handleFiles(Array.from(input.files));
  });

  dropArea.addEventListener("dragover", e => {
    e.preventDefault();
    dropArea.style.background = "#333";
  });

  dropArea.addEventListener("dragleave", () => {
    dropArea.style.background = "transparent";
  });

  dropArea.addEventListener("drop", e => {
    e.preventDefault();
    handleFiles(Array.from(e.dataTransfer.files));
  });
}

// =========================
// 🖼 IMAGE PREVIEW
// =========================
function handleFiles(files) {
  files.forEach(file => {
    filesArray.push(file);

    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    img.style.width = "80px";
    img.style.margin = "5px";
    img.style.borderRadius = "5px";

    preview.appendChild(img);
  });
}

// =========================
// 🔄 LOAD CARS
// =========================
async function loadCars() {
  console.log("🔥 loadCars called");

  try {
    const res = await fetch("http://localhost:5000/api/cars");
    const cars = await res.json();

    console.log("Cars:", cars);

    if (!Array.isArray(cars) || cars.length === 0) {
      carsList.innerHTML = "<h3>No Cars Found</h3>";
      return;
    }

    carsList.innerHTML = cars.map(car => `
      <div class="car-item">
        <span>${car.brand} ${car.model}</span>

        <div>
          <button class="edit-btn" onclick="editCar('${car._id}')">✏️</button>
          <button class="delete-btn" onclick="deleteCar('${car._id}')">❌</button>
        </div>
      </div>
    `).join("");

  } catch (err) {
    console.error("❌ ERROR LOADING CARS:", err);
    carsList.innerHTML = "<h3>❌ Failed to load cars</h3>";
  }
}

// =========================
// ✏️ EDIT CAR
// =========================
window.editCar = async (id) => {
  editId = id;

  const res = await fetch(`http://localhost:5000/api/cars/${id}`);
  const car = await res.json();

  console.log("Editing:", car);

  Object.keys(car).forEach(key => {
    if (form[key]) {
      if (Array.isArray(car[key])) {
        form[key].value = car[key].join(", ");
      } else if (typeof car[key] === "string") {
        form[key].value = car[key].replace(/[\[\]"']/g, "");
      } else {
        form[key].value = car[key] || "";
      }
    }
  });

  // Show existing images
  preview.innerHTML = "";
  if (car.images && car.images.length) {
    car.images.forEach(img => {
      const image = document.createElement("img");
      image.src = `http://localhost:5000/images/${img}`;
      image.style.width = "80px";
      image.style.margin = "5px";
      image.style.borderRadius = "5px";
      preview.appendChild(image);
    });
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
};

// =========================
// ❌ DELETE CAR
// =========================
window.deleteCar = async (id) => {
  if (!confirm("Delete this car?")) return;

  await fetch(`http://localhost:5000/api/cars/${id}`, {
    method: "DELETE"
  });

  alert("Deleted!");
  loadCars();
};

// =========================
// 💾 SUBMIT FORM
// =========================
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData();

  const fields = [
    "brand","model","type","priceRange","engineOptions","mileage",
    "fuelType","transmission","seatingCapacity","rating","ncapRating",
    "bestFor","description","features","pros","cons","verdict"
  ];

  fields.forEach(field => {
    formData.append(field, form[field].value);
  });

  // Images
  filesArray.forEach(file => formData.append("images", file));

  const url = editId
    ? `http://localhost:5000/api/cars/${editId}`
    : "http://localhost:5000/api/cars";

  const method = editId ? "PUT" : "POST";

  const res = await fetch(url, {
    method,
    body: formData
  });

  const data = await res.json();

  alert(data.message || "Saved!");

  // Reset
  form.reset();
  preview.innerHTML = "";
  filesArray = [];
  editId = null;

  loadCars();
});

// =========================
// 🚀 INIT
// =========================
window.onload = loadCars;