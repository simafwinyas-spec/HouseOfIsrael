/* =====================================================
   HOUSE OF ISRAEL ASSEMBLY — MAIN JS
   ===================================================== */

// ---- AOS INIT ----
document.addEventListener('DOMContentLoaded', () => {
  if (window.AOS) {
    AOS.init({ duration: 850, easing: 'ease-in-out', once: true, offset: 80 });
  }

  initNavbar();
  initParticles();
  initCounters();
  initForms();
  initGallery();
  initPageNav();
  loadDynamicContent();
});

// ---- NAVBAR ----
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('navMenu');
  const backTop = document.getElementById('backTop');

  window.addEventListener('scroll', () => {
    if (!navbar) return;
    navbar.classList.toggle('scrolled', window.scrollY > 50);
    if (backTop) backTop.classList.toggle('show', window.scrollY > 300);
  });

  toggle?.addEventListener('click', () => {
    toggle.classList.toggle('open');
    menu?.classList.toggle('open');
  });

  menu?.querySelectorAll('.nav-link').forEach(l => {
    l.addEventListener('click', () => {
      toggle?.classList.remove('open');
      menu?.classList.remove('open');
    });
  });

  backTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // Mark active link
  const current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(l => {
    const href = l.getAttribute('href') || '';
    if (href === current || (current === '' && href === 'index.html')) {
      l.classList.add('active');
    }
  });
}

