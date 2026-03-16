import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const STATUSES = ['Order Confirmed', 'Pharmacy Packed', 'Picked Up', 'On the Way', 'Delivered'];
const PARTNER = { name: 'Ravi Kumar', phone: '+91-9876543210', rating: 4.8, vehicle: '🛵 Honda Activa' };

function Tracking() {
  const location = useLocation();
  const navigate = useNavigate();
  const orderData = location.state || {};

  const [status, setStatus] = useState(0);
  const [eta, setEta] = useState(28);

  // Simulate delivery progression
  useEffect(() => {
    const t1 = setTimeout(() => setStatus(1), 3000);
    const t2 = setTimeout(() => setStatus(2), 7000);
    const t3 = setTimeout(() => setStatus(3), 12000);
    const etaInterval = setInterval(() => setEta(p => (p > 1 ? p - 1 : p)), 30000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearInterval(etaInterval);
    };
  }, []);

  const mapDots = [
    { x: 15, y: 70, label: 'Pharmacy', color: '#0ea5e9' },
    { x: 35, y: 55, color: '#4b5563' },
    { x: 55, y: 40, color: '#4b5563' },
    { x: 70, y: 50, color: '#4b5563' },
    { x: 85, y: 35, label: 'You', color: '#10b981' },
  ];

  return (
    <div className="premium-container animate-fade-in" style={{ maxWidth: '780px' }}>
      <button
        onClick={() => navigate('/orders')}
        style={{ background: 'none', border: 'none', color: 'var(--secondary)', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', marginBottom: '1.5rem' }}
      >
        ← Back to Orders
      </button>

      <h1 style={{ fontSize: '2.8rem', marginBottom: '0.25rem' }}>🚚 Live Order Tracking</h1>
      <p className="text-muted" style={{ marginBottom: '2rem' }}>
        Order #{orderData?.orderId || 'SM12345678'}
      </p>

      {/* Map Simulation */}
      <div
        className="glass-card"
        style={{ position: 'relative', height: '220px', overflow: 'hidden', padding: 0, marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(14,165,233,0.08))' }}
      >
        {/* Grid lines */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.2 }}>
          {[...Array(9)].map((_, i) => (
            <div key={`v-${i}`} style={{ position: 'absolute', left: `${(i + 1) * 10}%`, top: 0, bottom: 0, borderLeft: '1px dashed #666' }} />
          ))}
          {[...Array(5)].map((_, i) => (
            <div key={`h-${i}`} style={{ position: 'absolute', top: `${(i + 1) * 18}%`, left: 0, right: 0, borderTop: '1px dashed #666' }} />
          ))}
        </div>

        {/* Route line */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 100 100" preserveAspectRatio="none">
          <polyline
            points="15,70 35,55 55,40 70,50 85,35"
            fill="none"
            stroke="var(--secondary)"
            strokeWidth="0.8"
            strokeDasharray="3,2"
            opacity="0.7"
          />
        </svg>

        {/* Map dots */}
        {mapDots.map((dot, i) => (
          <div
            key={i}
            style={{ position: 'absolute', left: `${dot.x}%`, top: `${dot.y}%`, transform: 'translate(-50%, -50%)' }}
          >
            <div
              style={{
                width: i === 3 && status === 3 ? 30 : 18,
                height: i === 3 && status === 3 ? 30 : 18,
                borderRadius: '50%',
                background: dot.color,
                border: '3px solid rgba(255,255,255,0.3)',
                boxShadow: `0 2px 8px ${dot.color}80`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: i === 3 && status >= 3 ? '0.9rem' : '0.6rem',
                transition: 'all 0.5s',
              }}
            >
              {i === 0 ? '🏪' : i === 4 ? '🏠' : i === 3 && status >= 3 ? '🛵' : ''}
            </div>
            {dot.label && (
              <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#fff', marginTop: '3px', whiteSpace: 'nowrap', textAlign: 'center' }}>
                {dot.label}
              </div>
            )}
          </div>
        ))}

        {/* LIVE badge */}
        <div
          style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: 'rgba(0,0,0,0.5)', borderRadius: '8px', padding: '0.3rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', animation: 'pulse 1.5s infinite' }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>LIVE</span>
        </div>
        <style>{`@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.4)} }`}</style>
      </div>

      {/* ETA Banner */}
      <div
        style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', borderRadius: '16px', padding: '1.25rem 1.5rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <div>
          <div style={{ fontSize: '0.85rem', opacity: 0.85, color: '#fff' }}>Estimated Arrival</div>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#fff' }}>{eta} mins</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.85rem', opacity: 0.85, color: '#fff' }}>Current Status</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>{STATUSES[status]}</div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        {STATUSES.map((s, i) => (
          <div key={s} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: i < STATUSES.length - 1 ? '1rem' : 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div
                style={{ width: 28, height: 28, borderRadius: '50%', background: i <= status ? '#10b981' : 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: i <= status ? '#fff' : 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, transition: 'all 0.5s' }}
              >
                {i < status ? '✓' : i + 1}
              </div>
              {i < STATUSES.length - 1 && (
                <div style={{ width: 2, height: 20, background: i < status ? '#10b981' : 'rgba(255,255,255,0.1)', transition: 'all 0.5s' }} />
              )}
            </div>
            <div style={{ paddingTop: '4px' }}>
              <div style={{ fontSize: '0.95rem', fontWeight: i === status ? 800 : 500, color: i <= status ? '#fff' : 'var(--text-muted)' }}>
                {s}
              </div>
              {i === status && (
                <div style={{ fontSize: '0.8rem', color: 'var(--secondary)', marginTop: '2px' }}>● In progress...</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Delivery Partner */}
      {status >= 2 && (
        <div className="glass-card animate-fade-in" style={{ padding: '1.5rem' }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '1rem' }}>Delivery Partner</div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🧑‍💼</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: '1rem' }}>{PARTNER.name}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{PARTNER.vehicle}</div>
              <div style={{ color: '#facc15', fontSize: '0.85rem' }}>★ {PARTNER.rating}</div>
            </div>
            <a href={`tel:${PARTNER.phone}`} style={{ textDecoration: 'none' }}>
              <button className="btn-premium" style={{ padding: '0.5rem 1.2rem', fontSize: '0.9rem' }}>
                📞 Call
              </button>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tracking;
