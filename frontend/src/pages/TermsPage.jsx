import React from 'react';

export const TermsPage = () => {
  return (
    <div style={{ padding: '60px 0 100px' }}>
      <div className="container" style={{ maxWidth: '840px' }}>
        <h1 style={{ fontSize: '2.6rem', fontWeight: '800', color: '#fff', marginBottom: '24px' }}>
          Terms & Conditions
        </h1>
        <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', borderRadius: '16px', padding: '36px', color: 'var(--text-muted)', lineHeight: '1.8' }}>
          <p style={{ marginBottom: '16px' }}>
            Welcome to Pizza Hub. By accessing our website, placing an order, or utilizing our services, you agree to comply with and be bound by the following Terms & Conditions.
          </p>
          <h3 style={{ color: '#fff', fontSize: '1.25rem', marginTop: '24px', marginBottom: '8px' }}>
            1. Orders and Availability
          </h3>
          <p style={{ marginBottom: '16px' }}>
            All orders placed via our website are subject to availability and kitchen acceptance. Pizza Hub reserves the right to decline or cancel orders in cases of incorrect pricing information, product unavailability, or delivery addresses outside active service perimeters.
          </p>
          <h3 style={{ color: '#fff', fontSize: '1.25rem', marginTop: '24px', marginBottom: '8px' }}>
            2. Delivery Estimates
          </h3>
          <p style={{ marginBottom: '16px' }}>
            Our standard delivery time is approximately 30 to 40 minutes. However, delivery times may be extended during peak rush periods, adverse weather conditions, or unforeseen traffic delays.
          </p>
          <h3 style={{ color: '#fff', fontSize: '1.25rem', marginTop: '24px', marginBottom: '8px' }}>
            3. Cancellations & Modifications
          </h3>
          <p>
            Because pizzas are prepared fresh immediately upon order receipt, cancellations or modifications must be communicated to customer support within 5 minutes of placing your order.
          </p>
        </div>
      </div>
    </div>
  );
};
