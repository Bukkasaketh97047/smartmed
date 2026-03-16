import React, { useEffect, useState } from 'react';
import { getProducts, searchProducts } from '../services/api';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { Link, useLocation } from 'react-router-dom';

function Products() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const { addToCart } = useCart();
  const showToast = useToast();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get("search");

  const categories = ["All", "Fever & Pain", "Cold & Cough", "Digestive Health", "First Aid", "Medical Devices", "Vitamins", "Personal Care"];

  useEffect(() => {
    setLoading(true);
    const fetchAction = query ? searchProducts(query) : getProducts();

    fetchAction
      .then(res => {
        setProducts(res.data);
        setFilteredProducts(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch products", err);
        setLoading(false);
      });
  }, [query]);

  useEffect(() => {
    if (activeCategory === "All") {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(p => p.category === activeCategory));
    }
  }, [activeCategory, products]);

  if (loading) return (
    <div className="flex-center" style={{ minHeight: '60vh' }}>
      <h2 className="text-muted">Loading Premium Products...</h2>
    </div>
  );

  return (
    <div className="premium-container">
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.56rem' }}>
          {query ? `Search Results for "${query}"` : "Premium Medical Essentials"}
        </h1>
        <p className="text-muted">
          {query
            ? `Found ${filteredProducts.length} results matching your search.`
            : "Curated healthcare products delivered with precision and care."}
        </p>
      </div>

      {/* Category Filter Bar */}
      <div className="category-bar">
        {categories.map(cat => (
          <button
            key={cat}
            className={`cat-btn ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid">
        {filteredProducts.map((p) => (
          <div className="glass-card" key={p.id} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Link to={`/product/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{
                width: '100%',
                height: '180px',
                borderRadius: '16px',
                overflow: 'hidden',
                marginBottom: '1.5rem',
                background: '#f8f9fa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px',
                border: '1px solid rgba(0,0,0,0.05)'
              }}>
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                />
              </div>

              <span style={{
                fontSize: '0.75rem',
                fontWeight: '600',
                color: 'var(--secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '0.5rem',
                display: 'block'
              }}>
                {p.category}
              </span>

              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.2rem', color: 'white', WebkitTextFillColor: 'initial' }}>{p.name}</h3>
            </Link>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.8rem' }}>Exp: {p.expiryDate}</p>
            <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '1.5rem', lineBreak: 'anywhere' }}>{p.description}</p>

            <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1rem' }}>
              <div>
                <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'white' }}>₹{p.price}</span>
              </div>
              <button
                className="btn-premium"
                style={{ padding: '0.6rem 1rem', fontSize: '0.85rem', borderRadius: '10px' }}
                onClick={() => {
                  addToCart(p);
                  showToast(`${p.name} added to cart!`);
                }}
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Products;
