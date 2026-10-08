/**
 * PIZZA HUB - Admin Dashboard Engine
 * Full-featured Order Management, Menu CRUD, Size-Pricing, Offers & Settings
 */

const adminState = {
  token: localStorage.getItem('pizzahub_admin_token') || null,
  user: null,
  currentTab: 'orders',
  orders: [],
  menuItems: [],
  coupons: [],
  reviews: [],
  settings: {},
  filterStatus: 'all',
  searchQuery: ''
};

// API Helper with Auth Headers
async function adminFetch(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(adminState.token ? { Authorization: `Bearer ${adminState.token}` } : {}),
    ...(options.headers || {})
  };

  const res = await fetch(endpoint, { ...options, headers });
  if (res.status === 401 || res.status === 403) {
    adminLogout();
    throw new Error('Session expired. Please log in again.');
  }
  return res.json();
}

// Toast Notification for Admin
function showAdminToast(message, type = 'success') {
  alert(message); // Simple, reliable alert fallback for admin
}

// Initialize Admin App
async function initAdmin() {
  if (!adminState.token) {
    showLoginView();
    return;
  }

  try {
    const data = await adminFetch('/api/auth/me');
    if (data.success && data.user) {
      adminState.user = data.user;
      showDashboardView();
      loadAllDashboardData();
    } else {
      adminLogout();
    }
  } catch (err) {
    adminLogout();
  }
}

// Switch between Login and Dashboard Views
function showLoginView() {
  document.getElementById('admin-login-screen').style.display = 'flex';
  document.getElementById('admin-dashboard-screen').style.display = 'none';
}

function showDashboardView() {
  document.getElementById('admin-login-screen').style.display = 'none';
  document.getElementById('admin-dashboard-screen').style.display = 'flex';
}

// Admin Login
async function handleAdminLogin(e) {
  e.preventDefault();
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;
  const errorMsg = document.getElementById('login-error-msg');

  errorMsg.style.display = 'none';

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();

    if (data.success && data.token) {
      adminState.token = data.token;
      adminState.user = data.user;
      localStorage.setItem('pizzahub_admin_token', data.token);
      showDashboardView();
      loadAllDashboardData();
    } else {
      errorMsg.textContent = data.message || 'Invalid username or password.';
      errorMsg.style.display = 'block';
    }
  } catch (err) {
    errorMsg.textContent = 'Server connection error. Please try again.';
    errorMsg.style.display = 'block';
  }
}

// Admin Logout
function adminLogout() {
  adminState.token = null;
  adminState.user = null;
  localStorage.removeItem('pizzahub_admin_token');
  showLoginView();
}

// Load All Dashboard Data
function loadAllDashboardData() {
  loadStats();
  loadOrders();
  loadMenu();
  loadCoupons();
  loadReviews();
  loadSettings();
}

// Switch Admin Navigation Tabs
function switchAdminTab(tabName) {
  adminState.currentTab = tabName;

  // Update nav buttons
  const navBtns = document.querySelectorAll('.sidebar-nav .nav-item-btn');
  navBtns.forEach((btn) => {
    if (btn.dataset.tab === tabName) btn.classList.add('active');
    else btn.classList.remove('active');
  });

  // Update panels
  const panels = document.querySelectorAll('.admin-tab-panel');
  panels.forEach((p) => (p.style.display = 'none'));

  const targetPanel = document.getElementById(`panel-${tabName}`);
  if (targetPanel) targetPanel.style.display = 'block';

  const titleEl = document.getElementById('admin-page-title');
  if (titleEl) {
    const titles = {
      orders: 'Order Management',
      menu: 'Menu & Size-Pricing Editor',
      coupons: 'Offers & Promo Codes',
      reviews: 'Customer Reviews Moderation',
      settings: 'Restaurant Store Settings'
    };
    titleEl.textContent = titles[tabName] || 'Dashboard';
  }
}

