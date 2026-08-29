(() => {

  "use strict";


  const body =
    document.body;

  const nav =
    document.getElementById("avNav");

  const progress =
    document.getElementById("scrollProgress");

  const cursorDot =
    document.querySelector(".cursor-dot");

  const cursorRing =
    document.querySelector(".cursor-ring");


  /* =========================================================
     CUSTOM CURSOR
  ========================================================= */

  let mouseX =
    window.innerWidth / 2;

  let mouseY =
    window.innerHeight / 2;

  let ringX =
    mouseX;

  let ringY =
    mouseY;


  if (
    cursorDot &&
    cursorRing &&
    window.matchMedia("(pointer:fine)").matches &&
    !window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
  ) {

    body.classList.add(
      "cursor-ready"
    );


    window.addEventListener(
      "pointermove",
      (event) => {

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
          (mouseX - ringX) * 0.18;

        ringY +=
          (mouseY - ringY) * 0.18;


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
      (event) => {

        if (
          event.target.closest(
            "a, button, input, .brand-track span, .principle"
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
      (event) => {

        if (
          event.target.closest(
            "a, button, input, .brand-track span, .principle"
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


  /* =========================================================
     NAV + SCROLL PROGRESS
  ========================================================= */

  const updateScrollUI =
    () => {

      if (nav) {

        nav.classList.toggle(
          "scrolled",
          window.scrollY > 30
        );

      }


      if (progress) {

        const max =
          document.documentElement
            .scrollHeight -
          window.innerHeight;


        progress.style.height =
          `${
            max > 0
              ? (
                  window.scrollY /
                  max
                ) * 100
              : 0
          }%`;

      }

    };


  window.addEventListener(
    "scroll",
    updateScrollUI,
    {
      passive: true
    }
  );


  updateScrollUI();


  /* =========================================================
     REVEAL ANIMATIONS
  ========================================================= */

  if (
    "IntersectionObserver" in window
  ) {

    const revealObserver =
      new IntersectionObserver(
        (entries) => {

          entries.forEach(
            (entry) => {

              if (
                entry.isIntersecting
              ) {

                entry.target.classList.add(
                  "in"
                );


                revealObserver.unobserve(
                  entry.target
                );

              }

            }
          );

        },
        {
          threshold: 0.12
        }
      );


    document
      .querySelectorAll(".reveal")
      .forEach(
        (element) => {

          revealObserver.observe(
            element
          );

        }
      );

  } else {

    document
      .querySelectorAll(".reveal")
      .forEach(
        (element) => {

          element.classList.add(
            "in"
          );

        }
      );

  }


  /* =========================================================
     PARALLAX
  ========================================================= */

  const parallaxTarget =
    document.querySelector(
      "[data-parallax]"
    );


  if (
    parallaxTarget &&
    !window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
  ) {

    window.addEventListener(
      "scroll",
      () => {

        const amount =
          Number(
            parallaxTarget.dataset
              .parallax || 0
          );


        const y =
          window.scrollY * amount;


        parallaxTarget.style.transform =
          `translate3d(0, ${y}px, 0)`;

      },
      {
        passive: true
      }
    );

  }


  /* =========================================================
     COUNTERS
  ========================================================= */

  if (
    "IntersectionObserver" in window
  ) {

    const counterObserver =
      new IntersectionObserver(
        (entries) => {

          entries.forEach(
            (entry) => {

              if (
                !entry.isIntersecting
              ) {
                return;
              }


              const element =
                entry.target;


              const target =
                Number(
                  element.dataset.count
                );


              const isDecimal =
                String(
                  element.dataset.count
                ).includes(".");


              const duration =
                1000;


              const start =
                performance.now();


              const tick =
                (now) => {

                  const progressValue =
                    Math.min(
                      (now - start) /
                      duration,
                      1
                    );


                  const eased =
                    1 -
                    Math.pow(
                      1 -
                      progressValue,
                      3
                    );


                  const value =
                    target * eased;


                  element.textContent =
                    isDecimal
                      ? value.toFixed(1)
                      : Math.round(value);


                  if (
                    progressValue < 1
                  ) {

                    requestAnimationFrame(
                      tick
                    );

                  }

                };


              requestAnimationFrame(
                tick
              );


              counterObserver.unobserve(
                element
              );

            }
          );

        },
        {
          threshold: 0.5
        }
      );


    document
      .querySelectorAll(
        "[data-count]"
      )
      .forEach(
        (element) => {

          counterObserver.observe(
            element
          );

        }
      );

  }


  /* =========================================================
     MAGNETIC BUTTON EFFECT
  ========================================================= */

  const magneticElements =
    document.querySelectorAll(
      ".magnetic"
    );


  if (
    window.matchMedia("(pointer:fine)")
      .matches &&
    !window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
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


  /* =========================================================
     MOBILE NAVIGATION
  ========================================================= */

  const menu =
    document.querySelector(
      ".mobile-menu"
    );


  const links =
    document.querySelector(
      ".av-links"
    );


  if (
    menu &&
    links
  ) {

    menu.addEventListener(
      "click",
      () => {

        const open =
          menu.classList.toggle(
            "open"
          );


        links.classList.toggle(
          "mobile-open",
          open
        );

      }
    );


    document
      .querySelectorAll(
        ".av-links a"
      )
      .forEach(
        (link) => {

          link.addEventListener(
            "click",
            () => {

              menu.classList.remove(
                "open"
              );


              links.classList.remove(
                "mobile-open"
              );

            }
          );

        }
      );

  }


  /* =========================================================
     SMOOTH ANCHOR SCROLL
  ========================================================= */

  document
    .querySelectorAll(
      'a[href^="#"]'
    )
    .forEach(
      (link) => {

        link.addEventListener(
          "click",
          (event) => {

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


            target.scrollIntoView({
              behavior: "smooth",
              block: "start"
            });

          }
        );

      }
    );

})();