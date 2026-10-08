const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { authenticateAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Helper to slugify item names
function createSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// 1. GET ALL MENU ITEMS (Public)
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    let sql = 'SELECT * FROM menu_items WHERE 1=1';
    const params = [];

    if (category && category !== 'All') {
      sql += ' AND category = ?';
      params.push(category);
    }

    if (search) {
      sql += ' AND (name LIKE ? OR description LIKE ? OR ingredients LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    sql += ' ORDER BY is_featured DESC, is_bestseller DESC, id ASC';

    const items = await db.allAsync(sql, params);
    const itemIds = items.map((i) => i.id);

    // Fetch size prices for all matching items
    let prices = [];
    if (itemIds.length > 0) {
      const placeholders = itemIds.map(() => '?').join(',');
      prices = await db.allAsync(
        `SELECT * FROM item_prices WHERE menu_item_id IN (${placeholders}) ORDER BY 
          CASE size_name 
            WHEN 'Small' THEN 1 
            WHEN 'Medium' THEN 2 
            WHEN 'Large' THEN 3 
            WHEN 'Extra Large' THEN 4 
            ELSE 5 
          END ASC`,
        itemIds
      );
    }

    // Attach prices array to each item
    const formattedItems = items.map((item) => {
      const itemPrices = prices.filter((p) => p.menu_item_id === item.id);
      return {
        ...item,
        is_available: Boolean(item.is_available),
        is_bestseller: Boolean(item.is_bestseller),
        is_popular: Boolean(item.is_popular),
        is_featured: Boolean(item.is_featured),
        prices: itemPrices
      };
    });

    return res.json({
      success: true,
      items: formattedItems
    });
  } catch (err) {
    console.error('Fetch menu error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch menu items.' });
  }
});

// 2. GET SINGLE MENU ITEM (Public)
router.get('/:id', async (req, res) => {
  try {
    const item = await db.getAsync('SELECT * FROM menu_items WHERE id = ?', [req.params.id]);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Menu item not found.' });
    }

    const prices = await db.allAsync(
      `SELECT * FROM item_prices WHERE menu_item_id = ? ORDER BY 
        CASE size_name 
          WHEN 'Small' THEN 1 
          WHEN 'Medium' THEN 2 
          WHEN 'Large' THEN 3 
          WHEN 'Extra Large' THEN 4 
          ELSE 5 
        END ASC`,
      [item.id]
    );

    return res.json({
      success: true,
      item: {
        ...item,
        is_available: Boolean(item.is_available),
        is_bestseller: Boolean(item.is_bestseller),
        is_popular: Boolean(item.is_popular),
        is_featured: Boolean(item.is_featured),
        prices
      }
    });
  } catch (err) {
    console.error('Fetch single item error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch item details.' });
  }
});

// 3. UPLOAD PIZZA IMAGE (Admin)
router.post('/upload', authenticateAdmin, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded.' });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    return res.json({
      success: true,
      message: 'Image uploaded successfully.',
      imageUrl
    });
  } catch (err) {
    console.error('Image upload error:', err);
    return res.status(500).json({ success: false, message: 'Image upload failed.' });
  }
});

