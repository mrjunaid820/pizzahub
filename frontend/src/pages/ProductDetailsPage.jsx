import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, ShoppingBag, ShieldCheck, Flame, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const ProductDetailsPage = ({ slug, navigate }) => {
  const { settings, addToCart, setIsCartOpen } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/products/by-slug/${slug}/`)
      .then((res) => {
        if (!res.ok) throw new Error('Product not found');
        return res.json();
      })
      .then((data) => {
        setProduct(data);
        if (data.prices && data.prices.length > 0) {
          const defaultPrice = data.prices.find((p) => p.size_name === 'Medium') || data.prices[0];
          setSelectedSize(defaultPrice);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '120px 20px', color: 'var(--text-muted)' }}>
        <Loader2 size={40} className="animate-spin" style={{ margin: '0 auto 16px', color: 'var(--primary)' }} />
        <p>Preparing product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '100px 20px' }}>
        <h2 style={{ color: '#fff', marginBottom: '12px' }}>Product Not Found</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>The pizza or item you are looking for is unavailable.</p>
        <button type="button" className="btn btn-primary" onClick={() => navigate('/menu')}>
          ← Back to Menu
        </button>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!selectedSize) return;
    addToCart(product, selectedSize.size_name, selectedSize.price, quantity);
    setIsCartOpen(true);
  };

  const handleBuyNow = () => {
    if (!selectedSize) return;
    addToCart(product, selectedSize.size_name, selectedSize.price, quantity);
    navigate('/checkout');
  };

  return (
    <div style={{ padding: '60px 0 100px' }}>
      <div className="container">
        {/* Back Link */}
        <button
          type="button"
          onClick={() => navigate('/menu')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginBottom: '30px', fontWeight: '600' }}
        >
          <ArrowLeft size={18} /> Back to Full Menu
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '50px', alignItems: 'center' }}>
          {/* Left: Large Product Image */}
          <div style={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', background: '#1c1c24', border: '1px solid var(--dark-border)', boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}>
            <img
              src={product.image_url}
              alt={product.name}
              style={{ width: '100%', maxHeight: '480px', objectFit: 'cover' }}
            />
            {product.badge && (
              <span className="card-badge" style={{ top: '20px', left: '20px', fontSize: '0.85rem', padding: '6px 16px' }}>
                {product.badge}
              </span>
            )}
          </div>

          {/* Right: Info & Size Price Customizer */}
          <div>
            <span style={{ color: 'var(--accent-gold)', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {product.category_name}
            </span>
            <h1 style={{ fontSize: '2.8rem', fontWeight: '800', color: '#fff', margin: '6px 0 14px' }}>
              {product.name}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', color: 'var(--accent-gold)' }}>
                {'★'.repeat(5)}
              </div>
              <span style={{ color: '#fff', fontWeight: '700', fontSize: '0.9rem' }}>4.9/5 Rating</span>
              <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>• Hand-Tossed</span>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: '1.7', marginBottom: '24px' }}>
              {product.description}
            </p>

            {/* Ingredients & Allergens Box */}
            <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', borderRadius: '12px', padding: '16px 20px', marginBottom: '28px' }}>
              <div style={{ marginBottom: '8px' }}>
                <strong style={{ color: '#fff', fontSize: '0.88rem' }}>Fresh Ingredients:</strong>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '2px' }}>
                  {product.ingredients}
                </p>
              </div>
              {product.allergens && (
                <div>
                  <strong style={{ color: '#f87171', fontSize: '0.85rem' }}>Allergen Advice:</strong>
                  <span style={{ color: 'var(--text-dim)', fontSize: '0.82rem', marginLeft: '6px' }}>
                    Contains {product.allergens}
                  </span>
                </div>
              )}
            </div>

            {/* Size Selector */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px' }}>
                Select Available Size:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '10px' }}>
                {(product.prices || []).map((p) => (
                  <button
                    key={p.size_name}
                    type="button"
                    style={{
                      padding: '12px',
                      borderRadius: '10px',
                      background: selectedSize?.size_name === p.size_name ? 'rgba(225, 29, 72, 0.18)' : 'rgba(255,255,255,0.04)',
                      border: selectedSize?.size_name === p.size_name ? '2px solid var(--primary)' : '1px solid var(--dark-border)',
                      color: selectedSize?.size_name === p.size_name ? '#fff' : 'var(--text-muted)',
                      fontWeight: '700',
                      textAlign: 'center'
                    }}
                    onClick={() => setSelectedSize(p)}
                  >
                    <div style={{ fontSize: '0.95rem' }}>{p.size_name}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--accent-gold)', marginTop: '2px' }}>
                      {settings.currency} {Number(p.price).toLocaleString()}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Price & Quantity & Actions */}
            <div style={{ borderTop: '1px solid var(--dark-border)', paddingTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                  Total Price ({selectedSize?.size_name})
                </span>
                <div style={{ fontSize: '2.2rem', fontWeight: '800', color: '#fff' }}>
                  {settings.currency} {selectedSize ? (selectedSize.price * quantity).toLocaleString() : '0'}
                </div>
              </div>

              <div className="qty-control" style={{ transform: 'scale(1.1)' }}>
                <button type="button" className="qty-btn" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                  −
                </button>
                <span className="qty-input">{quantity}</span>
                <button type="button" className="qty-btn" onClick={() => setQuantity(quantity + 1)}>
                  +
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '24px' }}>
              <button type="button" className="btn btn-secondary" onClick={handleAddToCart}>
                🛒 Add to Cart
              </button>
              <button type="button" className="btn btn-primary" onClick={handleBuyNow}>
                ⚡ Buy Now & Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