// 1. STATS / KPI LOADING
async function loadStats() {
  try {
    const data = await adminFetch('/api/orders/stats/summary');
    if (data.success && data.stats) {
      const s = data.stats;
      document.getElementById('stat-total-orders').textContent = s.total_orders;
      document.getElementById('stat-pending-orders').textContent = s.pending_orders;
      document.getElementById('stat-preparing-orders').textContent = s.preparing_orders;
      document.getElementById('stat-out-orders').textContent = s.out_for_delivery_orders;
      document.getElementById('stat-completed-orders').textContent = s.completed_orders;
      document.getElementById('stat-total-sales').textContent = `Rs. ${Number(s.total_sales).toLocaleString()}`;
      document.getElementById('stat-today-orders').textContent = s.today_orders;
      document.getElementById('stat-today-revenue').textContent = `Rs. ${Number(s.today_revenue).toLocaleString()}`;
    }
  } catch (err) {
    console.warn('Failed to load stats:', err);
  }
}

// 2. ORDER MANAGEMENT
async function loadOrders() {
  try {
    let url = `/api/orders?status=${adminState.filterStatus}`;
    if (adminState.searchQuery) {
      url += `&search=${encodeURIComponent(adminState.searchQuery)}`;
    }

    const data = await adminFetch(url);
    if (data.success) {
      adminState.orders = data.orders;
      renderOrdersTable();
    }
  } catch (err) {
    console.error('Failed to load orders:', err);
  }
}

function renderOrdersTable() {
  const tbody = document.getElementById('orders-table-body');
  if (!tbody) return;

  if (adminState.orders.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-muted);">
          No orders found matching the filter.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = adminState.orders
    .map((ord) => {
      const itemsSummary = (ord.items || [])
        .map((i) => `${i.item_name} (${i.size_name}) x${i.quantity}`)
        .join(', ');

      const formattedDate = new Date(ord.created_at).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });

      return `
      <tr>
        <td><strong>#${ord.order_id}</strong></td>
        <td>
          <div style="font-weight: 700; color: #fff;">${ord.customer_name}</div>
          <div style="font-size: 0.8rem; color: var(--text-dim);">${ord.customer_phone}</div>
        </td>
        <td style="max-width: 250px; font-size: 0.82rem; color: var(--text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          ${itemsSummary || 'N/A'}
        </td>
        <td><strong>Rs. ${Number(ord.total_amount).toLocaleString()}</strong></td>
        <td>
          <span class="status-pill ${ord.status}">${ord.status.replace(/_/g, ' ')}</span>
        </td>
        <td style="font-size: 0.85rem; color: var(--text-dim);">${formattedDate}</td>
        <td>
          <button type="button" class="table-btn view" onclick="viewOrderModal('${ord.order_id}')">View</button>
          <select onchange="updateOrderStatus('${ord.order_id}', this.value)" style="background: rgba(255,255,255,0.06); border: 1px solid var(--admin-border); color: #fff; padding: 5px; border-radius: 6px; font-size: 0.8rem;">
            <option value="received" ${ord.status === 'received' ? 'selected' : ''}>Received</option>
            <option value="confirmed" ${ord.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
            <option value="preparing" ${ord.status === 'preparing' ? 'selected' : ''}>Preparing</option>
            <option value="out_for_delivery" ${ord.status === 'out_for_delivery' ? 'selected' : ''}>Out for Delivery</option>
            <option value="delivered" ${ord.status === 'delivered' ? 'selected' : ''}>Delivered</option>
            <option value="cancelled" ${ord.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
          </select>
          <button type="button" class="table-btn print" onclick="printOrderSlip('${ord.order_id}')">Print</button>
        </td>
      </tr>
    `;
    })
    .join('');
}

