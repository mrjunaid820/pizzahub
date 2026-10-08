import React, { useState, useEffect } from 'react';
import { Tag, Copy, Check, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const OffersPage = ({ navigate }) => {
  const { settings } = useCart();
  const [coupons, setCoupons] = useState([]);
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    fetch('/api/coupons/active/')
      .then((res) => res.json())
      .then((data) => setCoupons(Array.isArray(data) ? data : []))
      .catch((err) => console.warn(err));
  }, []);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 3000);
  };

  return (
    <div style={{ padding: '60px 0 100px' }}>
      <div className="container">
        <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 40px' }}>
          <span style={{ display: 'inline-block', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-gold)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '4px 16px', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '10px' }}>
            Exclusive Deals
          </span>
          <h1 style={{ fontSize: '2.8rem', fontWeight: '800', color: '#fff', marginBottom: '10px' }}>
            Offers & Promo Codes
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Copy your favorite coupon code and enter it at checkout to enjoy instant savings on your order.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {coupons.map((c) => (
            <div
              key={c.code}
              style={{
                background: '#15151c',
                border: '1px solid var(--dark-border)',
                borderRadius: '16px',
                padding: '28px',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <span style={{ display: 'inline-block', background: 'rgba(245,158,11,0.15)', color: 'var(--accent-gold)', padding: '4px 12px', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: '700', marginBottom: '14px' }}>
                {c.discount_type === 'percentage' ? `${c.discount_value}% OFF` : `FLAT RS. ${c.discount_value} OFF`}
              </span>
              <h3 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: '800', marginBottom: '8px' }}>
                {c.description}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '22px' }}>
                Minimum order value of {settings.currency} {c.min_order_amount}. Valid on all pizzas and sides.
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.5)', padding: '10px 16px', borderRadius: '12px', border: '1px dashed rgba(245,158,11,0.5)' }}>
                <span style={{ fontFamily: 'monospace', fontWeight: '800', color: 'var(--accent-gold)', fontSize: '1.25rem', letterSpacing: '1px' }}>
                  {c.code}
                </span>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  onClick={() => handleCopy(c.code)}
                >
                  {copiedCode === c.code ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
                  {copiedCode === c.code ? 'Copied!' : 'Copy Code'}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <button type="button" className="btn btn-primary" onClick={() => navigate('/menu')}>
            Order Now with Discount <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
