console.log("🔥 ADMIN JS LOADED");

const form = document.getElementById("form");
const input = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const dropArea = document.getElementById("dropArea");
const carsList = document.getElementById("carsList");
const variantContainer = document.getElementById("variantContainer");

let filesArray = [];
let editId = null;
let currentImages = [];

// =========================
// VARIANT FUNCTION
// =========================
window.addVariant = function (data = {}) {
  const div = document.createElement("div");
  div.classList.add("variant-box");

  div.innerHTML = `
    <input class="v-name" placeholder="Variant Name" value="${data.name || ""}">
    <input class="v-price" placeholder="Price" value="${data.price || ""}">
    <input class="v-fuel" placeholder="Fuel Type" value="${data.fuelType || ""}">
    <input class="v-trans" placeholder="Transmission" value="${data.transmission || ""}">
    <input class="v-mileage" placeholder="Mileage" value="${data.mileage || ""}">
    <input class="v-features" placeholder="Features" value="${(data.features || []).join(", ")}">
    <button type="button" class="remove-variant">❌ Remove</button>
  `;

  div.querySelector(".remove-variant").onclick = () => div.remove();

  variantContainer.appendChild(div);
};

// =========================
// IMAGE HANDLING
// =========================
if (dropArea && input) {
  dropArea.addEventListener("click", () => input.click());

  input.addEventListener("change", () => {
    handleFiles(Array.from(input.files));
  });

  dropArea.addEventListener("dragover", e => {
    e.preventDefault();
  });

  dropArea.addEventListener("drop", e => {
    e.preventDefault();
    handleFiles(Array.from(e.dataTransfer.files));
  });
}

function handleFiles(files) {
  files.forEach(file => {
    filesArray.push(file);

    const wrapper = document.createElement("div");

    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);

    const btn = document.createElement("button");
    btn.innerText = "❌";

    btn.onclick = () => {
      wrapper.remove();
      filesArray = filesArray.filter(f => f !== file);
    };

    wrapper.appendChild(img);
    wrapper.appendChild(btn);
    preview.appendChild(wrapper);
  });
}

// =========================
// LOAD
// =========================
async function loadCars() {
  const res = await fetch("http://localhost:5000/api/cars");
  const cars = await res.json();

  carsList.innerHTML = cars.map(car => `
    <div class="car-item">
      ${car.brand} ${car.model}
      <div>
        <button class="edit-btn" onclick="editCar('${car._id}')">✏️</button>
        <button class="delete-btn" onclick="deleteCar('${car._id}')">❌</button>
      </div>
    </div>
  `).join("");
}

// =========================
// EDIT
// =========================
window.editCar = async (id) => {
  editId = id;

  const res = await fetch(`http://localhost:5000/api/cars/${id}`);
  const car = await res.json();

  Object.keys(car).forEach(key => {
    if (form[key]) {
      form[key].value = Array.isArray(car[key])
        ? car[key].join(", ")
        : car[key] || "";
    }
  });

  // IMAGES
  preview.innerHTML = "";
  currentImages = car.images || [];

  currentImages.forEach((img, i) => {
    const wrapper = document.createElement("div");

    const image = document.createElement("img");
    image.src = `http://localhost:5000/images/${img}`;

    const btn = document.createElement("button");
    btn.innerText = "❌";

    btn.onclick = () => {
      wrapper.remove();
      currentImages.splice(i, 1);
    };

    wrapper.appendChild(image);
    wrapper.appendChild(btn);
    preview.appendChild(wrapper);
  });

  // VARIANTS
  variantContainer.innerHTML = "";
  (car.variants || []).forEach(v => addVariant(v));
};

// =========================
// DELETE
// =========================
window.deleteCar = async (id) => {
  if (!confirm("Delete this car?")) return;

  await fetch(`http://localhost:5000/api/cars/${id}`, {
    method: "DELETE"
  });

  loadCars();
};

// =========================
// SUBMIT
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

  formData.append("existingImages", JSON.stringify(currentImages));
  filesArray.forEach(file => formData.append("images", file));

  const variants = [];
  document.querySelectorAll(".variant-box").forEach(box => {
    variants.push({
      name: box.querySelector(".v-name").value,
      price: box.querySelector(".v-price").value,
      fuelType: box.querySelector(".v-fuel").value,
      transmission: box.querySelector(".v-trans").value,
      mileage: box.querySelector(".v-mileage").value,
      features: box.querySelector(".v-features").value.split(",")
    });
  });

  formData.append("variants", JSON.stringify(variants));

  const url = editId
    ? `http://localhost:5000/api/cars/${editId}`
    : "http://localhost:5000/api/cars";

  const method = editId ? "PUT" : "POST";

  await fetch(url, { method, body: formData });

  alert("Saved!");

  form.reset();
  preview.innerHTML = "";
  variantContainer.innerHTML = "";
  filesArray = [];
  currentImages = [];
  editId = null;

  loadCars();
});

// INIT
window.onload = loadCars;