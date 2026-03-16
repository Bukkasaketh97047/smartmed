import React, { useState, useEffect } from 'react';
import { getProducts, analyzeSymptoms } from '../services/api';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { Link } from 'react-router-dom';

const symptomsList = [
    { id: 'fever', label: 'Fever', icon: '🌡️' },
    { id: 'headache', label: 'Headache', icon: '🧠' },
    { id: 'cough', label: 'Cough', icon: '🗣️' },
    { id: 'bodyache', label: 'Body Ache', icon: '💪' },
    { id: 'stomach', label: 'Stomach Pain', icon: '🤢' },
    { id: 'fatigue', label: 'Fatigue', icon: '😴' }
];

function SymptomChecker() {
    const [selectedSymptoms, setSelectedSymptoms] = useState([]);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [allProducts, setAllProducts] = useState([]);
    const { addToCart } = useCart();
    const showToast = useToast();

    useEffect(() => {
        getProducts().then(res => setAllProducts(res.data));
    }, []);

    const toggleSymptom = (id) => {
        if (selectedSymptoms.includes(id)) {
            setSelectedSymptoms(selectedSymptoms.filter(s => s !== id));
        } else {
            setSelectedSymptoms([...selectedSymptoms, id]);
        }
    };

    const runCheck = async () => {
        if (selectedSymptoms.length === 0) {
            showToast("Please select at least one symptom.");
            return;
        }

        setLoading(true);
        try {
            const symptomLabels = symptomsList
                .filter(s => selectedSymptoms.includes(s.id))
                .map(s => s.label);

            const res = await analyzeSymptoms(symptomLabels);
            let aiData = res.data;

            // Robust check: If aiData is a string, parse it manually
            if (typeof aiData === 'string') {
                try {
                    aiData = JSON.parse(aiData);
                } catch (e) {
                    console.error("Failed to parse AI response:", aiData);
                    throw new Error("I couldn't quite understand the AI's response format. Please try again.");
                }
            }

            // Check for explicit AI error messages
            if (aiData && aiData.error) {
                throw new Error(aiData.error);
            }

            if (!aiData || !aiData.recommendations) {
                console.log("Malformed AI Data:", aiData);
                throw new Error("The AI didn't provide specific recommendations. Please try again.");
            }

            // Match AI recommendations with products in our database
            const matchedProducts = aiData.recommendations.map(recName => {
                const matched = allProducts.find(p =>
                    p.name.toLowerCase().includes(recName.toLowerCase()) ||
                    recName.toLowerCase().includes(p.name.toLowerCase())
                );
                return matched;
            }).filter(Boolean);

            setResult({
                ...aiData,
                products: matchedProducts
            });
            showToast("Analysis complete.");
        } catch (error) {
            console.error("Diagnosis error:", error);
            showToast("Error during analysis. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setSelectedSymptoms([]);
        setResult(null);
    };

    return (
        <div className="premium-container animate-fade-in">
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>August Diagnoser</h1>
                <p className="text-muted" style={{ maxWidth: '600px', margin: '0 auto' }}>
                    Select your symptoms below, and our smart assistant will suggest the best-suited medications from our store.
                </p>
            </div>

            {!result ? (
                <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h2 style={{ marginBottom: '2rem', textAlign: 'center' }}>What are you feeling?</h2>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                        {symptomsList.map(s => (
                            <div
                                key={s.id}
                                onClick={() => toggleSymptom(s.id)}
                                style={{
                                    padding: '2rem 1rem',
                                    borderRadius: '20px',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    background: selectedSymptoms.includes(s.id) ? 'var(--primary-glow)' : 'rgba(255,255,255,0.03)',
                                    border: `1px solid ${selectedSymptoms.includes(s.id) ? 'var(--primary)' : 'var(--glass-border)'}`,
                                    transform: selectedSymptoms.includes(s.id) ? 'translateY(-5px)' : 'none'
                                }}
                            >
                                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{s.icon}</div>
                                <div style={{ fontWeight: '600' }}>{s.label}</div>
                            </div>
                        ))}
                    </div>

                    <div style={{ textAlign: 'center' }}>
                        <button
                            className="btn-premium"
                            style={{ padding: '1.2rem 4rem', opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '0.8rem', margin: '0 auto' }}
                            onClick={runCheck}
                            disabled={loading}
                        >
                            {loading && <div className="loading-spinner" style={{ width: '20px', height: '20px', borderTopColor: 'white' }}></div>}
                            {loading ? 'Analyzing Symptoms...' : 'Analyze Symptoms'}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="animate-fade-in">
                    <div className="glass-card" style={{ maxWidth: '900px', margin: '0 auto', marginBottom: '3rem', background: 'rgba(99, 102, 241, 0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '2rem' }}>
                            <div>
                                <span className="badge" style={{ marginBottom: '1rem' }}>August Analysis Result</span>
                                <h1 style={{ fontSize: '2.5rem', color: 'var(--secondary)', marginBottom: '1rem' }}>{result.condition}</h1>
                                <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>{result.description}</p>
                            </div>
                            <button className="nav-link" onClick={reset}>← Start Over</button>
                        </div>

                        <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '2rem' }}>
                            <h3 style={{ marginBottom: '1.5rem' }}>Recommended Medicines</h3>
                            {result.products.length > 0 ? (
                                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
                                    {result.products.map(p => (
                                        <div key={p.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                                            <div style={{ height: '120px', marginBottom: '1rem', background: '#f8f9fa', borderRadius: '12px', padding: '10px', display: 'flex', justifyContent: 'center' }}>
                                                <img src={p.imageUrl} alt={p.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                            </div>
                                            <h4 style={{ marginBottom: '0.2rem' }}>{p.name}</h4>
                                            <span className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '1rem' }}>{p.category}</span>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                                                <span style={{ fontWeight: '700', color: 'var(--secondary)' }}>₹{p.price}</span>
                                                <button
                                                    className="btn-premium"
                                                    style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                                                    onClick={() => {
                                                        addToCart(p);
                                                        showToast(`${p.name} added to cart`);
                                                    }}
                                                >
                                                    Add
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', opacity: 0.8 }}>
                                    <p className="text-muted">August suggested: <strong>{result.recommendations?.join(', ')}</strong></p>
                                    <p style={{ marginTop: '0.5rem' }}>Currently, these specific items are not in our stock, but you can find alternatives in our Store.</p>
                                    <Link to="/products" className="nav-link" style={{ marginTop: '1rem', display: 'inline-block' }}>Go to Store →</Link>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="glass-card" style={{ maxWidth: '900px', margin: '0 auto', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                        <h3 style={{ color: 'var(--accent)', marginBottom: '1rem' }}>⚠️ Medical Disclaimer</h3>
                        <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                            This symptom checker is for informational purposes only and is NOT a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SymptomChecker;
