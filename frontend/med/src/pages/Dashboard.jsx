import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProducts } from '../services/api';

function Dashboard() {
    const { user, wallet } = useAuth();
    const [recentOrders, setRecentOrders] = useState([]);
    const [activeReminders] = useState([
        { id: 1, name: "Dolo 650", time: "08:00 AM", status: "Upcoming", color: "var(--primary)" },
        { id: 2, name: "Vicks Action 500", time: "02:00 PM", status: "Upcoming", color: "var(--secondary)" }
    ]);

    useEffect(() => {
        setRecentOrders([
            { id: '101', date: 'Mar 10', status: 'Delivered', total: '₹450' },
            { id: '102', date: 'Mar 12', status: 'On the Way', total: '₹120' }
        ]);
    }, []);

    return (
        <div className="premium-container animate-fade-in">
            <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                   <h1 style={{ fontSize: '2.8rem', marginBottom: '0.5rem' }}>Hello, {user?.username || 'Health Seeker'} ✨</h1>
                   <p className="text-muted">Your health command center. Everything is on track.</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                   <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Next Delivery</div>
                   <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.2rem' }}>Tomorrow, 10:00 AM</div>
                </div>
            </header>

            <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                
                {/* 1. Wallet Quick Look */}
                <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(0, 200, 150, 0.08), transparent)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>💳 Wallet</h3>
                        <Link to="/wallet" className="nav-link" style={{ fontSize: '0.8rem' }}>Top up →</Link>
                    </div>
                    <div style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '0.2rem' }}>₹{wallet.balance}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.85rem', color: '#f59e0b', fontWeight: 700 }}>⭐ {wallet.coins.toLocaleString()} Coins</span>
                    </div>
                </div>

                {/* 2. August AI Health Feed */}
                <div className="glass-card" style={{ gridColumn: 'span 2', background: 'rgba(255, 255, 255, 0.03)' }}>
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                        <div style={{ fontSize: '2.5rem' }}>🤖</div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--primary)' }}>August AI Insight</h3>
                            <p style={{ fontSize: '0.95rem', margin: '0.4rem 0' }}>
                                "Your recovery from the common cold is going well. I recommend 10% more hydration today."
                            </p>
                            <Link to="/august" style={{ fontSize: '0.8rem', color: 'var(--secondary)', fontWeight: 700, textDecoration: 'none' }}>Open Assistant →</Link>
                        </div>
                    </div>
                </div>

                {/* 3. Medication Reminders */}
                <div className="glass-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>🕒 Schedule</h3>
                        <Link to="/reminders" className="nav-link" style={{ fontSize: '0.8rem' }}>View All</Link>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        {activeReminders.map(r => (
                            <div key={r.id} style={{ padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{r.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.time}</div>
                                </div>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: r.color, boxShadow: `0 0 10px ${r.color}` }}></div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 4. Active Subscriptions */}
                <div className="glass-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>🔄 Auto-Refill</h3>
                        <Link to="/subscriptions" className="nav-link" style={{ fontSize: '0.8rem' }}>Manage</Link>
                    </div>
                    <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>3 Active Subscriptions</div>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '-10px', marginBottom: '1rem' }}>
                            {['💊', '🧪', '🩸'].map((emoji, i) => (
                                <div key={i} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-dark)', border: '2px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: i > 0 ? '-10px' : 0 }}>{emoji}</div>
                            ))}
                        </div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)' }}>Next: Amoxicillin (in 4 days)</div>
                    </div>
                </div>

                {/* 5. Quick Actions */}
                <div className="glass-card">
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1.2rem' }}>🚀 Quick Actions</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                        <Link to="/ai-scanner" style={{ textDecoration: 'none', padding: '0.8rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--glass-border)' }}>
                            <div style={{ fontSize: '1.2rem' }}>🤖</div>
                            <div style={{ fontSize: '0.75rem', color: '#fff', marginTop: '0.2rem' }}>AI Scanner</div>
                        </Link>
                        <Link to="/compare" style={{ textDecoration: 'none', padding: '0.8rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--glass-border)' }}>
                            <div style={{ fontSize: '1.2rem' }}>⚖️</div>
                            <div style={{ fontSize: '0.75rem', color: '#fff', marginTop: '0.2rem' }}>Compare</div>
                        </Link>
                        <Link to="/tracking" style={{ textDecoration: 'none', padding: '0.8rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--glass-border)' }}>
                            <div style={{ fontSize: '1.2rem' }}>🚚</div>
                            <div style={{ fontSize: '0.75rem', color: '#fff', marginTop: '0.2rem' }}>Track</div>
                        </Link>
                        <Link to="/emergency" style={{ textDecoration: 'none', padding: '0.8rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                            <div style={{ fontSize: '1.2rem' }}>🚨</div>
                            <div style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 700, marginTop: '0.2rem' }}>SOS</div>
                        </Link>
                    </div>
                </div>

                {/* 6. Recent Activity */}
                <div className="glass-card" style={{ gridColumn: 'span 3' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>📋 Recent Activity</h3>
                        <Link to="/orders" className="nav-link" style={{ fontSize: '0.8rem' }}>Full History</Link>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--glass-border)', borderRadius: '16px', overflow: 'hidden' }}>
                        {recentOrders.map(o => (
                            <div key={o.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', padding: '1.2rem 1.5rem', background: 'var(--bg-surface)', alignItems: 'center' }}>
                                <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>Order #{o.id}</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{o.date}</div>
                                <div>
                                    <span style={{
                                        padding: '0.3rem 0.8rem',
                                        borderRadius: '99px',
                                        fontSize: '0.75rem',
                                        fontWeight: 800,
                                        background: o.status === 'Delivered' ? 'rgba(0, 200, 150, 0.1)' : 'rgba(0, 191, 166, 0.1)',
                                        color: o.status === 'Delivered' ? 'var(--primary)' : 'var(--secondary)'
                                    }}>{o.status}</span>
                                </div>
                                <div style={{ fontSize: '0.95rem', fontWeight: 900, textAlign: 'right' }}>{o.total}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;

