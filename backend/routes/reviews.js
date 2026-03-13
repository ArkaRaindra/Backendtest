const express = require('express');
const router = express.Router();
const { pool } = require('../database');

function isAdmin(req, res, next) {
  if (req.session && req.session.adminId) return next();
  return res.status(401).json({ error: 'Unauthorized' });
}

// GET all reviews (optionally filter by approved)
router.get('/', async (req, res) => {
  try {
    const { approved } = req.query;
    let query = 'SELECT * FROM reviews';
    const params = [];
    if (approved !== undefined) {
      query += ' WHERE approved = ?';
      params.push(parseInt(approved));
    }
    query += ' ORDER BY created_at DESC';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengambil ulasan' });
  }
});

// POST new review
router.post('/', async (req, res) => {
  try {
    const { name, product, rating, text } = req.body;
    if (!name || !product || !rating || !text)
      return res.status(400).json({ error: 'Semua field harus diisi' });

    const date = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    const [result] = await pool.query(
      'INSERT INTO reviews (name, product, rating, `text`, date, approved) VALUES (?, ?, ?, ?, ?, ?)',
      [name, product, parseFloat(rating), text, date, 1]
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal menyimpan ulasan' });
  }
});

// PUT approve/hide review (admin)
router.put('/:id/approve', isAdmin, async (req, res) => {
  try {
    await pool.query('UPDATE reviews SET approved = ? WHERE id = ?', [req.body.approved ? 1 : 0, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal memperbarui ulasan' });
  }
});

// DELETE review (admin)
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM reviews WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal menghapus ulasan' });
  }
});

module.exports = router;
