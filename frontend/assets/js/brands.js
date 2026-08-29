/* =========================================================
   AUTOVERSE — BRANDS
========================================================= */

(() => {

    "use strict";


    /* =====================================================
       CONFIG
    ===================================================== */

    const API_BASE =
        window.API_BASE_URL ||
        window.CONFIG?.API_BASE_URL ||
        (
            window.location.hostname === "localhost" ||
            window.location.hostname === "127.0.0.1"
                ? "http://localhost:5000/api"
                : "https://auto-verse-hcp5.onrender.com/api"
        );


    console.log(
        "AutoVerse → API:",
        API_BASE
    );


    /* =====================================================
       DOM
    ===================================================== */

    const body =
        document.body;

    const nav =
        document.getElementById(
            "brandsNav"
        );

    const progress =
        document.getElementById(
            "scrollProgress"
        );

    const mobileMenu =
        document.getElementById(
            "mobileMenu"
        );

    const appLinks =
        document.querySelector(
            ".av-links"
        );

    const brandsContainer =
        document.getElementById(
            "brandsContainer"
        );

    const brandsStatus =
        document.getElementById(
            "brandsStatus"
        );

    const brandsEmpty =
        document.getElementById(
            "brandsEmpty"
        );

    const retryBtn =
        document.getElementById(
            "retryBtn"
        );

    const brandCount =
        document.getElementById(
            "brandCount"
        );


    /* =====================================================
       MODAL
    ===================================================== */

    const carModal =
        document.getElementById(
            "carModal"
        );

    const modalBackdrop =
        document.getElementById(
            "modalBackdrop"
        );

    const modalClose =
        document.getElementById(
            "modalClose"
        );

    const modalCarImage =
        document.getElementById(
            "modalCarImage"
        );

    const modalBrand =
        document.getElementById(
            "modalBrand"
        );

    const modalCarName =
        document.getElementById(
            "modalCarName"
        );

    const modalDescription =
        document.getElementById(
            "modalDescription"
        );

    const modalPrice =
        document.getElementById(
            "modalPrice"
        );

    const modalType =
        document.getElementById(
            "modalType"
        );

    const modalFuel =
        document.getElementById(
            "modalFuel"
        );

    const modalTransmission =
        document.getElementById(
            "modalTransmission"
        );


    /* =====================================================
       REDUCED MOTION
    ===================================================== */

    const reducedMotion =
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;


    /* =====================================================
       HELPERS
    ===================================================== */

    const escapeHTML = (value) => {

        if (
            value === null ||
            value === undefined
        ) {
            return "";
        }

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    };


    const formatValue = (value) => {

        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return "—";
        }


        if (Array.isArray(value)) {

            return value
                .filter(Boolean)
                .join(" / ");
        }


        return String(value);
    };


    /* =====================================================
       IMAGE URL
       
       API:
       https://auto-verse-hcp5.onrender.com/api

       IMAGE:
       https://auto-verse-hcp5.onrender.com/images/...
    ===================================================== */

    const getBackendBase = () => {

        return API_BASE
            .replace(/\/api\/?$/, "")
            .replace(/\/$/, "");
    };


    const getImageUrl = (imagePath) => {

        if (!imagePath) {

            return "";
        }


        let cleanPath =
            String(imagePath)
                .replace(/\\/g, "/")
                .trim();


        /*
         * Already a complete URL
         */

        if (
            cleanPath.startsWith("http://") ||
            cleanPath.startsWith("https://") ||
            cleanPath.startsWith("data:")
        ) {

            return cleanPath;
        }


        /*
         * Remove unnecessary leading slash
         */

        cleanPath =
            cleanPath.replace(
                /^\/+/,
                ""
            );


        /*
         * If database contains:
         *
         * images/brezza/file.jpg
         *
         * remove "images/" because backend
         * static route already points to /images.
         */

        if (
            cleanPath
                .toLowerCase()
                .startsWith("images/")
        ) {

            cleanPath =
                cleanPath.substring(
                    "images/".length
                );
        }


        return `${getBackendBase()}/images/${cleanPath}`;
    };


    /* =====================================================
       BRAND LOGO MAPPING
       
       Existing files:
       frontend/assets/images/
    ===================================================== */

    const brandLogoMap = {

        "audi": "audi.png",

        "bentley": "bentley.png",

        "bmw": "bmw.png",

        "ford": "ford.png",

        "honda": "honda.png",

        "hyundai": "hyundai.png",

        "jaguar": "jaguar.png",

        "jeep": "jeep.png",

        "kia": "kia.png",

        "land rover": "landrover.png",

        "landrover": "landrover.png",

        "mahindra": "mahindra.png",

        "maybach": "maybach.png",

        "mercedes": "mercedes.png",

        "mercedes-benz": "mercedes.png",

        "mercedes amg": "mercedesamg.png",

        "mercedes-amg": "mercedesamg.png",

        "mg": "mg.png",

        "mini": "mini.png",

        "nissan": "nissan.png",

        "porsche": "porsche.png",

        "renault": "renault.png",

        "skoda": "skoda.png",

        "suzuki": "suzuki.png",

        "maruti suzuki": "suzuki.png",

        "tata": "tata.png",

        "toyota": "toyota.png",

        "volkswagen": "volkswagen.png",

        "volvo": "volvo.png"

    };


    const getBrandLogoPath = (brand) => {

        if (!brand) {

            return "";
        }


        const key =
            String(brand)
                .trim()
                .toLowerCase();


        const filename =
            brandLogoMap[key];


        if (!filename) {

            return "";
        }


        return `assets/images/${filename}`;
    };


    const getBrandInitials = (brand) => {

        if (!brand) {

            return "AV";
        }


        const words =
            String(brand)
                .trim()
                .split(/\s+/)
                .filter(Boolean);


        if (words.length === 1) {

            return words[0]
                .substring(0, 2)
                .toUpperCase();
        }


        return words
            .slice(0, 2)
            .map(word => word[0])
            .join("")
            .toUpperCase();
    };


    const createBrandLogo = (brand) => {

        const logoPath =
            getBrandLogoPath(brand);


        if (logoPath) {

            return `
                <div
                    class="brand-logo"
                    aria-label="${escapeHTML(brand)}">

                    <img
                        src="${escapeHTML(logoPath)}"
                        alt="${escapeHTML(brand)} logo"
                        loading="lazy"
                        onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
                    >

                    <span style="display:none;">
                        ${escapeHTML(
                            getBrandInitials(brand)
                        )}
                    </span>

                </div>
            `;
        }


        return `
            <div
                class="brand-logo"
                aria-label="${escapeHTML(brand)}">

                <span>
                    ${escapeHTML(
                        getBrandInitials(brand)
                    )}
                </span>

            </div>
        `;
    };


    /* =====================================================
       FETCH CARS
    ===================================================== */

    const fetchCars = async () => {

        const endpoint =
            `${API_BASE.replace(/\/$/, "")}/cars`;


        console.log(
            "AutoVerse → Fetching cars:",
            endpoint
        );


        const response =
            await fetch(
                endpoint,
                {
                    method: "GET",

                    headers: {
                        "Accept":
                            "application/json"
                    },

                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                `API request failed: ${response.status}`
            );
        }


        const data =
            await response.json();


        if (!Array.isArray(data)) {

            throw new Error(
                "Invalid cars response."
            );
        }


        console.log(
            `AutoVerse → ${data.length} cars loaded`
        );


        return data;
    };


    /* =====================================================
       GROUP CARS BY BRAND
    ===================================================== */

    const groupCarsByBrand = (cars) => {

        const groups =
            new Map();


        cars.forEach((car) => {

            if (
                !car ||
                !car.brand
            ) {

                return;
            }


            const brand =
                String(car.brand)
                    .trim();


            if (!brand) {

                return;
            }


            const key =
                brand.toLowerCase();


            if (!groups.has(key)) {

                groups.set(
                    key,
                    {
                        name: brand,
                        cars: []
                    }
                );
            }


            const group =
                groups.get(key);


            /*
             * Only two cars per brand.
             */

            if (
                group.cars.length < 2
            ) {

                group.cars.push(car);
            }

        });


        return Array
            .from(groups.values())
            .sort(
                (a, b) =>
                    a.name.localeCompare(
                        b.name
                    )
            );
    };


    /* =====================================================
       CAR CARD
    ===================================================== */

    const createCarCard = (car) => {

        const image =
            car.images?.length
                ? getImageUrl(
                    car.images[0]
                )
                : "";


        const imageHTML =
            image

                ? `
                    <img
                        src="${escapeHTML(image)}"
                        alt="${escapeHTML(
                            `${car.brand || ""} ${car.model || ""}`
                        )}"
                        loading="lazy"
                        class="car-main-image"
                    >
                `

                : `
                    <div class="image-fallback">
                        ${escapeHTML(
                            car.brand || "AV"
                        )}
                    </div>
                `;


        return `
            <article
                class="car-card reveal"
                data-car-id="${escapeHTML(
                    car._id || ""
                )}"
                tabindex="0"
                role="button"
                aria-label="View ${escapeHTML(
                    `${car.brand || ""} ${car.model || ""}`
                )} information">

                <div class="car-image">

                    ${imageHTML}

                    <div
                        class="car-image-overlay">
                    </div>

                    <span class="car-tag">
                        ${escapeHTML(
                            formatValue(
                                car.type
                            )
                        )}
                    </span>

                </div>


                <div class="car-info">

                    <small>
                        ${escapeHTML(
                            formatValue(
                                car.brand
                            )
                        )}
                    </small>

                    <h3>
                        ${escapeHTML(
                            formatValue(
                                car.model
                            )
                        )}
                    </h3>


                    <div
                        class="car-info-bottom">

                        <span
                            class="car-price">

                            ${escapeHTML(
                                formatValue(
                                    car.priceRange
                                )
                            )}

                        </span>

                        <span
                            class="car-view">

                            VIEW PROFILE ↗

                        </span>

                    </div>

                </div>

            </article>
        `;
    };


    /* =====================================================
       BRAND BLOCK
    ===================================================== */

    const createBrandBlock =
        (group, index) => {

            const carsHTML =
                group.cars
                    .map(createCarCard)
                    .join("");


            const number =
                String(index + 1)
                    .padStart(2, "0");


            return `
                <section
                    class="brand-block reveal"
                    data-brand="${escapeHTML(
                        group.name
                    )}">


                    <div class="brand-header">

                        <div
                            class="brand-identity">

                            ${createBrandLogo(
                                group.name
                            )}

                            <div>

                                <h3
                                    class="brand-name">

                                    ${escapeHTML(
                                        group.name
                                    )}

                                </h3>

                                <span
                                    class="brand-meta">

                                    ${group.cars.length}
                                    featured
                                    machine${group.cars.length === 1 ? "" : "s"}

                                </span>

                            </div>

                        </div>


                        <span
                            class="brand-number">

                            ${number}

                        </span>

                    </div>


                    <div class="brand-cars">

                        ${carsHTML}

                    </div>


                    <div class="brand-explore">

                        <a
                            href="login.html"
                            class="explore-more">

                            EXPLORE MORE CARS

                            <span>
                                →
                            </span>

                        </a>

                    </div>

                </section>
            `;
        };


    /* =====================================================
       STORE CAR DATA
    ===================================================== */

    const prepareCarData = (cars) => {

        window.__AUTOVERSE_CARS__ =
            cars;
    };


    /* =====================================================
       RENDER
    ===================================================== */

    const renderBrands = (cars) => {

        const groups =
            groupCarsByBrand(cars);


        if (!groups.length) {

            showEmptyState();

            return;
        }


        brandsContainer.innerHTML =
            groups
                .map(createBrandBlock)
                .join("");


        if (brandCount) {

            brandCount.textContent =
                String(groups.length)
                    .padStart(2, "0");
        }


        brandsStatus.style.display =
            "none";


        brandsEmpty.hidden =
            true;


        initializeReveal();

        initializeCarCards();

        initializeMagneticCards();
    };


    /* =====================================================
       LOAD BRANDS
    ===================================================== */

    const loadBrands =
        async () => {

            try {

                brandsStatus.style.display =
                    "flex";

                brandsEmpty.hidden =
                    true;

                brandsContainer.innerHTML =
                    "";


                const cars =
                    await fetchCars();


                prepareCarData(cars);


                renderBrands(cars);

            }

            catch (error) {

                console.error(
                    "AutoVerse Brands:",
                    error
                );

                showEmptyState();
            }
        };


    /* =====================================================
       EMPTY STATE
    ===================================================== */

    const showEmptyState = () => {

        if (brandsStatus) {

            brandsStatus.style.display =
                "none";
        }


        if (brandsContainer) {

            brandsContainer.innerHTML =
                "";
        }


        if (brandsEmpty) {

            brandsEmpty.hidden =
                false;
        }


        if (brandCount) {

            brandCount.textContent =
                "00";
        }
    };


    /* =====================================================
       CAR MODAL
    ===================================================== */

    const openCarModal = (car) => {

        if (
            !carModal ||
            !car
        ) {

            return;
        }


        const image =
            car.images?.length
                ? getImageUrl(
                    car.images[0]
                )
                : "";


        modalCarImage.src =
            image || "";


        modalCarImage.alt =
            `${car.brand || ""} ${car.model || ""}`;


        modalBrand.textContent =
            formatValue(
                car.brand
            );


        modalCarName.textContent =
            formatValue(
                car.model
            );


        modalDescription.textContent =
            formatValue(
                car.description ||
                car.verdict ||
                "Explore this machine inside AutoVerse."
            );


        modalPrice.textContent =
            formatValue(
                car.priceRange
            );


        modalType.textContent =
            formatValue(
                car.type
            );


        modalFuel.textContent =
            formatValue(
                car.fuelType
            );


        modalTransmission.textContent =
            formatValue(
                car.transmission
            );


        carModal.classList.add(
            "open"
        );


        carModal.setAttribute(
            "aria-hidden",
            "false"
        );


        body.classList.add(
            "modal-open"
        );


        if (!reducedMotion) {

            document.documentElement.style
                .overflow = "hidden";
        }
    };


    const closeCarModal = () => {

        if (!carModal) {

            return;
        }


        carModal.classList.remove(
            "open"
        );


        carModal.setAttribute(
            "aria-hidden",
            "true"
        );


        body.classList.remove(
            "modal-open"
        );


        document.documentElement.style
            .overflow = "";
    };


    /* =====================================================
       CAR CARD EVENTS
    ===================================================== */

    const initializeCarCards = () => {

        const cards =
            document.querySelectorAll(
                ".car-card"
            );


        cards.forEach((card) => {

            const handleOpen =
                () => {

                    const id =
                        card.dataset.carId;


                    const car =
                        window.__AUTOVERSE_CARS__
                            ?.find(
                                item =>
                                    String(
                                        item._id
                                    ) ===
                                    String(id)
                            );


                    if (car) {

                        openCarModal(
                            car
                        );
                    }
                };


            card.addEventListener(
                "click",
                handleOpen
            );


            card.addEventListener(
                "keydown",
                event => {

                    if (
                        event.key === "Enter" ||
                        event.key === " "
                    ) {

                        event.preventDefault();

                        handleOpen();
                    }

                }
            );

        });
    };


    /* =====================================================
       NAVIGATION
    ===================================================== */

    const updateNavigation = () => {

        if (!nav) {

            return;
        }


        nav.classList.toggle(
            "scrolled",
            window.scrollY > 30
        );
    };


    /* =====================================================
       SCROLL PROGRESS
    ===================================================== */

    const updateScrollProgress = () => {

        if (!progress) {

            return;
        }


        const documentHeight =
            document.documentElement
                .scrollHeight -
            window.innerHeight;


        const percentage =
            documentHeight > 0

                ? (
                    window.scrollY /
                    documentHeight
                ) * 100

                : 0;


        let progressFill =
            progress.querySelector(
                "span"
            );


        if (!progressFill) {

            progressFill =
                document.createElement(
                    "span"
                );

            progress.appendChild(
                progressFill
            );
        }


        progressFill.style.height =
            `${percentage}%`;
    };


    window.addEventListener(
        "scroll",
        () => {

            updateNavigation();

            updateScrollProgress();

        },
        {
            passive: true
        }
    );


    updateNavigation();

    updateScrollProgress();


    /* =====================================================
       REVEAL ANIMATIONS
    ===================================================== */

    const initializeReveal = () => {

        const elements =
            document.querySelectorAll(
                ".reveal:not(.reveal-ready)"
            );


        elements.forEach(
            element => {

                element.classList.add(
                    "reveal-ready"
                );

            }
        );


        if (reducedMotion) {

            elements.forEach(
                element => {

                    element.classList.add(
                        "in"
                    );

                }
            );

            return;
        }


        const observer =
            new IntersectionObserver(
                (entries, observer) => {

                    entries.forEach(
                        entry => {

                            if (
                                !entry.isIntersecting
                            ) {

                                return;
                            }


                            entry.target.classList.add(
                                "in"
                            );


                            observer.unobserve(
                                entry.target
                            );

                        }
                    );

                },
                {
                    threshold: .1,

                    rootMargin:
                        "0px 0px -40px 0px"
                }
            );


        elements.forEach(
            element => {

                observer.observe(
                    element
                );

            }
        );
    };


    /* =====================================================
       CUSTOM CURSOR
    ===================================================== */

    const finePointer =
        window.matchMedia(
            "(pointer: fine)"
        ).matches;


    if (
        finePointer &&
        !reducedMotion
    ) {

        const cursorDot =
            document.querySelector(
                ".cursor-dot"
            );


        const cursorRing =
            document.querySelector(
                ".cursor-ring"
            );


        if (
            cursorDot &&
            cursorRing
        ) {

            body.classList.add(
                "cursor-ready"
            );


            let mouseX =
                window.innerWidth / 2;

            let mouseY =
                window.innerHeight / 2;


            let ringX =
                mouseX;

            let ringY =
                mouseY;


            window.addEventListener(
                "pointermove",
                event => {

                    mouseX =
                        event.clientX;

                    mouseY =
                        event.clientY;


                    cursorDot.style.left =
                        `${mouseX}px`;

                    cursorDot.style.top =
                        `${mouseY}px`;

                },
                {
                    passive: true
                }
            );


            const animateCursor =
                () => {

                    ringX +=
                        (mouseX - ringX) *
                        .18;

                    ringY +=
                        (mouseY - ringY) *
                        .18;


                    cursorRing.style.left =
                        `${ringX}px`;

                    cursorRing.style.top =
                        `${ringY}px`;


                    requestAnimationFrame(
                        animateCursor
                    );
                };


            animateCursor();


            document.addEventListener(
                "pointerover",
                event => {

                    if (
                        event.target.closest(
                            "a, button, .car-card, .brand-logo"
                        )
                    ) {

                        body.classList.add(
                            "cursor-hover"
                        );
                    }

                }
            );


            document.addEventListener(
                "pointerout",
                event => {

                    if (
                        event.target.closest(
                            "a, button, .car-card, .brand-logo"
                        )
                    ) {

                        body.classList.remove(
                            "cursor-hover"
                        );
                    }

                }
            );


            document.addEventListener(
                "pointerdown",
                () => {

                    body.classList.add(
                        "cursor-click"
                    );

                }
            );


            document.addEventListener(
                "pointerup",
                () => {

                    body.classList.remove(
                        "cursor-click"
                    );

                }
            );
        }
    }


    /* =====================================================
       MOBILE NAV
    ===================================================== */

    if (
        mobileMenu &&
        appLinks
    ) {

        mobileMenu.addEventListener(
            "click",
            event => {

                event.stopPropagation();


                const isOpen =
                    mobileMenu.classList.toggle(
                        "open"
                    );


                appLinks.classList.toggle(
                    "mobile-open",
                    isOpen
                );

            }
        );


        document.querySelectorAll(
            ".av-links a"
        ).forEach(
            link => {

                link.addEventListener(
                    "click",
                    () => {

                        mobileMenu.classList.remove(
                            "open"
                        );

                        appLinks.classList.remove(
                            "mobile-open"
                        );

                    }
                );

            }
        );
    }


    /* =====================================================
       OUTSIDE NAV CLICK
    ===================================================== */

    document.addEventListener(
        "click",
        event => {

            if (
                !appLinks ||
                !mobileMenu
            ) {

                return;
            }


            const insideNav =
                event.target.closest(
                    ".av-nav"
                );


            if (!insideNav) {

                mobileMenu.classList.remove(
                    "open"
                );

                appLinks.classList.remove(
                    "mobile-open"
                );
            }

        }
    );


    /* =====================================================
       MODAL EVENTS
    ===================================================== */

    if (modalClose) {

        modalClose.addEventListener(
            "click",
            closeCarModal
        );
    }


    if (modalBackdrop) {

        modalBackdrop.addEventListener(
            "click",
            closeCarModal
        );
    }


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                carModal?.classList.contains(
                    "open"
                )
            ) {

                closeCarModal();
            }

        }
    );


    /* =====================================================
       MAGNETIC MICRO MOTION
    ===================================================== */

    const initializeMagneticCards =
        () => {

            if (
                !finePointer ||
                reducedMotion
            ) {

                return;
            }


            const elements =
                document.querySelectorAll(
                    ".car-card, .explore-more"
                );


            elements.forEach(
                element => {

                    element.addEventListener(
                        "pointermove",
                        event => {

                            const rect =
                                element.getBoundingClientRect();


                            const x =
                                event.clientX -
                                rect.left -
                                rect.width / 2;


                            const y =
                                event.clientY -
                                rect.top -
                                rect.height / 2;


                            const strength =
                                element.classList.contains(
                                    "explore-more"
                                )
                                    ? .04
                                    : .018;


                            element.style.transform =
                                `translate(
                                    ${x * strength}px,
                                    ${y * strength}px
                                )`;

                        }
                    );


                    element.addEventListener(
                        "pointerleave",
                        () => {

                            element.style.transform =
                                "";

                        }
                    );

                }
            );
        };


    /* =====================================================
       RETRY
    ===================================================== */

    if (retryBtn) {

        retryBtn.addEventListener(
            "click",
            loadBrands
        );
    }


    /* =====================================================
       INITIAL LOAD
    ===================================================== */

    loadBrands();


})();