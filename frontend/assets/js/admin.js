console.log("🔥 AUTOVERSE ADMIN CONSOLE LOADED");

(() => {
  "use strict";

  /* =====================================================
     AUTOVERSE ADMIN CONSOLE
     -----------------------------------------------------
     SECURITY MODEL

     1. Backend is the authority for admin access.
     2. JWT is sent through Authorization: Bearer.
     3. localStorage role/user data is NEVER trusted.
     4. 401/403 immediately terminates the admin UI.
     5. GET requests use the authenticated JWT.
     6. State-changing requests can use CSRF when the
        backend exposes /auth/csrf.
     7. If /auth/csrf is unavailable, Bearer-token
        authentication remains usable because the token
        is explicitly attached as an Authorization header
        rather than automatically sent as a cookie.
     8. User-controlled HTML is escaped before rendering.
  ====================================================== */


  /* =====================================================
     CONFIG
  ====================================================== */

  const API =
    typeof API_BASE_URL !== "undefined"
      ? String(API_BASE_URL).replace(/\/+$/, "")
      : "";

  if (!API) {
    console.error(
      "❌ API_BASE_URL is not configured."
    );
  }


  /* =====================================================
     DOM
  ====================================================== */

  const carsList =
    document.getElementById("carsList");

  const carSearch =
    document.getElementById("carSearch");

  const resultCount =
    document.getElementById("resultCount");

  const toast =
    document.getElementById("toast");


  /* =====================================================
     STATE
  ====================================================== */

  let cars = [];

  let currentPage = 1;

  const pageLimit = 20;

  let totalPages = 1;

  let isAuthenticated = false;

  let isRedirecting = false;

  let csrfToken = null;

  let csrfEndpointAvailable = null;

  let toastTimer = null;

  let searchTimer = null;


  /* =====================================================
     SESSION MANAGEMENT
  ====================================================== */

  function getToken() {
    const token =
      localStorage.getItem("token");

    if (
      !token ||
      typeof token !== "string" ||
      token.trim() === ""
    ) {
      return null;
    }

    return token.trim();
  }


  function clearSession() {
    csrfToken = null;
    isAuthenticated = false;

    /*
     * Remove all client-side authentication state.
     *
     * The backend remains the authority.
     */
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }


  function redirectToLogin(
    message = "Administrator authentication required."
  ) {
    if (isRedirecting) {
      return;
    }

    isRedirecting = true;

    console.warn(
      "🔐 Admin access terminated:",
      message
    );

    clearSession();

    /*
     * Do not repeatedly redirect if already on login.
     */
    if (
      window.location.pathname.endsWith(
        "login.html"
      )
    ) {
      return;
    }

    window.location.replace(
      "login.html"
    );
  }


  /* =====================================================
     CSRF
     -----------------------------------------------------
     Your currently deployed API may not expose
     /auth/csrf yet.

     Therefore:

     - We DO NOT make CSRF initialization a requirement
       for reading the admin dashboard.
     - If the endpoint exists, we use it for mutations.
     - If it returns 404, Bearer authentication continues
       to work because the JWT is explicitly supplied in
       the Authorization header.
  ====================================================== */

  async function ensureCsrfToken(
    forceRefresh = false
  ) {
    if (
      csrfToken &&
      !forceRefresh
    ) {
      return csrfToken;
    }


    /*
     * We already know the endpoint does not exist.
     * Avoid hitting it repeatedly.
     */
    if (
      csrfEndpointAvailable === false &&
      !forceRefresh
    ) {
      return null;
    }


    let response;

    try {
      response =
        await fetch(
          `${API}/auth/csrf`,
          {
            method: "GET",

            credentials: "include",

            headers: {
              Accept:
                "application/json"
            },

            cache: "no-store"
          }
        );

    } catch (error) {

      /*
       * A network failure should not silently
       * destroy an otherwise valid JWT session.
       */
      console.warn(
        "⚠️ CSRF endpoint unreachable:",
        error
      );

      csrfEndpointAvailable = false;

      return null;
    }


    if (
      response.status === 404
    ) {
      /*
       * Current backend does not expose
       * this endpoint.
       *
       * Bearer-token requests remain usable.
       */
      csrfEndpointAvailable = false;

      csrfToken = null;

      return null;
    }


    const data =
      await safeJson(response);


    if (
      !response.ok ||
      typeof data.csrfToken !==
        "string"
    ) {
      csrfEndpointAvailable = false;

      csrfToken = null;

      return null;
    }


    csrfEndpointAvailable = true;

    csrfToken =
      data.csrfToken;

    return csrfToken;
  }


  /* =====================================================
     API HELPER
  ====================================================== */

  async function apiRequest(
    endpoint,
    options = {}
  ) {

    const token =
      getToken();


    /*
     * Every admin request requires authentication.
     */
    if (!token) {

      redirectToLogin(
        "Administrator authentication required."
      );

      throw new Error(
        "Authentication required."
      );
    }


    const method =
      String(
        options.method || "GET"
      ).toUpperCase();


    const headers = {
      ...(options.headers || {})
    };


    /*
     * Never manually assign Content-Type for FormData.
     */
    if (
      options.body &&
      !(options.body instanceof FormData)
    ) {

      headers[
        "Content-Type"
      ] =
        "application/json";
    }


    /*
     * Current AutoVerse backend authentication:
     *
     * Authorization: Bearer <JWT>
     */
    headers.Authorization =
      `Bearer ${token}`;


    /*
     * If the backend exposes CSRF protection,
     * attach its token to state-changing requests.
     *
     * This is deliberately optional because the
     * currently deployed Render API returns 404
     * for /auth/csrf.
     */
    if (
      method !== "GET" &&
      method !== "HEAD" &&
      method !== "OPTIONS"
    ) {

      const tokenForCsrf =
        await ensureCsrfToken();


      if (tokenForCsrf) {

        headers[
          "X-CSRF-Token"
        ] =
          tokenForCsrf;
      }
    }


    let response;


    try {

      response =
        await fetch(
          `${API}${endpoint}`,
          {
            ...options,

            method,

            headers,

            /*
             * Safe for current JWT authentication
             * and future cookie-based authentication.
             */
            credentials:
              "include",

            cache:
              options.cache ||
              "no-store"
          }
        );

    } catch (error) {

      console.error(
        "❌ API connection failed:",
        error
      );

      throw new Error(
        "Unable to connect to the AutoVerse server."
      );
    }


    /* =================================================
       AUTHORIZATION FAILURE
    ================================================= */

    if (
      response.status === 401
    ) {

      redirectToLogin(
        "Administrator session expired."
      );

      throw new Error(
        "Administrator session expired."
      );
    }


    if (
      response.status === 403
    ) {

      redirectToLogin(
        "Administrator access denied."
      );

      throw new Error(
        "Administrator access denied."
      );
    }


    return response;
  }


  /* =====================================================
     TOAST
  ====================================================== */

  function showToast(
    message
  ) {

    if (!toast) {
      return;
    }


    toast.textContent =
      String(
        message || ""
      );


    toast.classList.add(
      "show"
    );


    clearTimeout(
      toastTimer
    );


    toastTimer =
      setTimeout(
        () => {

          toast.classList.remove(
            "show"
          );

        },
        2800
      );
  }


  /* =====================================================
     SAFE JSON
  ====================================================== */

  async function safeJson(
    response
  ) {

    try {

      return await response.json();

    } catch {

      return {};
    }
  }


  /* =====================================================
     TEXT HELPERS
  ====================================================== */

  function setText(
    id,
    value
  ) {

    const element =
      document.getElementById(
        id
      );


    if (element) {

      element.textContent =
        String(
          value ?? ""
        );
    }
  }


  /* =====================================================
     ESCAPING
  ====================================================== */

  function escapeHtml(
    value
  ) {

    return String(
      value ?? ""
    )
      .replaceAll(
        "&",
        "&amp;"
      )
      .replaceAll(
        "<",
        "&lt;"
      )
      .replaceAll(
        ">",
        "&gt;"
      )
      .replaceAll(
        '"',
        "&quot;"
      )
      .replaceAll(
        "'",
        "&#039;"
      );
  }


  function escapeAttribute(
    value
  ) {

    return escapeHtml(
      value
    );
  }


  /* =====================================================
     DASHBOARD
  ====================================================== */

  async function loadDashboard() {

    const response =
      await apiRequest(
        "/admin/dashboard"
      );


    if (!response.ok) {

      const result =
        await safeJson(
          response
        );


      throw new Error(
        result.message ||
        "Unable to load administrator dashboard."
      );
    }


    const result =
      await safeJson(
        response
      );


    const stats =
      result.statistics ||
      {};


    setText(
      "totalCars",
      Number(
        stats.totalCars
      ) || 0
    );


    setText(
      "totalBrands",
      Number(
        stats.totalBrands
      ) || 0
    );


    setText(
      "totalVariants",
      Number(
        stats.totalVariants
      ) || 0
    );


    setText(
      "totalDealerships",
      Number(
        stats.totalDealerships
      ) || 0
    );


    return result;
  }


  /* =====================================================
     LOAD CARS
  ====================================================== */

  async function loadCars(
    page = 1
  ) {

    if (!carsList) {
      return;
    }


    carsList.innerHTML = `
      <div class="empty-dealership">
        Loading vehicle inventory...
      </div>
    `;


    try {

      const search =
        carSearch?.value?.trim() ||
        "";


      const params =
        new URLSearchParams();


      params.set(
        "page",
        String(
          Math.max(
            1,
            Number(page) || 1
          )
        )
      );


      params.set(
        "limit",
        String(
          pageLimit
        )
      );


      if (search) {

        params.set(
          "search",
          search
        );
      }


      const response =
        await apiRequest(
          `/admin/cars?${params.toString()}`
        );


      const result =
        await safeJson(
          response
        );


      if (!response.ok) {

        throw new Error(
          result.message ||
          "Unable to load vehicles."
        );
      }


      cars =
        Array.isArray(
          result.data
        )
          ? result.data
          : [];


      currentPage =
        Number(
          result.pagination?.page
        ) ||
        Number(page) ||
        1;


      totalPages =
        Number(
          result.pagination?.totalPages
        ) ||
        1;


      if (resultCount) {

        resultCount.textContent =
          `${
            Number(
              result.pagination?.total
            ) || 0
          } vehicles`;
      }


      renderCars();

      renderPagination();


    } catch (error) {

      if (
        isRedirecting
      ) {
        return;
      }


      console.error(
        "❌ Inventory error:",
        error
      );


      carsList.innerHTML = `

        <div class="empty-dealership">

          <div>⚠️</div>

          <h3>
            Unable to load inventory
          </h3>

          <p>
            ${escapeHtml(
              error.message
            )}
          </p>

        </div>

      `;
    }
  }


  /* =====================================================
     SEARCH
  ====================================================== */

  if (carSearch) {

    carSearch.addEventListener(
      "input",
      () => {

        clearTimeout(
          searchTimer
        );


        searchTimer =
          setTimeout(
            () => {

              loadCars(1);

            },
            350
          );
      }
    );
  }


  /* =====================================================
     RENDER CARS
  ====================================================== */

  function renderCars() {

    if (!carsList) {
      return;
    }


    if (!cars.length) {

      carsList.innerHTML = `

        <div class="empty-dealership">

          <div>🚗</div>

          <h3>
            No vehicles found
          </h3>

          <p>
            Try another search.
          </p>

        </div>

      `;

      return;
    }


    carsList.innerHTML =
      cars
        .map(
          car => {

            const image =
              getCarImage(
                car
              );


            const status =
              car.status ||
              "Active";


            const id =
              escapeAttribute(
                car._id
              );


            const name =
              `${car.brand || ""} ${
                car.model || ""
              }`.trim();


            return `

              <article
                class="car-item"
              >

                <div
                  class="car-info"
                >

                  ${
                    image
                      ? `

                        <img
                          class="car-thumb"
                          src="${escapeAttribute(
                            image
                          )}"
                          alt="${escapeAttribute(
                            name
                          )}"
                          loading="lazy"
                          decoding="async"
                        >

                      `
                      : `

                        <div
                          class="car-thumb"
                          aria-hidden="true"
                        ></div>

                      `
                  }


                  <div
                    class="car-name"
                  >

                    <strong>
                      ${escapeHtml(
                        name
                      )}
                    </strong>

                    <span>

                      ${escapeHtml(
                        car.type ||
                        "Vehicle"
                      )}

                      ${
                        car.priceRange
                          ? ` · ${escapeHtml(
                              car.priceRange
                            )}`
                          : ""
                      }

                      ·

                      ${escapeHtml(
                        status
                      )}

                    </span>

                  </div>

                </div>


                <div
                  class="car-actions"
                >

                  <button
                    class="car-action"
                    title="Edit vehicle"
                    type="button"
                    data-action="edit"
                    data-id="${id}"
                  >
                    ✏️
                  </button>


                  ${
                    status ===
                    "Archived"

                      ? `

                        <button
                          class="car-action"
                          title="Restore vehicle"
                          type="button"
                          data-action="restore"
                          data-id="${id}"
                        >
                          ↻
                        </button>

                      `

                      : `

                        <button
                          class="car-action delete"
                          title="Archive vehicle"
                          type="button"
                          data-action="archive"
                          data-id="${id}"
                        >
                          ×
                        </button>

                      `
                  }

                </div>

              </article>

            `;
          }
        )
        .join("");
  }


  /* =====================================================
     PAGINATION
  ====================================================== */

  function renderPagination() {

    if (!carsList) {
      return;
    }


    let pagination =
      document.getElementById(
        "adminPagination"
      );


    if (!pagination) {

      pagination =
        document.createElement(
          "div"
        );


      pagination.id =
        "adminPagination";


      pagination.className =
        "admin-pagination";


      carsList.parentNode?.insertBefore(
        pagination,
        carsList.nextSibling
      );
    }


    if (!pagination) {
      return;
    }


    if (
      totalPages <= 1
    ) {

      pagination.innerHTML =
        "";

      return;
    }


    pagination.innerHTML = `

      <button
        type="button"
        data-page="${
          currentPage - 1
        }"
        ${
          currentPage <= 1
            ? "disabled"
            : ""
        }
      >
        ← Previous
      </button>


      <span>
        Page ${
          currentPage
        }
        of ${
          totalPages
        }
      </span>


      <button
        type="button"
        data-page="${
          currentPage + 1
        }"
        ${
          currentPage >=
          totalPages
            ? "disabled"
            : ""
        }
      >
        Next →
      </button>

    `;


    pagination
      .querySelectorAll(
        "button"
      )
      .forEach(
        button => {

          button.addEventListener(
            "click",
            () => {

              const page =
                Number(
                  button.dataset.page
                );


              if (
                page >= 1 &&
                page <= totalPages
              ) {

                loadCars(
                  page
                );
              }
            }
          );
        }
      );
  }


  /* =====================================================
     CAR ACTIONS
  ====================================================== */

  if (carsList) {

    carsList.addEventListener(
      "click",
      async event => {

        const button =
          event.target.closest(
            "[data-action]"
          );


        if (!button) {
          return;
        }


        const action =
          button.dataset.action;


        const id =
          button.dataset.id;


        if (!id) {
          return;
        }


        if (
          action === "edit"
        ) {

          const car =
            cars.find(
              item =>
                String(
                  item._id
                ) ===
                String(id)
            );


          if (car) {
            openEditor(
              car
            );
          }


          return;
        }


        if (
          action === "archive" ||
          action === "restore"
        ) {

          await changeStatus(
            id,
            action
          );
        }

      }
    );
  }


  /* =====================================================
     ARCHIVE / RESTORE
  ====================================================== */

  async function changeStatus(
    id,
    action
  ) {

    const message =
      action === "archive"
        ? "Archive this vehicle?"
        : "Restore this vehicle?";


    if (
      !window.confirm(
        message
      )
    ) {

      return;
    }


    try {

      const response =
        await apiRequest(
          `/admin/cars/${encodeURIComponent(
            id
          )}/${action}`,
          {
            method:
              "PATCH"
          }
        );


      const result =
        await safeJson(
          response
        );


      if (!response.ok) {

        throw new Error(
          result.message ||
          "Operation failed."
        );
      }


      showToast(
        result.message ||
        "Vehicle updated."
      );


      await Promise.all([
        loadDashboard(),
        loadCars(
          currentPage
        )
      ]);


    } catch (error) {

      if (
        !isRedirecting
      ) {

        showToast(
          error.message ||
          "Operation failed."
        );
      }
    }
  }


  /* =====================================================
     VEHICLE EDITOR
  ====================================================== */

  function openEditor(
    car
  ) {

    const editor =
      document.getElementById(
        "vehicleEditor"
      );


    if (!editor) {
      return;
    }


    editor.classList.remove(
      "hidden"
    );


    const title =
      document.getElementById(
        "editorTitle"
      );


    if (title) {

      title.textContent =
        `Edit ${
          car.brand || ""
        } ${
          car.model || ""
        }`.trim();
    }


    const form =
      document.getElementById(
        "vehicleForm"
      );


    if (!form) {
      return;
    }


    const fields = [

      "brand",
      "model",
      "type",
      "bodyType",
      "priceRange",
      "engineOptions",
      "engineCapacity",
      "power",
      "torque",
      "fuelType",
      "transmission",
      "mileage",
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


    fields.forEach(
      name => {

        const field =
          form.elements[
            name
          ];


        if (!field) {
          return;
        }


        const value =
          car[name];


        if (
          Array.isArray(
            value
          )
        ) {

          field.value =
            value.join(
              ", "
            );

        } else {

          field.value =
            value ??
            "";
        }

      }
    );


    form.dataset.editId =
      String(
        car._id
      );


    editor.scrollIntoView({
      behavior:
        "smooth",

      block:
        "start"
    });
  }


  /* =====================================================
     VEHICLE FORM
  ====================================================== */

  const vehicleForm =
    document.getElementById(
      "vehicleForm"
    );


  if (vehicleForm) {

    vehicleForm.addEventListener(
      "submit",
      async event => {

        event.preventDefault();


        const submitButton =
          vehicleForm.querySelector(
            'button[type="submit"]'
          );


        if (
          submitButton
        ) {

          submitButton.disabled =
            true;
        }


        try {

          const formData =
            new FormData(
              vehicleForm
            );


          const data =
            Object.fromEntries(
              formData.entries()
            );


          [
            "engineOptions",
            "fuelType",
            "transmission",
            "bestFor",
            "features",
            "pros",
            "cons"
          ].forEach(
            field => {

              data[field] =
                String(
                  data[field] ||
                  ""
                )
                  .split(",")
                  .map(
                    value =>
                      value.trim()
                  )
                  .filter(
                    Boolean
                  );
            }
          );


          data.seatingCapacity =
            Number(
              data.seatingCapacity
            ) || 5;


          data.rating =
            Number(
              data.rating
            ) || 3;


          const editId =
            vehicleForm.dataset.editId;


          const endpoint =
            editId
              ? `/admin/cars/${encodeURIComponent(
                  editId
                )}`
              : "/admin/cars";


          const response =
            await apiRequest(
              endpoint,
              {

                method:
                  editId
                    ? "PUT"
                    : "POST",

                body:
                  JSON.stringify(
                    data
                  )

              }
            );


          const result =
            await safeJson(
              response
            );


          if (!response.ok) {

            throw new Error(
              result.message ||
              "Unable to save vehicle."
            );
          }


          showToast(
            result.message ||
            "Vehicle saved successfully."
          );


          vehicleForm.reset();


          delete vehicleForm
            .dataset
            .editId;


          document
            .getElementById(
              "vehicleEditor"
            )
            ?.classList
            .add(
              "hidden"
            );


          await Promise.all([
            loadDashboard(),
            loadCars(
              currentPage
            )
          ]);


        } catch (error) {

          if (
            !isRedirecting
          ) {

            showToast(
              error.message ||
              "Unable to save vehicle."
            );
          }

        } finally {

          if (
            submitButton
          ) {

            submitButton.disabled =
              false;
          }
        }
      }
    );
  }


  /* =====================================================
     NEW VEHICLE
  ====================================================== */

  document
    .getElementById(
      "newCarBtn"
    )
    ?.addEventListener(
      "click",
      () => {

        vehicleForm?.reset();


        if (
          vehicleForm
        ) {

          delete vehicleForm
            .dataset
            .editId;
        }


        const title =
          document.getElementById(
            "editorTitle"
          );


        if (title) {

          title.textContent =
            "Add Vehicle";
        }


        document
          .getElementById(
            "vehicleEditor"
          )
          ?.classList
          .remove(
            "hidden"
          );
      }
    );


  /* =====================================================
     CLOSE EDITOR
  ====================================================== */

  [
    "closeEditorBtn",
    "cancelVehicleBtn"
  ].forEach(
    id => {

      document
        .getElementById(id)
        ?.addEventListener(
          "click",
          () => {

            vehicleForm?.reset();


            if (
              vehicleForm
            ) {

              delete vehicleForm
                .dataset
                .editId;
            }


            document
              .getElementById(
                "vehicleEditor"
              )
              ?.classList
              .add(
                "hidden"
              );
          }
        );
    }
  );


  /* =====================================================
     REFRESH
  ====================================================== */

  document
    .getElementById(
      "refreshAllBtn"
    )
    ?.addEventListener(
      "click",
      async () => {

        showToast(
          "Refreshing inventory..."
        );


        try {

          await Promise.all([
            loadDashboard(),
            loadCars(
              currentPage
            )
          ]);


          showToast(
            "Inventory refreshed."
          );


        } catch (error) {

          if (
            !isRedirecting
          ) {

            showToast(
              error.message ||
              "Refresh failed."
            );
          }
        }
      }
    );


  /* =====================================================
     LOGOUT
  ====================================================== */

  document
    .getElementById(
      "logoutBtn"
    )
    ?.addEventListener(
      "click",
      async () => {

        if (
          !window.confirm(
            "Logout from AutoVerse Admin?"
          )
        ) {

          return;
        }


        const button =
          document.getElementById(
            "logoutBtn"
          );


        if (button) {
          button.disabled =
            true;
        }


        try {

          /*
           * Logout endpoint is optional.
           *
           * Even if the backend doesn't implement
           * logout yet, the local JWT is removed.
           */
          const token =
            getToken();


          if (token) {

            try {

              await fetch(
                `${API}/auth/logout`,
                {
                  method:
                    "POST",

                  credentials:
                    "include",

                  headers: {
                    Authorization:
                      `Bearer ${token}`,

                    Accept:
                      "application/json"
                  },

                  cache:
                    "no-store"
                }
              );

            } catch (error) {

              console.warn(
                "Logout request failed:",
                error
              );
            }
          }

        } finally {

          clearSession();

          window.location.replace(
            "login.html"
          );
        }
      }
    );


  /* =====================================================
     IMAGE HELPER
  ====================================================== */

  function getCarImage(
    car
  ) {

    if (
      !Array.isArray(
        car?.images
      ) ||
      car.images.length === 0
    ) {

      return "";
    }


    const image =
      String(
        car.images[0] ||
        ""
      ).trim();


    if (!image) {
      return "";
    }


    /*
     * Only allow HTTP(S) remote images.
     */
    if (
      image.startsWith(
        "https://"
      ) ||
      image.startsWith(
        "http://"
      )
    ) {

      return image;
    }


    const base =
      API.replace(
        /\/api$/,
        ""
      );


    return `${base}/images/${image}`;
  }


  /* =====================================================
     BULK IMPORT
  ====================================================== */

  const bulkImportPanel =
    document.getElementById(
      "bulkImportPanel"
    );


  const bulkJsonInput =
    document.getElementById(
      "bulkJsonInput"
    );


  const bulkFileName =
    document.getElementById(
      "bulkFileName"
    );


  const bulkPreview =
    document.getElementById(
      "bulkPreview"
    );


  const confirmBulkImportBtn =
    document.getElementById(
      "confirmBulkImportBtn"
    );


  let selectedBulkFile =
    null;


  let bulkImportReady =
    false;


  /* =====================================================
     OPEN BULK IMPORT
  ====================================================== */

  document
    .getElementById(
      "bulkImportBtn"
    )
    ?.addEventListener(
      "click",
      () => {

        bulkImportPanel
          ?.classList
          .remove(
            "hidden"
          );


        bulkImportPanel
          ?.scrollIntoView({
            behavior:
              "smooth",

            block:
              "start"
          });
      }
    );


  /* =====================================================
     CLOSE BULK IMPORT
  ====================================================== */

  [
    "closeBulkImportBtn",
    "cancelBulkImportBtn"
  ].forEach(
    id => {

      document
        .getElementById(id)
        ?.addEventListener(
          "click",
          resetBulkImport
        );
    }
  );


  /* =====================================================
     SELECT FILE
  ====================================================== */

  document
    .getElementById(
      "selectBulkFileBtn"
    )
    ?.addEventListener(
      "click",
      () => {

        bulkJsonInput?.click();
      }
    );


  bulkJsonInput
    ?.addEventListener(
      "change",
      () => {

        selectedBulkFile =
          bulkJsonInput.files?.[0] ||
          null;


        bulkImportReady =
          false;


        confirmBulkImportBtn
          ?.classList
          .add(
            "hidden"
          );


        bulkPreview
          ?.classList
          .add(
            "hidden"
          );


        if (
          selectedBulkFile
        ) {

          if (
            bulkFileName
          ) {

            bulkFileName.textContent =
              selectedBulkFile.name;
          }

        } else {

          if (
            bulkFileName
          ) {

            bulkFileName.textContent =
              "No file selected.";
          }
        }
      }
    );


  /* =====================================================
     PREVIEW / VALIDATE
  ====================================================== */

  document
    .getElementById(
      "previewBulkImportBtn"
    )
    ?.addEventListener(
      "click",
      async () => {

        if (
          !selectedBulkFile
        ) {

          showToast(
            "Select a JSON file first."
          );

          return;
        }


        /*
         * Client-side upload limits.
         */
        const MAX_FILE_SIZE =
          10 * 1024 * 1024;


        if (
          selectedBulkFile.size >
          MAX_FILE_SIZE
        ) {

          showToast(
            "File exceeds the 10 MB limit."
          );

          return;
        }


        /*
         * Browser MIME information can be empty,
         * therefore don't reject solely because the
         * browser didn't provide a MIME type.
         */
        if (
          selectedBulkFile.type &&
          selectedBulkFile.type !==
            "application/json"
        ) {

          showToast(
            "Please select a valid JSON file."
          );

          return;
        }


        const formData =
          new FormData();


        formData.append(
          "file",
          selectedBulkFile
        );


        showToast(
          "Validating dataset..."
        );


        try {

          const response =
            await apiRequest(
              "/admin/import/preview",
              {
                method:
                  "POST",

                body:
                  formData
              }
            );


          const result =
            await safeJson(
              response
            );


          if (
            !response.ok
          ) {

            throw new Error(
              result.message ||
              "Validation failed."
            );
          }


          const preview =
            result.preview ||
            {};


          const errors =
            Array.isArray(
              preview.errors
            )
              ? preview.errors
              : [];


          if (
            bulkPreview
          ) {

            bulkPreview.innerHTML = `

              <div
                class="bulk-stat-grid"
              >

                <div>
                  <span>
                    TOTAL
                  </span>

                  <strong>
                    ${
                      Number(
                        preview.total
                      ) || 0
                    }
                  </strong>
                </div>


                <div>
                  <span>
                    VALID
                  </span>

                  <strong>
                    ${
                      Number(
                        preview.valid
                      ) || 0
                    }
                  </strong>
                </div>


                <div>
                  <span>
                    NEW
                  </span>

                  <strong>
                    ${
                      Number(
                        preview.newCars
                      ) || 0
                    }
                  </strong>
                </div>


                <div>
                  <span>
                    EXISTING
                  </span>

                  <strong>
                    ${
                      Number(
                        preview.existingCars
                      ) || 0
                    }
                  </strong>
                </div>


                <div>
                  <span>
                    INVALID
                  </span>

                  <strong>
                    ${
                      Number(
                        preview.invalid
                      ) || 0
                    }
                  </strong>
                </div>

              </div>


              ${
                errors.length
                  ? `

                    <div
                      class="bulk-errors"
                    >

                      <strong>
                        Validation Errors
                      </strong>

                      ${
                        errors
                          .slice(
                            0,
                            20
                          )
                          .map(
                            error => `

                              <div>

                                #${escapeHtml(
                                  error.index
                                )}

                                ${escapeHtml(
                                  `${
                                    error.brand ||
                                    ""
                                  } ${
                                    error.model ||
                                    ""
                                  }`
                                )}

                                —

                                ${escapeHtml(
                                  error.message
                                )}

                              </div>

                            `
                          )
                          .join("")
                      }

                    </div>

                  `
                  : `

                    <div
                      class="bulk-success"
                    >
                      ✓ Dataset passed validation.
                    </div>

                  `
              }

            `;
          }


          bulkPreview
            ?.classList
            .remove(
              "hidden"
            );


          bulkImportReady =
            Number(
              preview.valid
            ) > 0;


          if (
            bulkImportReady
          ) {

            confirmBulkImportBtn
              ?.classList
              .remove(
                "hidden"
              );

          } else {

            confirmBulkImportBtn
              ?.classList
              .add(
                "hidden"
              );
          }


          showToast(
            `Validation complete: ${
              Number(
                preview.valid
              ) || 0
            } valid records.`
          );


        } catch (error) {

          if (
            !isRedirecting
          ) {

            showToast(
              error.message ||
              "Validation failed."
            );
          }
        }
      }
    );


  /* =====================================================
     CONFIRM BULK IMPORT
  ====================================================== */

  confirmBulkImportBtn
    ?.addEventListener(
      "click",
      async () => {

        if (
          !selectedBulkFile ||
          !bulkImportReady
        ) {

          showToast(
            "Validate the dataset first."
          );

          return;
        }


        if (
          !window.confirm(
            "Import all valid vehicles from this dataset?"
          )
        ) {

          return;
        }


        const formData =
          new FormData();


        formData.append(
          "file",
          selectedBulkFile
        );


        confirmBulkImportBtn.disabled =
          true;


        confirmBulkImportBtn.textContent =
          "Importing...";


        try {

          const response =
            await apiRequest(
              "/admin/import",
              {
                method:
                  "POST",

                body:
                  formData
              }
            );


          const result =
            await safeJson(
              response
            );


          if (
            !response.ok
          ) {

            throw new Error(
              result.message ||
              "Import failed."
            );
          }


          const stats =
            result.results ||
            result.results ||
            {};


          showToast(
            `Import complete — ${
              Number(
                stats.created
              ) || 0
            } created, ${
              Number(
                stats.updated
              ) || 0
            } updated, ${
              Number(
                stats.failed
              ) || 0
            } failed.`
          );


          resetBulkImport();


          await Promise.all([
            loadDashboard(),
            loadCars(1)
          ]);


        } catch (error) {

          if (
            !isRedirecting
          ) {

            showToast(
              error.message ||
              "Import failed."
            );
          }

        } finally {

          if (
            confirmBulkImportBtn
          ) {

            confirmBulkImportBtn.disabled =
              false;


            confirmBulkImportBtn.textContent =
              "Import Valid Cars";
          }
        }
      }
    );


  function resetBulkImport() {

    selectedBulkFile =
      null;


    bulkImportReady =
      false;


    if (
      bulkJsonInput
    ) {

      bulkJsonInput.value =
        "";
    }


    if (
      bulkFileName
    ) {

      bulkFileName.textContent =
        "No file selected.";
    }


    bulkPreview
      ?.classList
      .add(
        "hidden"
      );


    confirmBulkImportBtn
      ?.classList
      .add(
        "hidden"
      );


    bulkImportPanel
      ?.classList
      .add(
        "hidden"
      );
  }


  /* =====================================================
     EXPORT
  ====================================================== */

  document
    .getElementById(
      "exportCarsBtn"
    )
    ?.addEventListener(
      "click",
      async () => {

        try {

          showToast(
            "Preparing export..."
          );


          const response =
            await apiRequest(
              "/admin/cars-export"
            );


          const result =
            await safeJson(
              response
            );


          if (
            !response.ok
          ) {

            throw new Error(
              result.message ||
              "Export failed."
            );
          }


          const blob =
            new Blob(
              [
                JSON.stringify(
                  result,
                  null,
                  2
                )
              ],
              {
                type:
                  "application/json"
              }
            );


          const url =
            URL.createObjectURL(
              blob
            );


          const anchor =
            document.createElement(
              "a"
            );


          anchor.href =
            url;


          anchor.download =
            `autoverse-cars-${
              Date.now()
            }.json`;


          document.body.appendChild(
            anchor
          );


          anchor.click();


          anchor.remove();


          setTimeout(
            () => {
              URL.revokeObjectURL(
                url
              );
            },
            100
          );


          showToast(
            `Exported ${
              Number(
                result.count
              ) || 0
            } vehicles.`
          );


        } catch (error) {

          if (
            !isRedirecting
          ) {

            showToast(
              error.message ||
              "Export failed."
            );
          }
        }
      }
    );


  /* =====================================================
     ADMIN ACCESS VERIFICATION
     -----------------------------------------------------
     THIS IS THE MOST IMPORTANT PART.

     We do NOT check:

       localStorage.user.role

     We do NOT assume:

       token === admin

     Instead we ask the backend:

       GET /api/admin/dashboard

     The admin middleware must reject non-admin users.
  ====================================================== */

  async function verifyAdminAccess() {

    const token =
      getToken();


    if (!token) {

      redirectToLogin(
        "No administrator session found."
      );

      return false;
    }


    try {

      /*
       * IMPORTANT:
       *
       * Do NOT call /auth/csrf here.
       *
       * Your deployed Render API currently returns
       * 404 for that endpoint.
       *
       * Authentication is verified directly against
       * the protected admin endpoint.
       */
      const response =
        await apiRequest(
          "/admin/dashboard"
        );


      if (
        response.status ===
          401 ||
        response.status ===
          403
      ) {

        redirectToLogin(
          "Administrator access denied."
        );

        return false;
      }


      if (
        !response.ok
      ) {

        const result =
          await safeJson(
            response
          );


        console.error(
          "Admin verification failed:",
          result
        );


        throw new Error(
          result.message ||
          "Unable to verify administrator access."
        );
      }


      /*
       * The backend has now accepted the JWT
       * for an administrator-protected endpoint.
       */
      isAuthenticated =
        true;


      console.log(
        "✅ Administrator access verified by backend."
      );


      return true;


    } catch (error) {

      console.error(
        "❌ Admin verification failed:",
        error
      );


      isAuthenticated =
        false;


      redirectToLogin(
        error.message ||
        "Administrator verification failed."
      );


      return false;
    }
  }


  /* =====================================================
     INIT
  ====================================================== */

  async function init() {

    console.log(
      "🔐 Starting secure AutoVerse Admin initialization..."
    );


    /*
     * SECURITY GATE
     *
     * Nothing sensitive is loaded before this succeeds.
     */
    const authorized =
      await verifyAdminAccess();


    if (
      !authorized ||
      isRedirecting
    ) {

      return;
    }


    try {

      /*
       * Dashboard verification has already happened.
       *
       * Load the actual application data now.
       */
      await Promise.all([
        loadDashboard(),
        loadCars(1)
      ]);


      console.log(
        "✅ AutoVerse Admin Console initialized."
      );


    } catch (error) {

      if (
        !isRedirecting
      ) {

        console.error(
          "❌ Admin console initialization failed:",
          error
        );


        showToast(
          error.message ||
          "Unable to initialize administrator console."
        );
      }
    }
  }


  /* =====================================================
     START
  ====================================================== */

  init();

})();