const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { authenticateAdmin } = require('../middleware/authMiddleware');

// 1. GET APPROVED REVIEWS (Public)
router.get('/', async (req, res) => {
  try {
    const reviews = await db.allAsync(
      'SELECT id, customer_name, customer_avatar, rating, comment, created_at FROM reviews WHERE is_approved = 1 ORDER BY id DESC LIMIT 20'
    );
    return res.json({ success: true, reviews });
  } catch (err) {
    console.error('Fetch reviews error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch reviews.' });
  }
});

// 2. SUBMIT REVIEW (Public)
router.post('/', async (req, res) => {
  try {
    const { customer_name, rating, comment } = req.body;

    if (!customer_name || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Name and comment are required.'
      });
    }

    const cleanRating = Math.max(1, Math.min(5, parseInt(rating) || 5));
    const randomAvatars = [
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80'
    ];
    const avatar = randomAvatars[Math.floor(Math.random() * randomAvatars.length)];

    await db.runAsync(
      `INSERT INTO reviews (customer_name, customer_avatar, rating, comment, is_approved)
       VALUES (?, ?, ?, ?, 1)`,
      [customer_name.trim(), avatar, cleanRating, comment.trim()]
    );

    return res.status(201).json({
      success: true,
      message: 'Thank you for your valuable review! It has been posted.'
    });
  } catch (err) {
    console.error('Submit review error:', err);
    return res.status(500).json({ success: false, message: 'Failed to submit review.' });
  }
});

// 3. GET ALL REVIEWS (Admin)
router.get('/all', authenticateAdmin, async (req, res) => {
  try {
    const reviews = await db.allAsync('SELECT * FROM reviews ORDER BY id DESC');
    return res.json({ success: true, reviews });
  } catch (err) {
    console.error('Admin get reviews error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch reviews.' });
  }
});

// 4. TOGGLE APPROVAL (Admin)
router.put('/:id/approve', authenticateAdmin, async (req, res) => {
  try {
    const { is_approved } = req.body;
    await db.runAsync('UPDATE reviews SET is_approved = ? WHERE id = ?', [
      is_approved ? 1 : 0,
      req.params.id
    ]);
    return res.json({ success: true, message: 'Review status updated.' });
  } catch (err) {
    console.error('Approve review error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update review.' });
  }
});

// 5. DELETE REVIEW (Admin)
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    await db.runAsync('DELETE FROM reviews WHERE id = ?', [req.params.id]);
    return res.json({ success: true, message: 'Review deleted successfully.' });
  } catch (err) {
    console.error('Delete review error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete review.' });
  }
});

module.exports = router;
