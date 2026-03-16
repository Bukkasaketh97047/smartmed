import React, { useState, useEffect } from 'react';
import { getProducts } from '../services/api';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { normalize } from '../utils/medicineUtils';

const FREQ_OPTIONS = ['weekly', 'monthly', 'quarterly'];

function Subscriptions() {
  const [subs, setSubs] = useState([
    // Example pre-populated subscriptions (in a real app, these come from backend)
    {
      id: 'demo-1',
      medName: 'Metformin 500mg',
      freq: 'monthly',
      nextDate: 'Apr 12, 2026',
      active: true,
      qty: 2,
      price: 55,
    },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [allProducts, setAllProducts] = useState([]);
  const [selectedMed, setSelectedMed] = useState(null);
  const [freq, setFreq] = useState('monthly');
  const [qty, setQty] = useState(1);
  const showToast = useToast();
  const { addToCart } = useCart();

  useEffect(() => {
    getProducts().then(res => setAllProducts(res.data || []));
  }, []);

  const searchResults =
    search.length > 1
      ? allProducts.filter(m => normalize(m.name).includes(normalize(search))).slice(0, 5)
      : [];

  const addSubscription = () => {
    if (!selectedMed) return;
    setSubs(prev => [
      ...prev,
      {
        id: `sub-${Date.now()}`,
        medName: selectedMed.name,
        freq,
        nextDate: 'Apr 12, 2026',
        active: true,
        qty,
        price: selectedMed.price,
      },
    ]);
    showToast(`✅ Subscription added for ${selectedMed.name}!`);
    setShowModal(false);
    setSearch('');
    setSelectedMed(null);
    setQty(1);
    setFreq('monthly');
  };

  const toggleSub = id => setSubs(prev => prev.map(s => (s.id === id ? { ...s, active: !s.active } : s)));
  const removeSub = id => setSubs(prev => prev.filter(s => s.id !== id));

  return (
    <div className="premium-container animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2.8rem', marginBottom: '0.5rem' }}>🔄 Medicine Subscriptions</h1>
          <p className="text-muted" style={{ fontSize: '1rem' }}>
            Auto-deliver chronic medicines — never run out again.
          </p>
        </div>
        <button className="btn-premium" onClick={() => setShowModal(true)}>
          + New Subscription
        </button>
      </div>

      {/* Benefits */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '2.5rem' }}>
        {[
          ['💰', 'Save 10%', 'Extra discount on subscriptions'],
          ['🚚', 'Auto Delivery', 'Delivered on your schedule'],
          ['🔔', 'Reminders', 'Get notified before every delivery'],
        ].map(([icon, title, desc]) => (
          <div
            key={title}
            className="glass-card"
            style={{ padding: '1.5rem', textAlign: 'center' }}
          >
            <div style={{ fontSize: '2.2rem', marginBottom: '0.6rem' }}>{icon}</div>
            <div style={{ fontWeight: 700 }}>{title}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{desc}</div>
          </div>
        ))}
      </div>

      {/* Subscriptions List */}
      {subs.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem', opacity: 0.5 }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔄</div>
          <h3>No active subscriptions</h3>
          <p className="text-muted">Add one to get started</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {subs.map(sub => (
            <div
              key={sub.id}
              className="glass-card"
              style={{
                padding: '1.5rem',
                border: `2px solid ${sub.active ? 'rgba(99,102,241,0.3)' : 'var(--glass-border)'}`,
              }}
            >
              <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                <div style={{ fontSize: '2.5rem' }}>💊</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{sub.medName}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Qty: {sub.qty} × ₹{sub.price} · {sub.freq}
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        padding: '3px 10px',
                        borderRadius: '999px',
                        background: sub.active ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.07)',
                        color: sub.active ? '#10b981' : 'var(--text-muted)',
                        border: `1px solid ${sub.active ? '#10b98140' : 'var(--glass-border)'}`,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                      }}
                    >
                      {sub.active ? '● Active' : '⏸ Paused'}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>📅 Next: {sub.nextDate}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: '1.2rem' }}>₹{sub.price * sub.qty}</div>
                  <div style={{ fontSize: '0.75rem', color: '#10b981' }}>10% sub discount</div>
                  <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.75rem', justifyContent: 'flex-end' }}>
                    <button
                      className="nav-link"
                      style={{ fontSize: '0.8rem', padding: '0.4rem 0.9rem', border: '1px solid var(--glass-border)', borderRadius: '8px' }}
                      onClick={() => toggleSub(sub.id)}
                    >
                      {sub.active ? 'Pause' : 'Resume'}
                    </button>
                    <button
                      style={{ fontSize: '0.8rem', padding: '0.4rem 0.9rem', background: 'none', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: '#ef4444', cursor: 'pointer' }}
                      onClick={() => removeSub(sub.id)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Subscription Modal */}
      {showModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          onClick={e => e.target === e.currentTarget && setShowModal(false)}
        >
          <div
            className="glass-card"
            style={{ width: '100%', maxWidth: '480px', padding: '2rem', position: 'relative' }}
          >
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Add New Subscription</h3>

            {/* Medicine Search */}
            <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                Search Medicine
              </label>
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); setSelectedMed(null); }}
                placeholder="Type medicine name..."
              />
              {searchResults.length > 0 && !selectedMed && (
                <div style={{ position: 'absolute', left: 0, right: 0, background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', borderRadius: '12px', zIndex: 100, overflow: 'hidden', marginTop: '4px' }}>
                  {searchResults.map(m => (
                    <div
                      key={m.id}
                      onClick={() => { setSelectedMed(m); setSearch(m.name); }}
                      style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '0.75rem 1rem', cursor: 'pointer', borderBottom: '1px solid var(--glass-border)' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{m.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>₹{m.price}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Frequency */}
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              Delivery Frequency
            </label>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
              {FREQ_OPTIONS.map(f => (
                <button
                  key={f}
                  onClick={() => setFreq(f)}
                  style={{ flex: 1, padding: '0.7rem', border: `2px solid ${freq === f ? 'var(--primary)' : 'var(--glass-border)'}`, borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', background: freq === f ? 'rgba(99,102,241,0.15)' : 'transparent', color: freq === f ? 'var(--primary)' : 'var(--text-muted)' }}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            {/* Quantity */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Quantity per delivery:</label>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--glass-border)', borderRadius: '8px' }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ padding: '0.4rem 0.8rem', background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.1rem' }}>−</button>
                <span style={{ padding: '0 0.8rem', fontWeight: 700 }}>{qty}</span>
                <button onClick={() => setQty(q => q + 1)} style={{ padding: '0.4rem 0.8rem', background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.1rem' }}>+</button>
              </div>
            </div>

            <button className="btn-premium" style={{ width: '100%' }} disabled={!selectedMed} onClick={addSubscription}>
              Subscribe Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Subscriptions;
