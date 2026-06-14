/* =====================================================
   HOUSE OF ISRAEL — ADMIN DASHBOARD JS
   ===================================================== */

const API = '';
let token = localStorage.getItem('hoi_token');

// ---- AUTH CHECK ----
if (!token) window.location.href = '/admin/login.html';

function authHeaders() {
  return { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token };
}

async function apiFetch(url, opts = {}) {
  const res = await fetch(url, { ...opts, headers: { ...(opts.headers || {}), ...authHeaders() } });
  if (res.status === 401) { localStorage.clear(); window.location.href = '/admin/login.html'; }
  return res;
}

// ---- INIT ----
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('adminName').textContent = localStorage.getItem('hoi_admin') || 'Admin';
  document.getElementById('dashAdminName').textContent = localStorage.getItem('hoi_admin') || 'Admin';
  updateClock();
  setInterval(updateClock, 1000);
  loadStats();
  initNavigation();
  initSidebarToggle();
  initLogout();
  initForms();
});

// ---- CLOCK ----
function updateClock() {
  const el = document.getElementById('topbarTime');
  if (el) el.textContent = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

// ---- STATS ----
async function loadStats() {
  try {
    const res = await apiFetch('/api/admin/stats');
    const d = await res.json();
    document.getElementById('statSermons').textContent = d.sermons;
    document.getElementById('statEvents').textContent = d.events;
    document.getElementById('statPrayers').textContent = d.prayers;
    document.getElementById('statSubscribers').textContent = d.subscribers;
  } catch {}
}

// ---- SIDEBAR ----
function initSidebarToggle() {
  const toggle = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');
  toggle?.addEventListener('click', () => sidebar.classList.toggle('open'));
  document.addEventListener('click', e => {
    if (window.innerWidth < 900 && !sidebar.contains(e.target) && !toggle.contains(e.target)) {
      sidebar.classList.remove('open');
    }
  });
}

// ---- NAVIGATION ----
function initNavigation() {
  document.querySelectorAll('.sb-link[data-section]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const sec = link.dataset.section;
      switchSection(sec);
      if (window.innerWidth < 900) document.getElementById('sidebar').classList.remove('open');
    });
  });
}

window.switchSection = function(sec) {
  document.querySelectorAll('.panel').forEach(p => p.classList.add('hidden'));
  document.querySelectorAll('.sb-link').forEach(l => l.classList.remove('active'));
  const panel = document.getElementById('panel-' + sec);
  if (panel) panel.classList.remove('hidden');
  const link = document.querySelector(`.sb-link[data-section="${sec}"]`);
  if (link) link.classList.add('active');

  const titles = {
    'dashboard': 'Dashboard',
    'home-content': 'Edit Homepage',
    'sermons': 'Manage Sermons',
    'events': 'Manage Events',
    'gallery': 'Manage Gallery',
    'prayers': 'Prayer Requests',
    'newsletter': 'Newsletter Subscribers',
    'settings': 'Settings'
  };
  document.getElementById('pageTitle').textContent = titles[sec] || sec;

  // Load data for section
  if (sec === 'home-content') loadContentForm();
  if (sec === 'sermons') loadSermons();
  if (sec === 'events') loadEvents();
  if (sec === 'gallery') loadGallery();
  if (sec === 'prayers') loadPrayers();
  if (sec === 'newsletter') loadNewsletter();
};

// ---- LOGOUT ----
function initLogout() {
  document.getElementById('logoutBtn')?.addEventListener('click', e => {
    e.preventDefault();
    localStorage.clear();
    window.location.href = '/admin/login.html';
  });
}

// ---- TOAST ----
function adminToast(msg, type = 'success') {
  const t = document.getElementById('adminToast');
  t.textContent = msg;
  t.className = 'admin-toast show ' + type;
  setTimeout(() => t.className = 'admin-toast', 3500);
}

// ---- MODALS ----
window.closeModal = function(id) {
  document.getElementById(id)?.classList.remove('open');
};
function openModal(id) {
  document.getElementById(id)?.classList.add('open');
}
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal')) e.target.classList.remove('open');
});

