import React, { useState, useEffect } from 'react';
import { ArrowRight, Star, Clock, Flame, ShieldCheck, Heart, Award, CheckCircle2 } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const HomePage = ({ navigate }) => {
  const { settings, addToCart, setIsCartOpen } = useCart();
  const [popularProducts, setPopularProducts] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ name: '', rating: '5', comment: '' });
  const [reviewMsg, setReviewMsg] = useState('');

  // Selected sizes and quantities for cards on the home page
  const [cardSizes, setCardSizes] = useState({});
  const [cardQtys, setCardQtys] = useState({});

  useEffect(() => {
    // 1. Fetch popular pizzas
    fetch('/api/products/')
      .then((res) => res.json())
      .then((data) => {
        const items = Array.isArray(data) ? data : data.results || [];
        setPopularProducts(items.slice(0, 6));
      })
      .catch((err) => console.warn(err));

    // 2. Fetch active coupons
    fetch('/api/coupons/active/')
      .then((res) => res.json())
      .then((data) => setCoupons(Array.isArray(data) ? data : []))
      .catch((err) => console.warn(err));

    // 3. Fetch reviews
    fetch('/api/reviews/')
      .then((res) => res.json())
      .then((data) => {
        const revs = Array.isArray(data) ? data : data.results || [];
        setReviews(revs);
      })
      .catch((err) => console.warn(err));
  }, []);

  const handleSelectSize = (productId, sizeName, price) => {
    setCardSizes((prev) => ({ ...prev, [productId]: { sizeName, price } }));
  };

  const handleAdjustQty = (productId, delta) => {
    setCardQtys((prev) => {
      const current = prev[productId] || 1;
      return { ...prev, [productId]: Math.max(1, current + delta) };
    });
  };

  const handleAddToCart = (product) => {
    const defaultPrice = product.prices && product.prices.length > 0 ? product.prices[0] : { size_name: 'Medium', price: product.starting_price };
    const selected = cardSizes[product.id] || { sizeName: defaultPrice.size_name, price: defaultPrice.price };
    const qty = cardQtys[product.id] || 1;

    addToCart(product, selected.sizeName, selected.price, qty);
    setIsCartOpen(true);
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!reviewForm.name || !reviewForm.comment) return;

    fetch('/api/reviews/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_name: reviewForm.name,
        rating: parseInt(reviewForm.rating),
        comment: reviewForm.comment
      })
    })
      .then((res) => res.json())
      .then((data) => {
        setReviewMsg('Thank you! Your review has been submitted.');
        setReviewForm({ name: '', rating: '5', comment: '' });
        // Refresh reviews
        fetch('/api/reviews/')
          .then((r) => r.json())
          .then((d) => setReviews(Array.isArray(d) ? d : d.results || []));
      })
      .catch(() => setReviewMsg('Failed to submit review.'));
  };

  const copyCoupon = (code) => {
    navigator.clipboard.writeText(code);
    alert(`Coupon code "${code}" copied to clipboard! Paste at checkout to get discount.`);
  };

  return (
    <div>
      {/* 1. HERO SECTION */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-grid">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', padding: '6px 14px', borderRadius: '9999px', fontSize: '0.82rem', fontWeight: '700' }}>
                  <span style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%' }}></span>
                  24 Hours Delivery Available
                </span>
                <span style={{ color: 'var(--accent-gold)', fontSize: '0.85rem', fontWeight: '700' }}>
                  ★ 4.9/5 RATED BY 10,000+ FOODIES
                </span>
              </div>

              <h1 className="hero-title">
                Fresh Pizza,<br />
                <span className="highlight">Fresh Moments.</span>
              </h1>

              <p className="hero-subtitle">
                Fresh ingredients, handcrafted pizzas and fast delivery — made for every craving. Slow-fermented artisan dough with bubbling imported mozzarella delivered piping hot day and night.
              </p>

              <div className="hero-cta">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => navigate('/menu')}
                >
                  🍕 Order Now
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate('/menu')}
                >
                  📜 View Menu
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate('/track-order')}
                >
                  📍 Track Order
                </button>
              </div>

              <div className="hero-stats">
                <div className="stat-item">
                  <h4>30 Mins</h4>
                  <p>Guaranteed Fast Delivery</p>
                </div>
                <div className="stat-item">
                  <h4>100%</h4>
                  <p>Pure Whole Mozzarella</p>
                </div>
                <div className="stat-item">
                  <h4>24/7</h4>
                  <p>Midnight Kitchen Open</p>
                </div>
              </div>
            </div>

            {/* Floating Hero Pizza Image */}
            <div className="hero-image-wrapper">
              <div className="hero-pizza-glow"></div>
              <img
                src="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80"
                alt="Pizza Hub Fresh Artisan Pizza"
                className="hero-pizza-img"
              />
              <div className="hero-floating-badge badge-1">
                <span style={{ fontSize: '1.8rem' }}>🧀</span>
                <div>
                  <strong style={{ color: '#fff', fontSize: '0.9rem', display: 'block' }}>Triple Cheese Crust</strong>
                  <span style={{ color: 'var(--accent-gold)', fontSize: '0.75rem' }}>Gorgonzola & Mozzarella</span>
                </div>
              </div>
              <div className="hero-floating-badge badge-2">
                <span style={{ fontSize: '1.8rem' }}>🔥</span>
                <div>
                  <strong style={{ color: '#fff', fontSize: '0.9rem', display: 'block' }}>400°C Stone Oven</strong>
                  <span style={{ color: 'var(--accent-gold)', fontSize: '0.75rem' }}>Wood-fired blistered crust</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. POPULAR PIZZAS SECTION */}
      <section className="container" style={{ padding: '80px 0' }}>
        <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 40px' }}>
          <span style={{ display: 'inline-block', background: 'rgba(225, 29, 72, 0.12)', color: '#f43f5e', border: '1px solid rgba(225, 29, 72, 0.25)', padding: '4px 16px', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '10px' }}>
            Chef's Best Selection
          </span>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#fff', marginBottom: '10px' }}>
            Popular Pizzas & Best Sellers
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>
            Each recipe baked fresh with 48-hour fermented dough and authentic San Marzano sauce.
          </p>
        </div>

        <div className="menu-grid">
          {popularProducts.map((prod) => {
            const prices = prod.prices || [];
            const defaultPriceObj = prices.find((p) => p.size_name === 'Medium') || prices[0] || { size_name: 'Medium', price: prod.starting_price };
            const selected = cardSizes[prod.id] || { sizeName: defaultPriceObj.size_name, price: defaultPriceObj.price };
            const qty = cardQtys[prod.id] || 1;

            return (
              <div key={prod.id} className="pizza-card">
                <div className="pizza-card-image" onClick={() => navigate(`/menu/${prod.slug}`)} style={{ cursor: 'pointer' }}>
                  <img src={prod.image_url} alt={prod.name} loading="lazy" />
                  {prod.badge && (
                    <span className="card-badge">{prod.badge}</span>
                  )}
                </div>
                <div className="pizza-card-body">
                  <h3
                    className="pizza-name"
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/menu/${prod.slug}`)}
                  >
                    {prod.name}
                  </h3>
                  <p className="pizza-desc">{prod.description}</p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                    {prod.ingredients.split(',').slice(0, 3).map((ing, i) => (
                      <span key={i} className="ingredient-tag">{ing.trim()}</span>
                    ))}
                  </div>

                  {/* Size Selector Group */}
                  <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Select Size
                  </div>
                  <div className="size-selector-group">
                    {prices.map((p) => (
                      <button
                        key={p.size_name}
                        type="button"
                        className={`size-btn ${selected.sizeName === p.size_name ? 'active' : ''}`}
                        onClick={() => handleSelectSize(prod.id, p.size_name, p.price)}
                      >
                        {p.size_name}
                      </button>
                    ))}
                  </div>

                  <div style={{ marginTop: 'auto', borderTop: '1px solid var(--dark-border)', paddingTop: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                      <div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                          Price ({selected.sizeName})
                        </span>
                        <div style={{ fontSize: '1.45rem', fontWeight: '800', color: '#fff' }}>
                          {settings.currency} {Number(selected.price).toLocaleString()}
                        </div>
                      </div>

                      <div className="qty-control">
                        <button type="button" className="qty-btn" onClick={() => handleAdjustQty(prod.id, -1)}>
                          −
                        </button>
                        <span className="qty-input">{qty}</span>
                        <button type="button" className="qty-btn" onClick={() => handleAdjustQty(prod.id, 1)}>
                          +
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleAddToCart(prod)}
                      >
                        🛒 Add to Cart
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => {
                          handleAddToCart(prod);
                          navigate('/checkout');
                        }}
                      >
                        ⚡ Buy Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate('/menu')}
          >
            Explore Complete Menu & Deals <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* 3. SPECIAL OFFERS SECTION */}
      {coupons.length > 0 && (
        <section style={{ padding: '80px 0', background: 'linear-gradient(180deg, var(--dark-bg) 0%, #121217 100%)' }}>
          <div className="container">
            <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 40px' }}>
              <span style={{ display: 'inline-block', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-gold)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '4px 16px', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '10px' }}>
                Save Big
              </span>
              <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#fff', marginBottom: '10px' }}>
                Special Offers & Promo Codes
              </h2>
              <p style={{ color: 'var(--text-muted)' }}>
                Apply these codes at checkout to unlock instant discounts on your order!
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              {coupons.map((c) => (
                <div
                  key={c.code}
                  style={{
                    background: '#181820',
                    border: '1px solid var(--dark-border)',
                    borderRadius: '16px',
                    padding: '24px',
                    position: 'relative'
                  }}
                >
                  <span style={{ display: 'inline-block', background: 'rgba(245,158,11,0.15)', color: 'var(--accent-gold)', padding: '4px 12px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '700', marginBottom: '12px' }}>
                    {c.discount_type === 'percentage' ? `${c.discount_value}% DISCOUNT` : `FLAT RS. ${c.discount_value} OFF`}
                  </span>
                  <h3 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: '800', marginBottom: '8px' }}>
                    {c.description}
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '18px' }}>
                    Valid on orders above {settings.currency} {c.min_order_amount}.
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.4)', padding: '8px 14px', borderRadius: '10px', border: '1px dashed rgba(245,158,11,0.5)' }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: '800', color: 'var(--accent-gold)', fontSize: '1.1rem' }}>
                      {c.code}
                    </span>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                      onClick={() => copyCoupon(c.code)}
                    >
                      Copy Code
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. WHY CHOOSE PIZZA HUB */}
      <section className="container" style={{ padding: '80px 0' }}>
        <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 40px' }}>
          <span style={{ display: 'inline-block', background: 'rgba(225, 29, 72, 0.12)', color: '#f43f5e', border: '1px solid rgba(225, 29, 72, 0.25)', padding: '4px 16px', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '10px' }}>
            Our Craftsmanship
          </span>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#fff', marginBottom: '10px' }}>
            Why Choose Pizza Hub?
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>
            We obsess over dough, temperature, and fresh toppings to deliver unmatched pizza perfection.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
          <div style={{ background: 'var(--dark-surface)', border: '1px solid var(--dark-border)', padding: '35px 24px', borderRadius: '16px', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', background: 'rgba(225,29,72,0.12)', border: '1px solid rgba(225,29,72,0.25)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', margin: '0 auto 18px', color: 'var(--primary)' }}>
              🌾
            </div>
            <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '700', marginBottom: '10px' }}>48h Slow-Fermented Dough</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.6' }}>
              Naturally proofed artisan dough that results in a light, airy, and easily digestible crisp crust.
            </p>
          </div>

          <div style={{ background: 'var(--dark-surface)', border: '1px solid var(--dark-border)', padding: '35px 24px', borderRadius: '16px', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', margin: '0 auto 18px', color: 'var(--accent-gold)' }}>
              🧀
            </div>
            <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '700', marginBottom: '10px' }}>100% Real Mozzarella</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.6' }}>
              Zero synthetic oils or processed cheese substitutes. Pure, stretchy whole milk mozzarella cheese.
            </p>
          </div>

          <div style={{ background: 'var(--dark-surface)', border: '1px solid var(--dark-border)', padding: '35px 24px', borderRadius: '16px', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', margin: '0 auto 18px', color: '#10b981' }}>
              🍅
            </div>
            <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '700', marginBottom: '10px' }}>San Marzano Marinara</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.6' }}>
              Rich Italian vine tomatoes simmered with fresh sweet basil, garlic, and virgin olive oil.
            </p>
          </div>

          <div style={{ background: 'var(--dark-surface)', border: '1px solid var(--dark-border)', padding: '35px 24px', borderRadius: '16px', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', margin: '0 auto 18px', color: '#3b82f6' }}>
              🛵
            </div>
            <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '700', marginBottom: '10px' }}>Thermal Bag Delivery</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.6' }}>
              Riders equipped with heated insulated delivery bags guarantee piping hot pizza at your door.
            </p>
          </div>
        </div>
      </section>

      {/* 5. 24/7 DELIVERY SPECIAL BANNER */}
      <section className="container" style={{ padding: '40px 0 80px' }}>
        <div style={{ background: 'linear-gradient(135deg, #881337, #be123c, #1e1b4b)', borderRadius: '20px', padding: '50px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '30px', boxShadow: '0 20px 40px rgba(190, 18, 60, 0.25)' }}>
          <div>
            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 14px', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', color: '#fff' }}>
              ROUND-THE-CLOCK SERVICE
            </span>
            <h3 style={{ fontSize: '2.2rem', fontWeight: '800', color: '#fff', marginTop: '10px', marginBottom: '8px' }}>
              24 HOURS DELIVERY AVAILABLE
            </h3>
            <p style={{ color: '#ffe4e6', maxWidth: '600px', fontSize: '1rem' }}>
              Cravings strike at 3:00 AM? Pizza Hub kitchens never close. Hand-tossed dough and bubbling cheese baked fresh and delivered anywhere in town 24/7.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ background: '#fff', color: '#991b1b', fontWeight: '800', padding: '14px 28px' }}
            onClick={() => navigate('/menu')}
          >
            Order Midnight Pizza 🍕
          </button>
        </div>
      </section>

      {/* 6. CUSTOMER REVIEWS */}
      <section style={{ padding: '80px 0', background: '#0d0d10' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 40px' }}>
            <span style={{ display: 'inline-block', background: 'rgba(225, 29, 72, 0.12)', color: '#f43f5e', border: '1px solid rgba(225, 29, 72, 0.25)', padding: '4px 16px', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '10px' }}>
              Verified Reviews
            </span>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#fff', marginBottom: '10px' }}>
              What Pizza Lovers Say
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>
              Real reviews from real pizza fans across the city.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '50px' }}>
            {reviews.map((rev) => (
              <div
                key={rev.id}
                style={{
                  background: 'var(--dark-card)',
                  border: '1px solid var(--dark-border)',
                  padding: '26px',
                  borderRadius: '16px'
                }}
              >
                <div style={{ color: 'var(--accent-gold)', marginBottom: '10px', fontSize: '1.1rem' }}>
                  {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '18px' }}>
                  "{rev.comment}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img
                    src={rev.customer_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                    alt={rev.customer_name}
                    style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }}
                  />
                  <div>
                    <h5 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: '700' }}>{rev.customer_name}</h5>
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.78rem' }}>Verified Foodie</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Leave a Review Box */}
          <div style={{ maxWidth: '600px', margin: '0 auto', background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '32px', borderRadius: '16px' }}>
            <h3 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: '800', textAlign: 'center', marginBottom: '6px' }}>
              Leave Your Feedback
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', textAlign: 'center', marginBottom: '20px' }}>
              Loved your pizza? Share your experience with us!
            </p>

            {reviewMsg && (
              <div style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid #10b981', color: '#34d399', padding: '10px', borderRadius: '8px', marginBottom: '16px', textAlign: 'center', fontSize: '0.9rem' }}>
                {reviewMsg}
              </div>
            )}

            <form onSubmit={handleReviewSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Your Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Daniyal Khan"
                  value={reviewForm.name}
                  onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                  style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--dark-border)', borderRadius: '8px', color: '#fff' }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Rating (Stars)
                </label>
                <select
                  value={reviewForm.rating}
                  onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value })}
                  style={{ width: '100%', padding: '12px', background: '#1c1c24', border: '1px solid var(--dark-border)', borderRadius: '8px', color: '#fff' }}
                >
                  <option value="5">★★★★★ (5 Stars - Outstanding)</option>
                  <option value="4">★★★★☆ (4 Stars - Very Good)</option>
                  <option value="3">★★★☆☆ (3 Stars - Good)</option>
                </select>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Your Review Message
                </label>
                <textarea
                  required
                  rows="3"
                  placeholder="Tell us what you liked about the pizza, cheese, or delivery..."
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--dark-border)', borderRadius: '8px', color: '#fff' }}
                ></textarea>
              </div>

              <button type="submit" className="btn btn-primary btn-block">
                Submit Review
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};
