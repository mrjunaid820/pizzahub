import React from 'react';
import { Award, Clock, Flame, ShieldCheck } from 'lucide-react';

export const AboutPage = ({ navigate }) => {
  return (
    <div style={{ padding: '60px 0 100px' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span style={{ display: 'inline-block', background: 'rgba(225, 29, 72, 0.12)', color: '#f43f5e', border: '1px solid rgba(225, 29, 72, 0.25)', padding: '4px 16px', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '10px' }}>
            Our Heritage
          </span>
          <h1 style={{ fontSize: '2.8rem', fontWeight: '800', color: '#fff', marginBottom: '12px' }}>
            About Pizza Hub
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Passionate pizza artisans dedicated to perfection, flavor, and 24-hour round-the-clock delivery.
          </p>
        </div>

        <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', borderRadius: '20px', padding: '40px', lineHeight: '1.8', color: 'var(--text-muted)' }}>
          <h3 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '800', marginBottom: '14px' }}>
            Handcrafted With Integrity
          </h3>
          <p style={{ marginBottom: '16px' }}>
            Founded on the belief that fast food should never mean compromised quality, <strong>Pizza Hub</strong> was born to offer authentic, slow-fermented, stone-baked pizzas crafted from the ground up.
          </p>
          <p style={{ marginBottom: '24px' }}>
            Every morning, our master bakers hand-knead premium durum wheat dough and let it cold-ferment for 48 hours. This time-tested technique breaks down gluten, resulting in an airy, blistered crust that is crisp on the outside and wonderfully pillowy inside.
          </p>

          <h3 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '800', marginBottom: '14px' }}>
            Never Closed: 24/7 Delivery
          </h3>
          <p style={{ marginBottom: '24px' }}>
            Whether you are fueling an intense late-night gaming session, working the midnight shift, or hosting a weekend family get-together, our ovens never stop baking. Our custom thermal delivery bags ensure every pie arrives as hot as it left the hearth.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '30px', paddingTop: '24px', borderTop: '1px solid var(--dark-border)' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary)' }}>10,000+</div>
              <div style={{ fontSize: '0.85rem', color: '#fff' }}>Happy Regular Customers</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--accent-gold)' }}>100%</div>
              <div style={{ fontSize: '0.85rem', color: '#fff' }}>Pure Whole Milk Cheese</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: '#10b981' }}>24/7</div>
              <div style={{ fontSize: '0.85rem', color: '#fff' }}>Round-The-Clock Service</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
