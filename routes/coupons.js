const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { authenticateAdmin } = require('../middleware/authMiddleware');

// 1. VALIDATE COUPON CODE (Public)
router.post('/validate', async (req, res) => {
  try {
    const { code, subtotal } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Please provide a coupon code.' });
    }

    const cleanCode = code.trim().toUpperCase();
    const coupon = await db.getAsync('SELECT * FROM coupons WHERE code = ? AND is_active = 1', [cleanCode]);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or inactive coupon code.'
      });
    }

    // Check expiry
    if (coupon.expiry_date) {
      const expiry = new Date(coupon.expiry_date);
      if (expiry < new Date()) {
        return res.status(400).json({
          success: false,
          message: 'This coupon code has expired.'
        });
      }
    }

    const parsedSubtotal = parseFloat(subtotal) || 0;
    if (parsedSubtotal < (coupon.min_order_amount || 0)) {
      return res.status(400).json({
        success: false,
        message: `This coupon requires a minimum order of Rs. ${coupon.min_order_amount}.`
      });
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      discount = (parsedSubtotal * coupon.discount_value) / 100;
      if (coupon.max_discount && discount > coupon.max_discount) {
        discount = coupon.max_discount;
      }
    } else {
      discount = coupon.discount_value;
    }

    return res.json({
      success: true,
      message: `Coupon "${coupon.code}" applied successfully!`,
      coupon: {
        code: coupon.code,
        description: coupon.description,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        discount_amount: Math.round(discount)
      }
    });
  } catch (err) {
    console.error('Validate coupon error:', err);
    return res.status(500).json({ success: false, message: 'Server error validating coupon.' });
  }
});

// 2. GET ACTIVE COUPONS (Public)
router.get('/active', async (req, res) => {
  try {
    const coupons = await db.allAsync(
      'SELECT id, code, description, discount_type, discount_value, min_order_amount, max_discount, expiry_date FROM coupons WHERE is_active = 1 ORDER BY id DESC'
    );
    return res.json({ success: true, coupons });
  } catch (err) {
    console.error('Get active coupons error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch active offers.' });
  }
});

// 3. GET ALL COUPONS (Admin)
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const coupons = await db.allAsync('SELECT * FROM coupons ORDER BY id DESC');
    return res.json({ success: true, coupons });
  } catch (err) {
    console.error('Admin get coupons error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch coupons.' });
  }
});

// 4. CREATE COUPON (Admin)
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const { code, description, discount_type, discount_value, min_order_amount, max_discount, expiry_date, is_active } = req.body;
    if (!code || !discount_value) {
      return res.status(400).json({ success: false, message: 'Coupon code and discount value are required.' });
    }

    const cleanCode = code.trim().toUpperCase();
    const existing = await db.getAsync('SELECT id FROM coupons WHERE code = ?', [cleanCode]);
    if (existing) {
      return res.status(400).json({ success: false, message: 'A coupon with this code already exists.' });
    }

    const result = await db.runAsync(
      `INSERT INTO coupons (code, description, discount_type, discount_value, min_order_amount, max_discount, expiry_date, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        cleanCode,
        description || '',
        discount_type || 'percentage',
        parseFloat(discount_value) || 0,
        parseFloat(min_order_amount) || 0,
        parseFloat(max_discount) || 999999,
        expiry_date || null,
        is_active !== undefined ? (is_active ? 1 : 0) : 1
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Coupon created successfully.',
      id: result.lastID
    });
  } catch (err) {
    console.error('Create coupon error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create coupon.' });
  }
});

// 5. UPDATE COUPON (Admin)
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { code, description, discount_type, discount_value, min_order_amount, max_discount, expiry_date, is_active } = req.body;

    const existing = await db.getAsync('SELECT * FROM coupons WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Coupon not found.' });
    }

    const cleanCode = code ? code.trim().toUpperCase() : existing.code;

    await db.runAsync(
      `UPDATE coupons SET 
        code = ?,
        description = ?,
        discount_type = ?,
        discount_value = ?,
        min_order_amount = ?,
        max_discount = ?,
        expiry_date = ?,
        is_active = ?
       WHERE id = ?`,
      [
        cleanCode,
        description !== undefined ? description : existing.description,
        discount_type || existing.discount_type,
        discount_value !== undefined ? parseFloat(discount_value) : existing.discount_value,
        min_order_amount !== undefined ? parseFloat(min_order_amount) : existing.min_order_amount,
        max_discount !== undefined ? parseFloat(max_discount) : existing.max_discount,
        expiry_date !== undefined ? expiry_date : existing.expiry_date,
        is_active !== undefined ? (is_active ? 1 : 0) : existing.is_active,
        id
      ]
    );

    return res.json({ success: true, message: 'Coupon updated successfully.' });
  } catch (err) {
    console.error('Update coupon error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update coupon.' });
  }
});

// 6. DELETE COUPON (Admin)
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await db.runAsync('DELETE FROM coupons WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Coupon deleted successfully.' });
  } catch (err) {
    console.error('Delete coupon error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete coupon.' });
  }
});

module.exports = router;
