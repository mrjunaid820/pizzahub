import React, { useState, useEffect } from 'react';
import { Search, Loader2, CheckCircle2, Clock, Flame, Bike, Smile } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const TrackOrderPage = ({ initialOrderId = '' }) => {
  const { settings } = useCart();
  const [orderIdInput, setOrderIdInput] = useState(initialOrderId);
  const [phoneInput, setPhoneInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [trackingData, setTrackingData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Check URL query param ?orderId=
    const params = new URLSearchParams(window.location.search);
    const qId = params.get('orderId') || initialOrderId;
    if (qId) {
      setOrderIdInput(qId);
      performTrack(qId, '');
    }
  }, [initialOrderId]);

  const performTrack = (id, phone) => {
    if (!id.trim()) {
      setErrorMsg('Please enter your Order ID.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    let url = `/api/orders/track/?order_id=${encodeURIComponent(id.trim())}`;
    if (phone.trim()) url += `&phone=${encodeURIComponent(phone.trim())}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        if (data.success && data.order) {
          setTrackingData(data);
        } else {
          setTrackingData(null);
          setErrorMsg(data.message || 'Order ID not found.');
        }
      })
      .catch(() => {
        setLoading(false);
        setErrorMsg('Network error while looking up order.');
      });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    performTrack(orderIdInput, phoneInput);
  };

  return (
    <div style={{ padding: '60px 0 100px' }}>
      <div className="container" style={{ maxWidth: '840px' }}>
        <div style={{ textAlign: 'center', marginBottom: '35px' }}>
          <span style={{ display: 'inline-block', background: 'rgba(225, 29, 72, 0.12)', color: '#f43f5e', border: '1px solid rgba(225, 29, 72, 0.25)', padding: '4px 16px', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '10px' }}>
            Real-Time Kitchen Feed
          </span>
          <h1 style={{ fontSize: '2.8rem', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>
            Track Your Pizza Order
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Enter your Order ID (e.g. PH-20261007-8F42) below to view live kitchen baking and rider dispatch updates.
          </p>
        </div>

        {/* Search Box */}
        <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', borderRadius: '16px', padding: '24px', marginBottom: '36px' }}>
          <form onSubmit={handleSearch} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <input
              type="text"
              placeholder="Order ID (e.g. PH-20261007-8F42)"
              value={orderIdInput}
              onChange={(e) => setOrderIdInput(e.target.value)}
              style={{
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--dark-border)',
                borderRadius: '10px',
                color: '#fff',
                fontFamily: 'monospace',
                fontSize: '1rem',
                textTransform: 'uppercase'
              }}
            />
            <input
              type="tel"
              placeholder="Phone (Optional verification)"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              style={{
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--dark-border)',
                borderRadius: '10px',
                color: '#fff',
                fontSize: '0.95rem'
              }}
            />
            <button
              type="submit"
              className="btn btn-primary"
              style={{ padding: '12px 24px', gridColumn: 'span 1' }}
              disabled={loading}
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />} Track Order
            </button>
          </form>

          {errorMsg && (
            <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', color: '#f87171', padding: '12px 16px', borderRadius: '10px', marginTop: '16px', fontSize: '0.9rem' }}>
              ⚠️ {errorMsg}
            </div>
          )}
        </div>

        {/* Tracking Timeline & Details */}
        {trackingData && (
          <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', borderRadius: '20px', padding: '36px', boxShadow: '0 20px 50px rgba(0,0,0,0.6)' }}>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <span className="order-id-badge" style={{ fontSize: '1rem' }}>
                Order #{trackingData.order.order_id}
              </span>
              <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fff', marginTop: '10px' }}>
                {trackingData.stages[trackingData.current_stage_index]?.title || 'Processing Order'}
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                {trackingData.stages[trackingData.current_stage_index]?.desc}
              </p>
            </div>

            {/* 5-Stage Animated Timeline */}
            <div className="tracking-timeline" style={{ margin: '40px 0 50px' }}>
              <div className="timeline-line-bg"></div>
              <div
                className="timeline-line-fill"
                style={{
                  width: `calc(${Math.max(0, Math.min(100, (trackingData.current_stage_index / (trackingData.stages.length - 1)) * 100))}% * 0.85)`
                }}
              ></div>
              {trackingData.stages.map((stg, idx) => {
                const isCompleted = idx < trackingData.current_stage_index;
                const isActive = idx === trackingData.current_stage_index;
                return (
                  <div key={stg.key} className={`timeline-step ${isCompleted ? 'completed' : isActive ? 'active' : ''}`}>
                    <div className="step-icon-circle">
                      {isCompleted ? '✓' : idx + 1}
                    </div>
                    <div className="step-title">{stg.title}</div>
                  </div>
                );
              })}
            </div>

            {/* Order Items & Destination Recap */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--dark-border)', borderRadius: '16px', padding: '24px' }}>
              <h4 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px' }}>
                Order Summary
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderBottom: '1px solid var(--dark-border)', paddingBottom: '14px', marginBottom: '14px' }}>
                {(trackingData.order.items || []).map((it) => (
                  <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem' }}>
                    <span>{it.item_name} ({it.size_name}) x{it.quantity}</span>
                    <strong style={{ color: '#fff' }}>{settings.currency} {it.subtotal}</strong>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: '800', marginBottom: '16px' }}>
                <span style={{ color: '#fff' }}>Total Payable:</span>
                <span style={{ color: 'var(--primary)' }}>
                  {settings.currency} {Number(trackingData.order.total_amount).toLocaleString()} ({trackingData.order.payment_method})
                </span>
              </div>

              <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                <p><strong>Customer:</strong> {trackingData.order.customer_name} ({trackingData.order.customer_phone})</p>
                <p><strong>Destination:</strong> {trackingData.order.delivery_address}</p>
                {trackingData.order.landmark && <p><strong>Landmark:</strong> {trackingData.order.landmark}</p>}
                <p><strong>Placed At:</strong> {new Date(trackingData.order.created_at).toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