// Update Order Status
async function updateOrderStatus(orderId, newStatus) {
  try {
    const data = await adminFetch(`/api/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: newStatus })
    });
    if (data.success) {
      loadStats();
      loadOrders();
    }
  } catch (err) {
    alert('Failed to update status.');
  }
}

// View Order Modal
async function viewOrderModal(orderId) {
  try {
    const data = await adminFetch(`/api/orders/${orderId}`);
    if (!data.success) return;

    const { order, items } = data;
    const modal = document.getElementById('admin-order-modal');
    const content = document.getElementById('admin-order-modal-content');

    const itemsRows = items
      .map(
        (it) => `
      <tr style="border-bottom: 1px solid var(--admin-border);">
        <td style="padding: 10px 0;"><strong>${it.item_name}</strong> (${it.size_name})</td>
        <td style="padding: 10px; text-align: center;">${it.quantity}</td>
        <td style="padding: 10px 0; text-align: right;">Rs. ${it.subtotal}</td>
      </tr>
    `
      )
      .join('');

    content.innerHTML = `
      <div style="padding: 30px;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--admin-border); padding-bottom: 16px; margin-bottom: 20px;">
          <div>
            <h3 style="font-size: 1.4rem; color: #fff;">Order #${order.order_id}</h3>
            <span class="status-pill ${order.status}">${order.status}</span>
          </div>
          <button type="button" onclick="closeAdminModal('admin-order-modal')" style="color: #fff; font-size: 1.5rem;">✕</button>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; font-size: 0.9rem;">
          <div>
            <p><strong>Customer Name:</strong> ${order.customer_name}</p>
            <p><strong>Phone:</strong> ${order.customer_phone}</p>
            <p><strong>WhatsApp:</strong> ${order.customer_whatsapp || 'Same'}</p>
            <p><strong>Email:</strong> ${order.customer_email || 'None'}</p>
          </div>
          <div>
            <p><strong>Delivery Address:</strong> ${order.delivery_address}</p>
            <p><strong>Landmark:</strong> ${order.landmark || 'None'}</p>
            <p><strong>Payment Method:</strong> ${order.payment_method}</p>
            <p><strong>Notes:</strong> ${order.order_notes || 'None'}</p>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="border-bottom: 2px solid var(--admin-border); text-align: left; font-size: 0.8rem; color: var(--text-dim);">
              <th>Item & Size</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>

        <div style="background: rgba(0,0,0,0.3); padding: 16px; border-radius: 8px; margin-bottom: 24px; font-size: 0.92rem;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
            <span>Subtotal:</span>
            <span>Rs. ${order.subtotal}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
            <span>Delivery:</span>
            <span>Rs. ${order.delivery_charges}</span>
          </div>
          ${order.discount_amount > 0 ? `<div style="display: flex; justify-content: space-between; margin-bottom: 6px; color: #10b981;"><span>Discount (${order.coupon_code}):</span><span>-Rs. ${order.discount_amount}</span></div>` : ''}
          <div style="border-top: 1px solid var(--admin-border); padding-top: 8px; display: flex; justify-content: space-between; font-weight: 800; font-size: 1.2rem; color: var(--primary);">
            <span>Total Payable:</span>
            <span>Rs. ${order.total_amount}</span>
          </div>
        </div>

        <div style="display: flex; gap: 12px; justify-content: flex-end;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="printOrderSlip('${order.order_id}')">🖨️ Print Slip</button>
          <button type="button" class="btn btn-primary btn-sm" onclick="closeAdminModal('admin-order-modal')">Close</button>
        </div>
      </div>
    `;

    modal.classList.add('open');
  } catch (err) {
    alert('Failed to load order modal.');
  }
}

// Print Order Slip (Clean Thermal / A4 Receipt)
async function printOrderSlip(orderId) {
  try {
    const data = await adminFetch(`/api/orders/${orderId}`);
    if (!data.success) return;

    const { order, items } = data;
    const itemsHtml = items
      .map(
        (it) => `
      <tr>
        <td style="padding: 4px 0;">${it.item_name} (${it.size_name}) x${it.quantity}</td>
        <td style="text-align: right; padding: 4px 0;">Rs. ${it.subtotal}</td>
      </tr>
    `
      )
      .join('');

    const slipContainer = document.getElementById('printable-receipt');
    slipContainer.innerHTML = `
      <div class="printable-slip">
        <div class="slip-header">
          <h2 style="margin: 0; font-size: 20px;">PIZZA HUB</h2>
          <p style="margin: 3px 0; font-size: 12px;">Fresh Pizza, Fresh Moments</p>
          <p style="margin: 2px 0; font-size: 11px;">Tel: ${adminState.settings.phone_number || '+92 300 1234567'}</p>
        </div>

        <div style="font-size: 12px; margin-bottom: 12px;">
          <p style="margin: 2px 0;"><strong>ORDER ID: #${order.order_id}</strong></p>
          <p style="margin: 2px 0;">Date: ${new Date(order.created_at).toLocaleString()}</p>
          <p style="margin: 2px 0;">Customer: ${order.customer_name} (${order.customer_phone})</p>
          <p style="margin: 2px 0;">Address: ${order.delivery_address}</p>
          ${order.landmark ? `<p style="margin: 2px 0;">Landmark: ${order.landmark}</p>` : ''}
          <p style="margin: 2px 0;">Payment: ${order.payment_method}</p>
          ${order.order_notes ? `<p style="margin: 2px 0;">Notes: ${order.order_notes}</p>` : ''}
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 12px; border-top: 1px dashed #000; border-bottom: 1px dashed #000; margin-bottom: 10px;">
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div style="font-size: 12px; margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between;"><span>Subtotal:</span><span>Rs. ${order.subtotal}</span></div>
          <div style="display: flex; justify-content: space-between;"><span>Delivery Fee:</span><span>Rs. ${order.delivery_charges}</span></div>
          ${order.discount_amount > 0 ? `<div style="display: flex; justify-content: space-between;"><span>Discount:</span><span>-Rs. ${order.discount_amount}</span></div>` : ''}
          <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 15px; border-top: 1px dashed #000; padding-top: 6px; margin-top: 6px;">
            <span>TOTAL:</span><span>Rs. ${order.total_amount}</span>
          </div>
        </div>

        <div style="text-align: center; font-size: 11px; border-top: 1px dashed #000; padding-top: 10px;">
          <p style="margin: 2px 0;">Thank you for ordering with Pizza Hub!</p>
          <p style="margin: 2px 0;">Track Order at http://localhost:3000</p>
        </div>
      </div>
    `;

    window.print();
  } catch (err) {
    alert('Print error: ' + err.message);
  }
}

// 3. MENU MANAGEMENT & CRUD
async function loadMenu() {
  try {
    const data = await adminFetch('/api/menu');
    if (data.success) {
      adminState.menuItems = data.items;
      renderAdminMenuGrid();
    }
  } catch (err) {
    console.warn('Failed to load menu:', err);
  }
}

function renderAdminMenuGrid() {
  const container = document.getElementById('admin-menu-list');
  if (!container) return;

  container.innerHTML = adminState.menuItems
    .map((item) => {
      const priceListHtml = (item.prices || [])
        .map((p) => `<div><strong>${p.size_name}:</strong> Rs. ${p.price}</div>`)
        .join('');

      return `
      <div class="admin-pizza-item">
        <img src="${item.image_url}" alt="${item.name}" class="admin-pizza-thumb" />
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h4 style="color: #fff; font-size: 1.1rem; margin: 0;">${item.name}</h4>
            <span style="font-size: 0.75rem; color: var(--accent-gold); font-weight: 700;">${item.category}</span>
          </div>
          <p style="font-size: 0.8rem; color: var(--text-dim); margin-top: 4px;">${item.description.slice(0, 80)}...</p>
        </div>

        <div class="size-price-list">
          ${priceListHtml || 'No prices set'}
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--admin-border); padding-top: 10px;">
          <button type="button" class="table-btn edit" onclick="openEditPizzaModal(${item.id})">✏️ Edit</button>
          <button type="button" class="table-btn delete" onclick="deletePizza(${item.id})">🗑️ Delete</button>
        </div>
      </div>
    `;
    })
    .join('');
}

// Add New Pizza Modal
function openAddPizzaModal() {
  document.getElementById('pizza-modal-title').textContent = 'Add New Pizza';
  document.getElementById('pizza-form-id').value = '';
  document.getElementById('pizza-name-input').value = '';
  document.getElementById('pizza-desc-input').value = '';
  document.getElementById('pizza-ingredients-input').value = '';
  document.getElementById('pizza-badge-input').value = '';
  document.getElementById('pizza-category-select').value = 'Classic';
  document.getElementById('pizza-image-url-input').value = '';

  document.getElementById('pizza-price-small').value = '649';
  document.getElementById('pizza-price-medium').value = '1149';
  document.getElementById('pizza-price-large').value = '1699';
  document.getElementById('pizza-price-xl').value = '2199';

  document.getElementById('admin-pizza-modal').classList.add('open');
}

// Edit Pizza Modal
function openEditPizzaModal(itemId) {
  const item = adminState.menuItems.find((i) => i.id === itemId);
  if (!item) return;

  document.getElementById('pizza-modal-title').textContent = 'Edit Pizza: ' + item.name;
  document.getElementById('pizza-form-id').value = item.id;
  document.getElementById('pizza-name-input').value = item.name;
  document.getElementById('pizza-desc-input').value = item.description;
  document.getElementById('pizza-ingredients-input').value = item.ingredients;
  document.getElementById('pizza-badge-input').value = item.badge || '';
  document.getElementById('pizza-category-select').value = item.category;
  document.getElementById('pizza-image-url-input').value = item.image_url;

  // Populate size prices
  const sPrice = item.prices.find((p) => p.size_name === 'Small')?.price || 649;
  const mPrice = item.prices.find((p) => p.size_name === 'Medium')?.price || 1149;
  const lPrice = item.prices.find((p) => p.size_name === 'Large')?.price || 1699;
  const xlPrice = item.prices.find((p) => p.size_name === 'Extra Large')?.price || 2199;

  document.getElementById('pizza-price-small').value = sPrice;
  document.getElementById('pizza-price-medium').value = mPrice;
  document.getElementById('pizza-price-large').value = lPrice;
  document.getElementById('pizza-price-xl').value = xlPrice;

  document.getElementById('admin-pizza-modal').classList.add('open');
}

// Handle Image File Upload in Add/Edit Pizza Modal
async function handleImageFileUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('image', file);

  try {
    const res = await fetch('/api/menu/upload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminState.token}`
      },
      body: formData
    });
    const data = await res.json();
    if (data.success && data.imageUrl) {
      document.getElementById('pizza-image-url-input').value = data.imageUrl;
      alert('Image uploaded successfully!');
    } else {
      alert('Image upload failed: ' + data.message);
    }
  } catch (err) {
    alert('Upload error: ' + err.message);
  }
}

