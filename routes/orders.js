const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { authenticateAdmin } = require('../middleware/authMiddleware');
const {
  generateWhatsAppMessage,
  generateCustomerWhatsAppMessage,
  sendOrderEmails
} = require('../services/notificationService');

// Generate unique human-friendly order ID
function generateOrderId() {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let randomStr = '';
  for (let i = 0; i < 5; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `PH-${randomStr}`;
}

// 1. PLACE ORDER (Public)
router.post('/', async (req, res) => {
  try {
    const {
      customer_name,
      customer_phone,
      customer_whatsapp,
      customer_email,
      delivery_address,
      landmark,
      city,
      order_notes,
      payment_method,
      items,
      coupon_code,
      idempotency_key
    } = req.body;

    // Validation
    if (!customer_name || !customer_phone || !delivery_address) {
      return res.status(400).json({
        success: false,
        message: 'Name, phone number and delivery address are required.'
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your cart is empty. Please add items to place an order.'
      });
    }

    // Duplicate Order Prevention: Check idempotency key or recent identical order
    if (idempotency_key) {
      const existingByIdempotency = await db.getAsync(
        'SELECT order_id FROM orders WHERE idempotency_key = ?',
        [idempotency_key]
      );
      if (existingByIdempotency) {
        return res.json({
          success: true,
          is_duplicate: true,
          order_id: existingByIdempotency.order_id,
          message: 'Order already received.'
        });
      }
    }

    // Check if same customer placed an identical order within last 30 seconds
    const recentDuplicate = await db.getAsync(
      `SELECT order_id FROM orders 
       WHERE customer_phone = ? 
       AND datetime(created_at) >= datetime('now', '-30 seconds')
       ORDER BY id DESC LIMIT 1`,
      [customer_phone.trim()]
    );
    if (recentDuplicate) {
      return res.json({
        success: true,
        is_duplicate: true,
        order_id: recentDuplicate.order_id,
        message: 'An order was just placed with this phone number. Tracking your order now.'
      });
    }

    // Calculate subtotal from items
    let calculatedSubtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const qty = parseInt(item.quantity) || 1;
      const price = parseFloat(item.unit_price) || 0;
      const sub = price * qty;
      calculatedSubtotal += sub;

      validatedItems.push({
        menu_item_id: item.menu_item_id || null,
        item_name: item.item_name || 'Delicious Pizza',
        size_name: item.size_name || 'Medium',
        unit_price: price,
        quantity: qty,
        subtotal: sub
      });
    }

    // Fetch delivery charges setting
    const deliverySetting = await db.getAsync(
      "SELECT value FROM settings WHERE key = 'delivery_charges'"
    );
    const freeThresholdSetting = await db.getAsync(
      "SELECT value FROM settings WHERE key = 'free_delivery_threshold'"
    );

    let deliveryCharges = deliverySetting ? parseFloat(deliverySetting.value) || 150 : 150;
    const freeThreshold = freeThresholdSetting ? parseFloat(freeThresholdSetting.value) || 2500 : 2500;

    if (calculatedSubtotal >= freeThreshold) {
      deliveryCharges = 0;
    }

    // Coupon discount calculation
    let discountAmount = 0;
    let validCouponCode = null;

    if (coupon_code) {
      const coupon = await db.getAsync(
        'SELECT * FROM coupons WHERE code = ? AND is_active = 1',
        [coupon_code.trim().toUpperCase()]
      );

      if (coupon) {
        // Check min order amount
        if (calculatedSubtotal >= (coupon.min_order_amount || 0)) {
          if (coupon.discount_type === 'percentage') {
            discountAmount = (calculatedSubtotal * coupon.discount_value) / 100;
            if (coupon.max_discount && discountAmount > coupon.max_discount) {
              discountAmount = coupon.max_discount;
            }
          } else {
            discountAmount = coupon.discount_value;
          }
          validCouponCode = coupon.code;
        }
      }
    }

    const totalAmount = Math.max(0, calculatedSubtotal + deliveryCharges - discountAmount);
    const orderId = generateOrderId();

    // Insert order into database
    await db.runAsync(
      `INSERT INTO orders (
        order_id, customer_name, customer_phone, customer_whatsapp, customer_email,
        delivery_address, landmark, city, order_notes, payment_method,
        subtotal, delivery_charges, discount_amount, coupon_code, total_amount,
        status, idempotency_key
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'received', ?)`,
      [
        orderId,
        customer_name.trim(),
        customer_phone.trim(),
        customer_whatsapp ? customer_whatsapp.trim() : customer_phone.trim(),
        customer_email ? customer_email.trim() : null,
        delivery_address.trim(),
        landmark ? landmark.trim() : '',
        city ? city.trim() : 'Karachi',
        order_notes ? order_notes.trim() : '',
        payment_method || 'Cash on Delivery',
        calculatedSubtotal,
        deliveryCharges,
        discountAmount,
        validCouponCode,
        totalAmount,
        idempotency_key || null
      ]
    );

    // Insert order items
    for (const it of validatedItems) {
      await db.runAsync(
        `INSERT INTO order_items (order_id, menu_item_id, item_name, size_name, unit_price, quantity, subtotal)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          it.menu_item_id,
          it.item_name,
          it.size_name,
          it.unit_price,
          it.quantity,
          it.subtotal
        ]
      );
    }

    const createdOrder = await db.getAsync('SELECT * FROM orders WHERE order_id = ?', [orderId]);

    // Send notifications in background
    sendOrderEmails(createdOrder, validatedItems).catch((err) =>
      console.warn('Background email send error:', err)
    );

    // Format WhatsApp links
    const restaurantWhatsApp = process.env.RESTAURANT_WHATSAPP || '923001234567';
    const rawAdminMsg = generateWhatsAppMessage(createdOrder, validatedItems);
    const rawCustomerMsg = generateCustomerWhatsAppMessage(createdOrder, validatedItems);

    const whatsappAdminUrl = `https://api.whatsapp.com/send?phone=${restaurantWhatsApp}&text=${encodeURIComponent(
      rawAdminMsg
    )}`;

    const customerPhoneClean = (createdOrder.customer_whatsapp || createdOrder.customer_phone).replace(/[^0-9]/g, '');
    const whatsappCustomerUrl = `https://api.whatsapp.com/send?phone=${customerPhoneClean}&text=${encodeURIComponent(
      rawCustomerMsg
    )}`;

    return res.status(201).json({
      success: true,
      message:
        'Order Confirmed! 🍕 Thank you for choosing Pizza Hub. Your delicious pizza is being prepared. We’ll contact you shortly to confirm your delivery.',
      order_id: orderId,
      order: createdOrder,
      items: validatedItems,
      whatsapp_admin_url: whatsappAdminUrl,
      whatsapp_customer_url: whatsappCustomerUrl
    });
  } catch (err) {
    console.error('Create order error:', err);
    return res.status(500).json({ success: false, message: 'Failed to place order. Please try again.' });
  }
});

// 2. TRACK ORDER (Public)
router.get('/track/:orderId', async (req, res) => {
  try {
    const rawId = req.params.orderId.trim().toUpperCase();
    const order = await db.getAsync('SELECT * FROM orders WHERE UPPER(order_id) = ?', [rawId]);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order ID not found. Please double-check your Order ID (e.g. PH-XXXXX).'
      });
    }

    const items = await db.allAsync('SELECT * FROM order_items WHERE order_id = ?', [order.order_id]);

    // Progress mapping
    const stages = [
      { key: 'received', title: 'Order Received', desc: 'We have received your order details.', icon: 'clipboard-check' },
      { key: 'confirmed', title: 'Order Confirmed', desc: 'Order verified by our kitchen team.', icon: 'badge-check' },
      { key: 'preparing', title: 'Baking in Oven', desc: 'Fresh dough hand-tossed and baking at 400°C.', icon: 'flame' },
      { key: 'out_for_delivery', title: 'Out for Delivery', desc: 'Our rider is speeding toward your address.', icon: 'bike' },
      { key: 'delivered', title: 'Delivered', desc: 'Enjoy your piping hot meal! Fresh moments.', icon: 'smile' }
    ];

    let currentStageIndex = 0;
    if (order.status === 'confirmed') currentStageIndex = 1;
    else if (order.status === 'preparing') currentStageIndex = 2;
    else if (order.status === 'out_for_delivery') currentStageIndex = 3;
    else if (order.status === 'delivered') currentStageIndex = 4;
    else if (order.status === 'cancelled') currentStageIndex = -1;

    return res.json({
      success: true,
      order,
      items,
      stages,
      current_stage_index: currentStageIndex,
      is_cancelled: order.status === 'cancelled'
    });
  } catch (err) {
    console.error('Track order error:', err);
    return res.status(500).json({ success: false, message: 'Failed to track order.' });
  }
});

// 3. GET ORDERS STATS SUMMARY (Admin)
router.get('/stats/summary', authenticateAdmin, async (req, res) => {
  try {
    const totalOrdersRow = await db.getAsync('SELECT COUNT(*) as count FROM orders');
    const pendingOrdersRow = await db.getAsync("SELECT COUNT(*) as count FROM orders WHERE status = 'received'");
    const confirmedOrdersRow = await db.getAsync("SELECT COUNT(*) as count FROM orders WHERE status = 'confirmed'");
    const preparingOrdersRow = await db.getAsync("SELECT COUNT(*) as count FROM orders WHERE status = 'preparing'");
    const outForDeliveryOrdersRow = await db.getAsync("SELECT COUNT(*) as count FROM orders WHERE status = 'out_for_delivery'");
    const completedOrdersRow = await db.getAsync("SELECT COUNT(*) as count FROM orders WHERE status = 'delivered'");
    const cancelledOrdersRow = await db.getAsync("SELECT COUNT(*) as count FROM orders WHERE status = 'cancelled'");
    
    const totalSalesRow = await db.getAsync("SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE status != 'cancelled'");
    
    // Today's statistics
    const todayOrdersRow = await db.getAsync(
      "SELECT COUNT(*) as count FROM orders WHERE date(created_at) = date('now')"
    );
    const todaySalesRow = await db.getAsync(
      "SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE date(created_at) = date('now') AND status != 'cancelled'"
    );

    return res.json({
      success: true,
      stats: {
        total_orders: totalOrdersRow.count,
        pending_orders: pendingOrdersRow.count,
        confirmed_orders: confirmedOrdersRow.count,
        preparing_orders: preparingOrdersRow.count,
        out_for_delivery_orders: outForDeliveryOrdersRow.count,
        completed_orders: completedOrdersRow.count,
        cancelled_orders: cancelledOrdersRow.count,
        total_sales: totalSalesRow.total,
        today_orders: todayOrdersRow.count,
        today_revenue: todaySalesRow.total
      }
    });
  } catch (err) {
    console.error('Stats error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch order statistics.' });
  }
});

// 4. GET ALL ORDERS (Admin)
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const { status, search, limit = 50, page = 1 } = req.query;
    let sql = 'SELECT * FROM orders WHERE 1=1';
    const params = [];

    if (status && status !== 'all') {
      sql += ' AND status = ?';
      params.push(status);
    }

    if (search) {
      sql += ' AND (order_id LIKE ? OR customer_name LIKE ? OR customer_phone LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    sql += ' ORDER BY id DESC LIMIT ? OFFSET ?';
    const parsedLimit = parseInt(limit) || 50;
    const offset = ((parseInt(page) || 1) - 1) * parsedLimit;
    params.push(parsedLimit, offset);

    const orders = await db.allAsync(sql, params);

    // Attach items count to each order
    const formattedOrders = [];
    for (const ord of orders) {
      const items = await db.allAsync('SELECT * FROM order_items WHERE order_id = ?', [ord.order_id]);
      formattedOrders.push({
        ...ord,
        items
      });
    }

    return res.json({
      success: true,
      orders: formattedOrders
    });
  } catch (err) {
    console.error('Admin get orders error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve orders.' });
  }
});

// 5. GET SINGLE ORDER DETAILS (Admin)
router.get('/:orderId', authenticateAdmin, async (req, res) => {
  try {
    const order = await db.getAsync('SELECT * FROM orders WHERE order_id = ?', [req.params.orderId]);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const items = await db.allAsync('SELECT * FROM order_items WHERE order_id = ?', [order.order_id]);

    return res.json({
      success: true,
      order,
      items
    });
  } catch (err) {
    console.error('Admin get order error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch order details.' });
  }
});

// 6. UPDATE ORDER STATUS (Admin)
router.put('/:orderId/status', authenticateAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['received', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${allowedStatuses.join(', ')}`
      });
    }

    const order = await db.getAsync('SELECT * FROM orders WHERE order_id = ?', [req.params.orderId]);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    await db.runAsync(
      'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE order_id = ?',
      [status, req.params.orderId]
    );

    return res.json({
      success: true,
      message: `Order #${req.params.orderId} status updated to "${status}".`,
      status
    });
  } catch (err) {
    console.error('Update order status error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update order status.' });
  }
});

module.exports = router;