// 4. CREATE NEW MENU ITEM (Admin)
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const {
      name,
      description,
      ingredients,
      category,
      image_url,
      is_available,
      is_bestseller,
      is_popular,
      is_featured,
      badge,
      prices // Array of { size_name, price, is_available }
    } = req.body;

    if (!name || !category) {
      return res.status(400).json({ success: false, message: 'Name and category are required.' });
    }

    let slug = createSlug(name);
    // Ensure slug uniqueness
    const slugCheck = await db.getAsync('SELECT id FROM menu_items WHERE slug = ?', [slug]);
    if (slugCheck) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const defaultImg =
      image_url ||
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80';

    const insertResult = await db.runAsync(
      `INSERT INTO menu_items (name, slug, description, ingredients, category, image_url, is_available, is_bestseller, is_popular, is_featured, badge)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name.trim(),
        slug,
        description || '',
        ingredients || '',
        category,
        defaultImg,
        is_available !== undefined ? (is_available ? 1 : 0) : 1,
        is_bestseller ? 1 : 0,
        is_popular ? 1 : 0,
        is_featured ? 1 : 0,
        badge || ''
      ]
    );

    const newItemId = insertResult.lastID;

    // Insert prices
    if (Array.isArray(prices) && prices.length > 0) {
      for (const p of prices) {
        if (p.size_name && p.price !== undefined) {
          await db.runAsync(
            `INSERT INTO item_prices (menu_item_id, size_name, price, is_available)
             VALUES (?, ?, ?, ?)`,
            [newItemId, p.size_name, parseFloat(p.price) || 0, p.is_available !== false ? 1 : 0]
          );
        }
      }
    } else {
      // Default sizes if none provided
      const defaultSizes = [
        { size_name: 'Small', price: 649 },
        { size_name: 'Medium', price: 1149 },
        { size_name: 'Large', price: 1699 },
        { size_name: 'Extra Large', price: 2199 }
      ];
      for (const s of defaultSizes) {
        await db.runAsync(
          `INSERT INTO item_prices (menu_item_id, size_name, price, is_available)
           VALUES (?, ?, ?, 1)`,
          [newItemId, s.size_name, s.price]
        );
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Pizza added successfully to menu.',
      itemId: newItemId
    });
  } catch (err) {
    console.error('Create item error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create menu item.' });
  }
});

// 5. UPDATE MENU ITEM (Admin)
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      ingredients,
      category,
      image_url,
      is_available,
      is_bestseller,
      is_popular,
      is_featured,
      badge,
      prices
    } = req.body;

    const existing = await db.getAsync('SELECT * FROM menu_items WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Menu item not found.' });
    }

    await db.runAsync(
      `UPDATE menu_items SET 
        name = ?,
        description = ?,
        ingredients = ?,
        category = ?,
        image_url = ?,
        is_available = ?,
        is_bestseller = ?,
        is_popular = ?,
        is_featured = ?,
        badge = ?,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        name ? name.trim() : existing.name,
        description !== undefined ? description : existing.description,
        ingredients !== undefined ? ingredients : existing.ingredients,
        category || existing.category,
        image_url || existing.image_url,
        is_available !== undefined ? (is_available ? 1 : 0) : existing.is_available,
        is_bestseller !== undefined ? (is_bestseller ? 1 : 0) : existing.is_bestseller,
        is_popular !== undefined ? (is_popular ? 1 : 0) : existing.is_popular,
        is_featured !== undefined ? (is_featured ? 1 : 0) : existing.is_featured,
        badge !== undefined ? badge : existing.badge,
        id
      ]
    );

    // If new prices array is supplied, replace prices
    if (Array.isArray(prices) && prices.length > 0) {
      await db.runAsync('DELETE FROM item_prices WHERE menu_item_id = ?', [id]);
      for (const p of prices) {
        if (p.size_name && p.price !== undefined) {
          await db.runAsync(
            `INSERT INTO item_prices (menu_item_id, size_name, price, is_available)
             VALUES (?, ?, ?, ?)`,
            [id, p.size_name, parseFloat(p.price) || 0, p.is_available !== false ? 1 : 0]
          );
        }
      }
    }

    return res.json({
      success: true,
      message: 'Menu item updated successfully.'
    });
  } catch (err) {
    console.error('Update item error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update menu item.' });
  }
});

// 6. DELETE MENU ITEM (Admin)
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await db.getAsync('SELECT id FROM menu_items WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Menu item not found.' });
    }

    await db.runAsync('DELETE FROM item_prices WHERE menu_item_id = ?', [id]);
    await db.runAsync('DELETE FROM menu_items WHERE id = ?', [id]);

    return res.json({
      success: true,
      message: 'Menu item deleted successfully.'
    });
  } catch (err) {
    console.error('Delete item error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete menu item.' });
  }
});

module.exports = router;
