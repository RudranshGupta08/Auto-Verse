(() => {

  "use strict";


  /* =====================================================
     ELEMENTS
  ===================================================== */

  const nav =
    document.getElementById("avNav");

  const dealerGrid =
    document.getElementById("dealerGrid");

  const dealerSearch =
    document.getElementById("dealerSearch");

  const cityFilter =
    document.getElementById("cityFilter");

  const typeFilter =
    document.getElementById("typeFilter");

  const emptyState =
    document.getElementById("emptyState");

  const dealerModal =
    document.getElementById("dealerModal");

  const dealerDetails =
    document.getElementById("dealerDetails");

  const modalClose =
    document.getElementById("modalClose");

  const logoutBtn =
    document.getElementById("logoutBtn");

  const mobileMenu =
    document.getElementById("mobileMenu");

  const navLinks =
    document.querySelector(".av-links");

  const dealerCount =
    document.getElementById("dealerCount");

  const vehicleCount =
    document.getElementById("vehicleCount");


  /* =====================================================
     DEMO DEALERSHIP DATA
     
     Replace this later with API data.
  ===================================================== */

  const dealerships = [

    {
      id: 1,

      name: "Rudransh Automobile Industry",

      type: "dealer",

      city: "Lucknow",

      state: "Uttar Pradesh",

      address:
        "Faizabad Road, Lucknow, Uttar Pradesh",

      phone:
        "+91 98765 43210",

      support:
        "+91 91234 56789",

      email:
        "rudranshautomobile@gmail.com",

      brands:
        "Maruti Suzuki • Hyundai • Tata • Mahindra",

      inventory: 24,

      established: "2018",

      image:
        "https://images.unsplash.com/photo-1562141961-8a0f0c6b6c9d?auto=format&fit=crop&w=1200&q=80",

      description:
        "Rudransh Automobile Industry is a multi-brand automotive dealership connected with the AutoVerse network, offering new and pre-owned vehicles with customer-focused assistance."
    },


    {
      id: 2,

      name: "Elite Motors Lucknow",

      type: "authorized",

      city: "Lucknow",

      state: "Uttar Pradesh",

      address:
        "Gomti Nagar, Lucknow, Uttar Pradesh",

      phone:
        "+91 99887 66554",

      support:
        "+91 90011 22334",

      email:
        "contact@elitemotors.example",

      brands:
        "Hyundai • Kia",

      inventory: 18,

      established: "2016",

      image:
        "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80",

      description:
        "An authorized automotive showroom providing new vehicles, test-drive assistance and customer support through the AutoVerse dealership network."
    },


    {
      id: 3,

      name: "Capital Auto Hub",

      type: "multi-brand",

      city: "Delhi",

      state: "Delhi",

      address:
        "Dwarka, New Delhi",

      phone:
        "+91 98711 22334",

      support:
        "+91 90111 44556",

      email:
        "capitalautohub@example.com",

      brands:
        "Toyota • Honda • Volkswagen • Skoda",

      inventory: 31,

      established: "2020",

      image:
        "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=1200&q=80",

      description:
        "Capital Auto Hub brings multiple automotive brands together under one dealership network, making vehicle discovery easier for AutoVerse users."
    },


    {
      id: 4,

      name: "Premium Wheels",

      type: "dealer",

      city: "Kanpur",

      state: "Uttar Pradesh",

      address:
        "GT Road, Kanpur, Uttar Pradesh",

      phone:
        "+91 93355 77889",

      support:
        "+91 94555 22110",

      email:
        "premiumwheels@example.com",

      brands:
        "Mahindra • Tata • Jeep",

      inventory: 16,

      established: "2019",

      image:
        "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80",

      description:
        "Premium Wheels specializes in SUVs and utility vehicles, helping customers discover suitable vehicles through AutoVerse."
    },


    {
      id: 5,

      name: "Metro Pre-Owned Cars",

      type: "dealer",

      city: "Pune",

      state: "Maharashtra",

      address:
        "Baner Road, Pune, Maharashtra",

      phone:
        "+91 98888 11223",

      support:
        "+91 97777 44556",

      email:
        "metrocars@example.com",

      brands:
        "Maruti • Hyundai • Honda • Toyota",

      inventory: 27,

      established: "2021",

      image:
        "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",

      description:
        "A pre-owned vehicle dealership focused on inspected and customer-ready cars listed through the AutoVerse ecosystem."
    },


    {
      id: 6,

      name: "North India Motors",

      type: "authorized",

      city: "Chandigarh",

      state: "Chandigarh",

      address:
        "Industrial Area, Chandigarh",

      phone:
        "+91 98111 33445",

      support:
        "+91 98000 77665",

      email:
        "northindiamotors@example.com",

      brands:
        "Kia • MG • Volkswagen",

      inventory: 21,

      established: "2017",

      image:
        "https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&w=1200&q=80",

      description:
        "A participating authorized showroom helping AutoVerse users discover vehicles and connect with dealership representatives."
    }

  ];


  /* =====================================================
     INITIALIZATION
  ===================================================== */

  async function init() {

    /* Authentication is verified by the backend session. */
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        credentials: "include",
        headers: { Accept: "application/json" },
        cache: "no-store"
      });

      if (!response.ok) {
        window.location.replace("login.html");
        return;
      }
    } catch {
      window.location.replace("login.html");
      return;
    }

    updateStatistics();

    populateCities();

    renderDealerships(dealerships);

    setupEvents();

    setupRevealObserver();

  }


  /* =====================================================
     STATISTICS
  ===================================================== */

  function updateStatistics() {

    const totalVehicles =
      dealerships.reduce(
        (total, dealer) =>
          total + dealer.inventory,
        0
      );


    dealerCount.textContent =
      dealerships.length;

    vehicleCount.textContent =
      totalVehicles;

  }


  /* =====================================================
     CITY FILTER
  ===================================================== */

  function populateCities() {

    const cities =
      [...new Set(
        dealerships.map(
          dealer => dealer.city
        )
      )].sort();


    cities.forEach(city => {

      const option =
        document.createElement("option");

      option.value = city;

      option.textContent = city;

      cityFilter.appendChild(option);

    });

  }


  /* =====================================================
     RENDER DEALERSHIPS
  ===================================================== */

  function renderDealerships(list) {

    dealerGrid.innerHTML = "";

    emptyState.hidden =
      list.length !== 0;


    list.forEach(dealer => {

      const card =
        document.createElement("article");

      card.className =
        "dealer-card";


      card.innerHTML = `

        <div class="dealer-image">

          <img
            src="${dealer.image}"
            alt="${escapeHTML(dealer.name)}"
            loading="lazy"
          >

          <span class="dealer-badge">
            ${getDealerType(dealer.type)}
          </span>

        </div>


        <div class="dealer-info">

          <div class="dealer-brand">
            AUTOVERSE DEALERSHIP
          </div>


          <h3 class="dealer-name">
            ${escapeHTML(dealer.name)}
          </h3>


          <p class="dealer-location">
            ${escapeHTML(dealer.address)}
          </p>


          <div class="dealer-meta">

            <div>
              <strong>
                ${dealer.inventory}
              </strong>

              <span>
                VEHICLES
              </span>
            </div>


            <div>
              <strong>
                ${dealer.city}
              </strong>

              <span>
                LOCATION
              </span>
            </div>


            <div>
              <strong>
                ${dealer.established}
              </strong>

              <span>
                EST.
              </span>
            </div>

          </div>


          <div class="dealer-actions">

            <button
              type="button"
              data-action="details"
              data-id="${dealer.id}"
            >
              View Showroom
            </button>


            <a
              href="tel:${dealer.phone.replace(/\s/g, "")}"
            >
              Contact Dealer
            </a>

          </div>

        </div>

      `;


      dealerGrid.appendChild(card);

    });

  }


  /* =====================================================
     FILTERING
  ===================================================== */

  function filterDealers() {

    const search =
      dealerSearch.value
        .trim()
        .toLowerCase();

    const city =
      cityFilter.value;

    const type =
      typeFilter.value;


    const filtered =
      dealerships.filter(dealer => {

        const searchable = [

          dealer.name,

          dealer.city,

          dealer.state,

          dealer.brands,

          dealer.address

        ]
          .join(" ")
          .toLowerCase();


        const matchesSearch =
          !search ||
          searchable.includes(search);


        const matchesCity =
          city === "all" ||
          dealer.city === city;


        const matchesType =
          type === "all" ||
          dealer.type === type;


        return (
          matchesSearch &&
          matchesCity &&
          matchesType
        );

      });


    renderDealerships(filtered);

  }


  /* =====================================================
     DEALER MODAL
  ===================================================== */

  function openDealerModal(id) {

    const dealer =
      dealerships.find(
        item => item.id === Number(id)
      );


    if (!dealer) return;


    dealerDetails.innerHTML = `

      <p class="modal-subtitle">
        AUTOVERSE VERIFIED DEALERSHIP
      </p>


      <h2 class="modal-title">
        ${escapeHTML(dealer.name)}
      </h2>


      <p class="modal-description">
        ${escapeHTML(dealer.description)}
      </p>


      <div class="modal-details">

        <div class="modal-detail">

          <span>
            LOCATION
          </span>

          <strong>
            ${escapeHTML(dealer.address)}
          </strong>

        </div>


        <div class="modal-detail">

          <span>
            VEHICLE INVENTORY
          </span>

          <strong>
            ${dealer.inventory} Vehicles
          </strong>

        </div>


        <div class="modal-detail">

          <span>
            AVAILABLE BRANDS
          </span>

          <strong>
            ${escapeHTML(dealer.brands)}
          </strong>

        </div>


        <div class="modal-detail">

          <span>
            DEALERSHIP TYPE
          </span>

          <strong>
            ${getDealerType(dealer.type)}
          </strong>

        </div>


        <div class="modal-detail">

          <span>
            DEALERSHIP CONTACT
          </span>

          <strong>
            ${escapeHTML(dealer.phone)}
          </strong>

        </div>


        <div class="modal-detail">

          <span>
            INVENTORY SUPPORT
          </span>

          <strong>
            ${escapeHTML(dealer.support)}
          </strong>

        </div>


        <div class="modal-detail">

          <span>
            EMAIL
          </span>

          <strong>
            ${escapeHTML(dealer.email)}
          </strong>

        </div>


        <div class="modal-detail">

          <span>
            ESTABLISHED
          </span>

          <strong>
            ${dealer.established}
          </strong>

        </div>

      </div>


      <div class="dealer-actions" style="margin-top:30px">

        <a
          href="tel:${dealer.phone.replace(/\s/g, "")}"
        >
          Call Dealership
        </a>


        <a
          href="mailto:${dealer.email}?subject=AutoVerse Vehicle Enquiry"
        >
          Send Enquiry
        </a>

      </div>

    `;


    dealerModal.classList.add("open");

    dealerModal.setAttribute(
      "aria-hidden",
      "false"
    );

    document.body.style.overflow =
      "hidden";

  }


  function closeDealerModal() {

    dealerModal.classList.remove("open");

    dealerModal.setAttribute(
      "aria-hidden",
      "true"
    );

    document.body.style.overflow =
      "";

  }


  /* =====================================================
     EVENT LISTENERS
  ===================================================== */

  function setupEvents() {

    dealerSearch.addEventListener(
      "input",
      filterDealers
    );


    cityFilter.addEventListener(
      "change",
      filterDealers
    );


    typeFilter.addEventListener(
      "change",
      filterDealers
    );


    dealerGrid.addEventListener(
      "click",
      event => {

        const button =
          event.target.closest(
            '[data-action="details"]'
          );


        if (!button) return;


        openDealerModal(
          button.dataset.id
        );

      }
    );


    modalClose.addEventListener(
      "click",
      closeDealerModal
    );


    dealerModal.addEventListener(
      "click",
      event => {

        if (
          event.target === dealerModal
        ) {

          closeDealerModal();

        }

      }
    );


    document.addEventListener(
      "keydown",
      event => {

        if (
          event.key === "Escape"
        ) {

          closeDealerModal();

        }

      }
    );


    logoutBtn.addEventListener(
      "click",
      async () => {
        try {
          const csrf = await fetch(`${API_BASE_URL}/auth/csrf`, {
            credentials: "include",
            headers: { Accept: "application/json" },
            cache: "no-store"
          });
          const data = await csrf.json().catch(() => ({}));
          await fetch(`${API_BASE_URL}/auth/logout`, {
            method: "POST",
            credentials: "include",
            headers: {
              Accept: "application/json",
              "X-CSRF-Token": data.csrfToken || ""
            }
          });
        } finally {
          window.location.replace("login.html");
        }
      }
    );


    mobileMenu.addEventListener(
      "click",
      () => {

        navLinks.classList.toggle(
          "mobile-open"
        );

      }
    );


    document
      .querySelectorAll(".av-links a")
      .forEach(link => {

        link.addEventListener(
          "click",
          () => {

            navLinks.classList.remove(
              "mobile-open"
            );

          }
        );

      });


    window.addEventListener(
      "scroll",
      () => {

        nav.classList.toggle(
          "scrolled",
          window.scrollY > 30
        );

      },
      { passive: true }
    );

  }


  /* =====================================================
     REVEAL ANIMATION
  ===================================================== */

  function setupRevealObserver() {

    const observer =
      new IntersectionObserver(
        entries => {

          entries.forEach(entry => {

            if (
              entry.isIntersecting
            ) {

              entry.target.classList.add(
                "in"
              );

              observer.unobserve(
                entry.target
              );

            }

          });

        },
        {
          threshold: .12
        }
      );


    document
      .querySelectorAll(".reveal")
      .forEach(element => {

        observer.observe(element);

      });

  }


  /* =====================================================
     DEALER TYPE
  ===================================================== */

  function getDealerType(type) {

    const types = {

      authorized:
        "AUTHORIZED SHOWROOM",

      dealer:
        "CAR DEALER",

      "multi-brand":
        "MULTI-BRAND DEALER"

    };


    return (
      types[type] ||
      "DEALERSHIP"
    );

  }


  /* =====================================================
     HTML ESCAPE
  ===================================================== */

  function escapeHTML(value) {

    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  }


  /* =====================================================
     START
  ===================================================== */

  init();

})();