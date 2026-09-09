(async () => {
  const body = document.body;
  const nav = document.getElementById("appNav");
  const progress = document.getElementById("scrollProgress");
  const params = new URLSearchParams(location.search);
  const id = params.get("id");

  /*
   * =========================================================
   * AUTOVERSE IMAGE CONFIGURATION
   * =========================================================
   *
   * Images are physically stored on the backend:
   *
   * backend/public/images/
   *
   * Example:
   *   backend/public/images/swift/swift-1.jpg
   *   backend/public/images/grand-vitara/grand-1.jpg
   *   backend/public/images/victorious/victoris-1.jpg
   *
   * Public Render URL:
   *   https://auto-verse-hcp5.onrender.com/images/...
   * =========================================================
   */

  const IMAGE_BASE =
    "https://auto-verse-hcp5.onrender.com/images/";

  try {
    const authResponse = await fetch(`${API_BASE_URL}/auth/me`, {
      credentials: "include",
      headers: {
        Accept: "application/json"
      },
      cache: "no-store"
    });

    if (!authResponse.ok) {
      location.replace("index.html");
      return;
    }
  } catch {
    location.replace("index.html");
    return;
  }

  const $ = (id) => document.getElementById(id);

  const esc = (v) =>
    String(v ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#039;"
        })[c]
    );

  const arr = (v) =>
    Array.isArray(v) ? v : v ? [v] : [];

  /*
   * =========================================================
   * IMAGE URL RESOLVER
   * =========================================================
   *
   * Supports:
   *
   * 1. External URLs
   *    https://example.com/car.jpg
   *
   * 2. Already-correct paths
   *    swift/swift-1.jpg
   *
   * 3. Bare filenames
   *    swift-1.jpg
   *
   * 4. Special project folders
   *    Grand Vitara -> grand-vitara
   *    Victoris     -> victorious
   *    S-Presso     -> s-presso
   *    e Vitara     -> e-vitara
   *
   * This prevents the frontend from requesting:
   *
   *    /images/swift-1.jpg
   *
   * when the actual file is:
   *
   *    /images/swift/swift-1.jpg
   * =========================================================
   */

  const imageUrl = (imagePath, car) => {
    if (!imagePath) return "";

    const value = String(imagePath).trim();

    if (!value) return "";

    // -------------------------------------------------------
    // Already a complete external URL
    // -------------------------------------------------------
    if (/^https?:\/\//i.test(value)) {
      return value;
    }

    // -------------------------------------------------------
    // Normalize Windows-style slashes
    // -------------------------------------------------------
    const normalized = value
      .replace(/\\/g, "/")
      .replace(/^\/+/, "");

    // -------------------------------------------------------
    // Already contains a folder
    //
    // Example:
    //   swift/swift-1.jpg
    //   grand-vitara/grand-1.jpg
    // -------------------------------------------------------
    if (normalized.includes("/")) {
      return IMAGE_BASE + normalized;
    }

    // -------------------------------------------------------
    // Bare filename
    //
    // Determine folder from car model.
    // -------------------------------------------------------

    const model = String(car?.model || "")
      .trim()
      .toLowerCase();

    const folderMap = {
      "grand vitara": "grand-vitara",
      "grand-vitara": "grand-vitara",

      victoris: "victorious",

      "s-presso": "s-presso",
      "s presso": "s-presso",

      "e vitara": "e-vitara",
      "e-vitara": "e-vitara"
    };

    const folder =
      folderMap[model] ||
      model
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    if (!folder) {
      return IMAGE_BASE + normalized;
    }

    return `${IMAGE_BASE}${folder}/${normalized}`;
  };

  if (!id) {
    location.replace("carAll.html");
    return;
  }

  // =========================================================
  // PREMIUM CURSOR
  // =========================================================

  const initPremiumCursor = () => {
    const dot = document.querySelector(".cursor-dot");
    const ring = document.querySelector(".cursor-ring");

    if (
      !dot ||
      !ring ||
      !window.matchMedia("(pointer:fine)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    document.body.classList.add("cursor-ready");

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    let ringX = mouseX;
    let ringY = mouseY;

    let rafId = null;

    const onPointerMove = (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;

      if (dot && dot.isConnected) {
        dot.style.left = `${mouseX}px`;
        dot.style.top = `${mouseY}px`;
      }
    };

    const animate = () => {
      if (!dot?.isConnected || !ring?.isConnected) {
        cancelAnimationFrame(rafId);
        return;
      }

      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;

      ring.style.left = `${ringX}px`;
      ring.style.top = `${ringY}px`;

      rafId = requestAnimationFrame(animate);
    };

    window.addEventListener("pointermove", onPointerMove, {
      passive: true
    });

    animate();

    document.addEventListener("pointerover", (event) => {
      if (
        event.target?.closest?.(
          "a, button, .gallery-thumb"
        )
      ) {
        document.body.classList.add("cursor-hover");
      }
    });

    document.addEventListener("pointerout", (event) => {
      if (
        event.target?.closest?.(
          "a, button, .gallery-thumb"
        )
      ) {
        document.body.classList.remove("cursor-hover");
      }
    });
  };

  initPremiumCursor();

  // =========================================================
  // SCROLL
  // =========================================================

  const updateScroll = () => {
    if (nav) {
      nav.classList.toggle("scrolled", scrollY > 30);
    }

    const max =
      document.documentElement.scrollHeight -
      innerHeight;

    if (progress) {
      progress.style.height =
        (max > 0 ? (scrollY / max) * 100 : 0) + "%";
    }
  };

  addEventListener("scroll", updateScroll, {
    passive: true
  });

  updateScroll();

  // =========================================================
  // REVEAL ANIMATION
  // =========================================================

  const observer = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          observer.unobserve(e.target);
        }
      }),
    {
      threshold: 0.12
    }
  );

  document
    .querySelectorAll(".reveal")
    .forEach((el) => observer.observe(el));

  // =========================================================
  // TEXT HELPERS
  // =========================================================

  const setText = (
    el,
    value,
    fallback = "—"
  ) => {
    if (!el) return;

    el.textContent =
      value === undefined ||
      value === null ||
      value === ""
        ? fallback
        : value;
  };

  const list = (
    el,
    values,
    empty = "Information not available yet."
  ) => {
    if (!el) return;

    el.innerHTML =
      arr(values)
        .filter(Boolean)
        .map(
          (v) =>
            `<li>${esc(v)}</li>`
        )
        .join("") ||
      `<li>${esc(empty)}</li>`;
  };

  // =========================================================
  // RENDER VEHICLE
  // =========================================================

  const render = (car) => {
    const name =
      `${car.brand || ""} ${car.model || ""}`.trim();

    document.title =
      `${name || "Vehicle"} | AutoVerse`;

    // -------------------------------------------------------
    // BASIC INFORMATION
    // -------------------------------------------------------

    setText(
      $("vehicleBrand"),
      car.brand?.toUpperCase(),
      "AUTOVERSE"
    );

    if ($("vehicleName")) {
      $("vehicleName").innerHTML =
        `${esc(car.model || "Vehicle")}<br><em>${esc(
          car.type || "INTELLIGENCE"
        )}</em>`;
    }

    setText(
      $("vehicleType"),
      car.type,
      "AUTOMOBILE"
    );

    setText(
      $("price"),
      car.priceRange
    );

    setText(
      $("engine"),
      arr(car.engineOptions).join(" · ")
    );

    setText(
      $("mileage"),
      car.mileage
    );

    setText(
      $("fuel"),
      arr(car.fuelType).join(" · ")
    );

    setText(
      $("transmission"),
      arr(car.transmission).join(" · ")
    );

    setText(
      $("seating"),
      car.seatingCapacity
        ? `${car.seatingCapacity} seats`
        : ""
    );

    setText(
      $("description"),
      car.description,
      "AutoVerse is still building this vehicle profile."
    );

    setText(
      $("rating"),
      car.rating
        ? `${car.rating} / 5`
        : ""
    );

    setText(
      $("ncap"),
      car.ncapRating || "Not listed"
    );

    // =======================================================
    // BEST FOR
    // =======================================================

    const bestFor = $("bestFor");

    if (bestFor) {
      bestFor.innerHTML =
        arr(car.bestFor)
          .filter(Boolean)
          .map(
            (v) =>
              `<span>${esc(v)}</span>`
          )
          .join("");

      if (!bestFor.children.length) {
        bestFor.innerHTML =
          "<span>Not listed</span>";
      }
    }

    // =======================================================
    // SPECIFICATION TABLE
    // =======================================================

    const rows = [
      ["Brand", car.brand],

      ["Model", car.model],

      ["Body type", car.type],

      ["Price range", car.priceRange],

      [
        "Engine options",
        arr(car.engineOptions).join(" · ")
      ],

      ["Mileage", car.mileage],

      [
        "Fuel type",
        arr(car.fuelType).join(" · ")
      ],

      [
        "Transmission",
        arr(car.transmission).join(" · ")
      ],

      [
        "Seating capacity",
        car.seatingCapacity
          ? `${car.seatingCapacity} seats`
          : ""
      ],

      ["Safety rating", car.ncapRating],

      [
        "AutoVerse rating",
        car.rating
          ? `${car.rating}/5`
          : ""
      ]
    ];

    if ($("specTable")) {
      $("specTable").innerHTML =
        rows
          .map(
            ([k, v]) =>
              `<div class="spec-row">
                <span>${esc(k).toUpperCase()}</span>
                <strong>${esc(
                  v || "Not listed"
                )}</strong>
              </div>`
          )
          .join("");
    }

    // =======================================================
    // FEATURES
    // =======================================================

    const features = arr(car.features);

    if ($("featureGrid")) {
      $("featureGrid").innerHTML =
        features.length
          ? features
              .map(
                (v, i) =>
                  `<div class="feature-item">
                    <span>${String(i + 1).padStart(
                      2,
                      "0"
                    )}</span>
                    <strong>${esc(v)}</strong>
                  </div>`
              )
              .join("")
          : `<div class="feature-item">
               <strong>
                 Feature information not added yet.
               </strong>
             </div>`;
    }

    // =======================================================
    // PROS / CONS
    // =======================================================

    list(
      $("prosList"),
      car.pros,
      "Pros not added yet."
    );

    list(
      $("consList"),
      car.cons,
      "Cons not added yet."
    );

    // =======================================================
    // VERDICT
    // =======================================================

    setText(
      $("verdictText"),
      car.verdict,
      "The AutoVerse verdict will appear when this vehicle profile has been fully reviewed."
    );

    // =======================================================
    // IMAGE GALLERY
    // =======================================================

    const images =
      arr(car.images)
        .filter(Boolean);

    console.log(
      "🖼️ AutoVerse vehicle images:",
      {
        car: name,
        storedPaths: images,
        resolvedPaths: images.map(
          (img) => imageUrl(img, car)
        )
      }
    );

    if (images.length) {
      const firstImage =
        imageUrl(images[0], car);

      // -----------------------------------------------------
      // Hero image
      // -----------------------------------------------------

      if ($("heroImage")) {
        $("heroImage").src = firstImage;

        $("heroImage").onerror = () => {
          console.error(
            "❌ Failed to load hero image:",
            firstImage
          );
        };
      }

      // -----------------------------------------------------
      // Main gallery image
      // -----------------------------------------------------

      if ($("galleryMain")) {
        $("galleryMain").src = firstImage;

        $("galleryMain").onerror = () => {
          console.error(
            "❌ Failed to load gallery image:",
            firstImage
          );
        };
      }

      // -----------------------------------------------------
      // Image count
      // -----------------------------------------------------

      if ($("imageCount")) {
        $("imageCount").textContent =
          String(images.length).padStart(
            2,
            "0"
          );
      }

      // -----------------------------------------------------
      // Gallery thumbnails
      // -----------------------------------------------------

      if ($("galleryThumbs")) {
        $("galleryThumbs").innerHTML =
          images
            .map((img, i) => {
              const resolved =
                imageUrl(img, car);

              return `
                <button
                  class="gallery-thumb ${
                    i === 0 ? "active" : ""
                  }"
                  data-index="${i}"
                  data-src="${esc(resolved)}"
                  type="button"
                >
                  <img
                    src="${esc(resolved)}"
                    alt="${esc(name)} view ${i + 1}"
                    loading="${
                      i ? "lazy" : "eager"
                    }"
                    onerror="this.closest('.gallery-thumb')?.classList.add('image-error')"
                  >
                </button>
              `;
            })
            .join("");

        // -----------------------------------------------------
        // Thumbnail events
        // -----------------------------------------------------

        document
          .querySelectorAll(".gallery-thumb")
          .forEach((btn) => {
            btn.addEventListener(
              "click",
              () => {
                document
                  .querySelectorAll(
                    ".gallery-thumb"
                  )
                  .forEach((x) =>
                    x.classList.remove(
                      "active"
                    )
                  );

                btn.classList.add("active");

                const main =
                  $("galleryMain");

                if (!main) return;

                main.style.opacity = ".35";

                setTimeout(() => {
                  main.src =
                    btn.dataset.src;

                  main.style.opacity = "1";

                  if ($("galleryCaption")) {
                    $("galleryCaption").textContent =
                      `${String(
                        Number(
                          btn.dataset.index
                        ) + 1
                      ).padStart(
                        2,
                        "0"
                      )} / EXTERIOR`;
                  }
                }, 140);
              }
            );
          });
      }
    } else {
      // -----------------------------------------------------
      // No images
      // -----------------------------------------------------

      if ($("heroImage")) {
        $("heroImage").style.display =
          "none";
      }

      if ($("gallerySection")) {
        $("gallerySection").style.display =
          "none";
      }

      if ($("imageCount")) {
        $("imageCount").textContent = "—";
      }
    }

    // =======================================================
    // COMPARE LINK
    // =======================================================

    if ($("compareLink")) {
      $("compareLink").href =
        `compare.html?id=${encodeURIComponent(
          car._id || id
        )}`;
    }
  };

  // =========================================================
  // FETCH VEHICLE
  // =========================================================

  fetch(
    `${API_BASE_URL}/cars/${encodeURIComponent(id)}`
  )
    .then((res) => {
      if (!res.ok) {
        throw new Error(
          "Vehicle not found"
        );
      }

      return res.json();
    })
    .then(render)
    .catch((err) => {
      console.error(err);

      if ($("vehicleName")) {
        $("vehicleName").innerHTML =
          "Vehicle<br><em>not found.</em>";
      }

      if ($("description")) {
        $("description").textContent =
          "We could not load this vehicle profile right now.";
      }
    });

  // =========================================================
  // SAVE VEHICLE
  // =========================================================

  if ($("saveBtn")) {
    $("saveBtn").addEventListener(
      "click",
      () => {
        const key =
          "autoverse_saved_cars";

        const saved =
          JSON.parse(
            localStorage.getItem(key) ||
              "[]"
          );

        const exists =
          saved.includes(id);

        const next = exists
          ? saved.filter(
              (x) => x !== id
            )
          : [...saved, id];

        localStorage.setItem(
          key,
          JSON.stringify(next)
        );

        $("saveBtn").innerHTML =
          exists
            ? 'Save vehicle <span>＋</span>'
            : 'Saved to garage <span>✓</span>';
      }
    );
  }

  // =========================================================
  // LOGOUT
  // =========================================================

  if ($("logoutBtn")) {
    $("logoutBtn").addEventListener(
      "click",
      async () => {
        try {
          const csrf =
            await fetch(
              `${API_BASE_URL}/auth/csrf`,
              {
                credentials: "include",
                headers: {
                  Accept:
                    "application/json"
                },
                cache: "no-store"
              }
            );

          const data =
            await csrf
              .json()
              .catch(() => ({}));

          await fetch(
            `${API_BASE_URL}/auth/logout`,
            {
              method: "POST",
              credentials: "include",
              headers: {
                Accept:
                  "application/json",

                "X-CSRF-Token":
                  data.csrfToken || ""
              }
            }
          );
        } finally {
          location.replace(
            "index.html"
          );
        }
      }
    );
  }

  // =========================================================
  // MOBILE MENU
  // =========================================================

  const mobileMenu =
    $("mobileMenu");

  const links =
    document.querySelector(
      ".app-links"
    );

  mobileMenu?.addEventListener(
    "click",
    () =>
      links?.classList.toggle(
        "mobile-open"
      )
  );
})();