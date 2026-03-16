import React from 'react';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const COINS_BENEFITS = [

  { coins: 500, benefit: '₹25 off next order' },
  { coins: 1000, benefit: '₹60 off next order' },
  { coins: 2000, benefit: 'Free Express Delivery' },
  { coins: 5000, benefit: '₹350 off next order' },
];

const QUICK_AMOUNTS = [100, 200, 500, 1000];

function Wallet() {
  const { wallet, addMoney: contextAddMoney, redeemCoins: contextRedeemCoins } = useAuth();
  const [addAmount, setAddAmount] = React.useState('');
  const [activeTab, setActiveTab] = React.useState('overview');
  const showToast = useToast();

  const handleAddMoney = amount => {
    const a = Number(amount);
    if (!a || a < 1) return;
    contextAddMoney(a);
    showToast(`✅ ₹${a} added to wallet!`);
    setAddAmount('');
  };

  const handleRedeemCoins = (coins, benefit) => {
    contextRedeemCoins(coins, benefit);
    showToast(`🎉 Redeemed! ${benefit}`);
  };

  const TABS = [
    ['overview', '💰 Overview'],
    ['addmoney', '+ Add Money'],
    ['coins', '⭐ Coins'],
    ['history', '📋 History'],
  ];

  return (
    <div className="premium-container animate-fade-in" style={{ maxWidth: '800px' }}>
      <h1 style={{ fontSize: '2.8rem', marginBottom: '2rem' }}>💳 SmartMed Wallet</h1>

      {/* Balance Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '2.5rem' }}>
        <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', borderRadius: '20px', padding: '1.75rem', color: '#fff' }}>
          <div style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: '0.5rem' }}>Wallet Balance</div>
          <div style={{ fontSize: '2.8rem', fontWeight: 900 }}>₹{wallet?.balance || 0}</div>
          <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '0.5rem' }}>Use at checkout for instant savings</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)', borderRadius: '20px', padding: '1.75rem', color: '#fff' }}>
          <div style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: '0.5rem' }}>SmartCoins</div>
          <div style={{ fontSize: '2.8rem', fontWeight: 900 }}>⭐ {wallet?.coins?.toLocaleString() || 0}</div>
          <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '0.5rem' }}>Earn 1 coin per ₹2 spent</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--glass-border)', marginBottom: '2rem', overflowX: 'auto' }}>
        {TABS.map(([id, label]) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            style={{ background: 'none', border: 'none', padding: '0.75rem 1.25rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700, color: activeTab === id ? 'var(--secondary)' : 'var(--text-muted)', borderBottom: `2px solid ${activeTab === id ? 'var(--secondary)' : 'transparent'}`, marginBottom: '-1px', whiteSpace: 'nowrap' }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && (
        <div className="animate-fade-in">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '2rem' }}>
            {[
              ['💰', 'Total Credited', `₹${(wallet?.transactions || []).filter(h => h.type === 'credit').reduce((s, h) => s + h.amount, 0)}`],
              ['⭐', 'Total Coins', (wallet?.coins || 0).toLocaleString()],
              ['🎁', 'Referrals', '3 Friends'],
            ].map(([icon, label, val]) => (
              <div key={label} className="glass-card" style={{ padding: '1.25rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{icon}</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900 }}>{val}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{label}</div>
              </div>
            ))}
          </div>
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Refer & Earn</h3>
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Your referral code</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--secondary)', letterSpacing: '3px', marginTop: '0.2rem' }}>SMART100</div>
              </div>
              <button className="btn-premium" style={{ padding: '0.5rem 1.25rem' }} onClick={() => showToast('Referral code copied!')}>
                📋 Copy
              </button>
            </div>
            <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.75rem' }}>
              Share → Friend gets ₹100 off · You earn ₹100 cashback
            </p>
          </div>
        </div>
      )}

      {/* Add Money */}
      {activeTab === 'addmoney' && (
        <div className="glass-card animate-fade-in" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '1.5rem' }}>Add Money to Wallet</h3>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            {QUICK_AMOUNTS.map(a => (
              <button
                key={a}
                onClick={() => setAddAmount(String(a))}
                style={{ padding: '0.7rem 1.5rem', border: `2px solid ${addAmount === String(a) ? 'var(--primary)' : 'var(--glass-border)'}`, borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '1rem', background: addAmount === String(a) ? 'rgba(99,102,241,0.15)' : 'transparent', color: addAmount === String(a) ? 'var(--primary)' : 'var(--text-muted)' }}
              >
                ₹{a}
              </button>
            ))}
          </div>
          <div className="input-group">
            <label>Or enter custom amount</label>
            <input
              type="number"
              value={addAmount}
              onChange={e => setAddAmount(e.target.value)}
              placeholder="₹ Enter amount"
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {[['📱', 'UPI / Google Pay'], ['💳', 'Credit / Debit Card'], ['🏦', 'Net Banking']].map(([icon, label]) => (
              <div key={label} style={{ display: 'flex', gap: '1rem', padding: '0.9rem 1.1rem', border: '1px solid var(--glass-border)', borderRadius: '12px', cursor: 'pointer', alignItems: 'center' }}>
                <span style={{ fontSize: '1.3rem' }}>{icon}</span>
                <span style={{ fontWeight: 600 }}>{label}</span>
              </div>
            ))}
          </div>
          <button
            className="btn-premium"
            style={{ width: '100%' }}
            disabled={!addAmount || Number(addAmount) < 1}
            onClick={() => handleAddMoney(addAmount)}
          >
            Add {addAmount ? `₹${addAmount}` : 'Money'} →
          </button>
        </div>
      )}

      {/* Coins */}
      {activeTab === 'coins' && (
        <div className="animate-fade-in">
          <div className="glass-card" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.25rem', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>⭐ {wallet?.coins || 0} SmartCoins available</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Redeem for exclusive discounts and rewards</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {COINS_BENEFITS.map(b => (
              <div key={b.coins} className="glass-card" style={{ padding: '1.1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>⭐ {b.coins.toLocaleString()} coins</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--secondary)', marginTop: '2px' }}>{b.benefit}</div>
                </div>
                <button
                  className="btn-premium"
                  style={{ padding: '0.45rem 1.1rem', fontSize: '0.85rem' }}
                  disabled={(wallet?.coins || 0) < b.coins}
                  onClick={() => handleRedeemCoins(b.coins, b.benefit)}
                >
                  {(wallet?.coins || 0) >= b.coins ? 'Redeem' : 'Need more'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History */}
      {activeTab === 'history' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {wallet.transactions && wallet.transactions.map(h => (
            <div key={h.id} className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: h.type === 'credit' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                  {h.type === 'credit' ? '↓' : '↑'}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{h.desc}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{h.date} · +{h.coins} coins</div>
                </div>
              </div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: h.type === 'credit' ? '#10b981' : '#ef4444' }}>
                {h.type === 'credit' ? '+' : '-'}₹{h.amount}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Wallet;
