/* =========================================================
   AUTOVERSE — PLATFORM / ABOUT
========================================================= */

(() => {

    "use strict";


    /* =====================================================
       ELEMENTS
    ====================================================== */

    const body =
        document.body;

    const nav =
        document.getElementById("platformNav");

    const progress =
        document.getElementById("scrollProgress");

    const mobileMenu =
        document.getElementById("mobileMenu");

    const appLinks =
        document.querySelector(".app-links");


    /* =====================================================
       REDUCED MOTION
    ====================================================== */

    const reducedMotion =
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;


    /* =====================================================
       POINTER
    ====================================================== */

    const finePointer =
        window.matchMedia(
            "(pointer: fine)"
        ).matches;


    /* =====================================================
       NAVIGATION SCROLL STATE
    ====================================================== */

    const updateNavigation = () => {

        if (!nav) return;

        nav.classList.toggle(
            "scrolled",
            window.scrollY > 30
        );

    };


    /* =====================================================
       SCROLL PROGRESS
    ====================================================== */

    const updateScrollProgress = () => {

        if (!progress) return;

        const documentHeight =
            document.documentElement.scrollHeight -
            window.innerHeight;

        const percentage =
            documentHeight > 0
                ? (
                    window.scrollY /
                    documentHeight
                ) * 100
                : 0;

        progress.style.height =
            `${percentage}%`;

    };


    /* =====================================================
       SCROLL EVENT
    ====================================================== */

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
    ====================================================== */

    const revealElements =
        document.querySelectorAll(
            ".reveal"
        );


    if (reducedMotion) {

        revealElements.forEach(
            element => {

                element.classList.add(
                    "in"
                );

            }
        );

    } else {

        const revealObserver =
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
                    threshold: 0.12,

                    rootMargin:
                        "0px 0px -40px 0px"
                }
            );


        revealElements.forEach(
            element => {

                revealObserver.observe(
                    element
                );

            }
        );

    }


    /* =====================================================
       CUSTOM CURSOR
    ====================================================== */

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


            /* Mouse position */

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


            /* Ring animation */

            const animateCursor =
                () => {

                    ringX +=
                        (
                            mouseX -
                            ringX
                        ) * 0.18;

                    ringY +=
                        (
                            mouseY -
                            ringY
                        ) * 0.18;


                    cursorRing.style.left =
                        `${ringX}px`;

                    cursorRing.style.top =
                        `${ringY}px`;


                    requestAnimationFrame(
                        animateCursor
                    );

                };


            animateCursor();


            /* Hover */

            document.addEventListener(
                "pointerover",
                event => {

                    const target =
                        event.target.closest(
                            "a, button, .experience-card, .contact-card, .gold-btn"
                        );


                    if (target) {

                        body.classList.add(
                            "cursor-hover"
                        );

                    }

                }
            );


            document.addEventListener(
                "pointerout",
                event => {

                    const target =
                        event.target.closest(
                            "a, button, .experience-card, .contact-card, .gold-btn"
                        );


                    if (target) {

                        body.classList.remove(
                            "cursor-hover"
                        );

                    }

                }
            );


            /* Click */

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
       MOBILE NAVIGATION
    ====================================================== */

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


                mobileMenu.setAttribute(
                    "aria-expanded",
                    String(isOpen)
                );

            }
        );


        /* Close after navigation */

        document
            .querySelectorAll(
                ".app-links a"
            )
            .forEach(
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

                            mobileMenu.setAttribute(
                                "aria-expanded",
                                "false"
                            );

                        }
                    );

                }
            );

    }


    /* =====================================================
       CLOSE MENU OUTSIDE
    ====================================================== */

    document.addEventListener(
        "click",
        event => {

            if (
                !appLinks ||
                !mobileMenu
            ) {
                return;
            }


            const clickedInsideNav =
                event.target.closest(
                    ".platform-nav"
                );


            if (!clickedInsideNav) {

                mobileMenu.classList.remove(
                    "open"
                );

                appLinks.classList.remove(
                    "mobile-open"
                );

                mobileMenu.setAttribute(
                    "aria-expanded",
                    "false"
                );

            }

        }
    );


    /* =====================================================
       MAGNETIC MICRO MOTION
    ====================================================== */

    if (
        finePointer &&
        !reducedMotion
    ) {

        const magneticElements =
            document.querySelectorAll(
                ".magnetic, .experience-card, .contact-card, .gold-btn"
            );


        magneticElements.forEach(
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
                                "gold-btn"
                            )
                                ? 0.08
                                : element.classList.contains(
                                    "magnetic"
                                )
                                    ? 0.04
                                    : 0.025;


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

    }


    /* =====================================================
       SMOOTH INTERNAL LINKS
    ====================================================== */

    document
        .querySelectorAll(
            'a[href^="#"]'
        )
        .forEach(
            link => {

                link.addEventListener(
                    "click",
                    event => {

                        const targetId =
                            link.getAttribute(
                                "href"
                            );


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


                        target.scrollIntoView(
                            {
                                behavior:
                                    reducedMotion
                                        ? "auto"
                                        : "smooth",

                                block:
                                    "start"
                            }
                        );

                    }
                );

            }
        );


    /* =====================================================
       ESCAPE KEY
    ====================================================== */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key !== "Escape"
            ) {
                return;
            }


            if (
                mobileMenu &&
                appLinks
            ) {

                mobileMenu.classList.remove(
                    "open"
                );

                appLinks.classList.remove(
                    "mobile-open"
                );

                mobileMenu.setAttribute(
                    "aria-expanded",
                    "false"
                );

            }

        }
    );

})();