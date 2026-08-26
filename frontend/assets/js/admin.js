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

  dropArea.addEventListener("dragover", (e) => {
    e.preventDefault();
  });

  dropArea.addEventListener("drop", (e) => {
    e.preventDefault();
    handleFiles(Array.from(e.dataTransfer.files));
  });
}

function handleFiles(files) {
  files.forEach((file) => {
    filesArray.push(file);

    const wrapper = document.createElement("div");

    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);

    const btn = document.createElement("button");
    btn.innerText = "❌";

    btn.onclick = () => {
      wrapper.remove();
      filesArray = filesArray.filter((f) => f !== file);
    };

    wrapper.appendChild(img);
    wrapper.appendChild(btn);
    preview.appendChild(wrapper);
  });
}

// =========================
// LOAD CARS
// =========================
async function loadCars() {
  try {
    const res = await fetch(`${API_BASE_URL}/cars`);

    if (!res.ok) {
      throw new Error(`Failed to load cars: ${res.status}`);
    }

    const cars = await res.json();

    carsList.innerHTML = cars
      .map(
        (car) => `
        <div class="car-item">
          ${car.brand} ${car.model}
          <div>
            <button class="edit-btn" onclick="editCar('${car._id}')">✏️</button>
            <button class="delete-btn" onclick="deleteCar('${car._id}')">❌</button>
          </div>
        </div>
      `
      )
      .join("");
  } catch (error) {
    console.error("❌ Load Cars Error:", error);
  }
}

// =========================
// EDIT CAR
// =========================
window.editCar = async (id) => {
  try {
    editId = id;

    const res = await fetch(`${API_BASE_URL}/cars/${id}`);

    if (!res.ok) {
      throw new Error(`Failed to fetch car: ${res.status}`);
    }

    const car = await res.json();

    Object.keys(car).forEach((key) => {
      if (form[key]) {
        form[key].value = Array.isArray(car[key])
          ? car[key].join(", ")
          : car[key] || "";
      }
    });

    // =========================
    // IMAGES
    // =========================
    preview.innerHTML = "";
    currentImages = car.images || [];

    currentImages.forEach((img, i) => {
      const wrapper = document.createElement("div");

      const image = document.createElement("img");

      // Render serves the uploaded images
      image.src = `https://auto-verse-hcp5.onrender.com/images/${img}`;

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

    // =========================
    // VARIANTS
    // =========================
    variantContainer.innerHTML = "";

    (car.variants || []).forEach((variant) => {
      addVariant(variant);
    });
  } catch (error) {
    console.error("❌ Edit Car Error:", error);
  }
};

// =========================
// DELETE CAR
// =========================
window.deleteCar = async (id) => {
  if (!confirm("Delete this car?")) return;

  try {
    const res = await fetch(`${API_BASE_URL}/cars/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      throw new Error(`Failed to delete car: ${res.status}`);
    }

    await loadCars();
  } catch (error) {
    console.error("❌ Delete Car Error:", error);
    alert("Unable to delete the car.");
  }
};

// =========================
// SUBMIT CAR
// =========================
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    const formData = new FormData();

    const fields = [
      "brand",
      "model",
      "type",
      "priceRange",
      "engineOptions",
      "mileage",
      "fuelType",
      "transmission",
      "seatingCapacity",
      "rating",
      "ncapRating",
      "bestFor",
      "description",
      "features",
      "pros",
      "cons",
      "verdict",
    ];

    fields.forEach((field) => {
      formData.append(field, form[field].value);
    });

    formData.append(
      "existingImages",
      JSON.stringify(currentImages)
    );

    filesArray.forEach((file) => {
      formData.append("images", file);
    });

    // =========================
    // VARIANTS
    // =========================
    const variants = [];

    document.querySelectorAll(".variant-box").forEach((box) => {
      variants.push({
        name: box.querySelector(".v-name").value,
        price: box.querySelector(".v-price").value,
        fuelType: box.querySelector(".v-fuel").value,
        transmission: box.querySelector(".v-trans").value,
        mileage: box.querySelector(".v-mileage").value,
        features: box
          .querySelector(".v-features")
          .value.split(","),
      });
    });

    formData.append(
      "variants",
      JSON.stringify(variants)
    );

    // =========================
    // API URL
    // =========================
    const url = editId
      ? `${API_BASE_URL}/cars/${editId}`
      : `${API_BASE_URL}/cars`;

    const method = editId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      body: formData,
    });

    if (!res.ok) {
      throw new Error(`Failed to save car: ${res.status}`);
    }

    alert("Saved!");

    // =========================
    // RESET FORM
    // =========================
    form.reset();
    preview.innerHTML = "";
    variantContainer.innerHTML = "";

    filesArray = [];
    currentImages = [];
    editId = null;

    await loadCars();
  } catch (error) {
    console.error("❌ Save Car Error:", error);
    alert("Unable to save the car.");
  }
});

// =========================
// INIT
// =========================
window.onload = loadCars;