// Save Pizza Form
async function handleSavePizza(e) {
  e.preventDefault();
  const id = document.getElementById('pizza-form-id').value;
  const name = document.getElementById('pizza-name-input').value.trim();
  const description = document.getElementById('pizza-desc-input').value.trim();
  const ingredients = document.getElementById('pizza-ingredients-input').value.trim();
  const badge = document.getElementById('pizza-badge-input').value.trim();
  const category = document.getElementById('pizza-category-select').value;
  const image_url = document.getElementById('pizza-image-url-input').value.trim();

  const prices = [
    { size_name: 'Small', price: parseFloat(document.getElementById('pizza-price-small').value) || 0 },
    { size_name: 'Medium', price: parseFloat(document.getElementById('pizza-price-medium').value) || 0 },
    { size_name: 'Large', price: parseFloat(document.getElementById('pizza-price-large').value) || 0 },
    { size_name: 'Extra Large', price: parseFloat(document.getElementById('pizza-price-xl').value) || 0 }
  ];

  const payload = {
    name,
    description,
    ingredients,
    badge,
    category,
    image_url,
    prices
  };

  try {
    const url = id ? `/api/menu/${id}` : '/api/menu';
    const method = id ? 'PUT' : 'POST';

    const data = await adminFetch(url, {
      method,
      body: JSON.stringify(payload)
    });

    if (data.success) {
      closeAdminModal('admin-pizza-modal');
      loadMenu();
    } else {
      alert(data.message || 'Save failed.');
    }
  } catch (err) {
    alert('Error saving pizza.');
  }
}

