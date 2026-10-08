import React from 'react';

export const PrivacyPolicyPage = () => {
  return (
    <div style={{ padding: '60px 0 100px' }}>
      <div className="container" style={{ maxWidth: '840px' }}>
        <h1 style={{ fontSize: '2.6rem', fontWeight: '800', color: '#fff', marginBottom: '24px' }}>
          Privacy Policy
        </h1>
        <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', borderRadius: '16px', padding: '36px', color: 'var(--text-muted)', lineHeight: '1.8' }}>
          <p style={{ marginBottom: '16px' }}>
            At <strong>Pizza Hub</strong>, we prioritize the protection of our customers' personal data. This Privacy Policy outlines what information we collect, how it is used, and the steps we take to keep your records safe.
          </p>
          <h3 style={{ color: '#fff', fontSize: '1.25rem', marginTop: '24px', marginBottom: '8px' }}>
            1. Information We Collect
          </h3>
          <p style={{ marginBottom: '16px' }}>
            When you place an order on Pizza Hub, we collect your full name, mobile number, delivery address, nearby landmark, and optional email address. This information is solely used to prepare, dispatch, and confirm your order.
          </p>
          <h3 style={{ color: '#fff', fontSize: '1.25rem', marginTop: '24px', marginBottom: '8px' }}>
            2. Payment Security
          </h3>
          <p style={{ marginBottom: '16px' }}>
            We do not store credit or debit card numbers on our servers. For Cash on Delivery and Card on Delivery options, payments are collected in person by authorized delivery riders.
          </p>
          <h3 style={{ color: '#fff', fontSize: '1.25rem', marginTop: '24px', marginBottom: '8px' }}>
            3. Third-Party Sharing
          </h3>
          <p>
            Pizza Hub will never sell, rent, or lease customer contact information to third-party marketing companies. Data is only accessible to kitchen staff and dispatch personnel to fulfill customer orders.
          </p>
        </div>
      </div>
    </div>
  );
};
