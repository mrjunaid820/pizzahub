import React, { useState, useEffect } from 'react';
import { CheckCircle2, MessageCircle, ArrowRight, Clock, MapPin, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const OrderConfirmationPage = ({ orderId, navigate }) => {
  const { settings } = useCart();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Try session cache first
    const cached = sessionStorage.getItem(`pizzahub_order_${orderId}`);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setOrderData(parsed);
        setLoading(false);
        return;
      } catch {}
    }

    // 2. Fetch from tracking endpoint
    fetch(`/api/orders/track/?order_id=${encodeURIComponent(orderId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.order) {
          setOrderData({ order_id: data.order.order_id, order: data.order });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '120px 20px', color: 'var(--text-muted)' }}>
        <Loader2 size={36} className="animate-spin" style={{ margin: '0 auto 16px', color: 'var(--primary)' }} />
        <p>Loading your confirmation details...</p>
      </div>
    );
  }

  const order = orderData?.order;

  return (
    <div style={{ padding: '60px 0 100px' }}>
      <div className="container" style={{ maxWidth: '720px' }}>
        <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', borderRadius: '24px', padding: '40px 30px', textAlign: 'center', boxShadow: '0 25px 60px rgba(0,0,0,0.7)' }}>
          {/* Animated Confirmation Badge */}
          <div style={{ width: '84px', height: '84px', background: 'rgba(16, 185, 129, 0.15)', border: '2px solid rgba(16, 185, 129, 0.4)', color: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '2.5rem' }}>
            🍕
          </div>

          <h1 style={{ fontSize: '2.4rem', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>
            Order Confirmed!
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '520px', margin: '0 auto 16px', lineHeight: '1.6' }}>
            Thank you for choosing <strong>Pizza Hub</strong>. Your order has been received and is currently being prepared with fresh ingredients.
          </p>

          <div style={{ display: 'inline-block', background: 'rgba(225,29,72,0.12)', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '6px 20px', borderRadius: '9999px', fontSize: '1.15rem', fontWeight: '800', letterSpacing: '1px', marginBottom: '28px' }}>
            Order ID: #{orderId}
          </div>

          {/* Details Box */}
          {order && (
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--dark-border)', borderRadius: '16px', padding: '24px', textAlign: 'left', marginBottom: '30px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Customer Name:</span>
                <strong style={{ color: '#fff' }}>{order.customer_name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Contact Phone:</span>
                <span style={{ color: '#fff' }}>{order.customer_phone}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Delivery Address:</span>
                <span style={{ color: '#fff', maxWidth: '280px', textAlign: 'right' }}>{order.delivery_address}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Payment Method:</span>
                <span style={{ color: '#fff' }}>{order.payment_method}</span>
              </div>
              <div style={{ borderTop: '1px solid var(--dark-border)', paddingTop: '10px', marginTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: '800' }}>
                <span style={{ color: '#fff' }}>Total Amount:</span>
                <span style={{ color: 'var(--primary)' }}>
                  {settings.currency} {Number(order.total_amount).toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Action CTAs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {orderData?.whatsapp_admin_url && (
              <a
                href={orderData.whatsapp_admin_url}
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary btn-block"
                style={{ background: '#25d366', boxShadow: '0 4px 15px rgba(37,211,102,0.35)', padding: '14px' }}
              >
                <MessageCircle size={20} /> Send Order Slip to Restaurant WhatsApp
              </a>
            )}

            <button
              type="button"
              className="btn btn-secondary btn-block"
              style={{ padding: '14px' }}
              onClick={() => navigate(`/track-order?orderId=${orderId}`)}
            >
              📍 Track Live Order Status <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