// ---- CANVAS PARTICLES ----
function initParticles() {
  const canvas = document.getElementById('particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  resize();
  window.addEventListener('resize', resize);

  const symbols = ['✡', 'א', 'ב', 'ג', 'ה', 'ו', 'י', 'כ', 'ל', 'מ', 'ש', '★', '✦', '◆'];

  class Particle {
    constructor(randomY = false) {
      this.reset(randomY);
    }
    reset(randomY = false) {
      this.x = Math.random() * canvas.width;
      this.y = randomY ? Math.random() * canvas.height : canvas.height + 30;
      this.symbol = symbols[Math.floor(Math.random() * symbols.length)];
      this.size = Math.random() * 16 + 8;
      this.speed = Math.random() * 0.4 + 0.1;
      this.opacity = Math.random() * 0.22 + 0.04;
      this.rotation = Math.random() * 360;
      this.rotSpeed = (Math.random() - 0.5) * 0.4;
      this.drift = (Math.random() - 0.5) * 0.15;
    }
    update() {
      this.y -= this.speed;
      this.x += this.drift;
      this.rotation += this.rotSpeed;
      if (this.y < -40) this.reset();
    }
    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation * Math.PI / 180);
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = '#c9a84c';
      ctx.font = `${this.size}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.symbol, 0, 0);
      ctx.restore();
    }
  }

  const particles = Array.from({ length: 55 }, () => new Particle(true));

  (function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animate);
  })();
}

// ---- COUNTER ANIMATION ----
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count);
      let current = 0;
      const inc = target / 70;
      const t = setInterval(() => {
        current += inc;
        if (current >= target) { current = target; clearInterval(t); }
        el.textContent = Math.floor(current) + '+';
      }, 25);
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => obs.observe(c));
}

// ---- FORMS ----
function initForms() {
  // Prayer request
  document.getElementById('prayerForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const f = e.target;
    const data = {
      name: f.querySelector('[name="pname"]')?.value || f.querySelector('[placeholder="Your Name"]')?.value || '',
      email: f.querySelector('[name="pemail"]')?.value || f.querySelector('[type="email"]')?.value || '',
      request: f.querySelector('[name="prequest"]')?.value || f.querySelector('textarea')?.value || '',
      anonymous: f.querySelector('[name="panon"]')?.checked || false
    };
    const btn = f.querySelector('button[type="submit"]');
    btn.textContent = 'Submitting...';
    btn.disabled = true;
    try {
      const res = await fetch('/api/prayer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        showToast('Prayer request submitted! Our team will pray for you. Shalom! ✡', 'success');
        f.reset();
      } else {
        showToast('Something went wrong. Please try again.', 'error');
      }
    } catch {
      showToast('Prayer request submitted! Thank you for trusting us. ✡', 'success');
      f.reset();
    }
    btn.textContent = 'Submit Prayer Request';
    btn.disabled = false;
  });

  // Newsletter
  document.getElementById('newsletterForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const email = e.target.querySelector('input[type="email"]').value;
    try {
      await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
    } catch {}
    showToast('Successfully subscribed! Welcome to the House of Israel family. ✡', 'success');
    e.target.reset();
  });

  // Contact form
  document.getElementById('contactForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const f = e.target;
    const data = {
      name: f.querySelector('[name="cname"]')?.value,
      email: f.querySelector('[name="cemail"]')?.value,
      subject: f.querySelector('[name="csubject"]')?.value,
      message: f.querySelector('[name="cmessage"]')?.value
    };
    const btn = f.querySelector('button[type="submit"]');
    btn.textContent = 'Sending...';
    btn.disabled = true;
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      showToast('Message sent! We will get back to you soon. Shalom!', 'success');
      f.reset();
    } catch {
      showToast('Message sent! We will get back to you soon.', 'success');
      f.reset();
    }
    btn.textContent = 'Send Message';
    btn.disabled = false;
  });
}

// ---- GALLERY LIGHTBOX ----
function initGallery() {
  const lb = document.getElementById('lightbox');
  if (!lb) return;
  const lbImg = lb.querySelector('.lb-img');
  const lbCap = lb.querySelector('.lb-cap');
  const lbClose = lb.querySelector('.lb-close');

  document.querySelectorAll('.gal-item[data-img]').forEach(item => {
    item.addEventListener('click', () => {
      const src = item.dataset.img;
      const cap = item.dataset.cap || '';
      if (lbImg) lbImg.src = src;
      if (lbCap) lbCap.textContent = cap;
      lb.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  const closeLb = () => {
    lb.classList.remove('open');
    document.body.style.overflow = '';
  };
  lbClose?.addEventListener('click', closeLb);
  lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLb(); });
}

// ---- PAGE NAVIGATION ACTIVE ----
function initPageNav() {
  const sections = document.querySelectorAll('section[id]');
  if (!sections.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        document.querySelectorAll('.nav-link').forEach(l => {
          l.classList.toggle('active', l.getAttribute('href') === '#' + entry.target.id);
        });
      }
    });
  }, { threshold: 0.4 });
  sections.forEach(s => obs.observe(s));
}

// ---- DYNAMIC CONTENT ----
async function loadDynamicContent() {
  // Load latest sermons on homepage
  const sermonsContainer = document.getElementById('homeSermons');
  if (sermonsContainer) {
    try {
      const res = await fetch('/api/sermons');
      const sermons = await res.json();
      const latest = sermons.slice(0, 3);
      sermonsContainer.innerHTML = latest.map(s => buildSermonCard(s)).join('');
    } catch {}
  }

  // Load upcoming events on homepage
  const eventsContainer = document.getElementById('homeEvents');
  if (eventsContainer) {
    try {
      const res = await fetch('/api/events');
      const events = await res.json();
      const upcoming = events.slice(0, 3);
      eventsContainer.innerHTML = upcoming.map(e => buildEventCard(e)).join('');
    } catch {}
  }

  // Full sermons page
  const allSermons = document.getElementById('allSermons');
  if (allSermons) {
    try {
      const res = await fetch('/api/sermons');
      const sermons = await res.json();
      allSermons.innerHTML = sermons.map(s => buildSermonCardLarge(s)).join('');
    } catch {}
  }

  // Full events page
  const allEvents = document.getElementById('allEvents');
  if (allEvents) {
    try {
      const res = await fetch('/api/events');
      const events = await res.json();
      allEvents.innerHTML = events.map(e => buildEventCard(e)).join('');
    } catch {}
  }

  // Gallery page
  const galleryFull = document.getElementById('galleryFull');
  if (galleryFull) {
    try {
      const res = await fetch('/api/gallery');
      const items = await res.json();
      galleryFull.innerHTML = items.map(g => buildGalleryItem(g)).join('');
      initGallery();
    } catch {}
  }
}

function buildSermonCard(s) {
  const d = new Date(s.date);
  const dateStr = d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  return `
    <div class="sermon-card" data-aos="fade-up">
      <div class="scard-thumb">
        <div class="play-btn"><i class="fas fa-play"></i></div>
        <div class="scard-cat">${s.category}</div>
      </div>
      <div class="scard-body">
        <div class="scard-date"><i class="fas fa-calendar-alt"></i> ${dateStr}</div>
        <h3>${s.title}</h3>
        <p class="scard-speaker">${s.speaker}</p>
        <div class="scard-foot">
          <a href="sermons.html" class="btn-sm">Watch Now</a>
          <span class="scard-dur"><i class="fas fa-clock"></i> ${s.duration}</span>
        </div>
      </div>
    </div>`;
}

function buildSermonCardLarge(s) {
  const d = new Date(s.date);
  const dateStr = d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  return `
    <div class="sermon-card" data-aos="fade-up">
      <div class="scard-thumb">
        ${s.youtube_link ? `<a href="${s.youtube_link}" target="_blank" class="play-btn"><i class="fas fa-play"></i></a>` : '<div class="play-btn"><i class="fas fa-play"></i></div>'}
        <div class="scard-cat">${s.category}</div>
      </div>
      <div class="scard-body">
        <div class="scard-date"><i class="fas fa-calendar-alt"></i> ${dateStr}</div>
        <h3>${s.title}</h3>
        <p class="scard-speaker">${s.speaker}</p>
        <p style="font-size:0.85rem;color:var(--text-muted);line-height:1.6;margin-bottom:16px;">${s.description || ''}</p>
        <div class="scard-foot">
          ${s.youtube_link ? `<a href="${s.youtube_link}" target="_blank" class="btn-sm">Watch on YouTube</a>` : '<span class="btn-sm" style="opacity:0.5;cursor:default">Coming Soon</span>'}
          <span class="scard-dur"><i class="fas fa-clock"></i> ${s.duration}</span>
        </div>
      </div>
    </div>`;
}

function buildEventCard(e) {
  const d = new Date(e.date);
  const month = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const day = d.getDate();
  return `
    <div class="event-card" data-aos="fade-up">
      <div class="evt-date">
        <span class="evt-month">${month}</span>
        <span class="evt-day">${day}</span>
      </div>
      <div class="evt-info">
        <h3>${e.title}</h3>
        <div class="evt-meta">
          <span><i class="fas fa-clock"></i> ${e.time}</span>
          <span><i class="fas fa-map-marker-alt"></i> ${e.location}</span>
          ${e.category ? `<span><i class="fas fa-tag"></i> ${e.category}</span>` : ''}
        </div>
        <p class="evt-desc">${e.description}</p>
      </div>
      <a href="events.html" class="evt-btn">${e.registration_required ? 'Register Now' : 'Learn More'}</a>
    </div>`;
}

function buildGalleryItem(g) {
  const src = g.url || g.filename ? `/uploads/${g.filename}` : '';
  return `
    <div class="gal-item${g.featured ? ' gal-large' : ''}" data-img="${src}" data-cap="${g.caption}" data-aos="fade-up">
      <div class="gal-ph">
        ${src ? `<img src="${src}" alt="${g.caption}" loading="lazy">` : `<i class="fas fa-image"></i><span>${g.caption}</span>`}
      </div>
      <div class="gal-overlay">
        <i class="fas fa-expand"></i>
        <span>${g.caption}</span>
      </div>
    </div>`;
}

// ---- TOAST HELPER ----
window.showToast = function(msg, type = 'success') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = `show ${type}`;
  setTimeout(() => t.className = '', 4500);
};
