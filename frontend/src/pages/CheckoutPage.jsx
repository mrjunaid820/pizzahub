import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, Loader2, CreditCard, Banknote } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const CheckoutPage = ({ navigate }) => {
  const {
    cart,
    cartSubtotal,
    cartDeliveryFee,
    cartDiscount,
    cartTotal,
    appliedCoupon,
    settings,
    clearCart
  } = useCart();

  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    customer_whatsapp: '',
    sameAsPhone: true,
    customer_email: '',
    delivery_address: '',
    city: 'Karachi',
    landmark: '',
    delivery_instructions: '',
    order_notes: '',
    payment_method: 'Cash on Delivery'
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (cart.length === 0) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '100px 20px' }}>
        <h2 style={{ color: '#fff', marginBottom: '10px' }}>Your Cart is Empty</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Please add pizzas to your cart before proceeding to checkout.</p>
        <button type="button" className="btn btn-primary" onClick={() => navigate('/menu')}>
          Browse Menu →
        </button>
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.customer_name.trim() || !form.customer_phone.trim() || !form.delivery_address.trim()) {
      setErrorMsg('Please enter your Name, Phone Number, and Delivery Address.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    // Generate unique idempotency key
    const idempotencyKey = `idemp_${form.customer_phone}_${Date.now()}`;

    const payload = {
      customer_name: form.customer_name.trim(),
      customer_phone: form.customer_phone.trim(),
      customer_whatsapp: form.sameAsPhone ? form.customer_phone.trim() : form.customer_whatsapp.trim() || form.customer_phone.trim(),
      customer_email: form.customer_email.trim() || null,
      delivery_address: form.delivery_address.trim(),
      city: form.city.trim(),
      landmark: form.landmark.trim(),
      delivery_instructions: form.delivery_instructions.trim(),
      order_notes: form.order_notes.trim(),
      payment_method: form.payment_method,
      items: cart.map((it) => ({
        product_id: it.id,
        size_name: it.size_name,
        quantity: it.quantity,
        unit_price: it.unit_price
      })),
      coupon_code: appliedCoupon ? appliedCoupon.code : null,
      idempotency_key: idempotencyKey
    };

    fetch('/api/orders/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then((res) => res.json())
      .then((data) => {
        setSubmitting(false);
        if (data.success && data.order_id) {
          clearCart();
          // Store order in session for instant confirmation rendering
          sessionStorage.setItem(`pizzahub_order_${data.order_id}`, JSON.stringify(data));
          navigate(`/order-confirmation/${data.order_id}`);
        } else {
          setErrorMsg(data.message || 'Failed to place order. Please check your information.');
        }
      })
      .catch((err) => {
        setSubmitting(false);
        setErrorMsg('Network error. Please try again or call our helpline.');
      });
  };

  return (
    <div style={{ padding: '60px 0 100px' }}>
      <div className="container" style={{ maxWidth: '1080px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>
          Checkout & Delivery
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '36px' }}>
          Please fill in your delivery address to have your delicious artisan pizza prepared and dispatched.
        </p>

        {errorMsg && (
          <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', color: '#f87171', padding: '14px 20px', borderRadius: '12px', marginBottom: '24px' }}>
            {errorMsg}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px', alignItems: 'start' }}>
          {/* Customer Form */}
          <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', borderRadius: '16px', padding: '32px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff', marginBottom: '20px' }}>
              Customer Information
            </h3>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Asad Ullah"
                    value={form.customer_name}
                    onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                    style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--dark-border)', borderRadius: '8px', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 0300 1234567"
                    value={form.customer_phone}
                    onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
                    style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--dark-border)', borderRadius: '8px', color: '#fff' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  WhatsApp Number
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 0300 1234567"
                  disabled={form.sameAsPhone}
                  value={form.sameAsPhone ? form.customer_phone : form.customer_whatsapp}
                  onChange={(e) => setForm({ ...form, customer_whatsapp: e.target.value })}
                  style={{ width: '100%', padding: '12px', background: form.sameAsPhone ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)', border: '1px solid var(--dark-border)', borderRadius: '8px', color: '#fff' }}
                />
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-dim)', marginTop: '6px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={form.sameAsPhone}
                    onChange={(e) => setForm({ ...form, sameAsPhone: e.target.checked })}
                  />
                  Same as Mobile Number
                </label>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  placeholder="For order receipts and notifications"
                  value={form.customer_email}
                  onChange={(e) => setForm({ ...form, customer_email: e.target.value })}
                  style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--dark-border)', borderRadius: '8px', color: '#fff' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Delivery Address *
                </label>
                <textarea
                  required
                  rows="2"
                  placeholder="House / Flat No., Street, Block, Area"
                  value={form.delivery_address}
                  onChange={(e) => setForm({ ...form, delivery_address: e.target.value })}
                  style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--dark-border)', borderRadius: '8px', color: '#fff' }}
                ></textarea>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Nearby Landmark
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Near Shell Pump"
                    value={form.landmark}
                    onChange={(e) => setForm({ ...form, landmark: e.target.value })}
                    style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--dark-border)', borderRadius: '8px', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    City
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={form.city}
                    style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--dark-border)', borderRadius: '8px', color: 'var(--text-dim)' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Special Instructions / Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ring bell twice, extra napkins"
                  value={form.order_notes}
                  onChange={(e) => setForm({ ...form, order_notes: e.target.value })}
                  style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--dark-border)', borderRadius: '8px', color: '#fff' }}
                />
              </div>

              {/* Payment Method */}
              <div style={{ marginBottom: '30px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '10px' }}>
                  Payment Method
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '14px 16px',
                      borderRadius: '10px',
                      background: form.payment_method === 'Cash on Delivery' ? 'rgba(225,29,72,0.15)' : 'rgba(255,255,255,0.04)',
                      border: form.payment_method === 'Cash on Delivery' ? '1px solid var(--primary)' : '1px solid var(--dark-border)',
                      cursor: 'pointer'
                    }}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value="Cash on Delivery"
                      checked={form.payment_method === 'Cash on Delivery'}
                      onChange={() => setForm({ ...form, payment_method: 'Cash on Delivery' })}
                    />
                    <div>
                      <strong style={{ color: '#fff', fontSize: '0.95rem' }}>💵 Cash on Delivery (COD)</strong>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Pay cash when the rider reaches your doorstep.</div>
                    </div>
                  </label>

                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '14px 16px',
                      borderRadius: '10px',
                      background: form.payment_method === 'Card on Delivery' ? 'rgba(225,29,72,0.15)' : 'rgba(255,255,255,0.04)',
                      border: form.payment_method === 'Card on Delivery' ? '1px solid var(--primary)' : '1px solid var(--dark-border)',
                      cursor: 'pointer'
                    }}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value="Card on Delivery"
                      checked={form.payment_method === 'Card on Delivery'}
                      onChange={() => setForm({ ...form, payment_method: 'Card on Delivery' })}
                    />
                    <div>
                      <strong style={{ color: '#fff', fontSize: '0.95rem' }}>💳 Card on Delivery (POS Machine)</strong>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Rider carries wireless card terminal.</div>
                    </div>
                  </label>

                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '14px 16px',
                      borderRadius: '10px',
                      background: form.payment_method === 'EasyPaisa / JazzCash / Bank Transfer' ? 'rgba(225,29,72,0.15)' : 'rgba(255,255,255,0.04)',
                      border: form.payment_method === 'EasyPaisa / JazzCash / Bank Transfer' ? '1px solid var(--primary)' : '1px solid var(--dark-border)',
                      cursor: 'pointer'
                    }}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value="EasyPaisa / JazzCash / Bank Transfer"
                      checked={form.payment_method === 'EasyPaisa / JazzCash / Bank Transfer'}
                      onChange={() => setForm({ ...form, payment_method: 'EasyPaisa / JazzCash / Bank Transfer' })}
                    />
                    <div>
                      <strong style={{ color: '#fff', fontSize: '0.95rem' }}>📱 EasyPaisa / JazzCash / Online Transfer</strong>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Account details provided after order placement.</div>
                    </div>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block"
                style={{ padding: '16px', fontSize: '1.1rem' }}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 size={20} className="animate-spin" /> Confirming Your Order...
                  </>
                ) : (
                  <>
                    🍕 Confirm Order Now ({settings.currency} {cartTotal.toLocaleString()})
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right: Items Summary */}
          <div style={{ background: 'var(--dark-surface)', border: '1px solid var(--dark-border)', borderRadius: '16px', padding: '28px', position: 'sticky', top: '100px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff', marginBottom: '20px' }}>
              Order Items ({cart.length})
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderBottom: '1px solid var(--dark-border)', paddingBottom: '16px', marginBottom: '16px' }}>
              {cart.map((it, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.92rem' }}>
                  <div>
                    <strong style={{ color: '#fff' }}>{it.name}</strong>{' '}
                    <span style={{ color: 'var(--accent-gold)', fontSize: '0.8rem' }}>({it.size_name})</span>
                    <span style={{ color: 'var(--text-dim)', marginLeft: '6px' }}>x{it.quantity}</span>
                  </div>
                  <div style={{ color: '#fff', fontWeight: '700' }}>
                    {settings.currency} {(it.unit_price * it.quantity).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}>
              <span>Subtotal:</span>
              <span>{settings.currency} {cartSubtotal.toLocaleString()}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}>
              <span>Delivery Fee:</span>
              <span>{cartDeliveryFee === 0 ? <strong style={{ color: '#10b981' }}>FREE</strong> : `${settings.currency} ${cartDeliveryFee}`}</span>
            </div>

            {cartDiscount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981', fontSize: '0.9rem', marginBottom: '8px' }}>
                <span>Coupon Discount ({appliedCoupon.code}):</span>
                <span>-{settings.currency} {cartDiscount.toLocaleString()}</span>
              </div>
            )}

            <div style={{ borderTop: '1px solid var(--dark-border)', paddingTop: '14px', marginTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '1.35rem', fontWeight: '800', color: '#fff' }}>
              <span>Total Payable:</span>
              <span style={{ color: 'var(--primary)' }}>
                {settings.currency} {cartTotal.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
