import React, { useState } from 'react';

const INITIAL_NOTIFICATIONS = [
  { id: 1, type: 'order', title: 'Order Shipped!', message: 'Your order #SM12345 has been picked up by the delivery partner.', time: '2 hours ago', read: false },
  { id: 2, type: 'wallet', title: 'Cashback Credited', message: '₹50 cashback added to your wallet for your last purchase.', time: '5 hours ago', read: true },
  { id: 3, type: 'reminder', title: 'Medication Reminder', message: 'Time for your afternoon dose of Paracetamol.', time: '1 day ago', read: true },
  { id: 4, type: 'subscription', title: 'Subscription Renewed', message: 'Your monthly Amoxicillin subscription has been processed.', time: '2 days ago', read: true },
];

function Notifications() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = id => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const getIcon = type => {
    switch (type) {
      case 'order': return '🚚';
      case 'wallet': return '💰';
      case 'reminder': return '💊';
      case 'subscription': return '🔄';
      default: return '🔔';
    }
  };

  return (
    <div className="premium-container animate-fade-in" style={{ maxWidth: '800px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem' }}>🔔 Notifications</h1>
        <button 
          onClick={markAllRead}
          style={{ background: 'none', border: 'none', color: 'var(--secondary)', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}
        >
          Mark all as read
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {notifications.map(n => (
          <div 
            key={n.id} 
            className="glass-card" 
            style={{ 
              padding: '1.25rem', 
              display: 'flex', 
              gap: '1.25rem', 
              alignItems: 'center',
              borderLeft: n.read ? '1px solid var(--glass-border)' : '4px solid var(--secondary)',
              background: n.read ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)'
            }}
          >
            <div style={{ 
              width: '50px', 
              height: '50px', 
              borderRadius: '15px', 
              background: 'var(--bg-dark)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: '1.5rem',
              border: '1px solid var(--glass-border)'
            }}>
              {getIcon(n.type)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.2rem', color: n.read ? 'var(--text)' : '#fff' }}>{n.title}</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{n.time}</span>
              </div>
              <p className="text-muted" style={{ fontSize: '0.9rem', margin: 0 }}>{n.message}</p>
            </div>
            <button 
              onClick={() => deleteNotification(n.id)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem', padding: '0.5rem' }}
            >
              ×
            </button>
          </div>
        ))}
        {notifications.length === 0 && (
          <div className="flex-center" style={{ minHeight: '40vh', flexDirection: 'column', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '4rem', marginBottom: '1rem' }}>📭</span>
            <p>You're all caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Notifications;
