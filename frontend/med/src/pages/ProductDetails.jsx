import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductById } from '../services/api';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

function ProductDetails() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();
    const showToast = useToast();

    useEffect(() => {
        setLoading(true);
        getProductById(id)
            .then(res => {
                setProduct(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch product details", err);
                setLoading(false);
            });
    }, [id]);

    if (loading) return (
        <div className="flex-center" style={{ minHeight: '60vh' }}>
            <h2 className="text-muted">Loading Product Details...</h2>
        </div>
    );

    if (!product) return (
        <div className="flex-center" style={{ minHeight: '60vh' }}>
            <h2 className="text-muted">Product Not Found</h2>
            <Link to="/products" className="btn-premium">Back to Store</Link>
        </div>
    );

    return (
        <div className="premium-container animate-fade-in">
            <Link to="/products" className="nav-link" style={{ marginBottom: '2rem', display: 'inline-block' }}>
                ← Back to Store
            </Link>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'start' }}>
                {/* Product Image Section */}
                <div className="glass-card" style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img
                        src={product.imageUrl}
                        alt={product.name}
                        style={{ maxWidth: '100%', borderRadius: '16px', objectFit: 'contain', maxHeight: '500px' }}
                    />
                </div>

                {/* Product Info Section */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span className="badge" style={{ alignSelf: 'start', marginBottom: '1rem' }}>{product.category}</span>
                    <h1 style={{ fontSize: '3rem', marginBottom: '1rem', background: 'none', webkitTextFillColor: 'var(--primary)' }}>
                        {product.name}
                    </h1>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                        <span style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--secondary)' }}>
                            ₹{product.price.toFixed(2)}
                        </span>
                        <span className="text-muted" style={{ fontSize: '0.9rem' }}>Incl. of all taxes</span>
                    </div>

                    <p style={{ fontSize: '1.2rem', lineHeight: '1.8', marginBottom: '2.5rem', color: 'var(--text-light)' }}>
                        {product.description}
                    </p>

                    <button
                        className="btn-premium"
                        style={{ padding: '1.2rem 2.5rem', fontSize: '1.1rem', width: 'fit-content', marginBottom: '3rem' }}
                        onClick={() => {
                            addToCart(product);
                            showToast(`${product.name} added to cart!`);
                        }}
                    >
                        Add to Medical Cart
                    </button>

                    {/* Enriched Details Grid */}
                    <div style={{ display: 'grid', gap: '2rem' }}>
                        <div className="glass-card" style={{ background: 'rgba(59, 130, 246, 0.05)' }}>
                            <h3 style={{ marginBottom: '1rem', color: 'var(--secondary)' }}>Dosage Instructions</h3>
                            <p style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
                                {product.dosageInstructions || "Consult your physician for specific dosage guidance."}
                            </p>
                        </div>

                        <div className="glass-card" style={{ background: 'rgba(239, 68, 68, 0.05)' }}>
                            <h3 style={{ marginBottom: '1rem', color: 'var(--accent)' }}>Safety Warnings</h3>
                            <p style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
                                {product.warnings || "Read the packaging carefully before use. Keep out of reach of children."}
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: '2rem', padding: '1rem' }}>
                            <div>
                                <span className="text-muted" style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.4rem' }}>Expiry Date</span>
                                <span style={{ fontWeight: '600' }}>{product.expiryDate}</span>
                            </div>
                            <div>
                                <span className="text-muted" style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.4rem' }}>Item ID</span>
                                <span style={{ fontWeight: '600' }}>#{product.id}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductDetails;
