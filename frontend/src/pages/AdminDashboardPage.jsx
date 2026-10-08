import React, { useState, useEffect } from 'react';
import {
  Package,
  Layers,
  Tag,
  Star,
  Settings,
  LogOut,
  RefreshCw,
  Search,
  Printer,
  Plus,
  Trash2,
  CheckCircle,
  Eye,
  X,
  Loader2,
  Clock,
  Flame,
  Bike,
  TrendingUp,
  CheckCircle2,
  Phone,
  MapPin
} from 'lucide-react';
import { useCart } from '../context/CartContext';

export const AdminDashboardPage = ({ navigate, onLogout }) => {
  const { settings: globalSettings } = useCart();
  const [activeTab, setActiveTab] = useState('orders'); // orders, menu, coupons, reviews, settings
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [storeSettings, setStoreSettings] = useState({});

  // Filter & Search
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Forms
  const [productForm, setProductForm] = useState({
    name: '',
    category: '',
    description: '',
    ingredients: '',
    badge: '',
    image_url: '',
    starting_price: 649,
    price_small: 649,
    price_medium: 1149,
    price_large: 1699,
    price_xl: 2199
  });

  const [couponForm, setCouponForm] = useState({
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: 20,
    min_order_amount: 1000
  });

  const loadAllData = () => {
    loadStats();
    loadOrders();
    loadProducts();
    loadCategories();
    loadCoupons();
    loadReviews();
    loadSettings();
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const loadStats = () => {
    fetch('/api/admin/stats/')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setStats(data.stats);
      })
      .catch((err) => console.warn(err));
  };

  const loadOrders = () => {
    let url = '/api/orders/';
    const params = new URLSearchParams();
    if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);
    if (searchQuery.trim()) params.append('search', searchQuery.trim());

    const qs = params.toString();
    if (qs) url += `?${qs}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        const ords = Array.isArray(data) ? data : data.results || [];
        setOrders(ords);
      })
      .catch((err) => console.warn(err));
  };

  const loadProducts = () => {
    fetch('/api/products/')
      .then((res) => res.json())
      .then((data) => {
        const prods = Array.isArray(data) ? data : data.results || [];
        setProducts(prods);
      })
      .catch((err) => console.warn(err));
  };

  const loadCategories = () => {
    fetch('/api/categories/')
      .then((res) => res.json())
      .then((data) => {
        const cats = Array.isArray(data) ? data : data.results || [];
        setCategories(cats);
        if (cats.length > 0 && !productForm.category) {
          setProductForm((prev) => ({ ...prev, category: cats[0].id }));
        }
      })
      .catch((err) => console.warn(err));
  };

  const loadCoupons = () => {
    fetch('/api/coupons/')
      .then((res) => res.json())
      .then((data) => {
        const cps = Array.isArray(data) ? data : data.results || [];
        setCoupons(cps);
      })
      .catch((err) => console.warn(err));
  };

  const loadReviews = () => {
    fetch('/api/reviews/')
      .then((res) => res.json())
      .then((data) => {
        const revs = Array.isArray(data) ? data : data.results || [];
        setReviews(revs);
      })
      .catch((err) => console.warn(err));
  };

  const loadSettings = () => {
    fetch('/api/settings/')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) setStoreSettings(data.settings);
      })
      .catch((err) => console.warn(err));
  };

  // Update Order Status
  const handleUpdateOrderStatus = (orderId, newStatus) => {
    fetch(`/api/orders/${orderId}/status/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    })
      .then((res) => res.json())
      .then(() => {
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
        loadOrders();
        loadStats();
      })
      .catch(() => alert('Failed to update status'));
  };

  // Printable Slip
  const handlePrintSlip = (order) => {
    setSelectedOrder(order);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  // Save / Update Product
  const handleSaveProduct = (e) => {
    e.preventDefault();

    const payload = {
      name: productForm.name,
      category: parseInt(productForm.category),
      description: productForm.description,
      ingredients: productForm.ingredients,
      badge: productForm.badge,
      image_url:
        productForm.image_url ||
        'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
      starting_price: productForm.price_small,
      is_available: true
    };

    const url = editingProduct ? `/api/products/${editingProduct.id}/` : '/api/products/';
    const method = editingProduct ? 'PUT' : 'POST';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then((res) => res.json())
      .then(() => {
        setIsProductModalOpen(false);
        setEditingProduct(null);
        loadProducts();
      })
      .catch(() => alert('Error saving product'));
  };

  // Delete Product
  const handleDeleteProduct = (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    fetch(`/api/products/${id}/`, { method: 'DELETE' })
      .then(() => loadProducts())
      .catch(() => alert('Failed to delete product'));
  };

  // Create Coupon
  const handleCreateCoupon = (e) => {
    e.preventDefault();
    fetch('/api/coupons/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(couponForm)
    })
      .then((res) => res.json())
      .then(() => {
        setCouponForm({
          code: '',
          description: '',
          discount_type: 'percentage',
          discount_value: 20,
          min_order_amount: 1000
        });
        loadCoupons();
      })
      .catch(() => alert('Failed to create coupon'));
  };

  // Save Settings
  const handleSaveSettings = (e) => {
    e.preventDefault();
    fetch('/api/settings/', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(storeSettings)
    })
      .then((res) => res.json())
      .then(() => {
        alert('Restaurant settings saved successfully!');
        loadSettings();
      })
      .catch(() => alert('Settings update failed'));
  };

  // Status Badge Helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'received':
        return {
          bg: 'rgba(59, 130, 246, 0.15)',
          text: '#60a5fa',
          border: 'rgba(59, 130, 246, 0.4)',
          label: 'Received',
          icon: '📥'
        };
      case 'confirmed':
        return {
          bg: 'rgba(168, 85, 247, 0.15)',
          text: '#c084fc',
          border: 'rgba(168, 85, 247, 0.4)',
          label: 'Confirmed',
          icon: '✅'
        };
      case 'preparing':
        return {
          bg: 'rgba(245, 158, 11, 0.15)',
          text: '#fbbf24',
          border: 'rgba(245, 158, 11, 0.4)',
          label: 'Baking in Oven',
          icon: '🔥'
        };
      case 'out_for_delivery':
        return {
          bg: 'rgba(234, 88, 12, 0.15)',
          text: '#fb923c',
          border: 'rgba(234, 88, 12, 0.4)',
          label: 'Out for Delivery',
          icon: '🛵'
        };
      case 'delivered':
        return {
          bg: 'rgba(16, 185, 129, 0.15)',
          text: '#34d399',
          border: 'rgba(16, 185, 129, 0.4)',
          label: 'Delivered',
          icon: '🎉'
        };
      case 'cancelled':
        return {
          bg: 'rgba(239, 68, 68, 0.15)',
          text: '#f87171',
          border: 'rgba(239, 68, 68, 0.4)',
          label: 'Cancelled',
          icon: '❌'
        };
      default:
        return {
          bg: 'rgba(255, 255, 255, 0.1)',
          text: '#fff',
          border: 'rgba(255, 255, 255, 0.2)',
          label: status,
          icon: '📦'
        };
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0e', color: '#f8fafc', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      {/* 1. SIDEBAR NAVIGATION */}
      <aside
        style={{
          width: '230px',
          background: '#111116',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
          flexShrink: 0,
          zIndex: 100
        }}
      >
        {/* Brand Header */}
        <div style={{ padding: '24px 20px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ width: '40px', height: '40px', background: 'rgba(225, 29, 72, 0.15)', border: '1px solid #e11d48', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
            🍕
          </div>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#fff', letterSpacing: '-0.3px' }}>
              PIZZA<span style={{ color: '#e11d48' }}>HUB</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Operations Portal
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav style={{ padding: '20px 14px', display: 'flex', flexDirection: 'column', gap: '6px', flexGrow: 1 }}>
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '10px',
              color: activeTab === 'orders' ? '#fff' : '#94a3b8',
              background: activeTab === 'orders' ? 'rgba(225, 29, 72, 0.15)' : 'transparent',
              borderLeft: activeTab === 'orders' ? '4px solid #e11d48' : '4px solid transparent',
              fontWeight: '700',
              fontSize: '0.92rem',
              width: '100%',
              textAlign: 'left',
              cursor: 'pointer',
              border: 'none',
              transition: 'all 0.2s'
            }}
          >
            <Package size={18} color={activeTab === 'orders' ? '#e11d48' : '#94a3b8'} />
            Kitchen Queue & Orders
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('menu')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '10px',
              color: activeTab === 'menu' ? '#fff' : '#94a3b8',
              background: activeTab === 'menu' ? 'rgba(225, 29, 72, 0.15)' : 'transparent',
              borderLeft: activeTab === 'menu' ? '4px solid #e11d48' : '4px solid transparent',
              fontWeight: '700',
              fontSize: '0.92rem',
              width: '100%',
              textAlign: 'left',
              cursor: 'pointer',
              border: 'none',
              transition: 'all 0.2s'
            }}
          >
            <Layers size={18} color={activeTab === 'menu' ? '#e11d48' : '#94a3b8'} />
            Menu & Size-Pricing
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('coupons')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '10px',
              color: activeTab === 'coupons' ? '#fff' : '#94a3b8',
              background: activeTab === 'coupons' ? 'rgba(225, 29, 72, 0.15)' : 'transparent',
              borderLeft: activeTab === 'coupons' ? '4px solid #e11d48' : '4px solid transparent',
              fontWeight: '700',
              fontSize: '0.92rem',
              width: '100%',
              textAlign: 'left',
              cursor: 'pointer',
              border: 'none',
              transition: 'all 0.2s'
            }}
          >
            <Tag size={18} color={activeTab === 'coupons' ? '#e11d48' : '#94a3b8'} />
            Offers & Coupons
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '10px',
              color: activeTab === 'reviews' ? '#fff' : '#94a3b8',
              background: activeTab === 'reviews' ? 'rgba(225, 29, 72, 0.15)' : 'transparent',
              borderLeft: activeTab === 'reviews' ? '4px solid #e11d48' : '4px solid transparent',
              fontWeight: '700',
              fontSize: '0.92rem',
              width: '100%',
              textAlign: 'left',
              cursor: 'pointer',
              border: 'none',
              transition: 'all 0.2s'
            }}
          >
            <Star size={18} color={activeTab === 'reviews' ? '#e11d48' : '#94a3b8'} />
            Customer Feedback
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '10px',
              color: activeTab === 'settings' ? '#fff' : '#94a3b8',
              background: activeTab === 'settings' ? 'rgba(225, 29, 72, 0.15)' : 'transparent',
              borderLeft: activeTab === 'settings' ? '4px solid #e11d48' : '4px solid transparent',
              fontWeight: '700',
              fontSize: '0.92rem',
              width: '100%',
              textAlign: 'left',
              cursor: 'pointer',
              border: 'none',
              transition: 'all 0.2s'
            }}
          >
            <Settings size={18} color={activeTab === 'settings' ? '#e11d48' : '#94a3b8'} />
            Restaurant Settings
          </button>
        </nav>

        {/* Sidebar Footer */}
        <div style={{ padding: '16px 14px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            type="button"
            onClick={() => navigate('/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#94a3b8',
              fontSize: '0.88rem',
              padding: '10px 14px',
              width: '100%',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            🌐 View Live Store
          </button>
          <button
            type="button"
            onClick={() => {
              sessionStorage.removeItem('pizzahub_admin_user');
              if (onLogout) onLogout();
              navigate('/admin/login');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#ef4444',
              fontSize: '0.88rem',
              padding: '10px 14px',
              width: '100%',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.15)',
              cursor: 'pointer',
              fontWeight: '700'
            }}
          >
            <LogOut size={16} /> Logout Staff
          </button>
        </div>
      </aside>

      {/* 2. MAIN WORKSPACE */}
      <main style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
        {/* Top Header Bar */}
        <header
          style={{
            height: '70px',
            background: '#111116',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '0 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 90
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#fff', margin: 0 }}>
              {activeTab === 'orders' && 'Kitchen Queue & Order Dispatch'}
              {activeTab === 'menu' && 'Menu Products & Size-Based Pricing'}
              {activeTab === 'coupons' && 'Promotions & Discount Coupons'}
              {activeTab === 'reviews' && 'Customer Review Moderation'}
              {activeTab === 'settings' && 'Restaurant Store Settings'}
            </h2>
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Live real-time operational control
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#34d399',
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '0.8rem',
                fontWeight: '700'
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  background: '#10b981',
                  borderRadius: '50%',
                  boxShadow: '0 0 10px #10b981'
                }}
              ></span>
              SQLite / PostgreSQL Connected
            </span>

            <button
              type="button"
              onClick={loadAllData}
              title="Refresh Data"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                padding: '8px 14px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.84rem',
                fontWeight: '700'
              }}
            >
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </header>

        {/* Workspace Body */}
        <div style={{ padding: '24px 28px' }}>
          {/* ================= TAB 1: ORDERS ================= */}
          {activeTab === 'orders' && (
            <div>
              {/* KPI CARDS GRID */}
              {stats && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                    gap: '18px',
                    marginBottom: '32px'
                  }}
                >
                  {/* Card 1: Total Orders */}
                  <div
                    style={{
                      background: '#14141c',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderLeft: '5px solid #e11d48',
                      borderRadius: '16px',
                      padding: '22px 20px',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Total Orders</span>
                      <Package size={20} color="#e11d48" />
                    </div>
                    <div style={{ fontSize: '2.2rem', fontWeight: '800', color: '#fff', margin: '8px 0 4px', letterSpacing: '-0.5px' }}>
                      {stats.total_orders}
                    </div>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>All time orders</span>
                  </div>

                  {/* Card 2: Pending / Received */}
                  <div
                    style={{
                      background: '#14141c',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderLeft: '5px solid #f59e0b',
                      borderRadius: '16px',
                      padding: '22px 20px',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.78rem', color: '#f59e0b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Pending / Received</span>
                      <Clock size={20} color="#f59e0b" />
                    </div>
                    <div style={{ fontSize: '2.2rem', fontWeight: '800', color: '#fbbf24', margin: '8px 0 4px', letterSpacing: '-0.5px' }}>
                      {stats.pending_orders}
                    </div>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Requires kitchen action</span>
                  </div>

                  {/* Card 3: Baking in Oven */}
                  <div
                    style={{
                      background: '#14141c',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderLeft: '5px solid #ea580c',
                      borderRadius: '16px',
                      padding: '22px 20px',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.78rem', color: '#ea580c', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Baking in Oven</span>
                      <Flame size={20} color="#ea580c" />
                    </div>
                    <div style={{ fontSize: '2.2rem', fontWeight: '800', color: '#fb923c', margin: '8px 0 4px', letterSpacing: '-0.5px' }}>
                      {stats.preparing_orders}
                    </div>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Currently cooking</span>
                  </div>

                  {/* Card 4: Out for Delivery */}
                  <div
                    style={{
                      background: '#14141c',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderLeft: '5px solid #3b82f6',
                      borderRadius: '16px',
                      padding: '22px 20px',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.78rem', color: '#60a5fa', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Out for Delivery</span>
                      <Bike size={20} color="#3b82f6" />
                    </div>
                    <div style={{ fontSize: '2.2rem', fontWeight: '800', color: '#60a5fa', margin: '8px 0 4px', letterSpacing: '-0.5px' }}>
                      {stats.out_for_delivery_orders}
                    </div>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Riders on route</span>
                  </div>

                  {/* Card 5: Completed */}
                  <div
                    style={{
                      background: '#14141c',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderLeft: '5px solid #10b981',
                      borderRadius: '16px',
                      padding: '22px 20px',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.78rem', color: '#34d399', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Completed</span>
                      <CheckCircle2 size={20} color="#10b981" />
                    </div>
                    <div style={{ fontSize: '2.2rem', fontWeight: '800', color: '#34d399', margin: '8px 0 4px', letterSpacing: '-0.5px' }}>
                      {stats.completed_orders}
                    </div>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Delivered safely</span>
                  </div>

                  {/* Card 6: Today's Revenue */}
                  <div
                    style={{
                      background: '#14141c',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderLeft: '5px solid #10b981',
                      borderRadius: '16px',
                      padding: '22px 20px',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.78rem', color: '#34d399', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Today's Revenue</span>
                      <TrendingUp size={20} color="#10b981" />
                    </div>
                    <div style={{ fontSize: '1.9rem', fontWeight: '800', color: '#34d399', margin: '8px 0 4px', letterSpacing: '-0.5px' }}>
                      Rs. {stats.today_revenue.toLocaleString()}
                    </div>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{stats.today_orders} orders placed today</span>
                  </div>

                  {/* Card 7: Total Gross Sales */}
                  <div
                    style={{
                      background: '#14141c',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderLeft: '5px solid #8b5cf6',
                      borderRadius: '16px',
                      padding: '22px 20px',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.78rem', color: '#c084fc', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Total Gross Sales</span>
                      <Layers size={20} color="#8b5cf6" />
                    </div>
                    <div style={{ fontSize: '1.9rem', fontWeight: '800', color: '#c084fc', margin: '8px 0 4px', letterSpacing: '-0.5px' }}>
                      Rs. {stats.total_sales.toLocaleString()}
                    </div>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Cumulative volume</span>
                  </div>
                </div>
              )}

              {/* ORDERS DATA PANEL */}
              <div
                style={{
                  background: '#14141c',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '18px',
                  overflow: 'hidden',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
                  marginBottom: '40px'
                }}
              >
                {/* Panel Header */}
                <div
                  style={{
                    padding: '22px 28px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '16px',
                    background: 'rgba(255, 255, 255, 0.02)'
                  }}
                >
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
                    <Package size={22} color="#e11d48" /> Real-Time Kitchen Orders & Live Status
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        placeholder="Search ID, customer, phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') loadOrders();
                        }}
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          padding: '10px 16px 10px 38px',
                          borderRadius: '10px',
                          color: '#fff',
                          fontSize: '0.88rem',
                          minWidth: '240px',
                          outline: 'none'
                        }}
                      />
                      <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                    </div>

                    <select
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setTimeout(loadOrders, 50);
                      }}
                      style={{
                        background: '#1e1e28',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        padding: '10px 16px',
                        borderRadius: '10px',
                        color: '#fff',
                        fontSize: '0.88rem',
                        fontWeight: '600',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="all">🔍 All Statuses</option>
                      <option value="received">📥 Received</option>
                      <option value="confirmed">✅ Confirmed</option>
                      <option value="preparing">🔥 Baking in Oven</option>
                      <option value="out_for_delivery">🛵 Out for Delivery</option>
                      <option value="delivered">🎉 Delivered</option>
                      <option value="cancelled">❌ Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* Table View */}
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', minWidth: '960px', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: '#0e0e14', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                        <th style={{ padding: '14px 14px', fontSize: '0.78rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', whiteSpace: 'nowrap' }}>Order ID</th>
                        <th style={{ padding: '14px 14px', fontSize: '0.78rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Customer</th>
                        <th style={{ padding: '14px 14px', fontSize: '0.78rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Delivery Address</th>
                        <th style={{ padding: '14px 14px', fontSize: '0.78rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Items Summary</th>
                        <th style={{ padding: '14px 14px', fontSize: '0.78rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', whiteSpace: 'nowrap' }}>Total Amount</th>
                        <th style={{ padding: '14px 14px', fontSize: '0.78rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', textAlign: 'center' }}>Status</th>
                        <th style={{ padding: '14px 14px', fontSize: '0.78rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', textAlign: 'center' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.length === 0 ? (
                        <tr>
                          <td colSpan="7" style={{ textAlign: 'center', padding: '50px 20px', color: '#64748b', fontSize: '0.95rem' }}>
                            No orders matching the current filter.
                          </td>
                        </tr>
                      ) : (
                        orders.map((ord) => {
                          const badge = getStatusBadge(ord.status);
                          const itemsSummary = (ord.items || [])
                            .map((i) => `${i.item_name} (${i.size_name}) x${i.quantity}`)
                            .join(', ');

                          return (
                            <tr key={ord.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                              <td style={{ padding: '14px 14px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                                <span style={{ fontFamily: 'monospace', fontWeight: '800', color: '#f43f5e', background: 'rgba(244, 63, 94, 0.1)', padding: '5px 10px', borderRadius: '8px', border: '1px solid rgba(244, 63, 94, 0.25)', fontSize: '0.86rem' }}>
                                  #{ord.order_id}
                                </span>
                              </td>
                              <td style={{ padding: '14px 14px', verticalAlign: 'middle', minWidth: '150px' }}>
                                <div style={{ fontWeight: '700', color: '#fff', fontSize: '0.92rem' }}>{ord.customer_name}</div>
                                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <Phone size={12} color="#94a3b8" /> {ord.customer_phone}
                                </div>
                              </td>
                              <td style={{ padding: '14px 14px', verticalAlign: 'middle', maxWidth: '200px' }}>
                                <div style={{ fontSize: '0.86rem', color: '#cbd5e1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }} title={ord.delivery_address}>
                                  <MapPin size={13} color="#f43f5e" style={{ flexShrink: 0 }} /> {ord.delivery_address}
                                </div>
                                {ord.landmark && (
                                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px', paddingLeft: '17px' }}>Near {ord.landmark}</div>
                                )}
                              </td>
                              <td style={{ padding: '14px 14px', verticalAlign: 'middle', maxWidth: '200px' }}>
                                <div style={{ fontSize: '0.84rem', color: '#cbd5e1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={itemsSummary}>
                                  🍕 {itemsSummary || 'N/A'}
                                </div>
                              </td>
                              <td style={{ padding: '14px 14px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                                <div style={{ fontWeight: '800', color: '#f59e0b', fontSize: '1.02rem' }}>
                                  Rs. {Number(ord.total_amount).toLocaleString()}
                                </div>
                                <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{ord.payment_method}</div>
                              </td>
                              <td style={{ padding: '14px 14px', verticalAlign: 'middle', textAlign: 'center', whiteSpace: 'nowrap' }}>
                                <span style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  padding: '5px 12px',
                                  borderRadius: '9999px',
                                  fontSize: '0.76rem',
                                  fontWeight: '800',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.4px',
                                  background: badge.bg,
                                  color: badge.text,
                                  border: `1px solid ${badge.border}`
                                }}>
                                  {badge.icon} {badge.label}
                                </span>
                              </td>
                              <td style={{ padding: '14px 14px', verticalAlign: 'middle', textAlign: 'center', whiteSpace: 'nowrap' }}>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                  {/* Fast Status Dropdown */}
                                  <select
                                    value={ord.status}
                                    onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                                    style={{
                                      background: '#22222e',
                                      border: '1px solid rgba(255, 255, 255, 0.15)',
                                      color: '#fff',
                                      padding: '8px 10px',
                                      borderRadius: '8px',
                                      fontSize: '0.8rem',
                                      fontWeight: '600',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    <option value="received">Received</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="preparing">Baking</option>
                                    <option value="out_for_delivery">Out for Delivery</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                  </select>

                                  {/* View Modal Button */}
                                  <button
                                    type="button"
                                    onClick={() => setSelectedOrder(ord)}
                                    title="View Full Order Details"
                                    style={{
                                      background: 'rgba(255, 255, 255, 0.08)',
                                      color: '#fff',
                                      border: '1px solid rgba(255, 255, 255, 0.12)',
                                      padding: '8px 12px',
                                      borderRadius: '8px',
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '5px',
                                      fontSize: '0.8rem',
                                      fontWeight: '700'
                                    }}
                                  >
                                    <Eye size={14} /> View
                                  </button>

                                  {/* Print Thermal Slip Button */}
                                  <button
                                    type="button"
                                    onClick={() => handlePrintSlip(ord)}
                                    title="Print Kitchen / Dispatch Slip"
                                    style={{
                                      background: 'rgba(59, 130, 246, 0.15)',
                                      color: '#60a5fa',
                                      border: '1px solid rgba(59, 130, 246, 0.3)',
                                      padding: '8px 12px',
                                      borderRadius: '8px',
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '5px',
                                      fontSize: '0.8rem',
                                      fontWeight: '700'
                                    }}
                                  >
                                    <Printer size={14} /> Slip
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 2: MENU & PRICES ================= */}
          {activeTab === 'menu' && (
            <div style={{ background: '#14141c', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '18px', padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#fff', margin: 0 }}>
                  Pizza Menu & Size-Pricing Management
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setEditingProduct(null);
                    setProductForm({
                      name: '',
                      category: categories[0]?.id || '',
                      description: '',
                      ingredients: '',
                      badge: '',
                      image_url: '',
                      starting_price: 649,
                      price_small: 649,
                      price_medium: 1149,
                      price_large: 1699,
                      price_xl: 2199
                    });
                    setIsProductModalOpen(true);
                  }}
                  style={{
                    background: '#e11d48',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 18px',
                    borderRadius: '8px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Plus size={16} /> Add New Pizza
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {products.map((item) => (
                  <div key={item.id} style={{ background: '#181822', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '10px' }} />
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ color: '#fff', fontSize: '1.05rem', margin: 0, fontWeight: '700' }}>{item.name}</h4>
                        <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: '700' }}>{item.category_name}</span>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '6px' }}>{item.description.slice(0, 80)}...</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: 'rgba(0, 0, 0, 0.35)', padding: '10px 14px', borderRadius: '8px', fontSize: '0.8rem' }}>
                      {(item.prices || []).map((p) => (
                        <div key={p.size_name}>
                          <span style={{ color: '#94a3b8' }}>{p.size_name}:</span> <strong style={{ color: '#fff' }}>Rs. {p.price}</strong>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '12px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingProduct(item);
                          setProductForm({
                            name: item.name,
                            category: item.category,
                            description: item.description,
                            ingredients: item.ingredients,
                            badge: item.badge || '',
                            image_url: item.image_url,
                            starting_price: item.starting_price,
                            price_small: item.prices?.find((p) => p.size_name === 'Small')?.price || 649,
                            price_medium: item.prices?.find((p) => p.size_name === 'Medium')?.price || 1149,
                            price_large: item.prices?.find((p) => p.size_name === 'Large')?.price || 1699,
                            price_xl: item.prices?.find((p) => p.size_name === 'Extra Large')?.price || 2199
                          });
                          setIsProductModalOpen(true);
                        }}
                        style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '6px 14px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}
                      >
                        ✏️ Edit Prices
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(item.id)}
                        style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '6px 14px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB 3: COUPONS ================= */}
          {activeTab === 'coupons' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
              <div style={{ background: '#14141c', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '18px', padding: '28px' }}>
                <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '16px', fontWeight: '800' }}>Create Promo Code</h3>
                <form onSubmit={handleCreateCoupon}>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>Code *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. FLASH30"
                      value={couponForm.code}
                      onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                      style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontFamily: 'monospace' }}
                    />
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>Description</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 30% discount on entire cart"
                      value={couponForm.description}
                      onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                      style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                    />
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>Discount Type</label>
                    <select
                      value={couponForm.discount_type}
                      onChange={(e) => setCouponForm({ ...couponForm, discount_type: e.target.value })}
                      style={{ width: '100%', padding: '10px', background: '#1c1c24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Cash Amount (Rs.)</option>
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>Value</label>
                      <input
                        type="number"
                        required
                        value={couponForm.discount_value}
                        onChange={(e) => setCouponForm({ ...couponForm, discount_value: parseFloat(e.target.value) })}
                        style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>Min Order</label>
                      <input
                        type="number"
                        value={couponForm.min_order_amount}
                        onChange={(e) => setCouponForm({ ...couponForm, min_order_amount: parseFloat(e.target.value) })}
                        style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                      />
                    </div>
                  </div>

                  <button type="submit" style={{ width: '100%', padding: '12px', background: '#e11d48', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
                    Create Coupon Code
                  </button>
                </form>
              </div>

              <div style={{ background: '#14141c', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '18px', padding: '28px' }}>
                <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '20px', fontWeight: '800' }}>Active Coupons</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      <th style={{ padding: '12px 14px', color: '#94a3b8', fontSize: '0.78rem' }}>Code</th>
                      <th style={{ padding: '12px 14px', color: '#94a3b8', fontSize: '0.78rem' }}>Description</th>
                      <th style={{ padding: '12px 14px', color: '#94a3b8', fontSize: '0.78rem' }}>Discount</th>
                      <th style={{ padding: '12px 14px', color: '#94a3b8', fontSize: '0.78rem' }}>Min Order</th>
                      <th style={{ padding: '12px 14px', color: '#94a3b8', fontSize: '0.78rem' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map((c) => (
                      <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '14px', fontFamily: 'monospace', fontWeight: '800', color: '#f59e0b' }}>{c.code}</td>
                        <td style={{ padding: '14px', fontSize: '0.88rem' }}>{c.description}</td>
                        <td style={{ padding: '14px', fontSize: '0.88rem' }}>{c.discount_type === 'percentage' ? `${c.discount_value}%` : `Rs. ${c.discount_value}`}</td>
                        <td style={{ padding: '14px', fontSize: '0.88rem' }}>Rs. {c.min_order_amount}</td>
                        <td style={{ padding: '14px' }}>
                          <span style={{ padding: '4px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '800', background: c.is_active ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: c.is_active ? '#34d399' : '#f87171' }}>
                            {c.is_active ? 'ACTIVE' : 'DISABLED'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= TAB 4: REVIEWS ================= */}
          {activeTab === 'reviews' && (
            <div style={{ background: '#14141c', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '18px', padding: '28px' }}>
              <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '20px', fontWeight: '800' }}>Customer Feedback Moderation</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {reviews.map((r) => (
                  <div key={r.id} style={{ background: '#181822', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ color: '#fff', fontWeight: '700' }}>
                        {r.customer_name} — <span style={{ color: '#f59e0b' }}>{'★'.repeat(r.rating)}</span>
                      </div>
                      <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginTop: '4px' }}>"{r.comment}"</p>
                    </div>
                    <span style={{ color: '#34d399', fontWeight: '700', fontSize: '0.8rem', background: 'rgba(16, 185, 129, 0.12)', padding: '6px 12px', borderRadius: '9999px' }}>
                      APPROVED ✓
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB 5: STORE SETTINGS ================= */}
          {activeTab === 'settings' && (
            <div style={{ background: '#14141c', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '18px', padding: '32px', maxWidth: '800px' }}>
              <h3 style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '20px', fontWeight: '800' }}>Restaurant Operational Settings</h3>
              <form onSubmit={handleSaveSettings}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '6px' }}>Helpline Phone *</label>
                    <input
                      type="text"
                      required
                      value={storeSettings.phone_number || ''}
                      onChange={(e) => setStoreSettings({ ...storeSettings, phone_number: e.target.value })}
                      style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '6px' }}>WhatsApp Number (e.g. 923001234567) *</label>
                    <input
                      type="text"
                      required
                      value={storeSettings.whatsapp_number || ''}
                      onChange={(e) => setStoreSettings({ ...storeSettings, whatsapp_number: e.target.value })}
                      style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '6px' }}>Official Email</label>
                  <input
                    type="email"
                    value={storeSettings.email || ''}
                    onChange={(e) => setStoreSettings({ ...storeSettings, email: e.target.value })}
                    style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '6px' }}>Kitchen Address</label>
                  <input
                    type="text"
                    value={storeSettings.address || ''}
                    onChange={(e) => setStoreSettings({ ...storeSettings, address: e.target.value })}
                    style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '6px' }}>Delivery Fee (Rs.)</label>
                    <input
                      type="number"
                      value={storeSettings.delivery_fee || 150}
                      onChange={(e) => setStoreSettings({ ...storeSettings, delivery_fee: parseFloat(e.target.value) })}
                      style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '6px' }}>Free Delivery Threshold (Rs.)</label>
                    <input
                      type="number"
                      value={storeSettings.free_delivery_threshold || 2500}
                      onChange={(e) => setStoreSettings({ ...storeSettings, free_delivery_threshold: parseFloat(e.target.value) })}
                      style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                    />
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '16px', borderRadius: '10px', marginBottom: '24px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={Boolean(storeSettings.is_24_hours_open)}
                      onChange={(e) => setStoreSettings({ ...storeSettings, is_24_hours_open: e.target.checked })}
                      style={{ width: '20px', height: '20px' }}
                    />
                    <div>
                      <strong style={{ color: '#fff', fontSize: '1rem' }}>Enable 24/7 Delivery Availability</strong>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Shows "24 HOURS DELIVERY AVAILABLE" badge across website header and home hero</div>
                    </div>
                  </label>
                </div>

                <button type="submit" style={{ padding: '12px 24px', background: '#e11d48', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
                  Save Store Settings
                </button>
              </form>
            </div>
          )}
        </div>
      </main>

      {/* ================= MODAL: FULL ORDER DETAILS ================= */}
      {selectedOrder && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1200,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedOrder(null);
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '680px',
              background: '#14141c',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '24px',
              padding: '36px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 60px rgba(0,0,0,0.8)'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '0.82rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: '800' }}>Order Details</div>
                <h3 style={{ fontSize: '1.6rem', color: '#fff', margin: '4px 0 0', fontWeight: '800' }}>
                  #{selectedOrder.order_id}
                </h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {(() => {
                  const b = getStatusBadge(selectedOrder.status);
                  return (
                    <span style={{ padding: '6px 14px', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: '800', background: b.bg, color: b.text, border: `1px solid ${b.border}` }}>
                      {b.icon} {b.label}
                    </span>
                  );
                })()}
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1.2rem' }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Customer & Delivery Card */}
            <div style={{ background: '#1a1a24', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '20px', marginBottom: '24px', lineHeight: '1.7', fontSize: '0.92rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Customer Name</div>
                  <strong style={{ color: '#fff', fontSize: '1.05rem' }}>{selectedOrder.customer_name}</strong>
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Contact Number</div>
                  <a href={`tel:${selectedOrder.customer_phone}`} style={{ color: '#38bdf8', fontWeight: '700' }}>
                    📞 {selectedOrder.customer_phone}
                  </a>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Delivery Destination</div>
                <div style={{ color: '#e2e8f0' }}>📍 {selectedOrder.delivery_address}</div>
                {selectedOrder.landmark && (
                  <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Landmark: {selectedOrder.landmark}</div>
                )}
              </div>

              {selectedOrder.order_notes && (
                <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.08)', color: '#f59e0b', fontSize: '0.86rem' }}>
                  <strong>Special Notes:</strong> "{selectedOrder.order_notes}"
                </div>
              )}
            </div>

            {/* Line Items Table */}
            <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: '700', marginBottom: '12px' }}>Ordered Items</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.08)', textAlign: 'left', color: '#64748b' }}>
                  <th style={{ paddingBottom: '10px' }}>Item & Size</th>
                  <th style={{ paddingBottom: '10px', textAlign: 'center' }}>Qty</th>
                  <th style={{ paddingBottom: '10px', textAlign: 'right' }}>Price</th>
                </tr>
              </thead>
              <tbody>
                {(selectedOrder.items || []).map((it) => (
                  <tr key={it.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <td style={{ padding: '12px 0' }}>
                      <strong style={{ color: '#fff' }}>{it.item_name}</strong>
                      <span style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block' }}>Size: {it.size_name}</span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center', fontWeight: '700', color: '#fff' }}>x{it.quantity}</td>
                    <td style={{ padding: '12px 0', textAlign: 'right', fontWeight: '700', color: '#fff' }}>Rs. {it.subtotal}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Total Financial Summary */}
            <div style={{ background: '#181822', border: '1px solid rgba(255,255,255,0.08)', padding: '18px 20px', borderRadius: '12px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#94a3b8', fontSize: '0.9rem' }}>
                <span>Subtotal:</span><strong style={{ color: '#fff' }}>Rs. {selectedOrder.subtotal}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#94a3b8', fontSize: '0.9rem' }}>
                <span>Delivery Fee:</span><strong style={{ color: '#fff' }}>Rs. {selectedOrder.delivery_fee}</strong>
              </div>
              {selectedOrder.discount_amount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981', marginBottom: '8px', fontSize: '0.9rem' }}>
                  <span>Discount ({selectedOrder.coupon_code}):</span><strong>-Rs. {selectedOrder.discount_amount}</strong>
                </div>
              )}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: '800', color: '#e11d48' }}>
                <span>Total Payable:</span><span>Rs. {selectedOrder.total_amount}</span>
              </div>
            </div>

            {/* Quick Status Action Buttons */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', marginBottom: '10px' }}>
                Advance Order Workflow:
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'confirmed')}
                  style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.3)', padding: '8px 14px', borderRadius: '8px', fontWeight: '700', fontSize: '0.82rem', cursor: 'pointer' }}
                >
                  ✅ Confirm Order
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'preparing')}
                  style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '8px 14px', borderRadius: '8px', fontWeight: '700', fontSize: '0.82rem', cursor: 'pointer' }}
                >
                  🔥 Send to Oven
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'out_for_delivery')}
                  style={{ background: 'rgba(234, 88, 12, 0.15)', color: '#fb923c', border: '1px solid rgba(234, 88, 12, 0.3)', padding: '8px 14px', borderRadius: '8px', fontWeight: '700', fontSize: '0.82rem', cursor: 'pointer' }}
                >
                  🛵 Dispatch Rider
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'delivered')}
                  style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '8px 14px', borderRadius: '8px', fontWeight: '700', fontSize: '0.82rem', cursor: 'pointer' }}
                >
                  🎉 Mark Delivered
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'cancelled')}
                  style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '8px 14px', borderRadius: '8px', fontWeight: '700', fontSize: '0.82rem', cursor: 'pointer' }}
                >
                  ❌ Cancel Order
                </button>
              </div>
            </div>

            {/* Modal Bottom Footer Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '18px' }}>
              <button
                type="button"
                onClick={() => handlePrintSlip(selectedOrder)}
                style={{
                  background: 'rgba(59, 130, 246, 0.15)',
                  color: '#60a5fa',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  padding: '10px 18px',
                  borderRadius: '10px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Printer size={16} /> Print Thermal Slip
              </button>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#fff',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  padding: '10px 22px',
                  borderRadius: '10px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD / EDIT PRODUCT ================= */}
      {isProductModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1200,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsProductModalOpen(false);
          }}
        >
          <div style={{ width: '100%', maxWidth: '640px', background: '#14141c', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '20px', padding: '32px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '20px', fontWeight: '800' }}>
              {editingProduct ? 'Edit Pizza Product' : 'Add New Pizza Product'}
            </h3>

            <form onSubmit={handleSaveProduct}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>Pizza Name *</label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>Category *</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: '#1c1c24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>Description</label>
                <textarea
                  rows="2"
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                ></textarea>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>Ingredients (Comma separated)</label>
                <input
                  type="text"
                  value={productForm.ingredients}
                  onChange={(e) => setProductForm({ ...productForm, ingredients: e.target.value })}
                  style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>Badge (e.g. Best Seller)</label>
                  <input
                    type="text"
                    value={productForm.badge}
                    onChange={(e) => setProductForm({ ...productForm, badge: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>Image URL</label>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={productForm.image_url}
                    onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                  />
                </div>
              </div>

              {/* Size Prices */}
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '10px', marginBottom: '24px' }}>
                <h4 style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '10px', fontWeight: '700' }}>Size-Based Prices (Rs.)</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Small</label>
                    <input
                      type="number"
                      value={productForm.price_small}
                      onChange={(e) => setProductForm({ ...productForm, price_small: parseFloat(e.target.value) })}
                      style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Medium</label>
                    <input
                      type="number"
                      value={productForm.price_medium}
                      onChange={(e) => setProductForm({ ...productForm, price_medium: parseFloat(e.target.value) })}
                      style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Large</label>
                    <input
                      type="number"
                      value={productForm.price_large}
                      onChange={(e) => setProductForm({ ...productForm, price_large: parseFloat(e.target.value) })}
                      style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Extra Large</label>
                    <input
                      type="number"
                      value={productForm.price_xl}
                      onChange={(e) => setProductForm({ ...productForm, price_xl: parseFloat(e.target.value) })}
                      style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setIsProductModalOpen(false)} style={{ padding: '8px 18px', background: 'rgba(255,255,255,0.08)', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: '8px 18px', background: '#e11d48', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>
                  Save Pizza Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= PRINTABLE THERMAL RECEIPT SLIP ================= */}
      {selectedOrder && (
        <div id="printable-receipt" style={{ display: 'none' }}>
          <div className="printable-slip">
            <div className="slip-header">
              <h2 style={{ margin: 0, fontSize: '20px' }}>PIZZA HUB</h2>
              <p style={{ margin: '3px 0', fontSize: '12px' }}>Fresh Pizza, Fresh Moments</p>
              <p style={{ margin: '2px 0', fontSize: '11px' }}>Tel: {globalSettings.phone_number}</p>
            </div>
            <div style={{ fontSize: '12px', marginBottom: '12px' }}>
              <p style={{ margin: '2px 0' }}><strong>ORDER ID: #{selectedOrder.order_id}</strong></p>
              <p style={{ margin: '2px 0' }}>Customer: {selectedOrder.customer_name} ({selectedOrder.customer_phone})</p>
              <p style={{ margin: '2px 0' }}>Address: {selectedOrder.delivery_address}</p>
              <p style={{ margin: '2px 0' }}>Payment: {selectedOrder.payment_method}</p>
              {selectedOrder.order_notes && <p style={{ margin: '2px 0' }}>Notes: {selectedOrder.order_notes}</p>}
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', borderTop: '1px dashed #000', borderBottom: '1px dashed #000', marginBottom: '10px' }}>
              <tbody>
                {(selectedOrder.items || []).map((it) => (
                  <tr key={it.id}>
                    <td style={{ padding: '4px 0' }}>{it.item_name} ({it.size_name}) x{it.quantity}</td>
                    <td style={{ textAlign: 'right', padding: '4px 0' }}>Rs. {it.subtotal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal:</span><span>Rs. {selectedOrder.subtotal}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Delivery:</span><span>Rs. {selectedOrder.delivery_fee}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '15px', borderTop: '1px dashed #000', paddingTop: '4px', marginTop: '4px' }}>
                <span>TOTAL:</span><span>Rs. {selectedOrder.total_amount}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
