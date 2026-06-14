const express = require('express');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const helmet = require('helmet');
const cors = require('cors');

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'hoisrael-secret-key-change-in-production';

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (for local dev; Netlify will also serve via catch-all)
app.use(express.static(path.join(__dirname, 'public')));
app.use('/admin', express.static(path.join(__dirname, 'admin')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, 'uploads')),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files allowed'));
  }
});

// Helper: read/write JSON data
const readData = (file) => {
  try {
    return JSON.parse(fs.readFileSync(path.join(__dirname, 'data', file), 'utf8'));
  } catch { return file.endsWith('.json') && file !== 'admin.json' ? [] : {}; }
};
const writeData = (file, data) => {
  fs.writeFileSync(path.join(__dirname, 'data', file), JSON.stringify(data, null, 2));
};

// Auth middleware
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    req.admin = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// ======= PUBLIC API ROUTES =======
app.get('/api/content', (req, res) => {
  res.json(readData('content.json'));
});

app.get('/api/sermons', (req, res) => {
  res.json(readData('sermons.json'));
});

app.get('/api/sermons/:id', (req, res) => {
  const sermons = readData('sermons.json');
  const sermon = sermons.find(s => s.id === parseInt(req.params.id));
  if (!sermon) return res.status(404).json({ error: 'Sermon not found' });
  res.json(sermon);
});

app.get('/api/events', (req, res) => {
  const events = readData('events.json');
  res.json(events.sort((a, b) => new Date(a.date) - new Date(b.date)));
});

app.get('/api/gallery', (req, res) => {
  res.json(readData('gallery.json'));
});

app.post('/api/prayer', (req, res) => {
  const { name, email, request, anonymous } = req.body;
  if (!request) return res.status(400).json({ error: 'Prayer request text is required' });
  const prayers = readData('prayer-requests.json');
  const newPrayer = {
    id: Date.now(),
    name: anonymous ? 'Anonymous' : (name || 'Anonymous'),
    email: anonymous ? '' : (email || ''),
    request,
    anonymous: !!anonymous,
    date: new Date().toISOString(),
    prayed: false
  };
  prayers.push(newPrayer);
  writeData('prayer-requests.json', prayers);
  res.json({ success: true, message: 'Prayer request submitted' });
});

app.post('/api/newsletter', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });
  const newsletter = readData('newsletter.json');
  if (newsletter.find(n => n.email === email)) {
    return res.json({ success: true, message: 'Already subscribed' });
  }
  newsletter.push({ email, date: new Date().toISOString() });
  writeData('newsletter.json', newsletter);
  res.json({ success: true, message: 'Subscribed successfully' });
});

app.post('/api/contact', (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) return res.status(400).json({ error: 'Required fields missing' });
  res.json({ success: true, message: 'Message received. We will get back to you soon.' });
});

// ======= ADMIN AUTH =======
app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body;
  const admin = readData('admin.json');
  if (username !== admin.username) return res.status(401).json({ error: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, admin.password);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ username: admin.username, name: admin.name }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ success: true, token, name: admin.name });
});

app.post('/api/admin/change-password', authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const admin = readData('admin.json');
  const valid = await bcrypt.compare(currentPassword, admin.password);
  if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });
  admin.password = await bcrypt.hash(newPassword, 10);
  writeData('admin.json', admin);
  res.json({ success: true });
});

// ======= ADMIN API ROUTES =======
app.put('/api/admin/content', authMiddleware, (req, res) => {
  writeData('content.json', req.body);
  res.json({ success: true });
});

app.post('/api/admin/sermons', authMiddleware, (req, res) => {
  const sermons = readData('sermons.json');
  const newSermon = { ...req.body, id: Date.now(), views: 0 };
  sermons.push(newSermon);
  writeData('sermons.json', sermons);
  res.json({ success: true, sermon: newSermon });
});

