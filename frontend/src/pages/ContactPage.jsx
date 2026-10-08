import React, { useState } from 'react';
import { Phone, MessageCircle, Mail, MapPin, Send, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const ContactPage = () => {
  const { settings } = useCart();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setForm({ name: '', email: '', message: '' });
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <div style={{ padding: '60px 0 100px' }}>
      <div className="container" style={{ maxWidth: '980px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span style={{ display: 'inline-block', background: 'rgba(225, 29, 72, 0.12)', color: '#f43f5e', border: '1px solid rgba(225, 29, 72, 0.25)', padding: '4px 16px', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '10px' }}>
            We're Here For You
          </span>
          <h1 style={{ fontSize: '2.8rem', fontWeight: '800', color: '#fff', marginBottom: '12px' }}>
            Contact Pizza Hub
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Got questions, special catering requests, or feedback? Get in touch with our team anytime.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px' }}>
          {/* Left: Contact Channels */}
          <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', borderRadius: '20px', padding: '36px' }}>
            <h3 style={{ color: '#fff', fontSize: '1.35rem', fontWeight: '800', marginBottom: '24px' }}>
              Direct Channels
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '700' }}>
                  24/7 Phone Helpline
                </span>
                <a
                  href={`tel:${(settings.phone_number || '').replace(/\s+/g, '')}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.2rem', fontWeight: '800', color: '#fff', marginTop: '4px' }}
                >
                  <Phone size={20} color="var(--primary)" /> {settings.phone_number}
                </a>
              </div>

              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '700' }}>
                  Instant WhatsApp Order Support
                </span>
                <a
                  href={`https://wa.me/${settings.whatsapp_number}?text=Hello%20Pizza%20Hub!`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.2rem', fontWeight: '800', color: '#25d366', marginTop: '4px' }}
                >
                  <MessageCircle size={20} /> Chat on WhatsApp
                </a>
              </div>

              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '700' }}>
                  Customer Support Email
                </span>
                <a
                  href={`mailto:${settings.email}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem', fontWeight: '700', color: '#fff', marginTop: '4px' }}
                >
                  <Mail size={20} color="var(--primary)" /> {settings.email}
                </a>
              </div>

              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '700' }}>
                  Kitchen & Store Location
                </span>
                <p style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1rem', color: '#fff', marginTop: '4px' }}>
                  <MapPin size={20} color="var(--primary)" /> {settings.address}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Message Form */}
          <div style={{ background: 'var(--dark-surface)', border: '1px solid var(--dark-border)', borderRadius: '20px', padding: '36px' }}>
            <h3 style={{ color: '#fff', fontSize: '1.35rem', fontWeight: '800', marginBottom: '16px' }}>
              Send Us a Message
            </h3>

            {sent && (
              <div style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid #10b981', color: '#34d399', padding: '12px', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                <Check size={18} /> Thank you! Your message has been received.
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tariq Mehmood"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--dark-border)', borderRadius: '8px', color: '#fff' }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Email or Phone
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. tariq@gmail.com / 0300 1234567"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--dark-border)', borderRadius: '8px', color: '#fff' }}
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  How Can We Help?
                </label>
                <textarea
                  required
                  rows="4"
                  placeholder="Tell us about catering, party booking, or order inquiries..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--dark-border)', borderRadius: '8px', color: '#fff' }}
                ></textarea>
              </div>

              <button type="submit" className="btn btn-primary btn-block">
                <Send size={18} /> Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
