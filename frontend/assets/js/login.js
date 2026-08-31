(() => {

  "use strict";

  /* =========================================================
     ELEMENTS
  ========================================================= */

  const form =
    document.getElementById("authForm");

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
     API
  ========================================================= */

  const API =
    typeof API_BASE_URL !== "undefined"
      ? String(API_BASE_URL).replace(/\/+$/, "")
      : "http://localhost:5000/api";

  /* =========================================================
     STATE
  ========================================================= */

  let authMode = "login";
  let csrfToken = null;

  /* =========================================================
     CSRF
  ========================================================= */

  async function ensureCsrfToken() {

    if (csrfToken) {
      return csrfToken;
    }

    try {

      const response =
        await fetch(
          `${API}/auth/csrf`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              Accept: "application/json"
            }
          }
        );

      if (!response.ok) {

        console.warn(
          "CSRF request failed:",
          response.status
        );

        return null;
      }

      const data =
        await response.json();

      csrfToken =
        data.csrfToken ||
        data.token ||
        null;

      return csrfToken;

    } catch (error) {

      console.warn(
        "CSRF initialization failed:",
        error
      );

      return null;
    }
  }

  /* =========================================================
     API REQUEST
  ========================================================= */

  async function apiRequest(
    endpoint,
    options = {}
  ) {

    const headers = {
      Accept:
        "application/json",
      ...(options.headers || {})
    };

    if (
      options.body &&
      !(options.body instanceof FormData)
    ) {

      headers["Content-Type"] =
        "application/json";
    }

    if (csrfToken) {

      headers["X-CSRF-Token"] =
        csrfToken;
    }

    return fetch(
      `${API}${endpoint}`,
      {
        ...options,

        credentials:
          "include",

        headers
      }
    );
  }

  /* =========================================================
     UI
  ========================================================= */

  function clearMessage() {

    if (!authMessage) {
      return;
    }

    authMessage.textContent = "";

    authMessage.classList.remove(
      "success"
    );
  }

  function showError(message) {

    if (!authMessage) {
      return;
    }

    authMessage.textContent =
      message;

    authMessage.classList.remove(
      "success"
    );
  }

  function showSuccess(message) {

    if (!authMessage) {
      return;
    }

    authMessage.textContent =
      message;

    authMessage.classList.add(
      "success"
    );
  }

  function updateAuthUI() {

    const isLogin =
      authMode === "login";

    loginTab?.classList.toggle(
      "active",
      isLogin
    );

    signupTab?.classList.toggle(
      "active",
      !isLogin
    );

    if (isLogin) {

      if (authTitle) {

        authTitle.innerHTML =
          "Welcome<br><em>back.</em>";
      }

      if (authDescription) {

        authDescription.textContent =
          "Sign in to continue into the AutoVerse automotive intelligence platform.";
      }

      if (submitText) {

        submitText.textContent =
          "Sign In";
      }

      if (footerText?.firstChild) {

        footerText.firstChild.textContent =
          "New to AutoVerse? ";
      }

      if (footerSwitch) {

        footerSwitch.textContent =
          "Create an account";
      }

    } else {

      if (authTitle) {

        authTitle.innerHTML =
          "Enter the<br><em>Verse.</em>";
      }

      if (authDescription) {

        authDescription.textContent =
          "Create your AutoVerse account and unlock the full automotive intelligence experience.";
      }

      if (submitText) {

        submitText.textContent =
          "Create Account";
      }

      if (footerText?.firstChild) {

        footerText.firstChild.textContent =
          "Already have an account? ";
      }

      if (footerSwitch) {

        footerSwitch.textContent =
          "Sign in";
      }
    }

    clearMessage();
  }

  function setMode(mode) {

    authMode =
      mode === "signup"
        ? "signup"
        : "login";

    updateAuthUI();

    usernameInput?.focus();
  }

  /* =========================================================
     MODE EVENTS
  ========================================================= */

  loginTab?.addEventListener(
    "click",
    () => setMode("login")
  );

  signupTab?.addEventListener(
    "click",
    () => setMode("signup")
  );

  footerSwitch?.addEventListener(
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

  passwordToggle?.addEventListener(
    "click",
    () => {

      if (!passwordInput) {
        return;
      }

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
     GET CURRENT USER
  ========================================================= */

  async function getCurrentUser() {

    const response =
      await apiRequest(
        "/auth/me",
        {
          method: "GET"
        }
      );

    let data = {};

    try {

      data =
        await response.json();

    } catch {

      data = {};
    }

    console.log(
      "Auth /me response:",
      response.status,
      data
    );

    if (!response.ok) {

      throw new Error(
        data.message ||
        "Unable to verify authentication session."
      );
    }

    if (
      !data.success ||
      !data.user
    ) {

      throw new Error(
        "Authentication session could not be verified."
      );
    }

    return data.user;
  }

  /* =========================================================
     ADMIN VERIFICATION
  ========================================================= */

  async function verifyAdmin() {

    try {

      const response =
        await apiRequest(
          "/admin/dashboard",
          {
            method: "GET"
          }
        );

      console.log(
        "Admin verification:",
        response.status
      );

      return response.ok;

    } catch (error) {

      console.error(
        "Admin verification error:",
        error
      );

      return false;
    }
  }

  /* =========================================================
     STORE USER
  ========================================================= */

  function storeUser(user) {

    try {

      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );

    } catch (error) {

      console.warn(
        "Unable to store user:",
        error
      );
    }
  }

  /* =========================================================
     REDIRECT
  ========================================================= */

  async function redirectAfterLogin() {

    console.log(
      "Login successful. Verifying session..."
    );

    /*
     * The JWT is inside the HttpOnly cookie.
     *
     * We deliberately do NOT look for data.token.
     */

    const user =
      await getCurrentUser();

    console.log(
      "Authenticated user:",
      user
    );

    storeUser(user);

    const role =
      String(
        user.role || "user"
      ).toLowerCase();

    console.log(
      "Authenticated role:",
      role
    );

    /* -------------------------------------------------------
       ADMIN
    ------------------------------------------------------- */

    if (role === "admin") {

      const isAdmin =
        await verifyAdmin();

      if (!isAdmin) {

        throw new Error(
          "Administrator session could not be verified."
        );
      }

      showSuccess(
        "Administrator authenticated. Opening secure console..."
      );

      setTimeout(
        () => {

          window.location.replace(
            "admin.html"
          );

        },
        500
      );

      return;
    }

    /* -------------------------------------------------------
       NORMAL USER
    ------------------------------------------------------- */

    showSuccess(
      "Login successful. Entering AutoVerse..."
    );

    setTimeout(
      () => {

        window.location.replace(
          "discover.html"
        );

      },
      500
    );
  }

  /* =========================================================
     SUBMIT
  ========================================================= */

  form?.addEventListener(
    "submit",
    async event => {

      event.preventDefault();

      clearMessage();

      const username =
        usernameInput?.value?.trim() || "";

      const password =
        passwordInput?.value || "";

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

      const endpoint =
        authMode === "login"
          ? "/auth/login"
          : "/auth/signup";

      if (submitButton) {

        submitButton.disabled =
          true;
      }

      if (submitText) {

        submitText.textContent =
          authMode === "login"
            ? "Signing In..."
            : "Creating Account...";
      }

      try {

        /* ---------------------------------------------------
           CSRF
        --------------------------------------------------- */

        await ensureCsrfToken();

        /* ---------------------------------------------------
           REQUEST
        --------------------------------------------------- */

        const response =
          await apiRequest(
            endpoint,
            {
              method: "POST",

              body:
                JSON.stringify({
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

        console.log(
          "Authentication response:",
          response.status,
          data
        );

        /* ---------------------------------------------------
           ERROR
        --------------------------------------------------- */

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

        /* ===================================================
           LOGIN
        =================================================== */

        if (
          authMode === "login"
        ) {

          /*
           * IMPORTANT:
           *
           * Backend does NOT return JWT.
           *
           * Browser has received:
           *
           * autoverse_session=JWT
           *
           * as HttpOnly cookie.
           *
           * Now verify that cookie using /auth/me.
           */

          await redirectAfterLogin();

          return;
        }

        /* ===================================================
           SIGNUP
        =================================================== */

        showSuccess(
          data.message ||
          "Account created successfully. Please sign in."
        );

        if (passwordInput) {

          passwordInput.value = "";
        }

        setTimeout(
          () => {

            setMode("login");

            if (usernameInput) {

              usernameInput.value =
                username;
            }

            passwordInput?.focus();

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

        if (
          authMode === "login"
        ) {

          localStorage.removeItem(
            "user"
          );
        }

        showError(
          error.message ||
          "Unable to connect to AutoVerse. Please try again."
        );

      } finally {

        if (submitButton) {

          submitButton.disabled =
            false;
        }

        if (submitText) {

          submitText.textContent =
            authMode === "login"
              ? "Sign In"
              : "Create Account";
        }
      }
    }
  );

  /* =========================================================
     URL MODE
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