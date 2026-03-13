const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { pool } = require('../database');

// POST login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const [rows] = await pool.query('SELECT * FROM admins WHERE username = ?', [username]);
    const admin = rows[0];
    if (!admin || !bcrypt.compareSync(password, admin.password)) {
      return res.status(401).json({ error: 'Username atau password salah' });
    }
    req.session.adminId   = admin.id;
    req.session.adminName = admin.name;
    res.json({ success: true, name: admin.name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal login' });
  }
});

// POST logout
router.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// GET check session
router.get('/check', (req, res) => {
  if (req.session && req.session.adminId) {
    return res.json({ loggedIn: true, name: req.session.adminName });
  }
  res.json({ loggedIn: false });
});

// GET all settings (public — used by frontend pages)
router.get('/settings', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT `key`, `value` FROM settings');
    const settings = {};
    rows.forEach(r => { settings[r.key] = r.value; });
    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengambil pengaturan' });
  }
});

// PUT update settings (admin)
router.put('/settings', async (req, res) => {
  if (!req.session || !req.session.adminId) return res.status(401).json({ error: 'Unauthorized' });
  try {
    // MySQL uses INSERT ... ON DUPLICATE KEY UPDATE instead of SQLite's INSERT OR REPLACE
    for (const [key, value] of Object.entries(req.body)) {
      await pool.query(
        'INSERT INTO settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)',
        [key, value]
      );
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal menyimpan pengaturan' });
  }
});

module.exports = router;
