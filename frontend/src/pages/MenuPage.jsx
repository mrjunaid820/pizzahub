import React, { useState, useEffect } from 'react';
import { Search, Loader2, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const MenuPage = ({ navigate }) => {
  const { settings, addToCart, setIsCartOpen } = useCart();
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Selected sizes and quantities per card
  const [cardSizes, setCardSizes] = useState({});
  const [cardQtys, setCardQtys] = useState({});

  useEffect(() => {
    // 1. Fetch categories
    fetch('/api/categories/')
      .then((res) => res.json())
      .then((data) => {
        const cats = Array.isArray(data) ? data : data.results || [];
        setCategories(cats);
      })
      .catch((err) => console.warn(err));

    // 2. Fetch products
    loadProducts('All', '');
  }, []);

  const loadProducts = (cat, searchStr) => {
    setLoading(true);
    let url = '/api/products/?';
    if (cat && cat !== 'All') url += `category=${encodeURIComponent(cat)}&`;
    if (searchStr) url += `search=${encodeURIComponent(searchStr)}&`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        const items = Array.isArray(data) ? data : data.results || [];
        setProducts(items);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const handleCategoryChange = (catName) => {
    setActiveCategory(catName);
    loadProducts(catName, search);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadProducts(activeCategory, search);
  };

  const handleSelectSize = (productId, sizeName, price) => {
    setCardSizes((prev) => ({ ...prev, [productId]: { sizeName, price } }));
  };

  const handleAdjustQty = (productId, delta) => {
    setCardQtys((prev) => {
      const current = prev[productId] || 1;
      return { ...prev, [productId]: Math.max(1, current + delta) };
    });
  };

  const handleAddToCart = (product) => {
    const defaultPrice = product.prices && product.prices.length > 0 ? product.prices[0] : { size_name: 'Medium', price: product.starting_price };
    const selected = cardSizes[product.id] || { sizeName: defaultPrice.size_name, price: defaultPrice.price };
    const qty = cardQtys[product.id] || 1;

    addToCart(product, selected.sizeName, selected.price, qty);
    setIsCartOpen(true);
  };

  return (
    <div style={{ padding: '60px 0' }}>
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 30px' }}>
          <span style={{ display: 'inline-block', background: 'rgba(225, 29, 72, 0.12)', color: '#f43f5e', border: '1px solid rgba(225, 29, 72, 0.25)', padding: '4px 16px', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '10px' }}>
            Handcrafted With Passion
          </span>
          <h1 style={{ fontSize: '2.8rem', fontWeight: '800', color: '#fff', marginBottom: '10px' }}>
            Our Complete Menu
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Choose your desired size: Small, Medium, Large, or Extra Large. Prices update automatically in real-time.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} style={{ maxWidth: '500px', margin: '0 auto 35px', display: 'flex', gap: '10px' }}>
          <div style={{ flexGrow: 1, position: 'relative' }}>
            <input
              type="text"
              placeholder="Search pizza name or ingredients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 18px 12px 42px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--dark-border)',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '0.95rem'
              }}
            />
            <Search size={18} color="var(--text-dim)" style={{ position: 'absolute', left: '16px', top: '15px' }} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '12px 20px' }}>
            Search
          </button>
        </form>

        {/* Category Filter Pills */}
        <div className="category-tabs">
          <button
            type="button"
            className={`category-pill ${activeCategory === 'All' ? 'active' : ''}`}
            onClick={() => handleCategoryChange('All')}
          >
            All Items
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`category-pill ${activeCategory === cat.name ? 'active' : ''}`}
              onClick={() => handleCategoryChange(cat.name)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
            <Loader2 size={36} className="animate-spin" style={{ margin: '0 auto 16px', color: 'var(--primary)' }} />
            <p>Loading fresh artisan pizzas...</p>
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🍕</div>
            <h3 style={{ color: '#fff', marginBottom: '8px' }}>No items found</h3>
            <p>Try selecting another category or searching for another flavor.</p>
          </div>
        ) : (
          <div className="menu-grid">
            {products.map((prod) => {
              const prices = prod.prices || [];
              const defaultPriceObj = prices.find((p) => p.size_name === 'Medium') || prices[0] || { size_name: 'Medium', price: prod.starting_price };
              const selected = cardSizes[prod.id] || { sizeName: defaultPriceObj.size_name, price: defaultPriceObj.price };
              const qty = cardQtys[prod.id] || 1;

              return (
                <div key={prod.id} className="pizza-card">
                  <div
                    className="pizza-card-image"
                    onClick={() => navigate(`/menu/${prod.slug}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <img src={prod.image_url} alt={prod.name} loading="lazy" />
                    {prod.badge && <span className="card-badge">{prod.badge}</span>}
                  </div>
                  <div className="pizza-card-body">
                    <h3
                      className="pizza-name"
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/menu/${prod.slug}`)}
                    >
                      {prod.name}
                    </h3>
                    <p className="pizza-desc">{prod.description}</p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                      {prod.ingredients.split(',').slice(0, 3).map((ing, i) => (
                        <span key={i} className="ingredient-tag">{ing.trim()}</span>
                      ))}
                    </div>

                    {/* Size Selector Group */}
                    <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '8px' }}>
                      Select Size
                    </div>
                    <div className="size-selector-group">
                      {prices.map((p) => (
                        <button
                          key={p.size_name}
                          type="button"
                          className={`size-btn ${selected.sizeName === p.size_name ? 'active' : ''}`}
                          onClick={() => handleSelectSize(prod.id, p.size_name, p.price)}
                        >
                          {p.size_name}
                        </button>
                      ))}
                    </div>

                    <div style={{ marginTop: 'auto', borderTop: '1px solid var(--dark-border)', paddingTop: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                        <div>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                            Price ({selected.sizeName})
                          </span>
                          <div style={{ fontSize: '1.45rem', fontWeight: '800', color: '#fff' }}>
                            {settings.currency} {Number(selected.price).toLocaleString()}
                          </div>
                        </div>

                        <div className="qty-control">
                          <button type="button" className="qty-btn" onClick={() => handleAdjustQty(prod.id, -1)}>
                            −
                          </button>
                          <span className="qty-input">{qty}</span>
                          <button type="button" className="qty-btn" onClick={() => handleAdjustQty(prod.id, 1)}>
                            +
                          </button>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleAddToCart(prod)}
                        >
                          🛒 Add to Cart
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => {
                            handleAddToCart(prod);
                            navigate('/checkout');
                          }}
                        >
                          ⚡ Buy Now
                        </button>
                      </div>

                      <button
                        type="button"
                        style={{ width: '100%', padding: '6px', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', background: 'transparent' }}
                        onClick={() => navigate(`/menu/${prod.slug}`)}
                      >
                        View Details & Allergens →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
