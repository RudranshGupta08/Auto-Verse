(() => {

  "use strict";


  /* =========================================================
     ELEMENTS
  ========================================================= */

  const form = document.getElementById("authForm");

  const usernameInput =
    document.getElementById("username");

  const passwordInput =
    document.getElementById("password");

  const loginTab =
    document.getElementById("loginTab");

  const signupTab =
    document.getElementById("signupTab");

  const authTitle =
    document.getElementById("authTitle");

  const authDescription =
    document.getElementById("authDescription");

  const submitButton =
    document.getElementById("authSubmit");

  const submitText =
    document.getElementById("submitText");

  const authMessage =
    document.getElementById("authMessage");

  const footerText =
    document.getElementById("authFooterText");

  const footerSwitch =
    document.getElementById("footerSwitch");

  const passwordToggle =
    document.getElementById("passwordToggle");


  /* =========================================================
     AUTH MODE
  ========================================================= */

  let authMode = "login";


  /* =========================================================
     UPDATE AUTH UI
  ========================================================= */

  function updateAuthUI() {

    const isLogin =
      authMode === "login";


    loginTab.classList.toggle(
      "active",
      isLogin
    );


    signupTab.classList.toggle(
      "active",
      !isLogin
    );


    if (isLogin) {

      authTitle.innerHTML =
        "Welcome<br><em>back.</em>";


      authDescription.textContent =
        "Sign in to continue into the AutoVerse automotive intelligence platform.";


      submitText.textContent =
        "Sign In";


      footerText.childNodes[0].textContent =
        "New to AutoVerse? ";


      footerSwitch.textContent =
        "Create an account";

    } else {

      authTitle.innerHTML =
        "Enter the<br><em>Verse.</em>";


      authDescription.textContent =
        "Create your AutoVerse account and unlock the full automotive intelligence experience.";


      submitText.textContent =
        "Create Account";


      footerText.childNodes[0].textContent =
        "Already have an account? ";


      footerSwitch.textContent =
        "Sign in";

    }


    clearMessage();

    usernameInput.focus();

  }


  /* =========================================================
     MODE SWITCH
  ========================================================= */

  function setMode(mode) {

    authMode =
      mode === "signup"
        ? "signup"
        : "login";

    updateAuthUI();

  }


  loginTab.addEventListener(
    "click",
    () => setMode("login")
  );


  signupTab.addEventListener(
    "click",
    () => setMode("signup")
  );


  footerSwitch.addEventListener(
    "click",
    () => {

      setMode(
        authMode === "login"
          ? "signup"
          : "login"
      );

    }
  );


  /* =========================================================
     PASSWORD VISIBILITY
  ========================================================= */

  passwordToggle.addEventListener(
    "click",
    () => {

      const isPassword =
        passwordInput.type === "password";


      passwordInput.type =
        isPassword
          ? "text"
          : "password";


      passwordToggle.textContent =
        isPassword
          ? "HIDE"
          : "SHOW";


      passwordToggle.setAttribute(
        "aria-label",
        isPassword
          ? "Hide password"
          : "Show password"
      );

    }
  );


  /* =========================================================
     MESSAGE
  ========================================================= */

  function clearMessage() {

    authMessage.textContent = "";

    authMessage.classList.remove(
      "success"
    );

  }


  function showError(message) {

    authMessage.textContent =
      message;

    authMessage.classList.remove(
      "success"
    );

  }


  function showSuccess(message) {

    authMessage.textContent =
      message;

    authMessage.classList.add(
      "success"
    );

  }


  /* =========================================================
     SUBMIT
  ========================================================= */

  form.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();


      clearMessage();


      const username =
        usernameInput.value.trim();


      const password =
        passwordInput.value;


      /* ---------------------------------------------
         BASIC VALIDATION
      --------------------------------------------- */

      if (!username || !password) {

        showError(
          "Please enter your username and password."
        );

        return;

      }


      if (username.length < 3) {

        showError(
          "Username must contain at least 3 characters."
        );

        return;

      }


      if (password.length < 6) {

        showError(
          "Password must contain at least 6 characters."
        );

        return;

      }


      /* ---------------------------------------------
         API ENDPOINT
      --------------------------------------------- */

      const endpoint =
        authMode === "login"
          ? `${API_BASE_URL}/auth/login`
          : `${API_BASE_URL}/auth/signup`;


      /* ---------------------------------------------
         LOADING STATE
      --------------------------------------------- */

      submitButton.disabled = true;

      submitText.textContent =
        authMode === "login"
          ? "Signing In..."
          : "Creating Account...";


      try {

        const response =
          await fetch(
            endpoint,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json"
              },

              body: JSON.stringify({
                username,
                password
              })
            }
          );


        let data = {};

        try {

          data =
            await response.json();

        } catch {

          data = {};

        }


        /* ---------------------------------------------
           SERVER ERROR
        --------------------------------------------- */

        if (!response.ok) {

          throw new Error(
            data.message ||
            (
              authMode === "login"
                ? "Login failed."
                : "Unable to create account."
            )
          );

        }


        /* =================================================
           LOGIN SUCCESS
        ================================================= */

        if (authMode === "login") {

          if (!data.token) {

            throw new Error(
              "Login succeeded but no authentication token was received."
            );

          }


          localStorage.setItem(
            "token",
            data.token
          );


          if (data.user) {

            localStorage.setItem(
              "user",
              JSON.stringify(data.user)
            );

          }


          showSuccess(
            "Login successful. Entering AutoVerse..."
          );


          setTimeout(
            () => {

              window.location.href =
                "discover.html";

            },
            700
          );


          return;

        }


        /* =================================================
           SIGNUP SUCCESS
        ================================================= */

        showSuccess(
          data.message ||
          "Account created successfully. Please sign in."
        );


        passwordInput.value = "";


        /*
         * Automatically switch back to Login
         * after successful account creation.
         */

        setTimeout(
          () => {

            setMode("login");

            usernameInput.value =
              username;

            passwordInput.focus();

            showSuccess(
              "Account created. Sign in to continue."
            );

          },
          900
        );


      } catch (error) {

        console.error(
          "AutoVerse authentication error:",
          error
        );


        showError(
          error.message ||
          "Unable to connect to AutoVerse. Please try again."
        );

      } finally {

        submitButton.disabled =
          false;


        if (
          authMode === "login"
        ) {

          submitText.textContent =
            "Sign In";

        } else {

          submitText.textContent =
            "Create Account";

        }

      }

    }
  );


  /* =========================================================
     URL MODE
     
     login.html
        → Login

     login.html?mode=signup
        → Signup
  ========================================================= */

  const params =
    new URLSearchParams(
      window.location.search
    );


  if (
    params.get("mode") === "signup"
  ) {

    setMode("signup");

  } else {

    setMode("login");

  }


})();