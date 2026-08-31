(async () => {

  const body = document.body;

  const nav = document.getElementById("intelNav");
  const progress = document.getElementById("scrollProgress");

  const form = document.getElementById("intelligenceForm");
  const textarea = document.getElementById("requirementText");
  const analyseBtn = document.getElementById("analyseBtn");

  const grid = document.getElementById("recommendationGrid");
  const resultsSection = document.getElementById("resultsSection");
  const resultsMeta = document.getElementById("resultsMeta");

  const preferences =
    [...document.querySelectorAll(".preference")];

  const mapType = document.getElementById("mapType");
  const mapBudget = document.getElementById("mapBudget");
  const mapFuel = document.getElementById("mapFuel");
  const mapTransmission = document.getElementById("mapTransmission");
  const mapPurpose = document.getElementById("mapPurpose");
  const mapPriority = document.getElementById("mapPriority");


  /* =======================================================
     AUTH
     ======================================================= */

  async function requireAuthentication() {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        credentials: "include",
        headers: { Accept: "application/json" },
        cache: "no-store"
      });

      if (!response.ok) {
        window.location.replace("index.html");
        return false;
      }

      return true;
    } catch {
      window.location.replace("index.html");
      return false;
    }
  }

  if (!(await requireAuthentication())) return;


  /* =======================================================
     HELPERS
     ======================================================= */

  const escapeHTML = (value) => {

    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  };


  const normalise = (value) =>
    String(value ?? "").trim().toLowerCase();


  const priceValue = (car) => {

    if (
      Number.isFinite(Number(car.minPrice)) &&
      Number(car.minPrice) > 0
    ) {
      return Number(car.minPrice);
    }

    const match =
      String(car.priceRange || "")
        .match(/\d+(?:\.\d+)?/);

    return match
      ? Number(match[0]) * 100000
      : 0;

  };


  const imageBase =
    "https://auto-verse-hcp5.onrender.com/images/";


  const firstImage = (car) => {

    const image =
      Array.isArray(car.images) && car.images.length
        ? car.images[0]
        : "";

    return image
      ? imageBase + image
      : imageBase + "placeholder.jpg";

  };


  /* =======================================================
     CURSOR
     ======================================================= */

  if (
    window.matchMedia("(pointer:fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {

    body.classList.add("cursor-ready");

    const dot =
      document.querySelector(".cursor-dot");

    const ring =
      document.querySelector(".cursor-ring");

    if (dot && ring) {

      let mx = innerWidth / 2;
      let my = innerHeight / 2;

      let rx = mx;
      let ry = my;

      addEventListener("pointermove", (event) => {

        mx = event.clientX;
        my = event.clientY;

        dot.style.left = `${mx}px`;
        dot.style.top = `${my}px`;

      }, { passive: true });


      const tick = () => {

        rx += (mx - rx) * .18;
        ry += (my - ry) * .18;

        ring.style.left = `${rx}px`;
        ring.style.top = `${ry}px`;

        requestAnimationFrame(tick);

      };

      tick();


      document.addEventListener("pointerover", event => {

        if (
          event.target.closest(
            "a,button,textarea,.intelligence-card"
          )
        ) {
          body.classList.add("cursor-hover");
        }

      });


      document.addEventListener("pointerout", event => {

        if (
          event.target.closest(
            "a,button,textarea,.intelligence-card"
          )
        ) {
          body.classList.remove("cursor-hover");
        }

      });

    }

  }


  /* =======================================================
     SCROLL
     ======================================================= */

  const updateScroll = () => {

    if (nav) {
      nav.classList.toggle(
        "scrolled",
        scrollY > 30
      );
    }

    if (progress) {

      const max =
        document.documentElement.scrollHeight -
        innerHeight;

      progress.style.height =
        `${max > 0 ? (scrollY / max) * 100 : 0}%`;

    }

  };

  addEventListener(
    "scroll",
    updateScroll,
    { passive: true }
  );

  updateScroll();


  /* =======================================================
     REVEAL ANIMATION
     ======================================================= */

  const observer =
    new IntersectionObserver(
      entries => {

        entries.forEach(entry => {

          if (entry.isIntersecting) {

            entry.target.classList.add("in");

            observer.unobserve(entry.target);

          }

        });

      },
      { threshold: .12 }
    );


  document
    .querySelectorAll(".reveal")
    .forEach(element => observer.observe(element));


  /* =======================================================
     PREFERENCE BUTTONS
     ======================================================= */

  let selectedPurpose = "";


  preferences.forEach(button => {

    button.addEventListener("click", () => {

      preferences.forEach(
        item => item.classList.remove("selected")
      );

      button.classList.add("selected");

      selectedPurpose =
        normalise(button.dataset.purpose);

      updateRequirementMap();

    });

  });


  /* =======================================================
     REQUIREMENT PARSER
     ======================================================= */

  const parseRequirements = (text) => {

    const query = normalise(text);

    const requirements = {

      type: "",

      budget: null,

      fuel: "",

      transmission: "",

      purpose: selectedPurpose || "",

      priority: "balanced"

    };


    /* BODY TYPE */

    const bodyTypes = [
      "suv",
      "sedan",
      "hatchback",
      "muv",
      "coupe",
      "convertible",
      "pickup",
      "mpv"
    ];

    const detectedType =
      bodyTypes.find(type =>
        query.includes(type)
      );

    if (detectedType) {
      requirements.type = detectedType;
    }


    /* FUEL */

    if (
      query.includes("electric") ||
      /\bev\b/.test(query)
    ) {

      requirements.fuel = "electric";

    } else if (query.includes("diesel")) {

      requirements.fuel = "diesel";

    } else if (query.includes("petrol")) {

      requirements.fuel = "petrol";

    } else if (query.includes("hybrid")) {

      requirements.fuel = "hybrid";

    }


    /* TRANSMISSION */

    if (
      query.includes("automatic") ||
      query.includes("amt") ||
      query.includes("dct") ||
      query.includes("cvt")
    ) {

      requirements.transmission = "automatic";

    } else if (
      query.includes("manual")
    ) {

      requirements.transmission = "manual";

    }


    /* PURPOSE */

    const purposes = [
      "family",
      "city",
      "highway",
      "performance",
      "luxury",
      "value"
    ];

    if (!requirements.purpose) {

      const foundPurpose =
        purposes.find(purpose =>
          query.includes(purpose)
        );

      if (foundPurpose) {
        requirements.purpose = foundPurpose;
      }

    }


    /* PRIORITY */

    if (
      query.includes("cheap") ||
      query.includes("affordable") ||
      query.includes("value") ||
      query.includes("budget")
    ) {

      requirements.priority = "value";

    } else if (
      query.includes("performance") ||
      query.includes("power") ||
      query.includes("fast")
    ) {

      requirements.priority = "performance";

    } else if (
      query.includes("luxury") ||
      query.includes("premium")
    ) {

      requirements.priority = "luxury";

    } else if (
      query.includes("family") ||
      query.includes("practical")
    ) {

      requirements.priority = "family";

    }


    /* BUDGET */

    const budgetMatch =
      query.match(
        /(?:under|below|around|within|max|upto|up to)\s*₹?\s*(\d+(?:\.\d+)?)\s*(?:lakh|lac|l|cr|crore)?/
      );

    if (budgetMatch) {

      let value =
        Number(budgetMatch[1]);

      const unit =
        budgetMatch[0].toLowerCase();

      if (
        unit.includes("cr") ||
        unit.includes("crore")
      ) {

        value *= 100;

      }

      requirements.budget =
        value * 100000;

    }


    return requirements;

  };


  /* =======================================================
     REQUIREMENT MAP
     ======================================================= */

  const updateRequirementMap = (requirements = null) => {

    if (!requirements) {

      mapType.textContent = "ANY";
      mapBudget.textContent = "ANY";
      mapFuel.textContent = "ANY";
      mapTransmission.textContent = "ANY";
      mapPurpose.textContent = "ANY";
      mapPriority.textContent = "BALANCED";

      return;

    }


    mapType.textContent =
      requirements.type
        ? requirements.type.toUpperCase()
        : "ANY";


    mapBudget.textContent =
      requirements.budget
        ? `₹${(requirements.budget / 100000).toFixed(0)}L`
        : "ANY";


    mapFuel.textContent =
      requirements.fuel
        ? requirements.fuel.toUpperCase()
        : "ANY";


    mapTransmission.textContent =
      requirements.transmission
        ? requirements.transmission.toUpperCase()
        : "ANY";


    mapPurpose.textContent =
      requirements.purpose
        ? requirements.purpose.toUpperCase()
        : "ANY";


    mapPriority.textContent =
      requirements.priority.toUpperCase();

  };


  /* =======================================================
     MATCHING ENGINE
     ======================================================= */

  const matchVehicle = (car, requirements) => {

    let score = 0;
    let maxScore = 0;

    const reasons = [];


    /* BODY TYPE */

    if (requirements.type) {

      maxScore += 30;

      const type =
        normalise(car.bodyType || car.type);

      if (type.includes(requirements.type)) {

        score += 30;

        reasons.push(
          `${requirements.type.toUpperCase()} body type`
        );

      }

    }


    /* BUDGET */

    if (requirements.budget) {

      maxScore += 25;

      const price =
        priceValue(car);

      if (price > 0 && price <= requirements.budget) {

        score += 25;

        reasons.push("Fits your budget");

      }

    }


    /* FUEL */

    if (requirements.fuel) {

      maxScore += 20;

      const fuelData =
        Array.isArray(car.fuelType)
          ? car.fuelType.join(" ")
          : String(car.fuelType || "");

      if (
        normalise(fuelData)
          .includes(requirements.fuel)
      ) {

        score += 20;

        reasons.push(
          `${requirements.fuel.toUpperCase()} powertrain`
        );

      }

    }


    /* TRANSMISSION */

    if (requirements.transmission) {

      maxScore += 15;

      const transmission =
        Array.isArray(car.transmission)
          ? car.transmission.join(" ")
          : String(car.transmission || "");

      if (
        normalise(transmission)
          .includes(requirements.transmission)
      ) {

        score += 15;

        reasons.push(
          `${requirements.transmission} transmission`
        );

      }

    }


    /* PURPOSE */

    if (requirements.purpose) {

      maxScore += 10;

      const bestFor =
        Array.isArray(car.bestFor)
          ? car.bestFor.join(" ")
          : String(car.bestFor || "");

      if (
        normalise(bestFor)
          .includes(requirements.purpose)
      ) {

        score += 10;

        reasons.push(
          `Suited for ${requirements.purpose}`
        );

      }

    }


    /*
      If no explicit filters were detected,
      rating acts as a soft ranking signal.
    */

    if (maxScore === 0) {

      score =
        Math.max(
          0,
          Math.min(
            100,
            Number(car.rating || 0) * 20
          )
        );

      maxScore = 100;

      if (Number(car.rating) >= 4) {
        reasons.push("Strong catalogue rating");
      }

    }


    const percentage =
      Math.round(
        (score / maxScore) * 100
      );


    return {
      car,
      score,
      percentage,
      reasons
    };

  };


  /* =======================================================
     RENDER CARD
     ======================================================= */

  const renderCard =
    (result, index) => {

      const car =
        result.car;

      const name =
        `${escapeHTML(car.brand)} ${escapeHTML(car.model)}`;

      const reasons =
        result.reasons.length
          ? result.reasons.slice(0, 4)
          : ["Matches your overall search"];

      return `

        <article class="intelligence-card reveal in">

          <a
            class="intelligence-card-image"
            href="vehicle.html?id=${encodeURIComponent(car._id)}"
          >

            <img
              loading="${index < 2 ? "eager" : "lazy"}"
              src="${firstImage(car)}"
              alt="${name}"
            >

          </a>


          <div class="intelligence-card-body">

            <div class="match-line">

              <span>MATCH ${String(index + 1).padStart(2, "0")}</span>

              <span class="match-score">
                ${result.percentage}%
              </span>

            </div>


            <span class="vehicle-brand">
              ${escapeHTML(car.brand || "AUTOVERSE")}
            </span>


            <h3>
              ${escapeHTML(car.model || "Unknown")}
            </h3>


            <div class="intelligence-price">
              ${escapeHTML(
                car.priceRange ||
                "Price on request"
              )}
            </div>


            <ul class="match-reasons">

              ${reasons
                .map(
                  reason =>
                    `<li>${escapeHTML(reason)}</li>`
                )
                .join("")}

            </ul>


            <div class="card-actions">

              <a
                class="card-action"
                href="vehicle.html?id=${encodeURIComponent(car._id)}"
              >
                VIEW VEHICLE
              </a>

              <a
                class="card-action"
                href="compare.html"
              >
                COMPARE
              </a>

            </div>

          </div>

        </article>

      `;

    };


  /* =======================================================
     LOAD CARS
     ======================================================= */

  const loadCars = async () => {

    const response =
      await fetch(`${API_BASE_URL}/cars`);

    if (!response.ok) {

      throw new Error(
        `Vehicle request failed: ${response.status}`
      );

    }

    return await response.json();

  };


  /* =======================================================
     ANALYSE
     ======================================================= */

  form.addEventListener("submit", async event => {

    event.preventDefault();


    const text =
      textarea.value.trim();


    if (!text && !selectedPurpose) {

      textarea.focus();

      resultsMeta.textContent =
        "Tell us what you need before analysing.";

      return;

    }


    analyseBtn.disabled = true;

    analyseBtn.innerHTML =
      `ANALYSING YOUR REQUIREMENTS <span>...</span>`;


    try {

      const requirements =
        parseRequirements(text);


      updateRequirementMap(
        requirements
      );


      const cars =
        await loadCars();


      const results =
        cars
          .map(car =>
            matchVehicle(
              car,
              requirements
            )
          )
          .sort(
            (a, b) =>
              b.score - a.score
          )
          .slice(0, 6);


      if (!results.length) {

        grid.innerHTML = `

          <div class="empty-intelligence">

            <span>NO MATCHES</span>

            <h3>
              Nothing matched closely enough.
            </h3>

            <p>
              Try widening your requirements or
              removing one of the constraints.
            </p>

          </div>

        `;

        resultsMeta.textContent =
          "No vehicles matched the current requirements.";

      } else {

        grid.innerHTML =
          results
            .map(renderCard)
            .join("");

        resultsMeta.textContent =
          `${results.length} vehicles ranked from the AutoVerse catalogue.`;

      }


      resultsSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });


    } catch (error) {

      console.error(
        "AutoVerse Intelligence:",
        error
      );


      grid.innerHTML = `

        <div class="empty-intelligence">

          <span>CONNECTION ERROR</span>

          <h3>
            Catalogue unavailable.
          </h3>

          <p>
            AutoVerse couldn't reach the vehicle catalogue.
            Please try again.
          </p>

        </div>

      `;

      resultsMeta.textContent =
        "Unable to access the vehicle catalogue.";

    } finally {

      analyseBtn.disabled = false;

      analyseBtn.innerHTML =
        `ANALYSE MY REQUIREMENTS <span>→</span>`;

    }

  });


  /* =======================================================
     INITIAL STATE
     ======================================================= */

  updateRequirementMap();

})();