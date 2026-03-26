import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const { user, isLoggedIn, logout } = useAuth();
  const [searchQuery, setSearchQuery] = React.useState("");
  
  const isAuthPage = ['/signin', '/signup', '/'].includes(location.pathname) || 
                     location.pathname.startsWith('/oauth2');
  
  if (isAuthPage) {
    return null;
  }

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="navbar-container">
      {/* Top Bar: Logo, Search, User Actions */}
      <div className="navbar-top">
        <div className="nav-container">
          <Link to="/" className="nav-logo">
            <div className="logo-icon">S</div>
            SmartMed
          </Link>

          {isLoggedIn && (
            <form className="nav-search" onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search medicines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit">🔍</button>
            </form>
          )}

          <div className="nav-actions">
            {isLoggedIn ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span className="text-muted" style={{ fontSize: '0.9rem' }}>{user?.username}</span>
                <button className="btn-logout" onClick={handleLogout}>Logout</button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '1rem' }}>
                <Link to="/signin" className="nav-link">Sign In</Link>
                <Link to="/signup" className="btn-premium" style={{ textDecoration: 'none', padding: '0.6rem 1.2rem' }}>Get Started</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Bar: Horizontal Navigation Menu */}
      {isLoggedIn && (
        <div className="navbar-bottom">
          <div className="nav-container">
            <div className="nav-links">
              <Link to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>Dashboard</Link>
              <Link to="/products" className={`nav-link ${location.pathname === '/products' ? 'active' : ''}`}>Store</Link>
              <Link to="/finder" className={`nav-link ${location.pathname === '/finder' ? 'active' : ''}`}>📍 Map</Link>
              <Link to="/compare" className={`nav-link ${location.pathname === '/compare' ? 'active' : ''}`}>Compare</Link>
              <Link to="/symptom-checker" className={`nav-link ${location.pathname === '/symptom-checker' ? 'active' : ''}`}>Diagnoser</Link>
              <Link to="/disease-risk" className={`nav-link ${location.pathname === '/disease-risk' ? 'active' : ''}`}>Risk Profile</Link>
              <Link to="/reminders" className={`nav-link ${location.pathname === '/reminders' ? 'active' : ''}`}>Reminders</Link>
              <Link to="/august" className={`nav-link ${location.pathname === '/august' ? 'active' : ''}`}>August AI</Link>
              <Link to="/ai-scanner" className={`nav-link ${location.pathname === '/ai-scanner' ? 'active' : ''}`}>AI Pharmacy</Link>
              <Link to="/wallet" className={`nav-link ${location.pathname === '/wallet' ? 'active' : ''}`}>💳 Wallet</Link>
              <Link to="/notifications" className={`nav-link ${location.pathname === '/notifications' ? 'active' : ''}`} style={{ position: 'relative' }}>
                🔔
                <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'var(--accent)', color: 'white', fontSize: '0.65rem', padding: '1px 5px', borderRadius: '99px', fontWeight: 900 }}>1</span>
              </Link>
              <Link to="/cart" className={`nav-link ${location.pathname === '/cart' ? 'active' : ''}`}>
                Cart {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </Link>
              <Link to="/orders" className={`nav-link ${location.pathname === '/orders' ? 'active' : ''}`}>Orders</Link>
              <Link to="/emergency" className="btn-emergency" style={{ textDecoration: 'none', padding: '0.4rem 0.8rem', backgroundColor: '#ef4444', color: 'white', borderRadius: '8px', fontWeight: 'bold' }}>🚨 SOS</Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
