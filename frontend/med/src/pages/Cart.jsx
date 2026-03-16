import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { createOrder, getProducts } from '../services/api';
import { useToast } from '../context/ToastContext';
import { getCartRecommendations } from '../data/recommendations';

import { useAuth } from '../context/AuthContext';

function Cart() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, addToCart } = useCart();
  const showToast = useToast();
  const { user, isLoggedIn } = useAuth();
  const [allProducts, setAllProducts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    getProducts().then(res => setAllProducts(res.data));
  }, []);

  useEffect(() => {
    if (allProducts.length > 0) {
      setRecommendations(getCartRecommendations(cartItems, allProducts));
    }
  }, [cartItems, allProducts]);

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const tax = subtotal * 0.18; // 18% GST for medical
  const total = subtotal + tax;

  const [shippingAddress, setShippingAddress] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = async () => {
    if (!isLoggedIn || !user) {
      showToast("Please sign in to checkout", "error");
      return;
    }

    const username = user.username;

    if (!shippingAddress) {
      showToast("Please enter a shipping address", "error");
      return;
    }

    setIsCheckingOut(true);
    try {
      const orderData = {
        username,
        totalAmount: total,
        shippingAddress,
        items: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        }))
      };

      await createOrder(orderData);
      showToast("Order placed successfully! Redirecting...");
      clearCart();
      setTimeout(() => {
        window.location.href = "/orders";
      }, 2000);
    } catch (error) {
      console.error("Checkout failed details:", error.response?.data);
      showToast(error.response?.data || "Checkout failed. Please try again.", "error");
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="premium-container animate-fade-in flex-center" style={{ flexDirection: 'column', minHeight: '60vh' }}>
        <h2 className="text-muted" style={{ marginBottom: '1.5rem' }}>Your cart is empty</h2>
        <Link to="/products" className="btn-premium" style={{ textDecoration: 'none' }}>Go Shopping</Link>
      </div>
    );
  }

  return (
    <div className="premium-container animate-fade-in">
      <div style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem' }}>Your Medical Cart</h1>
          <p className="text-muted">High-quality essentials ready for dispatch.</p>
        </div>
        <button onClick={clearCart} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600' }}>
          Clear All
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
        {/* Left Column: Cart Items & Recommendations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          {/* Cart Items List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {cartItems.map(item => (
              <div key={item.id} className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1rem' }}>
                <img src={item.imageUrl} alt={item.name} style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover' }} />

                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{item.name}</h3>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <p className="text-muted" style={{ fontSize: '0.85rem', margin: 0 }}>{item.category}</p>
                    <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', background: 'rgba(0,0,0,0.2)', padding: '2px 6px', borderRadius: '4px' }}>
                      Exp: {item.expiryDate}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', background: 'var(--glass)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                    <button onClick={() => updateQuantity(item.id, -1)} style={{ padding: '0.4rem 0.8rem', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>-</button>
                    <span style={{ padding: '0 0.5rem', fontWeight: '600' }}>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} style={{ padding: '0.4rem 0.8rem', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>+</button>
                  </div>

                  <div style={{ minWidth: '80px', textAlign: 'right' }}>
                    <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>₹{item.price * item.quantity}</span>
                  </div>

                  <button onClick={() => removeFromCart(item.id)} style={{ padding: '0.5rem', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Smart Recommendations Section */}
          {recommendations.length > 0 && (
            <div className="animate-fade-in">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.2rem' }}>
                <span style={{ fontSize: '1.5rem' }}>💡</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Frequently Bought Together</h3>
                  <p className="text-muted" style={{ margin: 0, fontSize: '0.8rem' }}>Based on what's in your cart</p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {recommendations.map(p => (
                  <div key={p.id} className="glass-card" style={{
                    padding: '1rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    border: '1px solid rgba(0, 200, 150, 0.2)',
                    background: 'rgba(0, 200, 150, 0.04)',
                  }}>
                    <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: 'rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', flexShrink: 0 }}>
                      💊
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ margin: 0, fontSize: '0.95rem' }}>{p.name}</h4>
                      {p.reason && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--secondary)', marginTop: '2px' }}>💊 {p.reason}</div>
                      )}
                      {p.basedOn && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Based on: {p.basedOn}</div>
                      )}
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '1rem' }}>₹{p.price}</div>
                      <button
                        className="btn-premium"
                        style={{ padding: '0.35rem 0.9rem', fontSize: '0.8rem', marginTop: '6px' }}
                        onClick={() => {
                          addToCart(p);
                          showToast(`✅ ${p.name} added!`);
                        }}
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Order Summary */}
        <div style={{ height: 'fit-content' }}>
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', textAlign: 'left' }}>Summary</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-muted">Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-muted">Medical GST (18%)</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              <div style={{ height: '1px', background: 'var(--glass-border)', margin: '0.5rem 0' }}></div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Shipping Address</label>
                <textarea
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Enter your full address"
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--glass-border)',
                    color: 'white',
                    fontSize: '0.9rem',
                    resize: 'none',
                    height: '80px'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: '700' }}>
                <span>Total</span>
                <span style={{ color: 'var(--primary)' }}>₹{total.toFixed(2)}</span>
              </div>
            </div>

            <button
              className="btn-premium"
              style={{ width: '100%', marginTop: '2rem', padding: '1rem' }}
              onClick={handleCheckout}
              disabled={isCheckingOut || cartItems.length === 0}
            >
              {isCheckingOut ? "Processing..." : "Checkout Now"}
            </button>

            <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: '1.5rem', textAlign: 'center' }}>
              Free delivery on orders above ₹500. Secure healthcare checkout.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