// ---- CONTENT FORM ----
async function loadContentForm() {
  try {
    const res = await fetch('/api/content');
    const c = await res.json();
    if (c.hero) {
      setVal('hero_badge', c.hero.badge);
      setVal('hero_title1', c.hero.title_line1);
      setVal('hero_title2', c.hero.title_line2);
      setVal('hero_subtitle', c.hero.subtitle);
      setVal('hero_location', c.hero.location);
    }
    if (c.about) {
      setVal('about_body1', c.about.body1);
      setVal('about_body2', c.about.body2);
      setVal('stat1_num', c.about.stat1_num);
      setVal('stat2_num', c.about.stat2_num);
      setVal('stat3_num', c.about.stat3_num);
    }
    if (c.rabbi_quote) {
      setVal('rabbi_quote', c.rabbi_quote.quote);
      setVal('rabbi_author', c.rabbi_quote.author);
      setVal('rabbi_title', c.rabbi_quote.title);
    }
    if (c.contact) {
      setVal('contact_address', c.contact.address);
      setVal('contact_phone', c.contact.phone);
      setVal('contact_email', c.contact.email);
      setVal('contact_facebook', c.contact.facebook);
      setVal('contact_youtube', c.contact.youtube);
      setVal('contact_whatsapp', c.contact.whatsapp);
      setVal('contact_instagram', c.contact.instagram);
    }
  } catch {}
}

function setVal(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val || '';
}
function getVal(id) {
  return document.getElementById(id)?.value || '';
}

function initForms() {
  // Content form
  document.getElementById('contentForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const payload = {
      hero: {
        badge: getVal('hero_badge'),
        title_line1: getVal('hero_title1'),
        title_line2: getVal('hero_title2'),
        subtitle: getVal('hero_subtitle'),
        location: getVal('hero_location')
      },
      about: {
        body1: getVal('about_body1'),
        body2: getVal('about_body2'),
        stat1_num: getVal('stat1_num'),
        stat2_num: getVal('stat2_num'),
        stat3_num: getVal('stat3_num')
      },
      rabbi_quote: {
        quote: getVal('rabbi_quote'),
        author: getVal('rabbi_author'),
        title: getVal('rabbi_title')
      },
      contact: {
        address: getVal('contact_address'),
        phone: getVal('contact_phone'),
        email: getVal('contact_email'),
        facebook: getVal('contact_facebook'),
        youtube: getVal('contact_youtube'),
        whatsapp: getVal('contact_whatsapp'),
        instagram: getVal('contact_instagram')
      }
    };
    try {
      const res = await apiFetch('/api/admin/content', { method: 'PUT', body: JSON.stringify(payload) });
      if (res.ok) adminToast('Homepage content updated successfully!', 'success');
      else adminToast('Error saving content', 'error');
    } catch { adminToast('Error saving content', 'error'); }
  });

  // Sermon form
  document.getElementById('sermonForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const id = document.getElementById('sermonId').value;
    const data = {
      title: document.getElementById('sTitle').value,
      category: document.getElementById('sCategory').value,
      date: document.getElementById('sDate').value,
      speaker: document.getElementById('sSpeaker').value,
      duration: document.getElementById('sDuration').value,
      youtube_link: document.getElementById('sYoutube').value,
      description: document.getElementById('sDesc').value,
      featured: document.getElementById('sFeatured').checked
    };
    try {
      const url = id ? `/api/admin/sermons/${id}` : '/api/admin/sermons';
      const method = id ? 'PUT' : 'POST';
      const res = await apiFetch(url, { method, body: JSON.stringify(data) });
      if (res.ok) {
        adminToast(id ? 'Sermon updated!' : 'Sermon added!', 'success');
        closeModal('sermonModal');
        loadSermons();
        loadStats();
      } else adminToast('Error saving sermon', 'error');
    } catch { adminToast('Error saving sermon', 'error'); }
  });

  // Event form
  document.getElementById('eventForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const id = document.getElementById('eventId').value;
    const data = {
      title: document.getElementById('eTitle').value,
      date: document.getElementById('eDate').value,
      time: document.getElementById('eTime').value,
      location: document.getElementById('eLocation').value,
      category: document.getElementById('eCategory').value,
      description: document.getElementById('eDesc').value,
      registration_required: document.getElementById('eRegistration').checked
    };
    try {
      const url = id ? `/api/admin/events/${id}` : '/api/admin/events';
      const method = id ? 'PUT' : 'POST';
      const res = await apiFetch(url, { method, body: JSON.stringify(data) });
      if (res.ok) {
        adminToast(id ? 'Event updated!' : 'Event added!', 'success');
        closeModal('eventModal');
        loadEvents();
        loadStats();
      } else adminToast('Error saving event', 'error');
    } catch { adminToast('Error saving event', 'error'); }
  });

  // Change password
  document.getElementById('changePwForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const f = e.target;
    const cur = f.querySelector('[name="currentPassword"]').value;
    const nw = f.querySelector('[name="newPassword"]').value;
    const cf = f.querySelector('[name="confirmPassword"]').value;
    if (nw !== cf) { adminToast('Passwords do not match', 'error'); return; }
    try {
      const res = await apiFetch('/api/admin/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword: cur, newPassword: nw })
      });
      if (res.ok) {
        adminToast('Password changed successfully!', 'success');
        f.reset();
        localStorage.clear();
        setTimeout(() => window.location.href = '/admin/login.html', 2000);
      } else {
        const d = await res.json();
        adminToast(d.error || 'Error changing password', 'error');
      }
    } catch { adminToast('Error changing password', 'error'); }
  });

  // Image file preview
  document.getElementById('imageFile')?.addEventListener('change', function() {
    const file = this.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      document.getElementById('previewImg').src = e.target.result;
      document.getElementById('uploadPreview').style.display = '';
    };
    reader.readAsDataURL(file);
  });
}

