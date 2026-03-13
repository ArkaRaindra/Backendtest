const express = require('express');
const router = express.Router();
const db = require('../database');

function isAdmin(req, res, next) {
  if (req.session && req.session.adminId) return next();
  return res.status(401).json({ error: 'Unauthorized' });
}

// Stats (admin) — must be before /:id routes
router.get('/stats', isAdmin, (req, res) => {
  const totalOrders   = db.prepare('SELECT COUNT(*) as c FROM orders').get().c;
  const totalRevenue  = db.prepare("SELECT COALESCE(SUM(total),0) as s FROM orders WHERE status != 'cancelled'").get().s;
  const totalProducts = db.prepare('SELECT COUNT(*) as c FROM products').get().c;
  const totalReviews  = db.prepare('SELECT COUNT(*) as c FROM reviews').get().c;
  const recentOrders  = db.prepare('SELECT * FROM orders ORDER BY created_at DESC LIMIT 5').all();
  res.json({
    totalOrders, totalRevenue, totalProducts, totalReviews,
    recentOrders: recentOrders.map(o => ({ ...o, items: JSON.parse(o.items) }))
  });
});

// GET all orders (admin)
router.get('/', isAdmin, (req, res) => {
  const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
  res.json(orders.map(o => ({ ...o, items: JSON.parse(o.items) })));
});

// GET orders by phone number (public — for customer order tracking)
router.get('/by-phone/:phone', (req, res) => {
  const phone = req.params.phone.replace(/\D/g, ''); // strip non-digits
  // match flexibly: stored might be "08123..." or "+62812..."
  const orders = db.prepare(`
    SELECT * FROM orders
    WHERE REPLACE(REPLACE(REPLACE(customer_phone,' ',''),'-',''),'+','') LIKE ?
    ORDER BY created_at DESC
  `).all(`%${phone.slice(-9)}%`); // match last 9 digits
  res.json(orders.map(o => ({ ...o, items: JSON.parse(o.items) })));
});

// GET single order by id (public)
router.get('/:id', (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) return res.status(404).json({ error: 'Pesanan tidak ditemukan' });
  res.json({ ...order, items: JSON.parse(order.items) });
});

// POST create order (public)
router.post('/', (req, res) => {
  const { customer_name, customer_phone, customer_email, items, total, notes } = req.body;
  if (!customer_name || !customer_phone || !items || !total) {
    return res.status(400).json({ error: 'Data tidak lengkap' });
  }
  const result = db.prepare(`
    INSERT INTO orders (customer_name, customer_phone, customer_email, items, total, notes, status)
    VALUES (?, ?, ?, ?, ?, ?, 'pending')
  `).run(customer_name, customer_phone, customer_email || '', JSON.stringify(items), total, notes || '');
  res.json({ success: true, id: result.lastInsertRowid });
});

// PUT update status (admin)
router.put('/:id/status', isAdmin, (req, res) => {
  const { status } = req.body;
  const valid = ['pending','processing','shipped','completed','cancelled'];
  if (!valid.includes(status)) return res.status(400).json({ error: 'Status tidak valid' });
  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ success: true });
});

// POST submit review for a specific order item (public)
router.post('/:id/review', (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) return res.status(404).json({ error: 'Pesanan tidak ditemukan' });
  if (order.status !== 'completed') return res.status(400).json({ error: 'Pesanan belum selesai' });

  const { product, rating, text } = req.body;
  if (!product || !rating || !text) return res.status(400).json({ error: 'Data tidak lengkap' });

  const date = new Date().toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' });
  const result = db.prepare(`
    INSERT INTO reviews (name, product, rating, text, date, approved)
    VALUES (?, ?, ?, ?, ?, 1)
  `).run(order.customer_name, product, parseFloat(rating), text, date);

  // Mark order as reviewed (store review id in order notes or a separate flag)
  // We track which items were reviewed in a separate column
  const reviewed = JSON.parse(order.reviewed_items || '[]');
  reviewed.push(product);
  db.prepare('UPDATE orders SET reviewed_items = ? WHERE id = ?').run(JSON.stringify(reviewed), order.id);

  res.json({ success: true, reviewId: result.lastInsertRowid });
});

module.exports = router;
