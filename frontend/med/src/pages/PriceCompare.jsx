import React, { useState } from 'react';
import { getProducts } from '../services/api';
import { useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { normalize, tokenize, alphaTokens } from '../utils/medicineUtils';

function PriceCompare() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const { addToCart } = useCart();
  const showToast = useToast();

  useEffect(() => {
    getProducts().then(res => setAllProducts(res.data || []));
  }, []);

  const searchResults =
    search.length > 2
      ? allProducts
          .filter(m => {
            const n = normalize(search);
            return normalize(m.name).includes(n) || normalize(m.brand || '').includes(n);
          })
          .slice(0, 6)
      : [];

  // Find variants: products whose first alpha-token matches the selected product
  const getVariants = (med) => {
    const selAlpha = alphaTokens(tokenize(med.name));
    if (!selAlpha.length) return [];
    return allProducts
      .filter(m => {
        if (m.id === med.id) return false;
        const mAlpha = alphaTokens(tokenize(m.name));
        return mAlpha.length > 0 && mAlpha[0] === selAlpha[0];
      })
      .slice(0, 5);
  };

  const variants = selected ? [selected, ...getVariants(selected)] : [];
  const cheapest =
    variants.length > 0 ? variants.reduce((a, b) => (a.price < b.price ? a : b)) : null;
  const mostExpensive =
    variants.length > 0 ? variants.reduce((a, b) => (a.price > b.price ? a : b)) : null;

  return (
    <div className="premium-container animate-fade-in">
      <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>⚖️ Price Comparison</h1>
        <p className="text-muted" style={{ fontSize: '1.1rem' }}>
          Compare prices across brands for the same medicine — find the best deal instantly.
        </p>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', maxWidth: '700px', margin: '0 auto 2.5rem' }}>
        <div
          style={{
            display: 'flex',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid var(--glass-border)',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          }}
        >
          <span style={{ padding: '0 1rem', display: 'flex', alignItems: 'center', fontSize: '1.2rem' }}>🔍</span>
          <input
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setSelected(null);
            }}
            placeholder="Search medicine to compare (e.g. Paracetamol, Metformin)..."
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '1rem',
              padding: '1rem 0',
              background: 'transparent',
              color: 'white',
            }}
          />
        </div>

        {searchResults.length > 0 && !selected && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: 'var(--bg-surface)',
              border: '1px solid var(--glass-border)',
              borderRadius: '16px',
              marginTop: '6px',
              zIndex: 100,
              overflow: 'hidden',
              boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
            }}
          >
            {searchResults.map(m => (
              <div
                key={m.id}
                onClick={() => {
                  setSelected(m);
                  setSearch(m.name);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.75rem 1.25rem',
                  cursor: 'pointer',
                  borderBottom: '1px solid var(--glass-border)',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{m.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {m.brand} · ₹{m.price}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Results */}
      {variants.length > 0 && (
        <div>
          {cheapest && mostExpensive && cheapest.id !== mostExpensive.id && (
            <div
              style={{
                background: 'rgba(16,185,129,0.07)',
                border: '1.5px solid rgba(16,185,129,0.3)',
                borderRadius: '16px',
                padding: '1rem 1.5rem',
                marginBottom: '1.5rem',
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>💰</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1rem' }}>
                  Best Price: {cheapest.name} by {cheapest.brand || 'Unknown'}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#10b981' }}>
                  Save up to ₹{(mostExpensive.price - cheapest.price).toFixed(0)} vs most expensive option
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[...variants]
              .sort((a, b) => a.price - b.price)
              .map((m, i) => (
                <div
                  key={m.id}
                  className="glass-card"
                  style={{
                    display: 'flex',
                    gap: '1.25rem',
                    alignItems: 'center',
                    padding: '1.25rem 1.5rem',
                    border: `2px solid ${i === 0 ? 'rgba(16,185,129,0.4)' : 'var(--glass-border)'}`,
                    position: 'relative',
                  }}
                >
                  {i === 0 && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '-12px',
                        left: '1.25rem',
                        background: '#10b981',
                        color: '#fff',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        padding: '3px 12px',
                        borderRadius: '999px',
                      }}
                    >
                      BEST PRICE
                    </div>
                  )}
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '14px',
                      background: 'rgba(255,255,255,0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2rem',
                      flexShrink: 0,
                    }}
                  >
                    💊
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>{m.name}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {m.brand} · {m.manufacturer || m.category}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>₹{m.price}</div>
                    {m.mrp && m.mrp > m.price && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                        ₹{m.mrp}
                      </div>
                    )}
                    <button
                      className="btn-premium"
                      style={{ marginTop: '0.5rem', padding: '0.4rem 1rem', fontSize: '0.85rem' }}
                      onClick={() => {
                        addToCart(m);
                        showToast(`✅ ${m.name} added to cart!`);
                      }}
                    >
                      + Add to Cart
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {!selected && search.length < 2 && (
        <div style={{ textAlign: 'center', padding: '4rem 0', opacity: 0.4 }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚖️</div>
          <h3>Search any medicine above to compare brands side by side</h3>
        </div>
      )}
    </div>
  );
}

export default PriceCompare;
