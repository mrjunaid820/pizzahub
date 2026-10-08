/**
 * PIZZA HUB - Main Customer Frontend Application
 * High-performance, reactive, and fully responsive
 */

// Application State
const state = {
  menuItems: [],
  activeCategory: 'All',
  cart: JSON.parse(localStorage.getItem('pizzahub_cart') || '[]'),
  appliedCoupon: null,
  settings: {
    restaurant_name: 'Pizza Hub',
    phone_number: '+92 300 1234567',
    whatsapp_number: '923001234567',
    email: 'orders@pizzahub.com',
    currency: 'Rs.',
    delivery_charges: 150,
    free_delivery_threshold: 2500,
    is_24_hours_open: true
  },
  selectedCardSizes: {}, // itemId -> { size_name, price }
  selectedCardQtys: {}   // itemId -> quantity
};

// Save Cart to Local Storage
function saveCart() {
  localStorage.setItem('pizzahub_cart', JSON.stringify(state.cart));
  updateCartBadge();
  renderCartDrawer();
}

// Toast Notifications
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '🍕' : '⚠️'}</span>
    <div>${message}</div>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-30px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Update Cart Badge Counter
function updateCartBadge() {
  const badges = document.querySelectorAll('.cart-badge');
  const count = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  badges.forEach((b) => {
    b.textContent = count;
    b.style.display = count > 0 ? 'flex' : 'none';
  });
}

// Fetch Restaurant Settings
async function fetchSettings() {
  try {
    const res = await fetch('/api/settings');
    const data = await res.json();
    if (data.success && data.settings) {
      state.settings = data.settings;

      // Update phone links
      const phoneLinks = document.querySelectorAll('.phone-link');
      phoneLinks.forEach((el) => {
        el.href = `tel:${data.settings.phone_number.replace(/\s+/g, '')}`;
        if (el.dataset.text === 'true') el.textContent = data.settings.phone_number;
      });

      // Update WhatsApp links
      const waLinks = document.querySelectorAll('.whatsapp-link');
      waLinks.forEach((el) => {
        el.href = `https://wa.me/${data.settings.whatsapp_number}?text=${encodeURIComponent('Hello Pizza Hub! I would like to place an order or ask a question.')}`;
      });

      // Update Email links
      const emailLinks = document.querySelectorAll('.email-link');
      emailLinks.forEach((el) => {
        el.href = `mailto:${data.settings.email}`;
        if (el.dataset.text === 'true') el.textContent = data.settings.email;
      });

      // Update Announcement Bar
      const bannerEl = document.getElementById('announcement-text');
      if (bannerEl && data.settings.announcement_banner) {
        bannerEl.textContent = data.settings.announcement_banner;
      }

      // Update 24/7 Delivery Badge
      const deliveryStatusBadges = document.querySelectorAll('.delivery-status-badge');
      deliveryStatusBadges.forEach((badge) => {
        if (data.settings.is_24_hours_open) {
          badge.innerHTML = `<span class="pulse-dot"></span> 24/7 Delivery Active`;
        } else {
          badge.innerHTML = `🕒 Delivery: ${data.settings.business_hours || '11:00 AM - 02:00 AM'}`;
        }
      });
    }
  } catch (err) {
    console.warn('Failed to load settings:', err);
  }
}