app.put('/api/admin/sermons/:id', authMiddleware, (req, res) => {
  const sermons = readData('sermons.json');
  const idx = sermons.findIndex(s => s.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Sermon not found' });
  sermons[idx] = { ...sermons[idx], ...req.body };
  writeData('sermons.json', sermons);
  res.json({ success: true });
});

app.delete('/api/admin/sermons/:id', authMiddleware, (req, res) => {
  let sermons = readData('sermons.json');
  sermons = sermons.filter(s => s.id !== parseInt(req.params.id));
  writeData('sermons.json', sermons);
  res.json({ success: true });
});

app.post('/api/admin/events', authMiddleware, (req, res) => {
  const events = readData('events.json');
  const newEvent = { ...req.body, id: Date.now() };
  events.push(newEvent);
  writeData('events.json', events);
  res.json({ success: true, event: newEvent });
});

app.put('/api/admin/events/:id', authMiddleware, (req, res) => {
  const events = readData('events.json');
  const idx = events.findIndex(e => e.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Event not found' });
  events[idx] = { ...events[idx], ...req.body };
  writeData('events.json', events);
  res.json({ success: true });
});

app.delete('/api/admin/events/:id', authMiddleware, (req, res) => {
  let events = readData('events.json');
  events = events.filter(e => e.id !== parseInt(req.params.id));
  writeData('events.json', events);
  res.json({ success: true });
});

app.post('/api/admin/gallery', authMiddleware, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Image file required' });
  const gallery = readData('gallery.json');
  const newItem = {
    id: Date.now(),
    caption: req.body.caption || 'Gallery Image',
    category: req.body.category || 'General',
    filename: req.file.filename,
    featured: req.body.featured === 'true',
    url: '/uploads/' + req.file.filename
  };
  gallery.push(newItem);
  writeData('gallery.json', gallery);
  res.json({ success: true, item: newItem });
});

app.delete('/api/admin/gallery/:id', authMiddleware, (req, res) => {
  let gallery = readData('gallery.json');
  const item = gallery.find(g => g.id === parseInt(req.params.id));
  if (item && item.filename) {
    const filePath = path.join(__dirname, 'uploads', item.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
  gallery = gallery.filter(g => g.id !== parseInt(req.params.id));
  writeData('gallery.json', gallery);
  res.json({ success: true });
});

app.get('/api/admin/prayers', authMiddleware, (req, res) => {
  res.json(readData('prayer-requests.json'));
});

app.put('/api/admin/prayers/:id/prayed', authMiddleware, (req, res) => {
  const prayers = readData('prayer-requests.json');
  const idx = prayers.findIndex(p => p.id === parseInt(req.params.id));
  if (idx !== -1) {
    prayers[idx].prayed = true;
    writeData('prayer-requests.json', prayers);
  }
  res.json({ success: true });
});

app.get('/api/admin/newsletter', authMiddleware, (req, res) => {
  res.json(readData('newsletter.json'));
});

app.get('/api/admin/stats', authMiddleware, (req, res) => {
  const sermons = readData('sermons.json');
  const events = readData('events.json');
  const prayers = readData('prayer-requests.json');
  const newsletter = readData('newsletter.json');
  res.json({
    sermons: sermons.length,
    events: events.length,
    prayers: prayers.length,
    subscribers: newsletter.length,
    unansweredPrayers: prayers.filter(p => !p.prayed).length
  });
});

// Serve admin pages
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'admin', 'login.html')));
app.get('/admin/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'admin', 'dashboard.html')));

// Fallback (for SPA or missing routes)
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

// ========== EXPORT FOR NETLIFY (SERVERLESS) ==========
module.exports = app;

// ========== LOCAL DEVELOPMENT SERVER ==========
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log('\n╔══════════════════════════════════════════════╗');
    console.log('║   House of Israel Assembly Website           ║');
    console.log('╠══════════════════════════════════════════════╣');
    console.log(`║   Server running at: http://localhost:${PORT}   ║`);
    console.log(`║   Admin panel:  http://localhost:${PORT}/admin  ║`);
    console.log('║   Admin login:  admin / hoisrael2025         ║');
    console.log('╚══════════════════════════════════════════════╝\n');
  });
}