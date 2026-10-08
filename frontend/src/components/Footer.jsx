import React from 'react';
import { Phone, Mail, MapPin, Shield } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const Footer = ({ navigate }) => {
  const { settings } = useCart();

  return (
    <footer style={{ background: '#08080a', borderTop: '1px solid var(--dark-border)', padding: '70px 0 30px', marginTop: '100px' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '40px', marginBottom: '50px' }}>
          {/* Brand Info */}
          <div>
            <div className="logo" style={{ marginBottom: '14px' }}>
              <div className="logo-icon">🍕</div>
              <div className="logo-text">
                PIZZA<span>HUB</span>
              </div>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6', maxWidth: '300px' }}>
              Fresh Pizza, Fresh Moments. Slow-fermented hand-tossed dough, imported Italian cheese, and 24/7 delivery right to your door.
            </p>
            <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
              <a
                href={`tel:${(settings.phone_number || '').replace(/\s+/g, '')}`}
                className="btn btn-secondary btn-sm"
              >
                📞 Call
              </a>
              <a
                href={`https://wa.me/${settings.whatsapp_number}?text=Hello%20Pizza%20Hub!`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary btn-sm"
              >
                💬 WhatsApp
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: '#fff', fontSize: '1.05rem', fontWeight: '700', marginBottom: '18px' }}>
              Quick Links
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }} style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Home</a>
              <a href="/menu" onClick={(e) => { e.preventDefault(); navigate('/menu'); }} style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Pizza Menu</a>
              <a href="/offers" onClick={(e) => { e.preventDefault(); navigate('/offers'); }} style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Deals & Coupons</a>
              <a href="/track-order" onClick={(e) => { e.preventDefault(); navigate('/track-order'); }} style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Track Your Order</a>
              <a href="/cart" onClick={(e) => { e.preventDefault(); navigate('/cart'); }} style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Shopping Cart</a>
            </div>
          </div>

          {/* Customer Care */}
          <div>
            <h4 style={{ color: '#fff', fontSize: '1.05rem', fontWeight: '700', marginBottom: '18px' }}>
              Customer Care
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <a href="/about" onClick={(e) => { e.preventDefault(); navigate('/about'); }} style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>About Pizza Hub</a>
              <a href="/contact" onClick={(e) => { e.preventDefault(); navigate('/contact'); }} style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Contact Support</a>
              <a href="/privacy-policy" onClick={(e) => { e.preventDefault(); navigate('/privacy-policy'); }} style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Privacy Policy</a>
              <a href="/terms" onClick={(e) => { e.preventDefault(); navigate('/terms'); }} style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Terms & Conditions</a>
            </div>
          </div>

          {/* Contact Details */}
          <div>
            <h4 style={{ color: '#fff', fontSize: '1.05rem', fontWeight: '700', marginBottom: '18px' }}>
              Restaurant Location
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              <p style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={16} color="var(--primary)" />
                {settings.address}
              </p>
              <p style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={16} color="var(--primary)" />
                {settings.phone_number}
              </p>
              <p style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={16} color="var(--primary)" />
                {settings.email}
              </p>
              <div style={{ marginTop: '10px' }}>
                <a
                  href="/admin"
                  onClick={(e) => { e.preventDefault(); navigate('/admin'); }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--accent-gold)', fontSize: '0.82rem', fontWeight: '700' }}
                >
                  <Shield size={14} /> Staff / Admin Portal
                </a>
              </div>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--dark-border)', paddingTop: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
          <div>© {new Date().getFullYear()} Pizza Hub. All rights reserved. Commercial Restaurant Platform.</div>
          <div>Handcrafted with ❤️ & Fresh Basil</div>
        </div>
      </div>
    </footer>
  );
};