// ---- SERMONS ----
async function loadSermons() {
  const container = document.getElementById('sermonsList');
  container.innerHTML = '<div class="loading-ph"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';
  try {
    const res = await fetch('/api/sermons');
    const sermons = await res.json();
    if (!sermons.length) {
      container.innerHTML = '<div class="empty-ph"><i class="fas fa-scroll"></i>No sermons yet. Click "Add New Sermon" to get started.</div>';
      return;
    }
    container.innerHTML = sermons.map(s => {
      const d = new Date(s.date);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      return `
        <div class="data-row">
          <div class="data-row-icon"><i class="fas fa-play-circle"></i></div>
          <div class="data-row-info">
            <h4>${s.title}</h4>
            <p>${s.speaker} &nbsp;·&nbsp; ${dateStr} &nbsp;·&nbsp; ${s.duration}</p>
          </div>
          <div class="data-row-meta">
            <span class="tag">${s.category}</span>
            ${s.featured ? '<span class="tag green">Featured</span>' : ''}
            ${s.youtube_link ? '<span class="tag blue">YouTube</span>' : ''}
          </div>
          <div class="data-row-actions">
            <button class="admin-btn secondary" onclick="editSermon(${s.id})"><i class="fas fa-edit"></i></button>
            <button class="admin-btn danger" onclick="deleteSermon(${s.id})"><i class="fas fa-trash"></i></button>
          </div>
        </div>`;
    }).join('');
  } catch { container.innerHTML = '<div class="empty-ph"><i class="fas fa-exclamation-circle"></i> Error loading sermons.</div>'; }
}

window.openSermonModal = function(sermon = null) {
  document.getElementById('sermonId').value = sermon ? sermon.id : '';
  document.getElementById('sermonModalTitle').textContent = sermon ? 'Edit Sermon' : 'Add New Sermon';
  document.getElementById('sTitle').value = sermon ? sermon.title : '';
  document.getElementById('sCategory').value = sermon ? sermon.category : 'Torah Portion';
  document.getElementById('sDate').value = sermon ? sermon.date : new Date().toISOString().split('T')[0];
  document.getElementById('sSpeaker').value = sermon ? sermon.speaker : 'Rabbi Dr. Phillip Banda';
  document.getElementById('sDuration').value = sermon ? sermon.duration : '';
  document.getElementById('sYoutube').value = sermon ? sermon.youtube_link || '' : '';
  document.getElementById('sDesc').value = sermon ? sermon.description || '' : '';
  document.getElementById('sFeatured').checked = sermon ? !!sermon.featured : false;
  openModal('sermonModal');
};

