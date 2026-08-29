/* =========================================================
   AUTOVERSE — DEALERSHIP / B2B PARTNERSHIP
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENTS
    ===================================================== */

    const body = document.body;

    const nav =
        document.getElementById("dealerNav");

    const mobileMenu =
        document.getElementById("mobileMenu");

    const appLinks =
        document.getElementById("appLinks");

    const progress =
        document.getElementById("scrollProgress");

    const cursorDot =
        document.querySelector(".cursor-dot");

    const cursorRing =
        document.querySelector(".cursor-ring");

    const revealElements =
        document.querySelectorAll(".reveal");

    const magneticElements =
        document.querySelectorAll(".magnetic");


    /* =====================================================
       CUSTOM CURSOR
    ===================================================== */

    let mouseX = 0;
    let mouseY = 0;

    let ringX = 0;
    let ringY = 0;


    if (
        window.matchMedia("(pointer: fine)").matches &&
        cursorDot &&
        cursorRing
    ) {

        window.addEventListener("mousemove", (event) => {

            mouseX = event.clientX;
            mouseY = event.clientY;

            cursorDot.style.left =
                `${mouseX}px`;

            cursorDot.style.top =
                `${mouseY}px`;

            body.classList.add(
                "cursor-ready"
            );
        });


        function animateCursor() {

            ringX +=
                (mouseX - ringX) * 0.14;

            ringY +=
                (mouseY - ringY) * 0.14;

            cursorRing.style.left =
                `${ringX}px`;

            cursorRing.style.top =
                `${ringY}px`;

            requestAnimationFrame(
                animateCursor
            );
        }

        animateCursor();


        const hoverTargets =
            document.querySelectorAll(
                "a, button, .service-card, .process-card, .contact-card, .partner-tags span"
            );


        hoverTargets.forEach((element) => {

            element.addEventListener(
                "mouseenter",
                () => {

                    body.classList.add(
                        "cursor-hover"
                    );

                }
            );


            element.addEventListener(
                "mouseleave",
                () => {

                    body.classList.remove(
                        "cursor-hover"
                    );

                }
            );

        });


        window.addEventListener(
            "mousedown",
            () => {

                body.classList.add(
                    "cursor-click"
                );

            }
        );


        window.addEventListener(
            "mouseup",
            () => {

                body.classList.remove(
                    "cursor-click"
                );

            }
        );

    }


    /* =====================================================
       NAVIGATION SCROLL STATE
    ===================================================== */

    function updateNavigation() {

        if (!nav) return;

        if (window.scrollY > 40) {

            nav.classList.add(
                "scrolled"
            );

        } else {

            nav.classList.remove(
                "scrolled"
            );

        }

    }


    window.addEventListener(
        "scroll",
        updateNavigation,
        { passive: true }
    );

    updateNavigation();


    /* =====================================================
       SCROLL PROGRESS
    ===================================================== */

    function updateProgress() {

        if (!progress) return;

        const scrollTop =
            window.scrollY;

        const documentHeight =
            document.documentElement
                .scrollHeight;

        const windowHeight =
            window.innerHeight;

        const scrollable =
            documentHeight -
            windowHeight;


        if (scrollable <= 0) {

            progress.style.height =
                "100%";

            return;
        }


        const percentage =
            (scrollTop / scrollable) * 100;


        progress.style.height =
            `${percentage}%`;

    }


    window.addEventListener(
        "scroll",
        updateProgress,
        { passive: true }
    );

    updateProgress();


    /* =====================================================
       MOBILE MENU
    ===================================================== */

    if (
        mobileMenu &&
        appLinks
    ) {

        mobileMenu.addEventListener(
            "click",
            () => {

                const isOpen =
                    appLinks.classList.toggle(
                        "mobile-open"
                    );


                mobileMenu.classList.toggle(
                    "open",
                    isOpen
                );


                mobileMenu.setAttribute(
                    "aria-expanded",
                    String(isOpen)
                );

            }
        );


        const navLinks =
            appLinks.querySelectorAll("a");


        navLinks.forEach((link) => {

            link.addEventListener(
                "click",
                () => {

                    appLinks.classList.remove(
                        "mobile-open"
                    );

                    mobileMenu.classList.remove(
                        "open"
                    );

                    mobileMenu.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                }
            );

        });


        document.addEventListener(
            "click",
            (event) => {

                if (
                    !appLinks.contains(event.target) &&
                    !mobileMenu.contains(event.target)
                ) {

                    appLinks.classList.remove(
                        "mobile-open"
                    );

                    mobileMenu.classList.remove(
                        "open"
                    );

                    mobileMenu.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                }

            }
        );

    }


    /* =====================================================
       REVEAL ON SCROLL
    ===================================================== */

    if (
        "IntersectionObserver" in window
    ) {

        const revealObserver =
            new IntersectionObserver(
                (entries, observer) => {

                    entries.forEach(
                        (entry) => {

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

                        }
                    );

                },
                {
                    threshold: 0.12,
                    rootMargin:
                        "0px 0px -50px 0px"
                }
            );


        revealElements.forEach(
            (element) => {

                revealObserver.observe(
                    element
                );

            }
        );

    } else {

        revealElements.forEach(
            (element) => {

                element.classList.add(
                    "in"
                );

            }
        );

    }


    /* =====================================================
       MAGNETIC BUTTON EFFECT
    ===================================================== */

    if (
        window.matchMedia("(pointer: fine)").matches
    ) {

        magneticElements.forEach(
            (element) => {

                element.addEventListener(
                    "mousemove",
                    (event) => {

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


                        element.style.transform =
                            `translate(${x * 0.08}px, ${y * 0.08}px)`;

                    }
                );


                element.addEventListener(
                    "mouseleave",
                    () => {

                        element.style.transform =
                            "";

                    }
                );

            }
        );

    }


    /* =====================================================
       SMOOTH ANCHOR SCROLL
    ===================================================== */

    document
        .querySelectorAll(
            'a[href^="#"]'
        )
        .forEach((link) => {

            link.addEventListener(
                "click",
                (event) => {

                    const targetId =
                        link.getAttribute("href");


                    if (
                        !targetId ||
                        targetId === "#"
                    ) {
                        return;
                    }


                    const target =
                        document.querySelector(
                            targetId
                        );


                    if (!target) {
                        return;
                    }


                    event.preventDefault();


                    const navHeight =
                        nav
                            ? nav.offsetHeight
                            : 0;


                    const targetPosition =
                        target.getBoundingClientRect()
                            .top +
                        window.scrollY -
                        navHeight -
                        20;


                    window.scrollTo({
                        top:
                            targetPosition,
                        behavior:
                            "smooth"
                    });

                }
            );

        });


    /* =====================================================
       KEYBOARD ACCESSIBILITY
    ===================================================== */

    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Escape"
            ) {

                if (appLinks) {

                    appLinks.classList.remove(
                        "mobile-open"
                    );

                }

                if (mobileMenu) {

                    mobileMenu.classList.remove(
                        "open"
                    );

                    mobileMenu.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                }

            }

        }
    );


    /* =====================================================
       RESIZE HANDLING
    ===================================================== */

    window.addEventListener(
        "resize",
        () => {

            if (
                window.innerWidth > 700 &&
                appLinks &&
                mobileMenu
            ) {

                appLinks.classList.remove(
                    "mobile-open"
                );

                mobileMenu.classList.remove(
                    "open"
                );

                mobileMenu.setAttribute(
                    "aria-expanded",
                    "false"
                );

            }

        }
    );


    /* =====================================================
       AUTOVERSE DEALER PAGE READY
    ===================================================== */

    console.log(
        "AutoVerse → Dealer Partnership page initialized"
    );

});