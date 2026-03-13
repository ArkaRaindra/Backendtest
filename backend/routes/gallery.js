const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { pool } = require('../database');

function isAdmin(req, res, next) {
  if (req.session && req.session.adminId) return next();
  return res.status(401).json({ error: 'Unauthorized' });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads')),
  filename:    (req, file, cb) => cb(null, 'gallery-' + Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// GET all gallery items
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM gallery ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengambil gallery' });
  }
});

// POST upload new gallery item (admin)
router.post('/', isAdmin, upload.single('image'), async (req, res) => {
  try {
    const { title, category } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : '';
    const [result] = await pool.query(
      'INSERT INTO gallery (title, image, category) VALUES (?, ?, ?)',
      [title, image, category || 'umum']
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal menyimpan foto' });
  }
});

// DELETE gallery item (admin)
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM gallery WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal menghapus foto' });
  }
});

module.exports = router;