// Fetch Menu Items
async function fetchMenu() {
  try {
    const container = document.getElementById('menu-items-grid');
    if (container) {
      container.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">
          <div style="font-size: 2.5rem; margin-bottom: 10px;">🍕</div>
          <p>Loading fresh artisan pizzas...</p>
        </div>
      `;
    }

    const res = await fetch('/api/menu');
    const data = await res.json();
    if (data.success) {
      state.menuItems = data.items;
      renderMenu();
      renderPopularPizzas();
    }
  } catch (err) {
    console.error('Menu load error:', err);
    showToast('Failed to load menu items.', 'error');
  }
}

// Render Menu Cards
function renderMenu() {
  const container = document.getElementById('menu-items-grid');
  if (!container) return;

  const filtered = state.activeCategory === 'All'
    ? state.menuItems
    : state.menuItems.filter((i) => i.category === state.activeCategory);

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 60px; color: var(--text-muted);">
        <p style="font-size: 1.2rem;">No items found in this category right now.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map((item) => createPizzaCardHtml(item)).join('');
}

// Render Popular / Best Sellers on Homepage
function renderPopularPizzas() {
  const container = document.getElementById('popular-pizzas-grid');
  if (!container) return;

  const popular = state.menuItems.filter((i) => i.is_bestseller || i.is_popular).slice(0, 6);
  container.innerHTML = popular.map((item) => createPizzaCardHtml(item)).join('');
}

// Generate Single Pizza Card HTML
function createPizzaCardHtml(item) {
  const defaultPriceObj = (item.prices && item.prices.length > 0)
    ? (item.prices.find((p) => p.size_name === 'Medium') || item.prices[0])
    : { size_name: 'Medium', price: 999 };

  if (!state.selectedCardSizes[item.id]) {
    state.selectedCardSizes[item.id] = defaultPriceObj;
  }
  if (!state.selectedCardQtys[item.id]) {
    state.selectedCardQtys[item.id] = 1;
  }

  const currentSizeObj = state.selectedCardSizes[item.id];
  const currentQty = state.selectedCardQtys[item.id];

  const ingredientsList = item.ingredients
    ? item.ingredients
        .split(',')
        .map((ing) => `<span class="ingredient-tag">${ing.trim()}</span>`)
        .slice(0, 4)
        .join('')
    : '';

  const sizeButtons = (item.prices || [])
    .map(
      (p) => `
      <button 
        type="button" 
        class="size-btn ${currentSizeObj.size_name === p.size_name ? 'active' : ''}" 
        onclick="selectCardSize(${item.id}, '${p.size_name}', ${p.price})"
      >
        ${p.size_name}
      </button>
    `
    )
    .join('');

  return `
    <div class="pizza-card" id="card-${item.id}">
      <div class="pizza-card-image">
        <img src="${item.image_url}" alt="${item.name}" loading="lazy" />
        ${item.badge ? `<span class="card-badge ${item.badge.includes('Gold') || item.badge.includes('Chef') ? 'gold' : ''}">${item.badge}</span>` : ''}
      </div>
      <div class="pizza-card-body">
        <h3 class="pizza-name">${item.name}</h3>
        <p class="pizza-desc">${item.description}</p>
        
        ${ingredientsList ? `<div class="pizza-ingredients">${ingredientsList}</div>` : ''}

        <div class="size-selector-label">Select Size</div>
        <div class="size-selector-group">
          ${sizeButtons}
        </div>

        <div class="pizza-footer">
          <div class="price-qty-row">
            <div class="pizza-price-box">
              <span class="price-label">Price (${currentSizeObj.size_name})</span>
              <div class="pizza-price" id="price-val-${item.id}">
                ${state.settings.currency} <span>${Number(currentSizeObj.price).toLocaleString()}</span>
              </div>
            </div>

            <div class="qty-control">
              <button type="button" class="qty-btn" onclick="adjustCardQty(${item.id}, -1)">−</button>
              <span class="qty-input" id="qty-val-${item.id}">${currentQty}</span>
              <button type="button" class="qty-btn" onclick="adjustCardQty(${item.id}, 1)">+</button>
            </div>
          </div>

          <div class="card-actions">
            <button type="button" class="btn btn-secondary btn-sm" onclick="addToCartFromCard(${item.id})">
              🛒 Add to Cart
            </button>
            <button type="button" class="btn btn-primary btn-sm" onclick="buyNowFromCard(${item.id})">
              ⚡ Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Switch Size on Card
function selectCardSize(itemId, sizeName, price) {
  state.selectedCardSizes[itemId] = { size_name: sizeName, price };

  // Update active buttons in DOM
  const card = document.getElementById(`card-${itemId}`);
  if (card) {
    const btns = card.querySelectorAll('.size-btn');
    btns.forEach((b) => {
      if (b.textContent.trim() === sizeName) b.classList.add('active');
      else b.classList.remove('active');
    });

    // Update Price Display
    const priceValEl = document.getElementById(`price-val-${itemId}`);
    if (priceValEl) {
      priceValEl.innerHTML = `${state.settings.currency} <span>${Number(price).toLocaleString()}</span>`;
    }
  }
}

// Adjust Quantity on Card
function adjustCardQty(itemId, delta) {
  const current = state.selectedCardQtys[itemId] || 1;
  const next = Math.max(1, current + delta);
  state.selectedCardQtys[itemId] = next;

  const qtyEl = document.getElementById(`qty-val-${itemId}`);
  if (qtyEl) qtyEl.textContent = next;
}

// Add Item to Cart
function addToCartFromCard(itemId) {
  const item = state.menuItems.find((i) => i.id === itemId);
  if (!item) return;

  const sizeObj = state.selectedCardSizes[itemId] || (item.prices && item.prices[0]);
  const qty = state.selectedCardQtys[itemId] || 1;

  addItemToCart(item, sizeObj.size_name, sizeObj.price, qty);
  showToast(`Added ${qty}x ${item.name} (${sizeObj.size_name}) to cart!`, 'success');
}

// Buy Now: Add to cart & immediately open Checkout
function buyNowFromCard(itemId) {
  addToCartFromCard(itemId);
  openCartDrawer();
  navigateToPage('checkout');
}

// General Add to Cart Handler
function addItemToCart(item, sizeName, price, quantity) {
  const existingIndex = state.cart.findIndex(
    (c) => c.id === item.id && c.size_name === sizeName
  );

  if (existingIndex > -1) {
    state.cart[existingIndex].quantity += quantity;
  } else {
    state.cart.push({
      id: item.id,
      name: item.name,
      image_url: item.image_url,
      size_name: sizeName,
      unit_price: parseFloat(price),
      quantity: quantity
    });
  }

  saveCart();
}

// Adjust Cart Item Quantity in Drawer/Cart Page
function updateCartItemQty(index, delta) {
  if (state.cart[index]) {
    state.cart[index].quantity += delta;
    if (state.cart[index].quantity <= 0) {
      state.cart.splice(index, 1);
    }
    saveCart();
    if (document.getElementById('checkout-page') && !document.getElementById('checkout-page').classList.contains('hidden')) {
      renderCheckoutSummary();
    }
  }
}

// Remove Item from Cart
function removeCartItem(index) {
  if (state.cart[index]) {
    state.cart.splice(index, 1);
    saveCart();
    showToast('Item removed from cart.');
    if (document.getElementById('checkout-page') && !document.getElementById('checkout-page').classList.contains('hidden')) {
      renderCheckoutSummary();
    }
  }
}

// Cart Drawer Calculations
function calculateCartTotals() {
  const subtotal = state.cart.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
  const freeThreshold = state.settings.free_delivery_threshold || 2500;
  let delivery = subtotal > 0 ? (state.settings.delivery_charges || 150) : 0;

  if (subtotal >= freeThreshold) {
    delivery = 0;
  }

  let discount = 0;
  if (state.appliedCoupon) {
    discount = state.appliedCoupon.discount_amount || 0;
  }

  const total = Math.max(0, subtotal + delivery - discount);

  return { subtotal, delivery, discount, total };
}

// Render Cart Drawer
function renderCartDrawer() {
  const container = document.getElementById('cart-items-list');
  const footerEl = document.getElementById('cart-drawer-footer');
  if (!container || !footerEl) return;

  if (state.cart.length === 0) {
    container.innerHTML = `
      <div class="empty-cart-state">
        <span>🍕</span>
        <h4>Your Cart is Empty</h4>
        <p>Explore our menu and add your favorite pizzas!</p>
        <button type="button" class="btn btn-primary btn-sm" style="margin-top: 15px;" onclick="closeCartDrawer(); navigateToPage('menu');">
          Browse Menu
        </button>
      </div>
    `;
    footerEl.style.display = 'none';
    return;
  }

  footerEl.style.display = 'block';

  container.innerHTML = state.cart
    .map(
      (item, idx) => `
      <div class="cart-item-card">
        <img src="${item.image_url}" alt="${item.name}" style="width: 54px; height: 54px; border-radius: 8px; object-fit: cover;" />
        <div class="cart-item-info" style="flex-grow: 1;">
          <h5>${item.name}</h5>
          <div class="cart-item-size">Size: ${item.size_name}</div>
          <div class="cart-item-price">${state.settings.currency} ${(item.unit_price * item.quantity).toLocaleString()}</div>
        </div>
        <div class="qty-control" style="transform: scale(0.85);">
          <button type="button" class="qty-btn" onclick="updateCartItemQty(${idx}, -1)">−</button>
          <span class="qty-input">${item.quantity}</span>
          <button type="button" class="qty-btn" onclick="updateCartItemQty(${idx}, 1)">+</button>
        </div>
        <button type="button" onclick="removeCartItem(${idx})" style="color: #ef4444; font-size: 1.1rem; padding: 4px;">
          🗑️
        </button>
      </div>
    `
    )
    .join('');

  const { subtotal, delivery, discount, total } = calculateCartTotals();

  const summaryHtml = `
    <div class="cart-summary-line">
      <span>Subtotal:</span>
      <span>${state.settings.currency} ${subtotal.toLocaleString()}</span>
    </div>
    <div class="cart-summary-line">
      <span>Delivery Fee:</span>
      <span>${delivery === 0 ? '<strong style="color: #10b981;">FREE</strong>' : `${state.settings.currency} ${delivery}`}</span>
    </div>
    ${
      discount > 0
        ? `
    <div class="cart-summary-line" style="color: #10b981;">
      <span>Coupon Discount (${state.appliedCoupon.code}):</span>
      <span>-${state.settings.currency} ${discount.toLocaleString()}</span>
    </div>`
        : ''
    }
    <div class="cart-summary-line total">
      <span>Total:</span>
      <span>${state.settings.currency} ${total.toLocaleString()}</span>
    </div>
    <div style="margin-top: 16px; display: grid; gap: 10px;">
      <button type="button" class="btn btn-primary btn-block" onclick="closeCartDrawer(); navigateToPage('checkout');">
        Proceed to Checkout →
      </button>
      <button type="button" class="btn btn-secondary btn-block btn-sm" onclick="closeCartDrawer();">
        Continue Ordering
      </button>
    </div>
  `;

  footerEl.innerHTML = summaryHtml;
}

// Open & Close Cart Drawer
function openCartDrawer() {
  const overlay = document.getElementById('cart-drawer-overlay');
  if (overlay) {
    renderCartDrawer();
    overlay.classList.add('open');
  }
}

function closeCartDrawer() {
  const overlay = document.getElementById('cart-drawer-overlay');
  if (overlay) overlay.classList.remove('open');
}

// Filter Categories
function setCategory(cat) {
  state.activeCategory = cat;
  const pills = document.querySelectorAll('.category-pill');
  pills.forEach((p) => {
    if (p.textContent.trim() === cat) p.classList.add('active');
    else p.classList.remove('active');
  });
  renderMenu();
}

// Fetch Active Offers / Coupons
async function fetchOffers() {
  try {
    const res = await fetch('/api/coupons/active');
    const data = await res.json();
    if (data.success && data.coupons) {
      renderOffersGrid(data.coupons);
    }
  } catch (err) {
    console.warn('Failed to load offers:', err);
  }
}

function renderOffersGrid(coupons) {
  const container = document.getElementById('offers-container');
  if (!container) return;

  container.innerHTML = coupons
    .map(
      (c) => `
      <div class="offer-card">
        <span class="offer-badge">
          ${c.discount_type === 'percentage' ? `${c.discount_value}% DISCOUNT` : `FLAT ${state.settings.currency} ${c.discount_value} OFF`}
        </span>
        <h3 class="offer-title">${c.description || 'Exclusive Pizza Deal'}</h3>
        <p class="offer-desc">Valid on orders above ${state.settings.currency} ${c.min_order_amount}. Hurry, limited time offer!</p>
        <div class="coupon-copy-box">
          <span class="coupon-code-text">${c.code}</span>
          <button type="button" class="copy-btn" onclick="copyCouponCode('${c.code}')">Copy Code</button>
        </div>
      </div>
    `
    )
    .join('');
}

function copyCouponCode(code) {
  navigator.clipboard.writeText(code);
  showToast(`Coupon "${code}" copied to clipboard! Paste it at checkout.`);
}

// Apply Coupon at Checkout
async function applyCoupon() {
  const input = document.getElementById('checkout-coupon-input');
  if (!input || !input.value.trim()) {
    showToast('Please enter a coupon code.', 'error');
    return;
  }

  const { subtotal } = calculateCartTotals();
  if (subtotal === 0) {
    showToast('Add items to cart before applying coupon.', 'error');
    return;
  }

  try {
    const res = await fetch('/api/coupons/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: input.value.trim(),
        subtotal
      })
    });
    const data = await res.json();

    if (data.success && data.coupon) {
      state.appliedCoupon = data.coupon;
      showToast(data.message, 'success');
      renderCheckoutSummary();
      renderCartDrawer();
    } else {
      showToast(data.message || 'Invalid coupon.', 'error');
    }
  } catch (err) {
    showToast('Failed to validate coupon.', 'error');
  }
}

