import React, { useState } from 'react';
import { Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const CartPage = ({ navigate }) => {
  const {
    cart,
    cartSubtotal,
    cartDeliveryFee,
    cartDiscount,
    cartTotal,
    appliedCoupon,
    settings,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [validating, setValidating] = useState(false);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setValidating(true);
    setCouponError('');
    setCouponSuccess('');

    fetch('/api/coupons/validate/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: couponInput.trim(),
        subtotal: cartSubtotal
      })
    })
      .then((res) => res.json())
      .then((data) => {
        setValidating(false);
        if (data.success && data.coupon) {
          applyCoupon(data.coupon);
          setCouponSuccess(data.message);
        } else {
          setCouponError(data.message || 'Invalid coupon.');
        }
      })
      .catch(() => {
        setValidating(false);
        setCouponError('Failed to validate coupon.');
      });
  };

  if (cart.length === 0) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '100px 20px' }}>
        <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🍕</div>
        <h1 style={{ color: '#fff', fontSize: '2.2rem', marginBottom: '8px' }}>Your Cart is Empty</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
          Looks like you haven't added any pizzas to your cart yet.
        </p>
        <button type="button" className="btn btn-primary" onClick={() => navigate('/menu')}>
          Explore Menu Now →
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '60px 0 100px' }}>
      <div className="container">
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#fff', marginBottom: '30px' }}>
          Shopping Cart ({cart.length} {cart.length === 1 ? 'Item' : 'Items'})
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px', alignItems: 'start' }}>
          {/* Left: Cart Items Table/List */}
          <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', borderRadius: '16px', padding: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {cart.map((item, idx) => (
                <div
                  key={`${item.id}-${item.size_name}-${idx}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 0',
                    borderBottom: idx < cart.length - 1 ? '1px solid var(--dark-border)' : 'none',
                    flexWrap: 'wrap',
                    gap: '14px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <img
                      src={item.image_url}
                      alt={item.name}
                      style={{ width: '64px', height: '64px', borderRadius: '12px', objectFit: 'cover' }}
                    />
                    <div>
                      <h4 style={{ color: '#fff', fontSize: '1.05rem', fontWeight: '700' }}>{item.name}</h4>
                      <span style={{ color: 'var(--accent-gold)', fontSize: '0.85rem', fontWeight: '600' }}>
                        Size: {item.size_name}
                      </span>
                      <div style={{ color: 'var(--text-dim)', fontSize: '0.82rem', marginTop: '2px' }}>
                        {settings.currency} {item.unit_price} each
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div className="qty-control">
                      <button type="button" className="qty-btn" onClick={() => updateQuantity(idx, -1)}>
                        −
                      </button>
                      <span className="qty-input">{item.quantity}</span>
                      <button type="button" className="qty-btn" onClick={() => updateQuantity(idx, 1)}>
                        +
                      </button>
                    </div>

                    <div style={{ color: '#fff', fontWeight: '800', fontSize: '1.1rem', minWidth: '80px', textAlign: 'right' }}>
                      {settings.currency} {(item.unit_price * item.quantity).toLocaleString()}
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(idx)}
                      style={{ color: '#ef4444', padding: '6px' }}
                      title="Remove item"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--dark-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={clearCart}
                style={{ color: '#ef4444' }}
              >
                Clear Cart
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => navigate('/menu')}
              >
                + Add More Items
              </button>
            </div>
          </div>

          {/* Right: Order Breakdown & Checkout CTA */}
          <div style={{ background: 'var(--dark-surface)', border: '1px solid var(--dark-border)', borderRadius: '16px', padding: '28px', position: 'sticky', top: '100px' }}>
            <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#fff', marginBottom: '20px' }}>
              Order Breakdown
            </h3>

            {/* Coupon Application Box */}
            <form onSubmit={handleApplyCoupon} style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Coupon Code (e.g. PIZZAFIRST)"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  style={{
                    flexGrow: 1,
                    padding: '10px 14px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--dark-border)',
                    borderRadius: '8px',
                    color: '#fff',
                    textTransform: 'uppercase',
                    fontFamily: 'monospace'
                  }}
                />
                <button type="submit" className="btn btn-secondary btn-sm" disabled={validating}>
                  {validating ? 'Applying...' : 'Apply'}
                </button>
              </div>
              {couponError && <p style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '6px' }}>{couponError}</p>}
              {couponSuccess && <p style={{ color: '#34d399', fontSize: '0.8rem', marginTop: '6px' }}>{couponSuccess}</p>}
              {appliedCoupon && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', fontSize: '0.82rem', color: '#10b981' }}>
                  <span>Active Coupon: <strong>{appliedCoupon.code}</strong></span>
                  <button type="button" onClick={removeCoupon} style={{ color: '#ef4444', textDecoration: 'underline' }}>Remove</button>
                </div>
              )}
            </form>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '10px' }}>
              <span>Subtotal:</span>
              <span>{settings.currency} {cartSubtotal.toLocaleString()}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '10px' }}>
              <span>Delivery Fee:</span>
              <span>
                {cartDeliveryFee === 0 ? (
                  <strong style={{ color: '#10b981' }}>FREE</strong>
                ) : (
                  `${settings.currency} ${cartDeliveryFee}`
                )}
              </span>
            </div>

            {cartDiscount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981', fontSize: '0.92rem', marginBottom: '10px' }}>
                <span>Discount ({appliedCoupon.code}):</span>
                <span>-{settings.currency} {cartDiscount.toLocaleString()}</span>
              </div>
            )}

            <div style={{ borderTop: '1px solid var(--dark-border)', paddingTop: '16px', marginTop: '14px', display: 'flex', justifyContent: 'space-between', fontSize: '1.4rem', fontWeight: '800', color: '#fff', marginBottom: '24px' }}>
              <span>Total Payable:</span>
              <span style={{ color: 'var(--primary)' }}>
                {settings.currency} {cartTotal.toLocaleString()}
              </span>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-block"
              style={{ padding: '14px', fontSize: '1.05rem' }}
              onClick={() => navigate('/checkout')}
            >
              Proceed to Checkout <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
