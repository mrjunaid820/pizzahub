import React, { useState, useEffect } from 'react';
import { CartProvider } from './context/CartContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { SearchModal } from './components/SearchModal';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';

import { HomePage } from './pages/HomePage';
import { MenuPage } from './pages/MenuPage';
import { ProductDetailsPage } from './pages/ProductDetailsPage';
import { OffersPage } from './pages/OffersPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { TrackOrderPage } from './pages/TrackOrderPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsPage } from './pages/TermsPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

export default function App() {
  const [currentPath, setCurrentPath] = useState(
    window.location.pathname || '/'
  );

  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path.split('?')[0]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Determine current page and render
  const renderPage = () => {
    // 1. Menu Product Details: /menu/:slug
    const menuSlugMatch = currentPath.match(/^\/menu\/([a-zA-Z0-9_-]+)$/);
    if (menuSlugMatch) {
      const slug = menuSlugMatch[1];
      return <ProductDetailsPage slug={slug} navigate={navigate} />;
    }

    // 2. Order Confirmation: /order-confirmation/:id
    const orderConfirmMatch = currentPath.match(/^\/order-confirmation\/([a-zA-Z0-9_-]+)$/);
    if (orderConfirmMatch) {
      const orderId = orderConfirmMatch[1];
      return <OrderConfirmationPage orderId={orderId} navigate={navigate} />;
    }
    if (currentPath === '/order-confirmation') {
      const qId = new URLSearchParams(window.location.search).get('orderId') || '';
      return <OrderConfirmationPage orderId={qId} navigate={navigate} />;
    }

    // 3. Admin routes
    if (currentPath === '/admin/login') {
      return (
        <AdminLoginPage
          navigate={navigate}
          onLoginSuccess={() => navigate('/admin')}
        />
      );
    }

    if (currentPath === '/admin') {
      const adminUser = sessionStorage.getItem('pizzahub_admin_user');
      if (!adminUser) {
        return (
          <AdminLoginPage
            navigate={navigate}
            onLoginSuccess={() => navigate('/admin')}
          />
        );
      }
      return (
        <AdminDashboardPage
          navigate={navigate}
          onLogout={() => {
            sessionStorage.removeItem('pizzahub_admin_user');
            navigate('/admin/login');
          }}
        />
      );
    }

    // 4. Standard public pages
    switch (currentPath) {
      case '/':
      case '/home':
        return <HomePage navigate={navigate} />;
      case '/menu':
        return <MenuPage navigate={navigate} />;
      case '/offers':
        return <OffersPage navigate={navigate} />;
      case '/cart':
        return <CartPage navigate={navigate} />;
      case '/checkout':
        return <CheckoutPage navigate={navigate} />;
      case '/track-order': {
        const qId = new URLSearchParams(window.location.search).get('orderId') || '';
        return <TrackOrderPage initialOrderId={qId} navigate={navigate} />;
      }
      case '/about':
        return <AboutPage navigate={navigate} />;
      case '/contact':
        return <ContactPage navigate={navigate} />;
      case '/privacy-policy':
        return <PrivacyPolicyPage navigate={navigate} />;
      case '/terms':
        return <TermsPage navigate={navigate} />;
      default:
        return <HomePage navigate={navigate} />;
    }
  };

  // For active admin dashboard view, isolate layout so it doesn't collide with consumer navigation
  const isAdminDashboard =
    currentPath === '/admin' && !!sessionStorage.getItem('pizzahub_admin_user');

  return (
    <CartProvider>
      <div className="app-root">
        {!isAdminDashboard && (
          <Header currentPath={currentPath} navigate={navigate} />
        )}

        <main className="main-content">{renderPage()}</main>

        {!isAdminDashboard && <Footer navigate={navigate} />}

        {/* Global Drawers, Modals & Floating WhatsApp */}
        {!isAdminDashboard && (
          <>
            <CartDrawer navigate={navigate} />
            <SearchModal navigate={navigate} />
            <FloatingWhatsApp />
          </>
        )}
      </div>
    </CartProvider>
  );
}
