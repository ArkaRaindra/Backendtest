const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { pool } = require('../database');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads')),
  filename:    (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

function isAdmin(req, res, next) {
  if (req.session && req.session.adminId) return next();
  return res.status(401).json({ error: 'Unauthorized' });
}

function parseSpecial(rows) {
  return rows.map(p => ({
    ...p,
    special: Array.isArray(p.special) ? p.special : JSON.parse(p.special || '[]')
  }));
}

// GET all products
router.get('/', async (req, res) => {
  try {
    const { category, special, status, search } = req.query;
    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (category) { query += ' AND category = ?';                                     params.push(category); }
    if (status)   { query += ' AND status = ?';                                       params.push(status); }
    if (search)   { query += ' AND (name LIKE ? OR description LIKE ?)';             params.push(`%${search}%`, `%${search}%`); }

    query += ' ORDER BY id DESC';
    const [rows] = await pool.query(query, params);
    let result = parseSpecial(rows);

    if (special) result = result.filter(p => p.special.includes(special));
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengambil produk' });
  }
});

// GET single product
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Produk tidak ditemukan' });
    const p = rows[0];
    res.json({ ...p, special: Array.isArray(p.special) ? p.special : JSON.parse(p.special || '[]') });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengambil produk' });
  }
});

// POST create product (admin)
router.post('/', isAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, price, category, special, status, description, stock } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : '';
    const specialArr = Array.isArray(special) ? special : (special ? [special] : []);

    const [result] = await pool.query(
      'INSERT INTO products (name, price, category, special, status, image, description, stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, parseInt(price), category, JSON.stringify(specialArr), status || 'tersedia', image, description || '', parseInt(stock) || 0]
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal menambah produk' });
  }
});

// PUT update product (admin)
router.put('/:id', isAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, price, category, special, status, description, stock } = req.body;
    const [existing] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ error: 'Produk tidak ditemukan' });

    const image = req.file ? `/uploads/${req.file.filename}` : existing[0].image;
    const specialArr = Array.isArray(special) ? special : (special ? [special] : []);

    await pool.query(
      'UPDATE products SET name=?, price=?, category=?, special=?, status=?, image=?, description=?, stock=? WHERE id=?',
      [name, parseInt(price), category, JSON.stringify(specialArr), status, image, description || '', parseInt(stock) || 0, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal memperbarui produk' });
  }
});

// DELETE product (admin)
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal menghapus produk' });
  }
});

module.exports = router;
