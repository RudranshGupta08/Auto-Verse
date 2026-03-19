const form = document.getElementById("carForm");
const input = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const dropArea = document.getElementById("dropArea");

let filesArray = [];

// 🔥 CLICK TO OPEN FILE
dropArea.addEventListener("click", () => input.click());

// 🔥 DRAG OVER
dropArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropArea.style.background = "#334155";
});

// 🔥 DRAG LEAVE
dropArea.addEventListener("dragleave", () => {
  dropArea.style.background = "transparent";
});

// 🔥 DROP FILES
dropArea.addEventListener("drop", (e) => {
  e.preventDefault();
  dropArea.style.background = "transparent";

  const files = Array.from(e.dataTransfer.files);
  handleFiles(files);
});

// 🔥 FILE SELECT
input.addEventListener("change", () => {
  const files = Array.from(input.files);
  handleFiles(files);
});

// 🔥 HANDLE FILES + PREVIEW
function handleFiles(files) {
  files.forEach(file => {
    filesArray.push(file);

    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);

    preview.appendChild(img);
  });
}

// 🚀 SUBMIT FORM
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData();

  formData.append("brand", form.brand.value);
  formData.append("model", form.model.value);
  formData.append("type", form.type.value);
  formData.append("priceRange", form.priceRange.value);
  formData.append("engineOptions", form.engineOptions.value);
  formData.append("mileage", form.mileage.value);
  formData.append("fuelType", form.fuelType.value);
  formData.append("transmission", form.transmission.value);
  formData.append("seatingCapacity", form.seatingCapacity.value);

  // 🔥 ADD IMAGES
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

    // 🔥 RESET
    form.reset();
    preview.innerHTML = "";
    filesArray = [];

  } catch (err) {
    console.error(err);
    alert("Error uploading car");
  }
});