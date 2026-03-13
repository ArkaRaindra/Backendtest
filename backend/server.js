require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const cors = require('cors');
const { initDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'bakery-delight-secret-key-2025',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

// API Routes
app.use('/api/products', require('./routes/products'));
app.use('/api/reviews',  require('./routes/reviews'));
app.use('/api/gallery',  require('./routes/gallery'));
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/orders',   require('./routes/orders'));

// Frontend page routes
app.get('/',              (req, res) => res.sendFile(path.join(__dirname, '../public/index.html')));
app.get('/produk',        (req, res) => res.sendFile(path.join(__dirname, '../public/produk.html')));
app.get('/tentang',       (req, res) => res.sendFile(path.join(__dirname, '../public/tentang.html')));
app.get('/ulasan',        (req, res) => res.sendFile(path.join(__dirname, '../public/ulasan.html')));
app.get('/galeri',        (req, res) => res.sendFile(path.join(__dirname, '../public/galeri.html')));
app.get('/detail-produk', (req, res) => res.sendFile(path.join(__dirname, '../public/detail-produk.html')));
app.get('/admin',         (req, res) => res.sendFile(path.join(__dirname, '../public/admin/index.html')));
app.get('/admin/*',       (req, res) => res.sendFile(path.join(__dirname, '../public/admin/index.html')));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Boot: init DB then start server
initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🥐 Bakery Delight berjalan di http://localhost:${PORT}`);
      console.log(`📊 Admin Panel  : http://localhost:${PORT}/admin`);
      console.log(`   Login        : admin / admin123\n`);
    });
  })
  .catch(err => {
    console.error('❌ Gagal menjalankan server:', err.message);
    process.exit(1);
  });