// Render Checkout Order Summary
function renderCheckoutSummary() {
  const container = document.getElementById('checkout-summary-container');
  if (!container) return;

  if (state.cart.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px; color: var(--text-muted);">
        <p>Your cart is empty.</p>
        <button type="button" class="btn btn-primary btn-sm" style="margin-top: 10px;" onclick="navigateToPage('menu')">Add Pizzas Now</button>
      </div>
    `;
    return;
  }

  const itemsHtml = state.cart
    .map(
      (item) => `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; font-size: 0.92rem;">
        <div>
          <strong style="color: #fff;">${item.name}</strong> 
          <span style="color: var(--accent-gold); font-size: 0.8rem;">(${item.size_name})</span>
          <span style="color: var(--text-dim); margin-left: 6px;">x${item.quantity}</span>
        </div>
        <div style="font-weight: 700; color: #fff;">
          ${state.settings.currency} ${(item.unit_price * item.quantity).toLocaleString()}
        </div>
      </div>
    `
    )
    .join('');

  const { subtotal, delivery, discount, total } = calculateCartTotals();

  container.innerHTML = `
    <h3 style="font-size: 1.25rem; font-weight: 800; margin-bottom: 20px; color: #fff;">Order Summary</h3>
    <div style="border-bottom: 1px solid var(--dark-border); padding-bottom: 15px; margin-bottom: 15px;">
      ${itemsHtml}
    </div>

    <!-- Coupon Input Box -->
    <div style="display: flex; gap: 8px; margin-bottom: 20px;">
      <input type="text" id="checkout-coupon-input" placeholder="Coupon Code (e.g. PIZZAFIRST)" 
             value="${state.appliedCoupon ? state.appliedCoupon.code : ''}" 
             style="flex-grow: 1; padding: 10px 14px; background: rgba(255,255,255,0.05); border: 1px solid var(--dark-border); border-radius: 8px; color: #fff; font-family: monospace; text-transform: uppercase;" />
      <button type="button" class="btn btn-secondary btn-sm" onclick="applyCoupon()">Apply</button>
    </div>

    <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: var(--text-muted); font-size: 0.9rem;">
      <span>Subtotal:</span>
      <span>${state.settings.currency} ${subtotal.toLocaleString()}</span>
    </div>
    <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: var(--text-muted); font-size: 0.9rem;">
      <span>Delivery Charges:</span>
      <span>${delivery === 0 ? '<strong style="color: #10b981;">FREE</strong>' : `${state.settings.currency} ${delivery}`}</span>
    </div>
    ${
      discount > 0
        ? `
    <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #10b981; font-size: 0.9rem;">
      <span>Discount (${state.appliedCoupon.code}):</span>
      <span>-${state.settings.currency} ${discount.toLocaleString()}</span>
    </div>`
        : ''
    }
    <div style="border-top: 1px solid var(--dark-border); padding-top: 14px; margin-top: 10px; display: flex; justify-content: space-between; font-size: 1.35rem; font-weight: 800; color: #fff;">
      <span>Total Payable:</span>
      <span style="color: var(--primary);">${state.settings.currency} ${total.toLocaleString()}</span>
    </div>
  `;
}

// Checkout Form Submission (Anti-Double-Click & Idempotency)
let isSubmittingOrder = false;

async function handleCheckoutSubmit(e) {
  e.preventDefault();

  if (isSubmittingOrder) return;
  if (state.cart.length === 0) {
    showToast('Your cart is empty. Please add items first.', 'error');
    return;
  }

  const name = document.getElementById('checkout-name').value.trim();
  const phone = document.getElementById('checkout-phone').value.trim();
  const sameWa = document.getElementById('same-whatsapp-checkbox').checked;
  const whatsapp = sameWa ? phone : document.getElementById('checkout-whatsapp').value.trim();
  const email = document.getElementById('checkout-email').value.trim();
  const address = document.getElementById('checkout-address').value.trim();
  const landmark = document.getElementById('checkout-landmark').value.trim();
  const notes = document.getElementById('checkout-notes').value.trim();
  const paymentMethod = document.querySelector('input[name="payment_method"]:checked')?.value || 'Cash on Delivery';

  if (!name || !phone || !address) {
    showToast('Please fill in your Name, Phone Number, and Delivery Address.', 'error');
    return;
  }

  const btn = document.getElementById('confirm-order-btn');
  isSubmittingOrder = true;
  btn.disabled = true;
  btn.innerHTML = `<span>⏳</span> Confirming Your Delicious Pizza...`;

  const idempotencyKey = `order_${phone}_${Date.now()}`;

  try {
    const payload = {
      customer_name: name,
      customer_phone: phone,
      customer_whatsapp: whatsapp || phone,
      customer_email: email,
      delivery_address: address,
      landmark: landmark,
      city: 'Karachi',
      order_notes: notes,
      payment_method: paymentMethod,
      items: state.cart.map((i) => ({
        menu_item_id: i.id,
        item_name: i.name,
        size_name: i.size_name,
        unit_price: i.unit_price,
        quantity: i.quantity,
        subtotal: i.unit_price * i.quantity
      })),
      coupon_code: state.appliedCoupon ? state.appliedCoupon.code : null,
      idempotency_key: idempotencyKey
    };

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (data.success) {
      // Clear Cart
      state.cart = [];
      state.appliedCoupon = null;
      saveCart();

      // Show Order Confirmation
      showOrderConfirmation(data);
    } else {
      showToast(data.message || 'Failed to place order. Please check your information.', 'error');
    }
  } catch (err) {
    console.error('Order error:', err);
    showToast('Network error while placing order. Please try again.', 'error');
  } finally {
    isSubmittingOrder = false;
    btn.disabled = false;
    btn.innerHTML = `🍕 Confirm Order Now`;
  }
}

// Show Order Confirmation Modal
function showOrderConfirmation(data) {
  const modal = document.getElementById('order-confirmation-modal');
  if (!modal) return;

  const content = document.getElementById('confirmation-modal-content');
  content.innerHTML = `
    <div class="confirmation-body">
      <div class="conf-pizza-icon">🍕</div>
      <h2 style="font-size: 2rem; font-weight: 800; color: #fff; margin-bottom: 8px;">Order Confirmed!</h2>
      <p style="color: var(--text-muted); font-size: 1rem; max-width: 480px; margin: 0 auto 15px;">
        Thank you for choosing <strong>Pizza Hub</strong>. Your delicious pizza is being prepared. We’ll contact you shortly to confirm your delivery.
      </p>

      <div>
        <span class="order-id-badge">Order ID: #${data.order_id}</span>
      </div>

      <div style="background: rgba(255, 255, 255, 0.04); border: 1px solid var(--dark-border); border-radius: var(--radius-md); padding: 20px; text-align: left; margin: 24px 0; font-size: 0.9rem;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
          <span style="color: var(--text-muted);">Total Amount:</span>
          <strong style="color: var(--primary);">${state.settings.currency} ${data.order.total_amount.toLocaleString()} (${data.order.payment_method})</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
          <span style="color: var(--text-muted);">Delivery Address:</span>
          <span style="color: #fff; max-width: 250px; text-align: right;">${data.order.delivery_address}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: var(--text-muted);">Contact:</span>
          <span style="color: #fff;">${data.order.customer_phone}</span>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 12px;">
        <a href="${data.whatsapp_admin_url}" target="_blank" class="btn btn-primary btn-block" style="background: #25d366; box-shadow: 0 4px 15px rgba(37, 211, 102, 0.35);">
          💬 Send Order Slip to Restaurant WhatsApp
        </a>
        <button type="button" class="btn btn-secondary btn-block" onclick="closeConfirmationModal(); trackOrderById('${data.order_id}');">
          📍 Track Order Live
        </button>
      </div>
    </div>
  `;

  modal.classList.add('open');
}

function closeConfirmationModal() {
  const modal = document.getElementById('order-confirmation-modal');
  if (modal) modal.classList.remove('open');
}

// Track Order Live
async function trackOrderById(orderId) {
  const id = orderId || document.getElementById('track-order-input').value.trim();
  if (!id) {
    showToast('Please enter an Order ID.', 'error');
    return;
  }

  navigateToPage('track-order');
  const trackInput = document.getElementById('track-order-input');
  if (trackInput) trackInput.value = id;

  const resultBox = document.getElementById('track-result-box');
  resultBox.innerHTML = `
    <div style="text-align: center; padding: 40px; color: var(--text-muted);">
      <div style="font-size: 2rem; margin-bottom: 10px;">🔍</div>
      <p>Locating order #${id}...</p>
    </div>
  `;

  try {
    const res = await fetch(`/api/orders/track/${encodeURIComponent(id)}`);
    const data = await res.json();

    if (data.success) {
      renderTrackingDetails(data);
    } else {
      resultBox.innerHTML = `
        <div style="text-align: center; padding: 30px; color: #ef4444; background: rgba(239, 68, 68, 0.1); border-radius: var(--radius-md);">
          <h4>⚠️ ${data.message}</h4>
        </div>
      `;
    }
  } catch (err) {
    resultBox.innerHTML = `
      <div style="text-align: center; padding: 30px; color: #ef4444;">
        <h4>Failed to track order. Please try again.</h4>
      </div>
    `;
  }
}

// Render Tracking Progress & Details
function renderTrackingDetails(data) {
  const resultBox = document.getElementById('track-result-box');
  const { order, items, stages, current_stage_index, is_cancelled } = data;

  if (is_cancelled) {
    resultBox.innerHTML = `
      <div style="background: rgba(239, 68, 68, 0.15); border: 1px solid #ef4444; border-radius: var(--radius-md); padding: 25px; text-align: center;">
        <h3 style="color: #ef4444; font-size: 1.5rem; margin-bottom: 8px;">Order Cancelled</h3>
        <p style="color: var(--text-muted);">This order #${order.order_id} was cancelled. For any inquiry, please reach us on WhatsApp or call.</p>
      </div>
    `;
    return;
  }

  // Calculate timeline percentage width
  const percent = Math.max(0, Math.min(100, (current_stage_index / (stages.length - 1)) * 100));

  const stagesHtml = stages
    .map((stg, idx) => {
      let statusClass = '';
      if (idx < current_stage_index) statusClass = 'completed';
      else if (idx === current_stage_index) statusClass = 'active';

      return `
      <div class="timeline-step ${statusClass}">
        <div class="step-icon-circle">
          ${idx < current_stage_index ? '✓' : idx + 1}
        </div>
        <div class="step-title">${stg.title}</div>
      </div>
    `;
    })
    .join('');

  const itemsHtml = items
    .map(
      (it) => `
      <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--dark-border); font-size: 0.9rem;">
        <span>${it.item_name} (${it.size_name}) x ${it.quantity}</span>
        <strong>${state.settings.currency} ${it.subtotal}</strong>
      </div>
    `
    )
    .join('');

  resultBox.innerHTML = `
    <div style="margin-bottom: 24px; text-align: center;">
      <span class="order-id-badge" style="font-size: 0.95rem;">Order #${order.order_id}</span>
      <h3 style="font-size: 1.6rem; font-weight: 800; color: #fff; margin-top: 8px;">
        ${stages[current_stage_index]?.title || 'Processing Order'}
      </h3>
      <p style="color: var(--text-muted); font-size: 0.95rem;">${stages[current_stage_index]?.desc || ''}</p>
    </div>

    <!-- Animated Timeline -->
    <div class="tracking-timeline">
      <div class="timeline-line-bg"></div>
      <div class="timeline-line-fill" style="width: calc(${percent}% * 0.85);"></div>
      ${stagesHtml}
    </div>

    <!-- Order Items Breakdown -->
    <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--dark-border); border-radius: var(--radius-md); padding: 20px; margin-top: 30px;">
      <h4 style="font-size: 1.1rem; color: #fff; margin-bottom: 14px;">Order Summary</h4>
      ${itemsHtml}
      <div style="display: flex; justify-content: space-between; margin-top: 14px; font-size: 1.15rem; font-weight: 800; color: #fff;">
        <span>Total Payable:</span>
        <span style="color: var(--primary);">${state.settings.currency} ${order.total_amount} (${order.payment_method})</span>
      </div>
      <div style="margin-top: 14px; font-size: 0.85rem; color: var(--text-muted);">
        <p><strong>Delivery Address:</strong> ${order.delivery_address}</p>
        <p><strong>Phone:</strong> ${order.customer_phone}</p>
      </div>
    </div>
  `;
}

// Fetch Reviews
async function fetchReviews() {
  try {
    const res = await fetch('/api/reviews');
    const data = await res.json();
    if (data.success && data.reviews) {
      renderReviews(data.reviews);
    }
  } catch (err) {
    console.warn('Reviews load error:', err);
  }
}

function renderReviews(reviews) {
  const container = document.getElementById('reviews-container');
  if (!container) return;

  container.innerHTML = reviews
    .map(
      (r) => `
      <div class="review-card">
        <div class="review-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
        <p class="review-text">"${r.comment}"</p>
        <div class="review-author">
          <img src="${r.customer_avatar}" alt="${r.customer_name}" class="review-avatar" />
          <div class="author-info">
            <h5>${r.customer_name}</h5>
            <span>Verified Customer</span>
          </div>
        </div>
      </div>
    `
    )
    .join('');
}

// Submit Review Form
async function handleReviewSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('review-name').value.trim();
  const rating = document.getElementById('review-rating').value;
  const comment = document.getElementById('review-comment').value.trim();

  if (!name || !comment) {
    showToast('Please provide your name and review message.', 'error');
    return;
  }

  try {
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customer_name: name, rating, comment })
    });
    const data = await res.json();

    if (data.success) {
      showToast(data.message, 'success');
      document.getElementById('review-form').reset();
      fetchReviews();
    } else {
      showToast(data.message || 'Error submitting review.', 'error');
    }
  } catch (err) {
    showToast('Failed to submit review.', 'error');
  }
}

// Multi-Page SPA Navigation
function navigateToPage(pageId) {
  const pages = document.querySelectorAll('.page-view');
  pages.forEach((p) => p.classList.add('hidden'));

  const target = document.getElementById(`${pageId}-page`);
  if (target) {
    target.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Update active navbar item
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach((l) => {
    if (l.dataset.page === pageId) l.classList.add('active');
    else l.classList.remove('active');
  });

  if (pageId === 'checkout') {
    renderCheckoutSummary();
  }
}

// Same as WhatsApp Checkbox toggle
function setupWhatsAppCheckbox() {
  const cb = document.getElementById('same-whatsapp-checkbox');
  const waInput = document.getElementById('checkout-whatsapp');
  const phoneInput = document.getElementById('checkout-phone');

  if (cb && waInput && phoneInput) {
    cb.addEventListener('change', (e) => {
      if (e.target.checked) {
        waInput.value = phoneInput.value;
        waInput.disabled = true;
      } else {
        waInput.disabled = false;
      }
    });
  }
}

// Initial Boot
document.addEventListener('DOMContentLoaded', () => {
  fetchSettings();
  fetchMenu();
  fetchOffers();
  fetchReviews();
  updateCartBadge();
  setupWhatsAppCheckbox();

  // Attach Checkout Form
  const checkoutForm = document.getElementById('checkout-form');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', handleCheckoutSubmit);
  }

  // Attach Review Form
  const reviewForm = document.getElementById('review-form');
  if (reviewForm) {
    reviewForm.addEventListener('submit', handleReviewSubmit);
  }

  // Check URL params for orderId
  const urlParams = new URLSearchParams(window.location.search);
  const trackId = urlParams.get('orderId');
  if (trackId) {
    trackOrderById(trackId);
  }
});
