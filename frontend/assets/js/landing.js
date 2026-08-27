(() => {
  const body = document.body;
  const nav = document.getElementById('avNav');
  const progress = document.getElementById('scrollProgress');
  const authModal = document.getElementById('authModal');
  const authForm = document.getElementById('authForm');
  const authTitle = document.getElementById('authTitle');
  const authCopy = document.getElementById('authCopy');
  const authSubmitText = document.getElementById('authSubmitText');
  const authError = document.getElementById('authError');
  const username = document.getElementById('authUsername');
  const password = document.getElementById('authPassword');
  const tabs = document.querySelectorAll('.auth-tab');
  const cursorDot = document.querySelector('.cursor-dot');
  const cursorRing = document.querySelector('.cursor-ring');

  let authMode = 'signup';
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;

  // ---------------- CURSOR ----------------
  if (window.matchMedia('(pointer:fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    body.classList.add('cursor-ready');

    window.addEventListener('pointermove', (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;
    }, { passive: true });

    const animateCursor = () => {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      cursorRing.style.left = `${ringX}px`;
      cursorRing.style.top = `${ringY}px`;
      requestAnimationFrame(animateCursor);
    };
    animateCursor();

    document.addEventListener('pointerover', (event) => {
      if (event.target.closest('a, button, input, .brand-track span, .principle')) {
        body.classList.add('cursor-hover');
      }
    });

    document.addEventListener('pointerout', (event) => {
      if (event.target.closest('a, button, input, .brand-track span, .principle')) {
        body.classList.remove('cursor-hover');
      }
    });

    document.addEventListener('pointerdown', () => body.classList.add('cursor-click'));
    document.addEventListener('pointerup', () => body.classList.remove('cursor-click'));
  }

  // ---------------- NAV + PROGRESS ----------------
  const updateScrollUI = () => {
    nav.classList.toggle('scrolled', window.scrollY > 30);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.height = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
  };
  window.addEventListener('scroll', updateScrollUI, { passive: true });
  updateScrollUI();

  // ---------------- REVEALS ----------------
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

  // ---------------- PARALLAX ----------------
  const parallaxTarget = document.querySelector('[data-parallax]');
  if (parallaxTarget && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY * Number(parallaxTarget.dataset.parallax || 0);
      parallaxTarget.style.transform = `translate3d(0, ${y}px, 0)`;
    }, { passive: true });
  }

  // ---------------- COUNTERS ----------------
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = Number(el.dataset.count);
      const isDecimal = String(target).includes('.');
      const duration = 1000;
      const start = performance.now();

      const tick = (now) => {
        const progressValue = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progressValue, 3);
        const value = target * eased;
        el.textContent = isDecimal ? value.toFixed(1) : Math.round(value);
        if (progressValue < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      counterObserver.unobserve(el);
    });
  }, { threshold: .5 });

  document.querySelectorAll('[data-count]').forEach((el) => counterObserver.observe(el));

  // ---------------- AUTH ----------------
  const openAuth = (mode = 'signup') => {
    authMode = mode;
    updateAuthCopy();
    authModal.classList.add('open');
    authModal.setAttribute('aria-hidden', 'false');
    body.classList.add('auth-open');
    document.documentElement.style.overflow = 'hidden';
    setTimeout(() => username.focus(), 350);
  };

  const closeAuth = () => {
    authModal.classList.remove('open');
    authModal.setAttribute('aria-hidden', 'true');
    body.classList.remove('auth-open', 'cursor-hover');
    document.documentElement.style.overflow = '';
    authError.textContent = '';
    authForm.reset();
  };

  const updateAuthCopy = () => {
    const signup = authMode === 'signup';
    authTitle.innerHTML = signup ? 'Enter the<br><em>Verse.</em>' : 'Welcome<br><em>back.</em>';
    authCopy.textContent = signup
      ? 'Create your AutoVerse account and enter the automotive intelligence platform.'
      : 'Sign in to continue into the AutoVerse automotive intelligence platform.';
    authSubmitText.textContent = signup ? 'Create account' : 'Continue';
    tabs.forEach((tab) => tab.classList.toggle('active', tab.dataset.mode === authMode));
  };

  document.querySelectorAll('[data-auth]').forEach((button) => {
    button.addEventListener('click', () => openAuth(button.dataset.auth));
  });

  document.querySelector('.auth-close').addEventListener('click', closeAuth);
  authModal.addEventListener('click', (event) => {
    if (event.target === authModal) closeAuth();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && authModal.classList.contains('open')) closeAuth();
  });

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      authMode = tab.dataset.mode;
      updateAuthCopy();
      authError.textContent = '';
      password.focus();
    });
  });

  authForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    authError.textContent = '';

    const user = username.value.trim();
    const pass = password.value;

    if (!user || !pass) {
      authError.textContent = 'Please enter your username and password.';
      return;
    }

    const endpoint = authMode === 'signup'
      ? `${API_BASE_URL}/auth/signup`
      : `${API_BASE_URL}/auth/login`;

    const submitButton = authForm.querySelector('.auth-submit');
    submitButton.disabled = true;
    submitButton.style.opacity = '.6';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, password: pass })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || (authMode === 'signup' ? 'Signup failed.' : 'Login failed.'));
      }

      if (authMode === 'signup') {
        authMode = 'login';
        updateAuthCopy();
        authError.style.color = '#8fb69c';
        authError.textContent = 'Account created. Sign in to continue.';
        password.value = '';
        password.focus();
      } else {
        if (data.token) localStorage.setItem('token', data.token);
        window.location.href = 'discover.html';
      }
    } catch (error) {
      console.error('AutoVerse authentication error:', error);
      authError.style.color = '#d78a72';
      authError.textContent = error.message || 'Unable to connect to AutoVerse.';
    } finally {
      submitButton.disabled = false;
      submitButton.style.opacity = '1';
    }
  });

  // ---------------- MOBILE NAV ----------------
  const menu = document.querySelector('.mobile-menu');
  const links = document.querySelector('.av-links');

  menu.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    links.classList.toggle('mobile-open', open);
  });

  document.querySelectorAll('.av-links a').forEach((link) => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      links.classList.remove('mobile-open');
    });
  });
})();
