const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { authenticateAdmin } = require('../middleware/authMiddleware');

// 1. GET SETTINGS (Public)
router.get('/', async (req, res) => {
  try {
    const rows = await db.allAsync('SELECT key, value FROM settings');
    const settings = {};
    rows.forEach((r) => {
      settings[r.key] = r.value;
    });

    return res.json({
      success: true,
      settings: {
        restaurant_name: settings.restaurant_name || 'Pizza Hub',
        tagline: settings.tagline || 'Fresh Pizza, Fresh Moments.',
        phone_number: settings.phone_number || '+92 300 1234567',
        whatsapp_number: settings.whatsapp_number || '923001234567',
        email: settings.email || 'orders@pizzahub.com',
        address: settings.address || 'Shop #14, Commercial Boulevard, Phase 5, DHA',
        currency: settings.currency || 'Rs.',
        delivery_charges: parseFloat(settings.delivery_charges) || 150,
        free_delivery_threshold: parseFloat(settings.free_delivery_threshold) || 2500,
        is_24_hours_open: settings.is_24_hours_open === '1' || settings.is_24_hours_open === 1,
        business_hours: settings.business_hours || 'Open 24/7 (All Day & Night Delivery)',
        announcement_banner: settings.announcement_banner || '🔥 24/7 Delivery Available! Order Now!'
      }
    });
  } catch (err) {
    console.error('Fetch settings error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve settings.' });
  }
});

// 2. UPDATE SETTINGS (Admin)
router.put('/', authenticateAdmin, async (req, res) => {
  try {
    const updates = req.body; // e.g. { phone_number: '...', is_24_hours_open: 1 }

    for (const [key, val] of Object.entries(updates)) {
      const valueStr = typeof val === 'boolean' ? (val ? '1' : '0') : String(val);
      const existing = await db.getAsync('SELECT key FROM settings WHERE key = ?', [key]);
      if (existing) {
        await db.runAsync('UPDATE settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?', [
          valueStr,
          key
        ]);
      } else {
        await db.runAsync('INSERT INTO settings (key, value) VALUES (?, ?)', [key, valueStr]);
      }
    }

    return res.json({
      success: true,
      message: 'Restaurant settings updated successfully.'
    });
  } catch (err) {
    console.error('Update settings error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update settings.' });
  }
});

module.exports = router;
