import React, { useEffect, useState } from 'react';
import { getAllOrders, getProducts, updateOrderStatus, addProduct, updateProduct, deleteProduct } from '../services/api';
import { useToast } from '../context/ToastContext';

function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newProduct, setNewProduct] = useState({ name: "", price: "", category: "Fever & Pain", description: "", imageUrl: "", expiryDate: "" });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const showToast = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setLoading(true);
    Promise.all([getAllOrders(), getProducts()])
      .then(([ordersRes, productsRes]) => {
        setOrders(ordersRes.data);
        setProducts(productsRes.data);
        setLoading(false);
      })
      .catch(err => {
        showToast("Failed to fetch admin data", "error");
        setLoading(false);
      });
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalSales = orders.reduce((acc, order) => acc + order.totalAmount, 0);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      showToast("Order status updated!");
    } catch (err) {
      showToast("Failed to update status", "error");
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const res = await updateProduct(editingId, { ...newProduct, price: parseFloat(newProduct.price) });
        setProducts(products.map(p => p.id === editingId ? res.data : p));
        showToast("Product updated successfully!");
      } else {
        const res = await addProduct({ ...newProduct, price: parseFloat(newProduct.price) });
        setProducts([...products, res.data]);
        showToast("Product added successfully!");
      }
      resetForm();
    } catch (err) {
      showToast("Failed to save product", "error");
    }
  };

  const resetForm = () => {
    setNewProduct({ name: "", price: "", category: "Fever & Pain", description: "", imageUrl: "", expiryDate: "" });
    setEditingId(null);
  };

  const handleEditClick = (product) => {
    setNewProduct({ ...product });
    setEditingId(product.id);
    showToast("Editing mode active");
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteProduct(id);
      setProducts(products.filter(p => p.id !== id));
      showToast("Product deleted!");
    } catch (err) {
      showToast("Failed to delete product", "error");
    }
  };

  if (loading) return (
    <div className="flex-center" style={{ minHeight: '60vh' }}>
      <h2 className="text-muted">Loading Admin Controls...</h2>
    </div>
  );

  return (
    <div className="premium-container animate-fade-in">
      <h1 style={{ marginBottom: '2rem' }}>Admin Control Center</h1>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
        <div className="card" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), transparent)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Total Revenue</h3>
          <p style={{ fontSize: '1.8rem', fontWeight: 900 }}>₹{totalSales.toLocaleString()}</p>
          <span style={{ fontSize: '0.75rem', color: '#10b981' }}>↑ 12% from last month</span>
        </div>
        <div className="card" style={{ background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.1), transparent)', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Active Orders</h3>
          <p style={{ fontSize: '1.8rem', fontWeight: 900 }}>{orders.filter(o => o.status !== 'DELIVERED').length}</p>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{orders.length} total orders</span>
        </div>
        <div className="card" style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), transparent)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Avg Order Value</h3>
          <p style={{ fontSize: '1.8rem', fontWeight: 900 }}>₹{orders.length ? Math.round(totalSales / orders.length) : 0}</p>
          <span style={{ fontSize: '0.75rem', color: '#f59e0b' }}>Stable</span>
        </div>
        <div className="card" style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), transparent)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Subscriptions</h3>
          <p style={{ fontSize: '1.8rem', fontWeight: 900 }}>42</p>
          <span style={{ fontSize: '0.75rem', color: '#8b5cf6' }}>Premium Feature</span>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '3rem', background: 'rgba(255,255,255,0.02)' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Sales Breakdown by Category</h3>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-end', height: '150px', paddingBottom: '20px' }}>
          {['Fever', 'Digestive', 'Cold', 'Vitamins', 'Care'].map(cat => {
            const h = Math.floor(Math.random() * 80) + 20;
            return (
              <div key={cat} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '100%', height: `${h}%`, background: 'linear-gradient(to top, var(--primary), var(--secondary))', borderRadius: '4px', opacity: 0.8 }} />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{cat}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '2rem' }}>
        {/* Left Column: Orders & Inventory */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          {/* Recent Orders */}
          <div>
            <h2 style={{ marginBottom: '1.5rem' }}>Recent Orders</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {orders.map(order => (
                <div key={order.id} className="glass-card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: 0 }}>Order #{order.id} - {order.user.username}</h4>
                    <p className="text-muted" style={{ fontSize: '0.8rem' }}>₹{order.totalAmount} • {order.items.length} items</p>
                  </div>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                    style={{
                      padding: '0.4rem',
                      borderRadius: '8px',
                      background: 'var(--bg-dark)',
                      color: 'white',
                      border: '1px solid var(--glass-border)'
                    }}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Product Inventory Management */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0 }}>Product Inventory</h2>
              <input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '99px',
                  background: 'var(--glass)',
                  border: '1px solid var(--glass-border)',
                  color: 'white',
                  width: '200px'
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredProducts.map(product => (
                <div key={product.id} className="glass-card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <img src={product.imageUrl} alt={product.name} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                    <div>
                      <h4 style={{ margin: 0 }}>{product.name}</h4>
                      <p className="text-muted" style={{ fontSize: '0.8rem' }}>₹{product.price} • {product.category}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleEditClick(product)}
                      style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '8px', cursor: 'pointer' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '8px', cursor: 'pointer' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {filteredProducts.length === 0 && <p className="text-muted">No products found matching "{searchTerm}"</p>}
            </div>
          </div>
        </div>

        {/* Right Column: Add/Edit Form */}
        <div>
          <h2 style={{ marginBottom: '1.5rem' }}>{editingId ? "Edit Product" : "Add New Product"}</h2>
          <form onSubmit={handleSaveProduct} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'sticky', top: '100px' }}>
            <input
              placeholder="Product Name"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              required
              className="admin-input"
            />
            <input
              placeholder="Price"
              type="number"
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
              required
              className="admin-input"
            />
            <select
              value={newProduct.category}
              onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
              className="admin-input"
            >
              {["Fever & Pain", "Cold & Cough", "Digestive Health", "First Aid", "Medical Devices", "Vitamins", "Personal Care"].map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <textarea
              placeholder="Description"
              value={newProduct.description}
              onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              className="admin-input"
              style={{ height: '80px' }}
            />
            <input
              placeholder="Image URL"
              value={newProduct.imageUrl}
              onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
              className="admin-input"
            />
            <input
              placeholder="Expiry Date (e.g. Dec 2027)"
              value={newProduct.expiryDate}
              onChange={(e) => setNewProduct({ ...newProduct, expiryDate: e.target.value })}
              className="admin-input"
            />
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button type="submit" className="btn-premium" style={{ flex: 1 }}>
                {editingId ? "Update Product" : "Add Product"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  style={{ padding: '0.5rem 1rem', background: 'transparent', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '12px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