window.editSermon = async function(id) {
  try {
    const res = await fetch('/api/sermons/' + id);
    const sermon = await res.json();
    openSermonModal(sermon);
  } catch {}
};

window.deleteSermon = async function(id) {
  if (!confirm('Delete this sermon? This cannot be undone.')) return;
  try {
    const res = await apiFetch('/api/admin/sermons/' + id, { method: 'DELETE' });
    if (res.ok) { adminToast('Sermon deleted', 'success'); loadSermons(); loadStats(); }
  } catch {}
};

// ---- EVENTS ----
async function loadEvents() {
  const container = document.getElementById('eventsList');
  container.innerHTML = '<div class="loading-ph"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';
  try {
    const res = await fetch('/api/events');
    const events = await res.json();
    if (!events.length) {
      container.innerHTML = '<div class="empty-ph"><i class="fas fa-calendar-alt"></i>No events yet. Click "Add New Event" to get started.</div>';
      return;
    }
    container.innerHTML = events.map(e => {
      const d = new Date(e.date);
      const dateStr = d.toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric', year:'numeric' });
      return `
        <div class="data-row">
          <div class="data-row-icon"><i class="fas fa-calendar-star"></i></div>
          <div class="data-row-info">
            <h4>${e.title}</h4>
            <p>${dateStr} &nbsp;·&nbsp; ${e.time} &nbsp;·&nbsp; ${e.location}</p>
          </div>
          <div class="data-row-meta">
            <span class="tag">${e.category}</span>
            ${e.registration_required ? '<span class="tag blue">Registration Required</span>' : ''}
          </div>
          <div class="data-row-actions">
            <button class="admin-btn secondary" onclick="editEvent(${e.id})"><i class="fas fa-edit"></i></button>
            <button class="admin-btn danger" onclick="deleteEvent(${e.id})"><i class="fas fa-trash"></i></button>
          </div>
        </div>`;
    }).join('');
  } catch { container.innerHTML = '<div class="empty-ph"><i class="fas fa-exclamation-circle"></i> Error loading events.</div>'; }
}

window.openEventModal = function(event = null) {
  document.getElementById('eventId').value = event ? event.id : '';
  document.getElementById('eventModalTitle').textContent = event ? 'Edit Event' : 'Add New Event';
  document.getElementById('eTitle').value = event ? event.title : '';
  document.getElementById('eDate').value = event ? event.date : '';
  document.getElementById('eTime').value = event ? event.time : '';
  document.getElementById('eLocation').value = event ? event.location : 'Burma Barracks Chapel';
  document.getElementById('eCategory').value = event ? event.category : 'Feast Day';
  document.getElementById('eDesc').value = event ? event.description || '' : '';
  document.getElementById('eRegistration').checked = event ? !!event.registration_required : false;
  openModal('eventModal');
};

window.editEvent = async function(id) {
  try {
    const res = await fetch('/api/events');
    const events = await res.json();
    const event = events.find(e => e.id === id);
    if (event) openEventModal(event);
  } catch {}
};

window.deleteEvent = async function(id) {
  if (!confirm('Delete this event?')) return;
  try {
    const res = await apiFetch('/api/admin/events/' + id, { method: 'DELETE' });
    if (res.ok) { adminToast('Event deleted', 'success'); loadEvents(); loadStats(); }
  } catch {}
};

// ---- GALLERY ----
async function loadGallery() {
  const container = document.getElementById('galleryList');
  try {
    const res = await fetch('/api/gallery');
    const items = await res.json();
    if (!items.length) {
      container.innerHTML = '<div class="empty-ph"><i class="fas fa-images"></i>No images uploaded yet.</div>';
      return;
    }
    container.innerHTML = items.map(g => {
      const src = g.url || (g.filename ? '/uploads/' + g.filename : '');
      return `
        <div class="gal-admin-item">
          ${src ? `<img src="${src}" alt="${g.caption}" loading="lazy">` : `<i class="fas fa-image" style="font-size:2rem;color:var(--gold);opacity:0.3;"></i>`}
          <div class="gal-admin-overlay">
            <button class="admin-btn danger" onclick="deleteGalleryItem(${g.id})" style="font-size:0.75rem;padding:6px 12px;">
              <i class="fas fa-trash"></i> Delete
            </button>
          </div>
          <div class="gal-admin-cap">${g.caption}</div>
        </div>`;
    }).join('');
  } catch { container.innerHTML = '<div class="empty-ph"><i class="fas fa-exclamation-circle"></i> Error loading gallery.</div>'; }
}

