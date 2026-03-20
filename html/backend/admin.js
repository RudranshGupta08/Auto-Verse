const form = document.getElementById("carForm");
const input = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const dropArea = document.getElementById("dropArea");

let filesArray = [];

// CLICK
dropArea.addEventListener("click", () => input.click());

// DRAG
dropArea.addEventListener("dragover", e => {
  e.preventDefault();
  dropArea.style.background = "#333";
});

dropArea.addEventListener("dragleave", () => {
  dropArea.style.background = "transparent";
});

// DROP
dropArea.addEventListener("drop", e => {
  e.preventDefault();
  handleFiles(Array.from(e.dataTransfer.files));
});

// SELECT
input.addEventListener("change", () => {
  handleFiles(Array.from(input.files));
});

// PREVIEW
function handleFiles(files) {
  files.forEach(file => {
    filesArray.push(file);

    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);

    preview.appendChild(img);
  });
}

// SUBMIT
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData();

  // BASIC
  formData.append("brand", form.brand.value);
  formData.append("model", form.model.value);
  formData.append("type", form.type.value);
  formData.append("priceRange", form.priceRange.value);

  // ENGINE
  formData.append("engineOptions", form.engineOptions.value);
  formData.append("mileage", form.mileage.value);
  formData.append("fuelType", form.fuelType.value);
  formData.append("transmission", form.transmission.value);
  formData.append("seatingCapacity", form.seatingCapacity.value);

  // NEW FIELDS
  formData.append("rating", form.rating.value);
  formData.append("ncap", form.ncap.value);
  formData.append("bestFor", form.bestFor.value);

  // CONTENT
  formData.append("features", form.features.value);
  formData.append("pros", form.pros.value);
  formData.append("cons", form.cons.value);
  formData.append("verdict", form.verdict.value);

  // IMAGES
  filesArray.forEach(file => {
    formData.append("images", file);
  });

  try {
    const res = await fetch("http://localhost:5000/api/cars", {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    alert(data.message || "Car Added!");

    form.reset();
    preview.innerHTML = "";
    filesArray = [];

  } catch (err) {
    console.error(err);
    alert("Error uploading car");
  }
});