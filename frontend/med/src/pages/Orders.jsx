import React, { useEffect, useState } from 'react';
import { getUserOrders } from '../services/api';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const username = localStorage.getItem("username");
    if (username) {
      getUserOrders(username)
        .then(res => {
          setOrders(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Failed to fetch orders", err);
          setLoading(false);
        });
    }
  }, []);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'DELIVERED':
        return { background: 'rgba(34, 197, 94, 0.1)', color: '#4ade80' };
      case 'PENDING':
        return { background: 'rgba(234, 179, 8, 0.1)', color: '#fbbf24' };
      case 'CANCELLED':
        return { background: 'rgba(239, 68, 68, 0.1)', color: '#f87171' };
      default:
        return { background: 'rgba(148, 163, 184, 0.1)', color: '#94a3b8' };
    }
  };

  if (loading) return (
    <div className="flex-center" style={{ minHeight: '60vh' }}>
      <h2 className="text-muted">Loading Your Orders...</h2>
    </div>
  );

  return (
    <div className="premium-container animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem' }}>My Orders</h1>
        <p className="text-muted">Track your recent healthcare deliveries.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px' }}>
        {orders.length === 0 ? (
          <p className="text-muted">You haven't placed any orders yet.</p>
        ) : (
          orders.map(order => (
            <div key={order.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Order #{order.id}</h3>
                <p className="text-muted" style={{ fontSize: '0.9rem' }}>₹{order.totalAmount.toFixed(2)} • {new Date(order.orderDate).toLocaleDateString()}</p>
                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.5rem' }}>
                  Items: {order.items.map(item => `${item.product.name} (x${item.quantity})`).join(', ')}
                </p>
              </div>
              <span style={{
                padding: '0.4rem 1rem',
                borderRadius: '99px',
                ...getStatusStyle(order.status),
                fontSize: '0.85rem',
                fontWeight: '600'
              }}>{order.status}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Orders;
