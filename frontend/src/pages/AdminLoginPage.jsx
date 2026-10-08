import React, { useState } from 'react';
import { ShieldCheck, Lock, User, ArrowRight, Loader2 } from 'lucide-react';

export const AdminLoginPage = ({ navigate, onLoginSuccess }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const cleanUser = username.trim();
    const cleanPass = password.trim();

    fetch('/api/admin/auth/login/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: cleanUser, password: cleanPass })
    })
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        if (data.success && data.user) {
          sessionStorage.setItem('pizzahub_admin_user', JSON.stringify(data.user));
          if (onLoginSuccess) onLoginSuccess(data.user);
          navigate('/admin');
        } else {
          setErrorMsg(data.message || data.detail || 'Invalid admin credentials.');
        }
      })
      .catch(() => {
        setLoading(false);
        setErrorMsg('Network error connecting to backend API.');
      });
  };

  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          background: 'var(--dark-card)',
          border: '1px solid var(--dark-border)',
          borderRadius: '24px',
          padding: '40px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.7)',
          textAlign: 'center'
        }}
      >
        <div style={{ width: '64px', height: '64px', background: 'rgba(225,29,72,0.15)', border: '2px solid var(--primary)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--primary)' }}>
          <ShieldCheck size={32} />
        </div>

        <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fff', marginBottom: '6px' }}>
          Admin Portal Login
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '24px' }}>
          Access the kitchen queue, live order statuses, menu prices, and store settings.
        </p>

        {errorMsg && (
          <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', color: '#f87171', padding: '12px', borderRadius: '10px', marginBottom: '20px', fontSize: '0.88rem' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ textAlign: 'left' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Username
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                required
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ width: '100%', padding: '12px 14px 12px 40px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--dark-border)', borderRadius: '10px', color: '#fff' }}
              />
              <User size={18} color="var(--text-dim)" style={{ position: 'absolute', left: '14px', top: '14px' }} />
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', padding: '12px 14px 12px 40px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--dark-border)', borderRadius: '10px', color: '#fff' }}
              />
              <Lock size={18} color="var(--text-dim)" style={{ position: 'absolute', left: '14px', top: '14px' }} />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            style={{ padding: '14px' }}
            disabled={loading}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <>Unlock Dashboard <ArrowRight size={18} /></>}
          </button>
        </form>

        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--dark-border)', fontSize: '0.85rem', color: 'var(--text-dim)', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
          <div>
            Default Credentials: <strong style={{ color: '#fff' }}>admin</strong> / <strong style={{ color: '#fff' }}>admin123</strong>
          </div>
          <button
            type="button"
            onClick={() => {
              setUsername('admin');
              setPassword('admin123');
              setErrorMsg('');
            }}
            style={{ color: 'var(--accent-gold)', fontSize: '0.82rem', textDecoration: 'underline' }}
          >
            ⚡ Click to auto-fill credentials
          </button>
        </div>
      </div>
    </div>
  );
};
