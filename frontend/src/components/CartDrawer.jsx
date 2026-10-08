import React from 'react';
import { X, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const CartDrawer = ({ navigate }) => {
  const {
    cart,
    cartSubtotal,
    cartDeliveryFee,
    cartDiscount,
    cartTotal,
    appliedCoupon,
    settings,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1050,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        justifyContent: 'flex-end'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsCartOpen(false);
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          height: '100%',
          background: 'var(--dark-surface)',
          borderLeft: '1px solid var(--dark-border)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-15px 0 40px rgba(0,0,0,0.8)',
          animation: 'slideInRight 0.3s ease'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '22px 24px',
            borderBottom: '1px solid var(--dark-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShoppingBag size={22} color="var(--primary)" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff' }}>Your Pizza Cart</h3>
          </div>
          <button
            type="button"
            onClick={() => setIsCartOpen(false)}
            style={{ color: 'var(--text-muted)', padding: '4px' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Items List */}
        <div style={{ flexGrow: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-dim)' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '14px' }}>🍕</div>
              <h4 style={{ color: '#fff', fontSize: '1.15rem', marginBottom: '6px' }}>Your cart is empty</h4>
              <p style={{ fontSize: '0.9rem', marginBottom: '20px' }}>Explore our artisan pizza menu and pick your cravings!</p>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setIsCartOpen(false);
                  navigate('/menu');
                }}
              >
                Browse Menu
              </button>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div
                key={`${item.id}-${item.size_name}-${idx}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'var(--dark-card)',
                  border: '1px solid var(--dark-border)',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  gap: '12px'
                }}
              >
                <img
                  src={item.image_url}
                  alt={item.name}
                  style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }}
                />
                <div style={{ flexGrow: 1 }}>
                  <h5 style={{ color: '#fff', fontSize: '0.92rem', fontWeight: '700', marginBottom: '2px' }}>
                    {item.name}
                  </h5>
                  <div style={{ color: 'var(--accent-gold)', fontSize: '0.78rem', fontWeight: '600' }}>
                    Size: {item.size_name}
                  </div>
                  <div style={{ color: '#fff', fontWeight: '800', fontSize: '0.88rem', marginTop: '2px' }}>
                    {settings.currency} {item.unit_price * item.quantity}
                  </div>
                </div>

                {/* Quantity Control */}
                <div className="qty-control" style={{ transform: 'scale(0.85)' }}>
                  <button type="button" className="qty-btn" onClick={() => updateQuantity(idx, -1)}>
                    −
                  </button>
                  <span className="qty-input">{item.quantity}</span>
                  <button type="button" className="qty-btn" onClick={() => updateQuantity(idx, 1)}>
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => removeFromCart(idx)}
                  style={{ color: '#ef4444', padding: '6px', borderRadius: '6px' }}
                  title="Remove Item"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer Summary */}
        {cart.length > 0 && (
          <div
            style={{
              padding: '24px',
              borderTop: '1px solid var(--dark-border)',
              background: '#0d0d12'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
              <span>Subtotal:</span>
              <span>{settings.currency} {cartSubtotal.toLocaleString()}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#10b981', marginBottom: '8px' }}>
                <span>Discount ({appliedCoupon.code}):</span>
                <span>-{settings.currency} {cartDiscount.toLocaleString()}</span>
              </div>
            )}

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '1.25rem',
                fontWeight: '800',
                color: '#fff',
                borderTop: '1px solid var(--dark-border)',
                paddingTop: '12px',
                marginTop: '10px',
                marginBottom: '18px'
              }}
            >
              <span>Total Payable:</span>
              <span style={{ color: 'var(--primary)' }}>
                {settings.currency} {cartTotal.toLocaleString()}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-primary btn-block"
                onClick={() => {
                  setIsCartOpen(false);
                  navigate('/checkout');
                }}
              >
                Proceed to Checkout <ArrowRight size={18} />
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-block btn-sm"
                onClick={() => setIsCartOpen(false)}
              >
                Continue Ordering
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
