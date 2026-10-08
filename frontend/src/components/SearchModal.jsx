import React, { useState, useEffect } from 'react';
import { Search, X, Loader2, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const SearchModal = ({ navigate }) => {
  const { isSearchOpen, setIsSearchOpen, settings } = useCart();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isSearchOpen) {
      setQuery('');
      setResults([]);
      return;
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsSearchOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      setLoading(true);
      fetch(`/api/products/?search=${encodeURIComponent(query.trim())}`)
        .then((res) => res.json())
        .then((data) => {
          setResults(Array.isArray(data) ? data : data.results || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isSearchOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1100,
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '60px 20px'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsSearchOpen(false);
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '650px',
          background: '#14141a',
          border: '1px solid var(--dark-border)',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 25px 60px rgba(0,0,0,0.8)'
        }}
      >
        {/* Search Input Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '16px 20px',
            borderBottom: '1px solid var(--dark-border)',
            gap: '12px'
          }}
        >
          <Search size={22} color="var(--primary)" />
          <input
            type="text"
            placeholder="Search pizza name, ingredients (e.g. Pepperoni, Tikka, Cheese)..."
            value={query}
            autoFocus
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flexGrow: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#fff',
              fontSize: '1.05rem',
              fontFamily: 'inherit'
            }}
          />
          {loading && <Loader2 size={20} className="animate-spin" color="var(--accent-gold)" />}
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              style={{ color: 'var(--text-dim)', padding: '4px' }}
            >
              <X size={18} />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsSearchOpen(false)}
            style={{
              background: 'rgba(255,255,255,0.06)',
              color: '#fff',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '0.8rem',
              fontWeight: '600'
            }}
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div style={{ maxHeight: '420px', overflowY: 'auto', padding: '16px' }}>
          {query.trim() === '' ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-dim)' }}>
              <p>Type to search through our fresh pizza menu & ingredients.</p>
            </div>
          ) : loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              <p>Searching menu...</p>
            </div>
          ) : results.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '1.1rem', marginBottom: '6px' }}>No pizzas found for "{query}"</p>
              <span style="font-size: 0.85rem; color: var(--text-dim);">Try searching for "Pepperoni", "Tikka", "Cheese", or "Burger"</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {results.map((prod) => (
                <div
                  key={prod.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--dark-border)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => {
                    setIsSearchOpen(false);
                    navigate(`/menu/${prod.slug}`);
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <img
                      src={prod.image_url}
                      alt={prod.name}
                      style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }}
                    />
                    <div>
                      <h4 style={{ color: '#fff', fontSize: '0.98rem', fontWeight: '700' }}>{prod.name}</h4>
                      <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                        {prod.ingredients.slice(0, 60)}...
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: 'var(--accent-gold)', fontWeight: '800', fontSize: '0.95rem' }}>
                      {settings.currency} {prod.starting_price}
                    </span>
                    <ArrowRight size={16} color="var(--text-muted)" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
