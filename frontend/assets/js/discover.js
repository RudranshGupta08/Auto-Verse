(async () => {
  const body = document.body;
  const nav = document.getElementById('appNav');
  const progress = document.getElementById('scrollProgress');
  const popularCars = document.getElementById('popularCars');
  const evCars = document.getElementById('evCars');
  const finder = document.getElementById('carFinder');
  const logoutBtn = document.getElementById('logoutBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const appLinks = document.querySelector('.app-links');

  const IMAGE_BASE = 'https://auto-verse-hcp5.onrender.com/images/';

  const escapeHTML = (value) => String(value ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  const priceValue = (car) => {
    if (Number.isFinite(Number(car.minPrice)) && Number(car.minPrice) > 0) return Number(car.minPrice);
    const match = String(car.priceRange || '').match(/\d+(?:\.\d+)?/);
    return match ? Number(match[0]) * 100000 : 0;
  };

  const firstImage = (car) => {
    const image = Array.isArray(car.images) && car.images.length ? car.images[0] : '';
    return image ? IMAGE_BASE + image : IMAGE_BASE + 'placeholder.jpg';
  };

  const renderVehicleCard = (car, index, tag = 'POPULAR') => {
    const name = `${escapeHTML(car.brand)} ${escapeHTML(car.model)}`;
    const type = escapeHTML(car.bodyType || car.type || 'AUTOMOBILE');
    const rating = Math.max(1, Math.min(5, Number(car.rating) || 3));
    return `
      <a class="vehicle-card magnetic reveal in" href="vehicle.html?id=${encodeURIComponent(car._id)}">
        <span class="vehicle-tag">${escapeHTML(tag)}</span>
        <div class="vehicle-image">
          <img loading="${index < 2 ? 'eager' : 'lazy'}" src="${firstImage(car)}" alt="${name}">
        </div>
        <div class="vehicle-meta">
          <span class="vehicle-brand">${escapeHTML(car.brand || 'AUTOVERSE')}</span>
          <h3>${escapeHTML(car.model || 'Unknown')}</h3>
          <div class="vehicle-price">${escapeHTML(car.priceRange || 'Price on request')}</div>
          <div class="vehicle-stats">
            <span>TYPE<b>${type}</b></span>
            <span>RATING<b>${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}</b></span>
            ${car.seatingCapacity ? `<span>SEATS<b>${escapeHTML(car.seatingCapacity)}</b></span>` : ''}
          </div>
        </div>
      </a>`;
  };

  const renderEVCard = (car) => {
    const name = `${escapeHTML(car.brand)} ${escapeHTML(car.model)}`;
    const range = car.range || car.mileage || 'EV';
    return `
      <a class="ev-card magnetic reveal in" href="vehicle.html?id=${encodeURIComponent(car._id)}">
        <img loading="lazy" src="${firstImage(car)}" alt="${name}">
        <div class="ev-card-body">
          <small>ELECTRIC</small>
          <strong>${escapeHTML(car.brand)} ${escapeHTML(car.model)}</strong>
          <span>${escapeHTML(range)}${String(range).toLowerCase().includes('km') ? '' : ' range'}</span>
        </div>
      </a>`;
  };

  // Guard: the discover page is part of the authenticated experience.
  try {
    const authResponse = await fetch(`${API_BASE_URL}/auth/me`, {
      credentials: 'include',
      headers: { Accept: 'application/json' },
      cache: 'no-store'
    });
    if (!authResponse.ok) {
      window.location.replace('index.html');
      return;
    }
  } catch {
    window.location.replace('index.html');
    return;
  }

  // Custom cursor — stays above every interactive surface.
  if (window.matchMedia('(pointer:fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    body.classList.add('cursor-ready');
    const dot = document.querySelector('.cursor-dot');
    const ring = document.querySelector('.cursor-ring');
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;

    addEventListener('pointermove', e => {
      mx = e.clientX; my = e.clientY;
      dot.style.left = `${mx}px`; dot.style.top = `${my}px`;
    }, { passive: true });

    const tick = () => {
      rx += (mx - rx) * .18; ry += (my - ry) * .18;
      ring.style.left = `${rx}px`; ring.style.top = `${ry}px`;
      requestAnimationFrame(tick);
    };
    tick();

    document.addEventListener('pointerover', e => {
      if (e.target.closest('a,button,select,.body-card,.vehicle-card,.ev-card,.knowledge-card')) body.classList.add('cursor-hover');
    });
    document.addEventListener('pointerout', e => {
      if (e.target.closest('a,button,select,.body-card,.vehicle-card,.ev-card,.knowledge-card')) body.classList.remove('cursor-hover');
    });
    document.addEventListener('pointerdown', () => body.classList.add('cursor-click'));
    document.addEventListener('pointerup', () => body.classList.remove('cursor-click'));
  }

  const updateScroll = () => {
    nav.classList.toggle('scrolled', scrollY > 30);
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.height = `${max > 0 ? (scrollY / max) * 100 : 0}%`;
  };
  addEventListener('scroll', updateScroll, { passive: true });
  updateScroll();

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: .12 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  // Animated welcome word emphasis.
  const arrivalWords = [...document.querySelectorAll('.arrival-words span')];
  if (arrivalWords.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let active = 0;
    setInterval(() => {
      arrivalWords.forEach((el, i) => {
        el.style.transition = 'color .8s ease, transform .8s ease';
        el.style.color = i === active ? 'rgba(214,168,79,.18)' : 'rgba(233,236,232,.045)';
        el.style.transform = i === active ? 'translateX(-8px)' : 'translateX(0)';
      });
      active = (active + 1) % arrivalWords.length;
    }, 1500);
  }

  // Load the existing AutoVerse database. Popularity is temporarily represented
  // by rating until the platform has search-event analytics.
  const loadCars = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/cars`);
      if (!response.ok) throw new Error(`Cars request failed: ${response.status}`);
      const cars = await response.json();

      const ranked = [...cars]
        .sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0) || priceValue(a) - priceValue(b))
        .slice(0, 8);

      popularCars.innerHTML = ranked.length
        ? ranked.map((car, i) => renderVehicleCard(car, i, i < 2 ? 'POPULAR' : 'EXPLORE')).join('')
        : '<div class="loading-state">No vehicles available<span>—</span></div>';

      const ev = cars.filter(car =>
        car.isEV === true ||
        (Array.isArray(car.fuelType) && car.fuelType.some(f => String(f).toLowerCase().includes('electric') || String(f).toLowerCase() === 'ev'))
      ).slice(0, 4);

      evCars.innerHTML = ev.length
        ? ev.map(renderEVCard).join('')
        : '<div class="loading-state">EV catalogue is being prepared<span>—</span></div>';

    } catch (error) {
      console.error('AutoVerse Discover:', error);
      popularCars.innerHTML = '<div class="loading-state">Unable to load vehicles right now<span>—</span></div>';
      evCars.innerHTML = '<div class="loading-state">Unable to load EVs right now<span>—</span></div>';
    }
  };

  loadCars();

  // Finder translates the user's choices into the existing search API's query language.
  finder.addEventListener('submit', e => {
    e.preventDefault();

    const type =
      document.getElementById('finderType').value.trim().toLowerCase();

    const budget =
      document.getElementById('finderBudget').value.trim();

    const fuel =
      document.getElementById('finderFuel').value.trim().toLowerCase();

    const purpose =
      document.getElementById('finderPurpose').value.trim().toLowerCase();

    const params = new URLSearchParams();

    if (type) params.set('type', type);
    if (budget) params.set('budget', budget);
    if (fuel) params.set('fuel', fuel);
    if (purpose) params.set('purpose', purpose);

    // If the user selected nothing, show the normal catalogue.
    if (!params.toString()) {
      params.set('query', 'cars');
    }

    window.location.href =
      `search.html?${params.toString()}`;
  });

  logoutBtn.addEventListener('click', async () => {
    try {
      const csrf = await fetch(`${API_BASE_URL}/auth/csrf`, {
        credentials: 'include', headers: { Accept: 'application/json' }, cache: 'no-store'
      });
      const csrfData = await csrf.json().catch(() => ({}));
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST', credentials: 'include',
        headers: { Accept: 'application/json', 'X-CSRF-Token': csrfData.csrfToken || '' }
      });
    } finally {
      window.location.replace('index.html');
    }
  });

  mobileMenu.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('open');
    appLinks.classList.toggle('mobile-open', open);
  });

  document.querySelectorAll('.app-links a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      appLinks.classList.remove('mobile-open');
    });
  });
})();
