console.log("🔥 AUTOVERSE ADMIN CONSOLE LOADED");

(() => {

  /* =====================================================
     CONFIG
  ====================================================== */

  const API =
    typeof API_BASE_URL !== "undefined"
      ? API_BASE_URL
      : "";


  /* =====================================================
     DOM
  ====================================================== */

  const vehicleForm =
    document.getElementById("vehicleForm");

  const vehicleEditor =
    document.getElementById("vehicleEditor");

  const vehicleEditorTitle =
    document.getElementById("editorTitle");

  const carsList =
    document.getElementById("carsList");

  const carSearch =
    document.getElementById("carSearch");

  const resultCount =
    document.getElementById("resultCount");

  const imageInput =
    document.getElementById("imageInput");

  const preview =
    document.getElementById("preview");

  const dropArea =
    document.getElementById("dropArea");

  const variantContainer =
    document.getElementById("variantContainer");

  const dealershipEditor =
    document.getElementById("dealershipEditor");

  const dealershipForm =
    document.getElementById("dealershipForm");

  const toast =
    document.getElementById("toast");


  /* =====================================================
     STATE
  ====================================================== */

  let cars = [];

  let filteredCars = [];

  let uploadedFiles = [];

  let currentImages = [];

  let editId = null;

  let dealershipEditId = null;

  /*
   * Future-ready local dealership state.
   *
   * IMPORTANT:
   * This is intentionally NOT treated as database data.
   * Once dealership backend is available, replace the
   * local state with GET/POST/PUT/DELETE API calls.
   */

  let dealerships = [];


  /* =====================================================
     API REQUEST HELPER
  ====================================================== */

  async function apiRequest(
    endpoint,
    options = {}
  ) {

    const token =
      localStorage.getItem("token");

    const headers = {
      ...(options.headers || {})
    };


    /*
     * Do not manually set Content-Type for FormData.
     * Browser must generate multipart boundary.
     */

    if (
      options.body &&
      !(options.body instanceof FormData)
    ) {

      headers["Content-Type"] =
        "application/json";

    }


    if (token) {

      headers.Authorization =
        `Bearer ${token}`;

    }


    const response =
      await fetch(
        `${API}${endpoint}`,
        {
          ...options,
          headers
        }
      );


    if (
      response.status === 401 ||
      response.status === 403
    ) {

      showToast(
        "Authentication required."
      );

      /*
       * Don't automatically redirect yet.
       * This keeps the panel usable with your
       * current backend authentication setup.
       */

    }


    return response;

  }


  /* =====================================================
     TOAST
  ====================================================== */

  let toastTimer;

  function showToast(message) {

    toast.textContent = message;

    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer =
      setTimeout(() => {

        toast.classList.remove("show");

      }, 2800);

  }


  /* =====================================================
     DASHBOARD
  ====================================================== */

  function updateDashboard() {

    const totalCars =
      cars.length;


    const brands =
      new Set(
        cars
          .map(car =>
            String(car.brand || "")
              .trim()
              .toLowerCase()
          )
          .filter(Boolean)
      );


    const variants =
      cars.reduce(
        (total, car) =>
          total +
          (
            Array.isArray(car.variants)
              ? car.variants.length
              : 0
          ),
        0
      );


    document.getElementById(
      "totalCars"
    ).textContent =
      totalCars;


    document.getElementById(
      "totalBrands"
    ).textContent =
      brands.size;


    document.getElementById(
      "totalVariants"
    ).textContent =
      variants;


    document.getElementById(
      "totalDealerships"
    ).textContent =
      dealerships.length;

  }


  /* =====================================================
     LOAD CARS
  ====================================================== */

  async function loadCars() {

    carsList.innerHTML = `
      <div class="empty-dealership">
        Loading vehicle inventory...
      </div>
    `;


    try {

      /*
       * ONE database request.
       *
       * Search and filtering happen locally afterwards.
       */

      const response =
        await apiRequest("/cars");


      if (!response.ok) {

        throw new Error(
          `Failed to load vehicles (${response.status})`
        );

      }


      const data =
        await response.json();


      cars =
        Array.isArray(data)
          ? data
          : [];


      filteredCars =
        [...cars];


      updateDashboard();

      renderCars();

    } catch (error) {

      console.error(
        "❌ Inventory Error:",
        error
      );


      carsList.innerHTML = `
        <div class="empty-dealership">
          <div>⚠️</div>
          <h3>Unable to load inventory</h3>
          <p>
            ${escapeHtml(error.message)}
          </p>
        </div>
      `;

    }

  }


  /* =====================================================
     SEARCH
  ====================================================== */

  carSearch.addEventListener(
    "input",
    () => {

      const query =
        carSearch.value
          .trim()
          .toLowerCase();


      if (!query) {

        filteredCars =
          [...cars];

      } else {

        filteredCars =
          cars.filter(car => {

            const searchable = [

              car.brand,

              car.model,

              car.type,

              car.fuelType,

              car.transmission,

              car.priceRange

            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();


            return searchable.includes(query);

          });

      }


      renderCars();

    }
  );


  /* =====================================================
     RENDER CARS
  ====================================================== */

  function renderCars() {

    resultCount.textContent =
      `${filteredCars.length} ${filteredCars.length === 1
        ? "vehicle"
        : "vehicles"
      }`;


    if (!filteredCars.length) {

      carsList.innerHTML = `
        <div class="empty-dealership">

          <div>🚗</div>

          <h3>
            No vehicles found
          </h3>

          <p>
            Try another search or add a new vehicle.
          </p>

        </div>
      `;

      return;

    }


    carsList.innerHTML =
      filteredCars
        .map(car => {

          const image =
            getCarImage(car);


          return `

            <article class="car-item">

              <div class="car-info">

                ${image
              ? `
                      <img
                        class="car-thumb"
                        src="${escapeAttribute(image)}"
                        alt="${escapeAttribute(
                `${car.brand || ""} ${car.model || ""}`
              )}"
                        loading="lazy"
                      >
                    `
              : `
                      <div class="car-thumb"></div>
                    `
            }


                <div class="car-name">

                  <strong>
                    ${escapeHtml(
              `${car.brand || ""} ${car.model || ""}`
            )}
                  </strong>

                  <span>
                    ${escapeHtml(
              car.type || "Vehicle"
            )}
                    ${car.priceRange
              ? ` · ${escapeHtml(car.priceRange)}`
              : ""
            }
                  </span>

                </div>

              </div>


              <div class="car-actions">

                <button
                  class="car-action"
                  title="Edit vehicle"
                  data-action="edit"
                  data-id="${escapeAttribute(car._id)}"
                >
                  ✏️
                </button>

                <button
                  class="car-action delete"
                  title="Delete vehicle"
                  data-action="delete"
                  data-id="${escapeAttribute(car._id)}"
                >
                  ×
                </button>

              </div>

            </article>

          `;

        })
        .join("");

  }


  /* =====================================================
     CAR ACTIONS
  ====================================================== */

  carsList.addEventListener(
    "click",
    event => {

      const button =
        event.target.closest(
          "[data-action]"
        );


      if (!button) return;


      const id =
        button.dataset.id;


      if (
        button.dataset.action ===
        "edit"
      ) {

        editCar(id);

      }


      if (
        button.dataset.action ===
        "delete"
      ) {

        deleteCar(id);

      }

    }
  );


  /* =====================================================
     NEW CAR
  ====================================================== */

  document
    .getElementById("newCarBtn")
    .addEventListener(
      "click",
      () => {

        resetVehicleEditor();

        vehicleEditor.classList.remove(
          "hidden"
        );

        vehicleEditor.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });

      }
    );


  /* =====================================================
     CLOSE EDITOR
  ====================================================== */

  document
    .getElementById("closeEditorBtn")
    .addEventListener(
      "click",
      closeVehicleEditor
    );


  document
    .getElementById("cancelVehicleBtn")
    .addEventListener(
      "click",
      closeVehicleEditor
    );


  function closeVehicleEditor() {

    vehicleEditor.classList.add(
      "hidden"
    );

    resetVehicleEditor();

  }


  /* =====================================================
     RESET VEHICLE
  ====================================================== */

  function resetVehicleEditor() {

    vehicleForm.reset();

    preview.innerHTML = "";

    variantContainer.innerHTML = "";

    uploadedFiles = [];

    currentImages = [];

    editId = null;

    vehicleEditorTitle.textContent =
      "Add Vehicle";

  }


  /* =====================================================
     EDIT CAR
  ====================================================== */

  async function editCar(id) {

    try {

      showToast(
        "Loading vehicle..."
      );


      const response =
        await apiRequest(
          `/cars/${encodeURIComponent(id)}`
        );


      if (!response.ok) {

        throw new Error(
          `Unable to fetch vehicle (${response.status})`
        );

      }


      const car =
        await response.json();


      editId = id;


      vehicleEditorTitle.textContent =
        "Edit Vehicle";


      fillVehicleForm(car);


      vehicleEditor.classList.remove(
        "hidden"
      );


      vehicleEditor.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });


    } catch (error) {

      console.error(
        "❌ Edit Error:",
        error
      );

      showToast(
        "Unable to load vehicle."
      );

    }

  }


  /* =====================================================
     FILL VEHICLE FORM
  ====================================================== */

  function fillVehicleForm(car) {

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
      "verdict"

    ];


    fields.forEach(field => {

      const input =
        vehicleForm.elements[field];


      if (!input) return;


      const value =
        car[field];


      input.value =
        Array.isArray(value)
          ? value.join(", ")
          : value ?? "";

    });


    /* IMAGES */

    preview.innerHTML = "";

    uploadedFiles = [];

    currentImages =
      Array.isArray(car.images)
        ? [...car.images]
        : [];


    currentImages.forEach(
      (image, index) => {

        renderExistingImage(
          image,
          index
        );

      }
    );


    /* VARIANTS */

    variantContainer.innerHTML = "";


    if (
      Array.isArray(car.variants)
    ) {

      car.variants.forEach(
        variant =>
          addVariant(variant)
      );

    }

  }


  /* =====================================================
     EXISTING IMAGE
  ====================================================== */

  function renderExistingImage(
    image,
    index
  ) {

    const wrapper =
      document.createElement(
        "div"
      );


    wrapper.className =
      "image-wrapper";


    const img =
      document.createElement(
        "img"
      );


    img.src =
      buildImageUrl(image);


    img.alt =
      "Vehicle image";


    img.loading =
      "lazy";


    const remove =
      document.createElement(
        "button"
      );


    remove.type =
      "button";


    remove.className =
      "image-remove";


    remove.textContent =
      "×";


    remove.onclick =
      () => {

        currentImages.splice(
          index,
          1
        );

        wrapper.remove();

      };


    wrapper.appendChild(img);

    wrapper.appendChild(remove);

    preview.appendChild(wrapper);

  }


  /* =====================================================
     IMAGE URL
  ====================================================== */

  function buildImageUrl(image) {

    if (!image) return "";

    if (
      image.startsWith("http://") ||
      image.startsWith("https://")
    ) {

      return image;

    }


    return `${API}/images/${image}`;

  }


  function getCarImage(car) {

    if (
      !Array.isArray(car.images) ||
      !car.images.length
    ) {

      return "";

    }


    return buildImageUrl(
      car.images[0]
    );

  }


  /* =====================================================
     IMAGE INPUT
  ====================================================== */

  dropArea.addEventListener(
    "click",
    () => imageInput.click()
  );


  imageInput.addEventListener(
    "change",
    event => {

      handleFiles(
        Array.from(
          event.target.files || []
        )
      );

      imageInput.value = "";

    }
  );


  dropArea.addEventListener(
    "dragover",
    event => {

      event.preventDefault();

      dropArea.classList.add(
        "dragging"
      );

    }
  );


  dropArea.addEventListener(
    "dragleave",
    () => {

      dropArea.classList.remove(
        "dragging"
      );

    }
  );


  dropArea.addEventListener(
    "drop",
    event => {

      event.preventDefault();

      dropArea.classList.remove(
        "dragging"
      );


      handleFiles(
        Array.from(
          event.dataTransfer.files || []
        )
      );

    }
  );


  /* =====================================================
     HANDLE FILES
  ====================================================== */

  function handleFiles(files) {

    const validFiles =
      files.filter(
        file =>
          file.type.startsWith(
            "image/"
          )
      );


    validFiles.forEach(
      file => {

        uploadedFiles.push(
          file
        );


        const wrapper =
          document.createElement(
            "div"
          );


        wrapper.className =
          "image-wrapper";


        const img =
          document.createElement(
            "img"
          );


        img.src =
          URL.createObjectURL(file);


        img.onload =
          () =>
            URL.revokeObjectURL(
              img.src
            );


        const remove =
          document.createElement(
            "button"
          );


        remove.type =
          "button";


        remove.className =
          "image-remove";


        remove.textContent =
          "×";


        remove.onclick =
          () => {

            uploadedFiles =
              uploadedFiles.filter(
                f =>
                  f !== file
              );

            wrapper.remove();

          };


        wrapper.appendChild(img);

        wrapper.appendChild(remove);

        preview.appendChild(wrapper);

      }
    );

  }


  /* =====================================================
     VARIANTS
  ====================================================== */

  document
    .getElementById("addVariantBtn")
    .addEventListener(
      "click",
      () => addVariant()
    );


  window.addVariant =
    addVariant;


  function addVariant(
    data = {}
  ) {

    const div =
      document.createElement(
        "div"
      );


    div.className =
      "variant-box";


    div.innerHTML = `

      <input
        class="v-name"
        placeholder="Variant Name"
        value="${escapeAttribute(
      data.name || ""
    )}"
      >

      <input
        class="v-price"
        placeholder="Price"
        value="${escapeAttribute(
      data.price || ""
    )}"
      >

      <input
        class="v-fuel"
        placeholder="Fuel Type"
        value="${escapeAttribute(
      data.fuelType || ""
    )}"
      >

      <input
        class="v-trans"
        placeholder="Transmission"
        value="${escapeAttribute(
      data.transmission || ""
    )}"
      >

      <input
        class="v-mileage"
        placeholder="Mileage"
        value="${escapeAttribute(
      data.mileage || ""
    )}"
      >

      <input
        class="v-features"
        placeholder="Features"
        value="${escapeAttribute(
      Array.isArray(data.features)
        ? data.features.join(", ")
        : data.features || ""
    )}"
      >

      <button
        type="button"
        class="remove-variant"
      >
        Remove Variant
      </button>

    `;


    div
      .querySelector(
        ".remove-variant"
      )
      .addEventListener(
        "click",
        () => div.remove()
      );


    variantContainer.appendChild(
      div
    );

  }


  /* =====================================================
     SAVE VEHICLE
  ====================================================== */

  vehicleForm.addEventListener(
    "submit",
    async event => {

      event.preventDefault();


      const button =
        document.getElementById(
          "saveVehicleBtn"
        );


      button.disabled = true;

      button.textContent =
        "Saving...";


      try {

        const formData =
          new FormData();


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
          "verdict"

        ];


        fields.forEach(field => {

          const input =
            vehicleForm.elements[field];


          formData.append(
            field,
            input.value
          );

        });


        formData.append(
          "existingImages",
          JSON.stringify(
            currentImages
          )
        );


        uploadedFiles.forEach(
          file => {

            formData.append(
              "images",
              file
            );

          }
        );


        const variants =
          collectVariants();


        formData.append(
          "variants",
          JSON.stringify(
            variants
          )
        );


        const endpoint =
          editId
            ? `/cars/${encodeURIComponent(editId)}`
            : "/cars";


        const method =
          editId
            ? "PUT"
            : "POST";


        const response =
          await apiRequest(
            endpoint,
            {
              method,
              body: formData
            }
          );


        if (!response.ok) {

          let message =
            `Unable to save vehicle (${response.status})`;


          try {

            const error =
              await response.json();


            message =
              error.message ||
              message;

          } catch (_) { }


          throw new Error(
            message
          );

        }


        showToast(
          editId
            ? "Vehicle updated successfully."
            : "Vehicle added successfully."
        );


        closeVehicleEditor();


        /*
         * Re-fetch after mutation.
         *
         * This ensures the admin UI reflects the
         * actual database state instead of guessing.
         */

        await loadCars();


      } catch (error) {

        console.error(
          "❌ Save Vehicle Error:",
          error
        );


        showToast(
          error.message ||
          "Unable to save vehicle."
        );

      } finally {

        button.disabled =
          false;

        button.textContent =
          "Save Vehicle";

      }

    }
  );


  /* =====================================================
     COLLECT VARIANTS
  ====================================================== */

  function collectVariants() {

    return Array.from(
      document.querySelectorAll(
        ".variant-box"
      )
    ).map(box => {

      return {

        name:
          box.querySelector(
            ".v-name"
          ).value.trim(),

        price:
          box.querySelector(
            ".v-price"
          ).value.trim(),

        fuelType:
          box.querySelector(
            ".v-fuel"
          ).value.trim(),

        transmission:
          box.querySelector(
            ".v-trans"
          ).value.trim(),

        mileage:
          box.querySelector(
            ".v-mileage"
          ).value.trim(),

        features:
          box
            .querySelector(
              ".v-features"
            )
            .value
            .split(",")
            .map(item =>
              item.trim()
            )
            .filter(Boolean)

      };

    });

  }


  /* =====================================================
     DELETE CAR
  ====================================================== */

  async function deleteCar(id) {

    const car =
      cars.find(
        item =>
          item._id === id
      );


    const name =
      car
        ? `${car.brand || ""} ${car.model || ""}`.trim()
        : "this vehicle";


    const confirmed =
      confirm(
        `Delete ${name}?\n\nThis action cannot be undone.`
      );


    if (!confirmed) return;


    try {

      const response =
        await apiRequest(
          `/cars/${encodeURIComponent(id)}`,
          {
            method: "DELETE"
          }
        );


      if (!response.ok) {

        throw new Error(
          `Delete failed (${response.status})`
        );

      }


      showToast(
        "Vehicle deleted."
      );


      /*
       * Re-fetch actual DB state.
       */

      await loadCars();


    } catch (error) {

      console.error(
        "❌ Delete Error:",
        error
      );


      showToast(
        "Unable to delete vehicle."
      );

    }

  }


  /* =====================================================
     ADMIN TABS
  ====================================================== */

  document
    .querySelectorAll(".admin-tab")
    .forEach(tab => {

      tab.addEventListener(
        "click",
        () => {

          const section =
            tab.dataset.section;


          document
            .querySelectorAll(
              ".admin-tab"
            )
            .forEach(item =>
              item.classList.remove(
                "active"
              )
            );


          document
            .querySelectorAll(
              ".admin-section"
            )
            .forEach(item =>
              item.classList.remove(
                "active"
              )
            );


          tab.classList.add(
            "active"
          );


          if (
            section ===
            "inventory"
          ) {

            document
              .getElementById(
                "inventorySection"
              )
              .classList.add(
                "active"
              );

          }


          if (
            section ===
            "dealerships"
          ) {

            document
              .getElementById(
                "dealershipSection"
              )
              .classList.add(
                "active"
              );

          }

        }
      );

    });


  /* =====================================================
     DEALERSHIP FRONTEND
  ====================================================== */

  document
    .getElementById(
      "addDealershipBtn"
    )
    .addEventListener(
      "click",
      () => {

        dealershipEditId =
          null;

        dealershipForm.reset();

        dealershipEditor
          .classList
          .remove("hidden");


        dealershipEditor.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });

      }
    );


  document
    .getElementById(
      "closeDealershipBtn"
    )
    .addEventListener(
      "click",
      closeDealershipEditor
    );


  document
    .getElementById(
      "cancelDealershipBtn"
    )
    .addEventListener(
      "click",
      closeDealershipEditor
    );


  function closeDealershipEditor() {

    dealershipEditor
      .classList
      .add("hidden");

    dealershipForm.reset();

    dealershipEditId =
      null;

  }


  /*
   * TEMPORARY FRONTEND-ONLY DEALERSHIP SAVE
   *
   * This does NOT pretend to save to MongoDB.
   * It exists so the UI/workflow can be tested
   * before the dealership backend is built.
   */

  dealershipForm.addEventListener(
    "submit",
    event => {

      event.preventDefault();


      const formData =
        new FormData(
          dealershipForm
        );


      const dealership =
        Object.fromEntries(
          formData.entries()
        );


      dealership.id =
        dealershipEditId ||
        `local-${Date.now()}`;


      if (dealershipEditId) {

        dealerships =
          dealerships.map(
            item =>
              item.id ===
                dealershipEditId
                ? dealership
                : item
          );

      } else {

        dealerships.push(
          dealership
        );

      }


      updateDashboard();

      renderDealerships();

      closeDealershipEditor();


      showToast(
        "Dealership saved locally. Backend integration pending."
      );

    }
  );


  /* =====================================================
     DEALERSHIP RENDER
  ====================================================== */

  function renderDealerships() {

    const list =
      document.getElementById(
        "dealershipList"
      );


    if (!dealerships.length) {

      list.innerHTML = `

        <div class="empty-dealership">

          <div>🏢</div>

          <h3>
            Dealership Network
          </h3>

          <p>
            No dealership records are connected yet.
            Once the dealership backend is available,
            verified partners will appear here.
          </p>

        </div>

      `;

      return;

    }


    list.innerHTML =
      dealerships
        .map(
          dealership => `

            <article class="car-item">

              <div class="car-info">

                <div class="car-thumb">
                  🏢
                </div>

                <div class="car-name">

                  <strong>
                    ${escapeHtml(
            dealership.dealershipName ||
            "Unnamed Dealership"
          )}
                  </strong>

                  <span>
                    ${escapeHtml(
            dealership.city || ""
          )}
                    ${dealership.state
              ? ` · ${escapeHtml(
                dealership.state
              )}`
              : ""
            }

                    ·

                    ${escapeHtml(
              dealership.businessType ||
              "Dealer"
            )}
                  </span>

                </div>

              </div>


              <div class="car-actions">

                <button
                  class="car-action"
                  data-dealership-edit="${escapeAttribute(
              dealership.id
            )}"
                >
                  ✏️
                </button>

              </div>

            </article>

          `
        )
        .join("");

  }


  /* =====================================================
     DEALERSHIP EDIT
  ====================================================== */

  document
    .getElementById(
      "dealershipList"
    )
    .addEventListener(
      "click",
      event => {

        const button =
          event.target.closest(
            "[data-dealership-edit]"
          );


        if (!button) return;


        const id =
          button.dataset.dealershipEdit;


        const dealership =
          dealerships.find(
            item =>
              item.id === id
          );


        if (!dealership) return;


        dealershipEditId =
          id;


        Object.entries(
          dealership
        ).forEach(
          ([key, value]) => {

            const input =
              dealershipForm.elements[key];


            if (input) {

              input.value =
                value || "";

            }

          }
        );


        dealershipEditor
          .classList
          .remove("hidden");


        dealershipEditor.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });

      }
    );


  /* =====================================================
     REFRESH
  ====================================================== */

  document
    .getElementById(
      "refreshAllBtn"
    )
    .addEventListener(
      "click",
      async () => {

        showToast(
          "Refreshing inventory..."
        );

        await loadCars();

      }
    );


  /* =====================================================
     LOGOUT
  ====================================================== */

  document
    .getElementById(
      "logoutBtn"
    )
    .addEventListener(
      "click",
      () => {

        const confirmed =
          confirm(
            "Logout from AutoVerse Admin?"
          );


        if (!confirmed) return;


        localStorage.removeItem(
          "token"
        );


        window.location.href =
          "login.html";

      }
    );


  /* =====================================================
     SECURITY HELPERS
  ====================================================== */

  function escapeHtml(value) {

    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  }


  function escapeAttribute(value) {

    return escapeHtml(value);

  }


  /* =====================================================
     INIT
  ====================================================== */

  async function init() {

    /*
     * Dealership backend is intentionally not called yet.
     * When the API exists, this is where we will load it.
     */

    dealerships = [];

    renderDealerships();

    updateDashboard();

    await loadCars();

  }


  init();

})();