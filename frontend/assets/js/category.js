(async () => {
  const body = document.body, nav = document.getElementById('appNav'), progress = document.getElementById('scrollProgress');
  const grid = document.getElementById('vehicleGrid'), count = document.getElementById('vehicleCount'), sort = document.getElementById('sortCars');
  const type = (document.body.dataset.type || '').toLowerCase();
  const IMAGE_BASE = 'https://auto-verse-hcp5.onrender.com/images/';
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]));
  const arr = v => Array.isArray(v) ? v : (v ? [v] : []);
  const image = c => Array.isArray(c.images) && c.images[0] ? IMAGE_BASE + c.images[0] : '';
  const value = c => { const m = String(c.priceRange || '').match(/\d+(?:\.\d+)?/); return m ? Number(m[0]) : 99999 };

  try {
    const authResponse = await fetch(`${API_BASE_URL}/auth/me`, { credentials: 'include', headers: { Accept: 'application/json' }, cache: 'no-store' });
    if (!authResponse.ok) { location.replace('index.html'); return }
  } catch { location.replace('index.html'); return }

  if (matchMedia('(pointer:fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const dot = document.querySelector('.cursor-dot'), ring = document.querySelector('.cursor-ring');
    if (dot && ring) {
      body.classList.add('cursor-ready'); let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
      addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; dot.style.left = mx + 'px'; dot.style.top = my + 'px' }, { passive: true });
      const tick = () => { if (!ring.isConnected) return; rx += (mx - rx) * .18; ry += (my - ry) * .18; ring.style.left = rx + 'px'; ring.style.top = ry + 'px'; requestAnimationFrame(tick) }; tick();
      document.addEventListener('pointerover', e => { if (e.target.closest?.('a,button,.vehicle-card')) body.classList.add('cursor-hover') });
      document.addEventListener('pointerout', e => { if (e.target.closest?.('a,button,.vehicle-card')) body.classList.remove('cursor-hover') });
    }
  }

  const scrollUI = () => { nav.classList.toggle('scrolled', scrollY > 30); const max = document.documentElement.scrollHeight - innerHeight; progress.style.height = (max > 0 ? scrollY / max * 100 : 0) + '%' };
  addEventListener('scroll', scrollUI, { passive: true }); scrollUI();

  const observer = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); observer.unobserve(e.target) } }), { threshold: .12 });
  document.querySelectorAll('.reveal').forEach(x => observer.observe(x));

  const render = cars => {
    count.textContent = `${cars.length} VEHICLE${cars.length === 1 ? '' : 'S'}`;
    if (!cars.length) { grid.innerHTML = '<div class="loading-state">No vehicles found in this category<span>—</span></div>'; return }
    grid.innerHTML = cars.map((c, i) => `
      <a class="vehicle-card reveal in" href="vehicle.html?id=${encodeURIComponent(c._id)}">
        <span class="vehicle-tag">${i < 3 ? 'FEATURED' : 'EXPLORE'}</span>
        <div class="vehicle-image">${image(c) ? `<img src="${esc(image(c))}" alt="${esc(c.brand)} ${esc(c.model)}" loading="${i < 3 ? 'eager' : 'lazy'}">` : ''}</div>
        <div class="vehicle-info">
          <small>${esc(c.brand || 'AUTOVERSE')}</small>
          <h3>${esc(c.model || 'Vehicle')}</h3>
          <div class="vehicle-price">${esc(c.priceRange || 'Price on request')}</div>
          <div class="vehicle-stats">
            <span>FUEL<b>${esc(arr(c.fuelType).join(' · ') || '—')}</b></span>
            <span>MILEAGE<b>${esc(c.mileage || '—')}</b></span>
            <span>TRANSMISSION<b>${esc(arr(c.transmission).join(' · ') || '—')}</b></span>
            <span>RATING<b>${esc(c.rating ? c.rating + '/5' : '—')}</b></span>
          </div>
        </div>
      </a>`).join('');
  };

  let all = [];
  fetch(`${API_BASE_URL}/cars`).then(r => { if (!r.ok) throw new Error('Cars request failed'); return r.json() })
    .then(cars => {
      all = cars.filter(c => String(c.type || c.bodyType || '').toLowerCase() === type);
      render(all);
    })
    .catch(e => { console.error(e); grid.innerHTML = '<div class="loading-state">Unable to load vehicles right now<span>—</span></div>' });

  sort.addEventListener('change', () => {
    const cars = [...all];
    if (sort.value === 'price-low') cars.sort((a, b) => value(a) - value(b));
    if (sort.value === 'price-high') cars.sort((a, b) => value(b) - value(a));
    if (sort.value === 'rating') cars.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
    render(cars);
  });

  document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
      const csrf = await fetch(`${API_BASE_URL}/auth/csrf`, { credentials: 'include', headers: { Accept: 'application/json' }, cache: 'no-store' });
      const data = await csrf.json().catch(() => ({}));
      await fetch(`${API_BASE_URL}/auth/logout`, { method: 'POST', credentials: 'include', headers: { Accept: 'application/json', 'X-CSRF-Token': data.csrfToken || '' } });
    } finally { location.replace('index.html'); }
  });
  document.getElementById('mobileMenu').addEventListener('click', () => document.querySelector('.app-links').classList.toggle('mobile-open'));
})();