window.uploadImage = async function() {
  const file = document.getElementById('imageFile').files[0];
  if (!file) { adminToast('Please select an image', 'error'); return; }
  const fd = new FormData();
  fd.append('image', file);
  fd.append('caption', document.getElementById('imgCaption').value || 'Gallery Image');
  fd.append('category', document.getElementById('imgCategory').value || 'General');
  fd.append('featured', document.getElementById('imgFeatured').checked);
  try {
    const res = await fetch('/api/admin/gallery', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token },
      body: fd
    });
    if (res.ok) {
      adminToast('Image uploaded successfully!', 'success');
      document.getElementById('uploadPreview').style.display = 'none';
      document.getElementById('imageFile').value = '';
      loadGallery();
    } else adminToast('Upload failed', 'error');
  } catch { adminToast('Upload failed', 'error'); }
};

window.deleteGalleryItem = async function(id) {
  if (!confirm('Delete this image?')) return;
  try {
    const res = await apiFetch('/api/admin/gallery/' + id, { method: 'DELETE' });
    if (res.ok) { adminToast('Image deleted', 'success'); loadGallery(); }
  } catch {}
};

// ---- PRAYERS ----
async function loadPrayers() {
  const container = document.getElementById('prayersList');
  container.innerHTML = '<div class="loading-ph"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';
  try {
    const res = await apiFetch('/api/admin/prayers');
    const prayers = await res.json();
    if (!prayers.length) {
      container.innerHTML = '<div class="empty-ph"><i class="fas fa-hands-praying"></i>No prayer requests yet.</div>';
      return;
    }
    container.innerHTML = prayers.reverse().map(p => {
      const d = new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      return `
        <div class="data-row">
          <div class="data-row-icon"><i class="fas fa-hands-praying"></i></div>
          <div class="data-row-info" style="flex:1;">
            <h4>${p.anonymous ? '(Anonymous)' : p.name}${p.email ? ' — ' + p.email : ''}</h4>
            <p>${d}</p>
            <div class="prayer-text-preview">${p.request}</div>
          </div>
          <div class="data-row-meta">
            ${p.prayed ? '<span class="tag green"><i class="fas fa-check"></i> Prayed</span>' : `<button class="admin-btn success" onclick="markPrayed(${p.id})" style="font-size:0.72rem;padding:7px 14px;"><i class="fas fa-check"></i> Mark Prayed</button>`}
          </div>
        </div>`;
    }).join('');
  } catch { container.innerHTML = '<div class="empty-ph"><i class="fas fa-exclamation-circle"></i> Error loading requests.</div>'; }
}

window.markPrayed = async function(id) {
  try {
    const res = await apiFetch('/api/admin/prayers/' + id + '/prayed', { method: 'PUT' });
    if (res.ok) { adminToast('Marked as prayed! Shalom.', 'success'); loadPrayers(); }
  } catch {}
};

// ---- NEWSLETTER ----
async function loadNewsletter() {
  const container = document.getElementById('newsletterList');
  container.innerHTML = '<div class="loading-ph"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';
  try {
    const res = await apiFetch('/api/admin/newsletter');
    const subs = await res.json();
    if (!subs.length) {
      container.innerHTML = '<div class="empty-ph"><i class="fas fa-envelope"></i>No subscribers yet.</div>';
      return;
    }
    container.innerHTML = subs.reverse().map((s, i) => {
      const d = new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      return `
        <div class="data-row">
          <div class="data-row-icon"><i class="fas fa-envelope"></i></div>
          <div class="data-row-info">
            <h4>${s.email}</h4>
            <p>Subscribed: ${d}</p>
          </div>
          <span class="tag green">Active</span>
        </div>`;
    }).join('');
  } catch { container.innerHTML = '<div class="empty-ph"><i class="fas fa-exclamation-circle"></i> Error loading subscribers.</div>'; }
}
