(() => {
  const body = document.body;
  const nav = document.getElementById('appNav');
  const progress = document.getElementById('scrollProgress');
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  const IMAGE_BASE = 'https://auto-verse-hcp5.onrender.com/images/';

  if (!localStorage.getItem('token')) {
    location.replace('index.html');
    return;
  }

  const $ = (id) => document.getElementById(id);
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const arr = (v) => Array.isArray(v) ? v : (v ? [v] : []);
  const imageUrl = (path) => path ? IMAGE_BASE + path : '';

  if (!id) {
    location.replace('carAll.html');
    return;
  }


  // Premium cursor — defensive implementation.
  // If the cursor elements are unavailable, the rest of the vehicle page continues normally.
  const initPremiumCursor = () => {
    const dot = document.querySelector('.cursor-dot');
    const ring = document.querySelector('.cursor-ring');

    if (!dot || !ring || !window.matchMedia('(pointer:fine)').matches ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    document.body.classList.add('cursor-ready');

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let rafId = null;

    const onPointerMove = (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;

      // Guard against DOM changes/removal.
      if (dot && dot.isConnected) {
        dot.style.left = `${mouseX}px`;
        dot.style.top = `${mouseY}px`;
      }
    };

    const animate = () => {
      if (!dot?.isConnected || !ring?.isConnected) {
        cancelAnimationFrame(rafId);
        return;
      }

      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;

      ring.style.left = `${ringX}px`;
      ring.style.top = `${ringY}px`;

      rafId = requestAnimationFrame(animate);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    animate();

    document.addEventListener('pointerover', (event) => {
      if (event.target?.closest?.('a, button, .gallery-thumb')) {
        document.body.classList.add('cursor-hover');
      }
    });

    document.addEventListener('pointerout', (event) => {
      if (event.target?.closest?.('a, button, .gallery-thumb')) {
        document.body.classList.remove('cursor-hover');
      }
    });
  };

  initPremiumCursor();

  const updateScroll=()=>{nav.classList.toggle('scrolled',scrollY>30);const max=document.documentElement.scrollHeight-innerHeight;progress.style.height=(max>0?scrollY/max*100:0)+'%'};
  addEventListener('scroll',updateScroll,{passive:true});updateScroll();

  const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');observer.unobserve(e.target)}}),{threshold:.12});
  document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));

  const setText=(el,value,fallback='—')=>{el.textContent=(value===undefined||value===null||value==='')?fallback:value};
  const list=(el,values,empty='Information not available yet.')=>{
    el.innerHTML=arr(values).filter(Boolean).map(v=>`<li>${esc(v)}</li>`).join('') || `<li>${esc(empty)}</li>`;
  };

  const render = (car) => {
    const name = `${car.brand || ''} ${car.model || ''}`.trim();
    document.title = `${name || 'Vehicle'} | AutoVerse`;
    setText($('vehicleBrand'), car.brand?.toUpperCase(), 'AUTOVERSE');
    $('vehicleName').innerHTML = `${esc(car.model || 'Vehicle')}<br><em>${esc(car.type || 'INTELLIGENCE')}</em>`;
    setText($('vehicleType'), car.type, 'AUTOMOBILE');
    setText($('price'), car.priceRange);
    setText($('engine'), arr(car.engineOptions).join(' · '));
    setText($('mileage'), car.mileage);
    setText($('fuel'), arr(car.fuelType).join(' · '));
    setText($('transmission'), arr(car.transmission).join(' · '));
    setText($('seating'), car.seatingCapacity ? `${car.seatingCapacity} seats` : '');
    setText($('description'), car.description, 'AutoVerse is still building this vehicle profile.');
    setText($('rating'), car.rating ? `${car.rating} / 5` : '');
    setText($('ncap'), car.ncapRating || 'Not listed');

    list($('bestFor'), arr(car.bestFor).map(v=>`<span>${esc(v)}</span>`), '');
    if (!$('bestFor').children.length) $('bestFor').innerHTML='<span>Not listed</span>';

    const rows = [
      ['Brand', car.brand],['Model',car.model],['Body type',car.type],
      ['Price range',car.priceRange],['Engine options',arr(car.engineOptions).join(' · ')],
      ['Mileage',car.mileage],['Fuel type',arr(car.fuelType).join(' · ')],
      ['Transmission',arr(car.transmission).join(' · ')],
      ['Seating capacity',car.seatingCapacity ? `${car.seatingCapacity} seats` : ''],
      ['Safety rating',car.ncapRating],['AutoVerse rating',car.rating ? `${car.rating}/5` : '']
    ];
    $('specTable').innerHTML = rows.map(([k,v])=>`<div class="spec-row"><span>${esc(k).toUpperCase()}</span><strong>${esc(v || 'Not listed')}</strong></div>`).join('');

    const features=arr(car.features);
    $('featureGrid').innerHTML=features.length
      ? features.map((v,i)=>`<div class="feature-item"><span>${String(i+1).padStart(2,'0')}</span><strong>${esc(v)}</strong></div>`).join('')
      : '<div class="feature-item"><strong>Feature information not added yet.</strong></div>';

    list($('prosList'),car.pros,'Pros not added yet.');
    list($('consList'),car.cons,'Cons not added yet.');
    setText($('verdictText'),car.verdict,'The AutoVerse verdict will appear when this vehicle profile has been fully reviewed.');

    const images=arr(car.images).filter(Boolean);
    if(images.length){
      $('heroImage').src=imageUrl(images[0]);
      $('galleryMain').src=imageUrl(images[0]);
      $('imageCount').textContent=String(images.length).padStart(2,'0');
      $('galleryThumbs').innerHTML=images.map((img,i)=>`
        <button class="gallery-thumb ${i===0?'active':''}" data-index="${i}" data-src="${esc(imageUrl(img))}" type="button">
          <img src="${esc(imageUrl(img))}" alt="${esc(name)} view ${i+1}" loading="${i?'lazy':'eager'}">
        </button>`).join('');
      document.querySelectorAll('.gallery-thumb').forEach(btn=>{
        btn.addEventListener('click',()=>{
          document.querySelectorAll('.gallery-thumb').forEach(x=>x.classList.remove('active'));
          btn.classList.add('active');
          const main=$('galleryMain');
          main.style.opacity='.35';
          setTimeout(()=>{main.src=btn.dataset.src;main.style.opacity='1';$('galleryCaption').textContent=`${String(Number(btn.dataset.index)+1).padStart(2,'0')} / EXTERIOR`},140);
        });
      });
    } else {
      $('heroImage').style.display='none';
      $('gallerySection').style.display='none';
      $('imageCount').textContent='—';
    }

    $('compareLink').href=`compare.html?id=${encodeURIComponent(car._id || id)}`;
  };

  fetch(`${API_BASE_URL}/cars/${encodeURIComponent(id)}`)
    .then(res=>{if(!res.ok)throw new Error('Vehicle not found');return res.json()})
    .then(render)
    .catch(err=>{
      console.error(err);
      $('vehicleName').innerHTML='Vehicle<br><em>not found.</em>';
      $('description').textContent='We could not load this vehicle profile right now.';
    });

  $('saveBtn').addEventListener('click',()=>{
    const key='autoverse_saved_cars';
    const saved=JSON.parse(localStorage.getItem(key)||'[]');
    const exists=saved.includes(id);
    const next=exists?saved.filter(x=>x!==id):[...saved,id];
    localStorage.setItem(key,JSON.stringify(next));
    $('saveBtn').innerHTML=exists?'Save vehicle <span>＋</span>':'Saved to garage <span>✓</span>';
  });

  $('logoutBtn').addEventListener('click',()=>{localStorage.removeItem('token');location.replace('index.html')});

  const mobileMenu=$('mobileMenu'), links=document.querySelector('.app-links');
  mobileMenu?.addEventListener('click',()=>links.classList.toggle('mobile-open'));
})();