// Delete Pizza
async function deletePizza(itemId) {
  if (!confirm('Are you sure you want to delete this pizza?')) return;
  try {
    const data = await adminFetch(`/api/menu/${itemId}`, { method: 'DELETE' });
    if (data.success) loadMenu();
  } catch (err) {
    alert('Failed to delete pizza.');
  }
}

// 4. COUPONS / OFFERS MANAGEMENT
async function loadCoupons() {
  try {
    const data = await adminFetch('/api/coupons');
    if (data.success) {
      adminState.coupons = data.coupons;
      renderAdminCouponsTable();
    }
  } catch (err) {
    console.warn('Failed to load coupons:', err);
  }
}

function renderAdminCouponsTable() {
  const tbody = document.getElementById('coupons-table-body');
  if (!tbody) return;

  tbody.innerHTML = adminState.coupons
    .map(
      (c) => `
      <tr>
        <td><strong style="color: var(--accent-gold);">${c.code}</strong></td>
        <td>${c.description}</td>
        <td>${c.discount_type === 'percentage' ? `${c.discount_value}%` : `Rs. ${c.discount_value}`}</td>
        <td>Rs. ${c.min_order_amount}</td>
        <td>${c.expiry_date || 'None'}</td>
        <td>
          <span class="status-pill ${c.is_active ? 'delivered' : 'cancelled'}">${c.is_active ? 'ACTIVE' : 'DISABLED'}</span>
        </td>
        <td>
          <button type="button" class="table-btn delete" onclick="deleteCoupon(${c.id})">Delete</button>
        </td>
      </tr>
    `
    )
    .join('');
}

