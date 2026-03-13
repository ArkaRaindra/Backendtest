const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '../data/bakery.db');
const dataDir = path.join(__dirname, '../data');
const uploadDir = path.join(__dirname, '../uploads');

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price INTEGER NOT NULL,
    category TEXT NOT NULL,
    special TEXT DEFAULT '[]',
    status TEXT DEFAULT 'tersedia',
    image TEXT DEFAULT '',
    description TEXT DEFAULT '',
    stock INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    product TEXT NOT NULL,
    rating REAL NOT NULL,
    text TEXT NOT NULL,
    approved INTEGER DEFAULT 1,
    date TEXT DEFAULT (date('now','localtime')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS gallery (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    image TEXT NOT NULL,
    category TEXT DEFAULT 'umum',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    customer_email TEXT,
    items TEXT NOT NULL,
    total INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',
    notes TEXT,
    reviewed_items TEXT DEFAULT '[]',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`);

// Add reviewed_items column if missing (migration)
try {
  db.exec(`ALTER TABLE orders ADD COLUMN reviewed_items TEXT DEFAULT '[]'`);
} catch(e) { /* column already exists */ }

// Seed initial data
const productCount = db.prepare('SELECT COUNT(*) as c FROM products').get().c;
if (productCount === 0) {
  const ins = db.prepare(`INSERT INTO products (name,price,category,special,status,image,description,stock) VALUES (?,?,?,?,?,?,?,?)`);
  [
    ['Roti Tawar Gandum',     25000,'roti',         '["terlaris","rendah-gula"]','tersedia','','Roti tawar gandum dengan serat tinggi, cocok untuk diet sehat',50],
    ['Croissant Coklat',      18000,'pastry',        '["terlaris"]',             'tersedia','','Croissant dengan isian coklat premium, renyah di luar lembut di dalam',30],
    ['Black Forest Cake',    120000,'kue',           '["baru"]',                 'preorder','','Kue black forest dengan coklat dan cherry, pesan minimal 2 hari sebelumnya',10],
    ['Roti Tawar Premium',    30000,'tanpa-bahan',   '["vegan"]',                'tersedia','','Roti tawar tanpa bahan pengawet, 100% bahan alami',40],
    ['Danish Pastry',         22000,'pastry',        '[]',                       'tersedia','','Pastry dengan lapisan yang renyah dan isian buah pilihan',25],
    ['Cheese Cake',           45000,'kue',           '["terlaris","baru"]',      'tersedia','','Cheese cake dengan rasa yang lembut dan topping buah segar',15],
    ['Roti Tawar Rendah Gula',28000,'tanpa-bahan',   '["rendah-gula","vegan"]',  'tersedia','','Roti tawar dengan kandungan gula rendah, cocok untuk penderita diabetes',35],
    ['Baguette',              20000,'roti',          '[]',                       'tersedia','','Roti baguette renyah khas Prancis, sempurna untuk sandwich',20],
  ].forEach(p => ins.run(...p));
}

const reviewCount = db.prepare('SELECT COUNT(*) as c FROM reviews').get().c;
if (reviewCount === 0) {
  const ins = db.prepare('INSERT INTO reviews (name,product,rating,text,date) VALUES (?,?,?,?,?)');
  ins.run('Sarah Wijaya','Roti Tawar Gandum',5,'Roti dari Bakery Delight selalu segar dan enak. Keluarga saya sangat menyukai roti tawar gandumnya yang lembut dan sehat. Sudah langganan lebih dari 2 tahun!','12 November 2023');
  ins.run('Budi Santoso','Cheese Cake',5,'Kue ulang tahun untuk anak saya dibuat dengan sangat detail dan rasanya luar biasa. Anak-anak dan tamu undangan semua memuji. Terima kasih Bakery Delight!','5 Desember 2023');
  ins.run('Dian Permata','Roti Tawar Rendah Gula',4.5,'Sebagai penderita diabetes, saya kesulitan menemukan roti yang aman dikonsumsi. Roti rendah gula dari Bakery Delight solusinya!','20 Januari 2024');
}

const adminCount = db.prepare('SELECT COUNT(*) as c FROM admins').get().c;
if (adminCount === 0) {
  const hash = bcrypt.hashSync('admin123', 10);
  db.prepare('INSERT INTO admins (username,password,name) VALUES (?,?,?)').run('admin', hash, 'Administrator');
}

const settingCount = db.prepare('SELECT COUNT(*) as c FROM settings').get().c;
if (settingCount === 0) {
  const ins = db.prepare('INSERT OR IGNORE INTO settings (key,value) VALUES (?,?)');
  ins.run('store_name',    'Bakery Delight');
  ins.run('store_address', 'Jl. A.M. Sangaji No.47, Cokrodiningratan, Kec. Jetis, Kota Yogyakarta');
  ins.run('store_phone',   '+62 123 4567 890');
  ins.run('store_email',   'info@bakerydelight.com');
  ins.run('store_hours',   '07.00 - 21.00');
  ins.run('notice_bar',    'Gratis Ongkir untuk Pembelian di Atas Rp 100.000 • Produk Segar Setiap Hari');
}

module.exports = db;
