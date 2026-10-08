import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, Shield, Menu as MenuIcon, X, Phone } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const Header = ({ currentPath, navigate }) => {
  const { cartCount, settings, setIsCartOpen, setIsSearchOpen } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Scroll detection for sticky header shadow and styling
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle Escape key to close mobile drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const handleNavClick = (path) => {
    setMobileMenuOpen(false);
    navigate(path);
  };

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Menu', path: '/menu' },
    { label: 'Offers', path: '/offers' },
    { label: 'About', path: '/about' },
    { label: 'Track Order', path: '/track-order' },
    { label: 'Contact', path: '/contact' }
  ];

  return (
    <>
      {/* 1. TOP ANNOUNCEMENT BAR */}
      <aside className="top-bar">
        <div className="top-bar-content">
          <span className="top-badge">
            {settings.is_24_hours_open ? '🔥 24/7 Hot Delivery' : '🕒 Freshly Baked'}
          </span>
          <span>{settings.announcement_banner}</span>
          <div style={{ display: 'inline-flex', gap: '14px', alignItems: 'center' }}>
            <a
              href={`tel:${(settings.phone_number || '').replace(/\s+/g, '')}`}
              style={{ color: '#fff', textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Phone size={13} /> Call: {settings.phone_number}
            </a>
            <a
              href={`https://wa.me/${settings.whatsapp_number}?text=Hello%20Pizza%20Hub!`}
              target="_blank"
              rel="noreferrer"
              style={{ color: '#25d366', fontWeight: 'bold', textDecoration: 'underline' }}
            >
              WhatsApp
            </a>
          </div>
        </div>
      </aside>

      {/* 2. STICKY HEADER */}
      <header className={`site-header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="container">
          <nav className="navbar">
            {/* Left: Brand Logo */}
            <a
              href="/"
              className="logo"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('/');
              }}
            >
              <div className="logo-icon">🍕</div>
              <div className="logo-text">
                PIZZA<span>HUB</span>
              </div>
            </a>

            {/* Center: Desktop Navigation */}
            <ul className="nav-links">
              {navItems.map((item) => {
                const isActive =
                  currentPath === item.path ||
                  (item.path !== '/' && currentPath.startsWith(item.path));
                return (
                  <li key={item.path}>
                    <a
                      href={item.path}
                      className={`nav-link ${isActive ? 'active' : ''}`}
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavClick(item.path);
                      }}
                    >
                      {item.label}
                    </a>
                  </li>
                );
              })}
            </ul>

            {/* Right: Actions */}
            <div className="header-actions">
              {/* Search Button */}
              <button
                type="button"
                className="action-icon-btn"
                aria-label="Search Pizzas"
                title="Search menu & ingredients"
                onClick={() => setIsSearchOpen(true)}
              >
                <Search size={20} />
              </button>

              {/* Cart Button */}
              <button
                type="button"
                className="action-icon-btn"
                aria-label="View Shopping Cart"
                title="Shopping Cart"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingBag size={20} />
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </button>

              {/* Admin Portal Button */}
              <button
                type="button"
                className="action-icon-btn"
                aria-label="Admin Portal"
                title="Admin Dashboard"
                onClick={() => handleNavClick('/admin')}
              >
                <Shield size={20} />
              </button>

              {/* Prominent Order Now Button */}
              <button
                type="button"
                className="btn btn-primary"
                style={{ padding: '10px 22px', fontSize: '0.9rem' }}
                onClick={() => handleNavClick('/menu')}
              >
                ORDER NOW
              </button>

              {/* Mobile Hamburger Toggle */}
              <button
                type="button"
                className="action-icon-btn"
                style={{ display: 'none' }}
                id="mobile-hamburger-btn"
                aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* 3. MOBILE SLIDE-OUT DRAWER */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            justifyContent: 'flex-end'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setMobileMenuOpen(false);
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '320px',
              height: '100%',
              background: '#121216',
              borderLeft: '1px solid var(--dark-border)',
              padding: '30px 24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              animation: 'slideInRight 0.3s ease'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div className="logo" style={{ fontSize: '1.3rem' }}>
                  <div className="logo-icon" style={{ width: '36px', height: '36px' }}>🍕</div>
                  <div className="logo-text">PIZZA<span>HUB</span></div>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ color: '#fff', padding: '6px' }}
                >
                  <X size={24} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {navItems.map((item) => (
                  <button
                    key={item.path}
                    type="button"
                    style={{
                      textAlign: 'left',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      background: currentPath === item.path ? 'rgba(225, 29, 72, 0.15)' : 'transparent',
                      color: currentPath === item.path ? '#fff' : 'var(--text-muted)',
                      fontWeight: '700',
                      fontSize: '1rem',
                      borderLeft: currentPath === item.path ? '4px solid var(--primary)' : 'none'
                    }}
                    onClick={() => handleNavClick(item.path)}
                  >
                    {item.label}
                  </button>
                ))}

                <button
                  type="button"
                  style={{
                    textAlign: 'left',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    color: 'var(--accent-gold)',
                    fontWeight: '700'
                  }}
                  onClick={() => handleNavClick('/admin')}
                >
                  🔒 Admin Portal
                </button>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--dark-border)', paddingTop: '20px' }}>
              <button
                type="button"
                className="btn btn-primary btn-block"
                style={{ marginBottom: '12px' }}
                onClick={() => handleNavClick('/menu')}
              >
                🍕 ORDER NOW
              </button>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)', textAlign: 'center' }}>
                Helpline: {settings.phone_number}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