// Save New Coupon
async function handleSaveCoupon(e) {
  e.preventDefault();
  const code = document.getElementById('coupon-code-input').value.trim();
  const description = document.getElementById('coupon-desc-input').value.trim();
  const discount_type = document.getElementById('coupon-type-select').value;
  const discount_value = parseFloat(document.getElementById('coupon-val-input').value);
  const min_order_amount = parseFloat(document.getElementById('coupon-min-input').value);
  const expiry_date = document.getElementById('coupon-expiry-input').value;

  try {
    const data = await adminFetch('/api/coupons', {
      method: 'POST',
      body: JSON.stringify({
        code,
        description,
        discount_type,
        discount_value,
        min_order_amount,
        expiry_date
      })
    });
    if (data.success) {
      document.getElementById('new-coupon-form').reset();
      loadCoupons();
    } else {
      alert(data.message || 'Failed to create coupon.');
    }
  } catch (err) {
    alert('Coupon create error.');
  }
}

async function deleteCoupon(id) {
  if (!confirm('Delete this coupon?')) return;
  try {
    await adminFetch(`/api/coupons/${id}`, { method: 'DELETE' });
    loadCoupons();
  } catch (err) {
    alert('Failed to delete coupon.');
  }
}

// 5. REVIEWS MODERATION
async function loadReviews() {
  try {
    const data = await adminFetch('/api/reviews/all');
    if (data.success) {
      adminState.reviews = data.reviews;
      renderAdminReviews();
    }
  } catch (err) {
    console.warn('Reviews load error:', err);
  }
}

function renderAdminReviews() {
  const container = document.getElementById('admin-reviews-list');
  if (!container) return;

  container.innerHTML = adminState.reviews
    .map(
      (r) => `
      <div style="background: #141419; border: 1px solid var(--admin-border); border-radius: 8px; padding: 16px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="font-weight: 700; color: #fff;">${r.customer_name} - <span style="color: var(--accent-gold);">${'★'.repeat(r.rating)}</span></div>
          <p style="color: var(--text-muted); font-size: 0.88rem; margin: 4px 0;">"${r.comment}"</p>
        </div>
        <div style="display: flex; gap: 8px;">
          <button type="button" class="table-btn ${r.is_approved ? 'delete' : 'edit'}" onclick="toggleReviewApprove(${r.id}, ${r.is_approved ? 0 : 1})">
            ${r.is_approved ? 'Hide' : 'Approve'}
          </button>
          <button type="button" class="table-btn delete" onclick="deleteReview(${r.id})">Delete</button>
        </div>
      </div>
    `
    )
    .join('');
}

async function toggleReviewApprove(id, is_approved) {
  await adminFetch(`/api/reviews/${id}/approve`, {
    method: 'PUT',
    body: JSON.stringify({ is_approved })
  });
  loadReviews();
}

async function deleteReview(id) {
  if (!confirm('Delete this review?')) return;
  await adminFetch(`/api/reviews/${id}`, { method: 'DELETE' });
  loadReviews();
}

// 6. STORE SETTINGS
async function loadSettings() {
  try {
    const data = await adminFetch('/api/settings');
    if (data.success && data.settings) {
      adminState.settings = data.settings;
      const s = data.settings;
      document.getElementById('setting-phone').value = s.phone_number;
      document.getElementById('setting-whatsapp').value = s.whatsapp_number;
      document.getElementById('setting-email').value = s.email;
      document.getElementById('setting-address').value = s.address;
      document.getElementById('setting-delivery-fee').value = s.delivery_charges;
      document.getElementById('setting-free-threshold').value = s.free_delivery_threshold;
      document.getElementById('setting-24-hours').checked = Boolean(s.is_24_hours_open);
      document.getElementById('setting-hours').value = s.business_hours;
    }
  } catch (err) {
    console.warn('Settings load error:', err);
  }
}

async function handleSaveSettings(e) {
  e.preventDefault();
  const payload = {
    phone_number: document.getElementById('setting-phone').value.trim(),
    whatsapp_number: document.getElementById('setting-whatsapp').value.trim(),
    email: document.getElementById('setting-email').value.trim(),
    address: document.getElementById('setting-address').value.trim(),
    delivery_charges: parseFloat(document.getElementById('setting-delivery-fee').value),
    free_delivery_threshold: parseFloat(document.getElementById('setting-free-threshold').value),
    is_24_hours_open: document.getElementById('setting-24-hours').checked ? 1 : 0,
    business_hours: document.getElementById('setting-hours').value.trim()
  };

  try {
    const data = await adminFetch('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
    if (data.success) {
      alert('Settings updated successfully!');
      loadSettings();
    }
  } catch (err) {
    alert('Settings update error.');
  }
}

// Modal helper
function closeAdminModal(modalId) {
  const m = document.getElementById(modalId);
  if (m) m.classList.remove('open');
}

// Event Listeners on DOM Load
document.addEventListener('DOMContentLoaded', () => {
  initAdmin();

  // Login Form
  const loginForm = document.getElementById('admin-login-form');
  if (loginForm) loginForm.addEventListener('submit', handleAdminLogin);

  // Search & Filter Orders
  const searchInput = document.getElementById('order-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      adminState.searchQuery = e.target.value.trim();
      loadOrders();
    });
  }

  const filterSelect = document.getElementById('order-status-filter');
  if (filterSelect) {
    filterSelect.addEventListener('change', (e) => {
      adminState.filterStatus = e.target.value;
      loadOrders();
    });
  }

  // Pizza Form
  const pizzaForm = document.getElementById('admin-pizza-form');
  if (pizzaForm) pizzaForm.addEventListener('submit', handleSavePizza);

  // Image Upload input
  const imageFileInput = document.getElementById('pizza-image-file-input');
  if (imageFileInput) imageFileInput.addEventListener('change', handleImageFileUpload);

  // Coupon Form
  const couponForm = document.getElementById('new-coupon-form');
  if (couponForm) couponForm.addEventListener('submit', handleSaveCoupon);

  // Settings Form
  const settingsForm = document.getElementById('admin-settings-form');
  if (settingsForm) settingsForm.addEventListener('submit', handleSaveSettings);
});
