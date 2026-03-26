import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../services/api';

function AIPharmacyScanner() {
    const { user } = useAuth();
    const { addToCart } = useCart();
    const navigate = useNavigate();
    const showToast = useToast();
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Upload, 2: Scanning, 3: Results
    const [scanResult, setScanResult] = useState(null);
    const [bill, setBill] = useState(null);
    const [interactions, setInteractions] = useState([]);
    const [alternatives, setAlternatives] = useState(null);   // { name, list }
    const [altLoading, setAltLoading] = useState(false);
    const [aiSummary, setAiSummary] = useState(null);
    const [summarizeLoading, setSummarizeLoading] = useState(false);

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected) {
            setFile(selected);
            setPreview(URL.createObjectURL(selected));
        }
    };

    const startScan = async () => {
        if (!file) return;
        setLoading(true);
        setStep(2);
        setInteractions([]);
        setAlternatives(null);
        setAiSummary(null);

        try {
            // Step 1: Upload
            const formData = new FormData();
            formData.append('file', file);
            formData.append('username', user.username);

            const uploadRes = await api.post('/prescription/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Step 2: Scan
            const scanRes = await api.post(`/prescription/scan/${uploadRes.data.id}`);
            console.log("Raw Scan Response:", scanRes.data);

            let parsedData;
            try {
                parsedData = typeof scanRes.data === 'string'
                    ? JSON.parse(scanRes.data.replace(/```json\n?|\n?```/g, '').trim())
                    : scanRes.data;
                if (parsedData.error) throw new Error(parsedData.error);
            } catch (parseError) {
                console.error("JSON Parsing Error:", parseError, "Raw Data:", scanRes.data);
                throw new Error("Failed to parse the AI response correctly. " + parseError.message);
            }

            setScanResult(parsedData);

            // Step 3: Check drug interactions locally via backend
            const validMedicines = parsedData.filter(med => !med.isFallback);
            const medNames = validMedicines.map(m => m.name);

            if (medNames.length > 1) {
                try {
                    const interactionRes = await axios.post(`${import.meta.env.VITE_API_URL || 'https://smartmed-backend.onrender.com'}/api/prescription/check-interactions`, medNames);
                    setInteractions(interactionRes.data || []);
                } catch {
                    // Interaction check is optional, don't fail
                }
            }

            // Step 4: Generate Bill
            if (validMedicines.length > 0) {
                const billRes = await axios.post(`${import.meta.env.VITE_API_URL || 'https://smartmed-backend.onrender.com'}/api/bill/generate`, validMedicines);
                setBill(billRes.data);
            } else {
                setBill(null);
            }

            setStep(3);
            showToast("Prescription analyzed successfully!");

            // Step 5: Generate AI Summary (Background)
            if (medNames.length > 0) {
                fetchSummary(medNames);
            }
        } catch (error) {
            console.error("Full Scan Error Details:", error);
            if (error.response) {
                console.error("Data:", error.response.data);
                console.error("Status:", error.response.status);
            } else if (error.request) {
                console.error("Request:", error.request);
            }
            showToast(error.message || "Error processing prescription. Please try a clearer image.");
            setStep(1);
        } finally {
            setLoading(false);
        }
    };

    const viewAlternatives = async (med) => {
        setAltLoading(true);
        setAlternatives({ name: med.name, list: [] });
        try {
            // Find the product ID first by searching by name
            const searchRes = await api.get(`/products/search?query=${encodeURIComponent(med.name)}`);
            if (searchRes.data && searchRes.data.length > 0) {
                const productId = searchRes.data[0].id;
                const altRes = await api.get(`/products/alternatives/${productId}`);
                setAlternatives({ name: med.name, list: altRes.data.slice(0, 5) }); // Show max 5 alternatives
            } else {
                setAlternatives({ name: med.name, list: [] });
            }
        } catch {
            setAlternatives({ name: med.name, list: [] });
        } finally {
            setAltLoading(false);
        }
    };

    const fetchSummary = async (medNames) => {
        setSummarizeLoading(true);
        try {
            const res = await api.post('/prescription/generate-summary', medNames);
            setAiSummary(res.data);
        } catch (err) {
            console.error("Summary error:", err);
            setAiSummary("Failed to generate AI guidance summary.");
        } finally {
            setSummarizeLoading(false);
        }
    };

    const handleCheckout = () => {
        if (!bill || !bill.items) return;
        
        // Add each item from the bill to the global cart
        bill.items.forEach(item => {
            addToCart({
                id: item.id,
                name: item.name,
                price: item.price,
                imageUrl: item.imageUrl
            });
        });

        showToast("Medicines added to cart! Proceeding to checkout...");
        navigate('/cart');
    };

    const hasFallback = scanResult && scanResult.some(m => m.isFallback);

    return (
        <div className="premium-container animate-fade-in">
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>AI Pharmacy Assistant</h1>
                <p className="text-muted">Upload your prescription. August will read, validate, and prepare your order.</p>
            </div>

            {/* Alternatives Modal */}
            {alternatives && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex',
                    alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)'
                }}>
                    <div className="glass-card" style={{ maxWidth: '480px', width: '90%', padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0 }}>Alternatives for {alternatives.name}</h3>
                            <button onClick={() => setAlternatives(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: 'var(--text-muted)' }}>✕</button>
                        </div>
                        {altLoading ? (
                            <div style={{ textAlign: 'center', padding: '2rem' }}>
                                <div className="loading-spinner" style={{ margin: '0 auto' }}></div>
                                <p className="text-muted" style={{ marginTop: '1rem' }}>Searching database...</p>
                            </div>
                        ) : alternatives.list.length > 0 ? (
                            alternatives.list.map((alt, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid var(--glass-border)' }}>
                                    <div>
                                        <div style={{ fontWeight: 700 }}>{alt.name}</div>
                                        <div className="text-muted" style={{ fontSize: '0.8rem' }}>{alt.category}</div>
                                    </div>
                                    <span style={{ fontWeight: 800, color: 'var(--primary)' }}>₹{alt.price}</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-muted" style={{ textAlign: 'center' }}>No alternatives found in the same category.</p>
                        )}
                    </div>
                </div>
            )}

            {/* STEP 1: Upload */}
            {step === 1 && (
                <div className="glass-card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '4rem 2rem' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '2rem' }}>📄</div>
                    <h3>Upload Prescription</h3>
                    <p className="text-muted" style={{ marginBottom: '2rem' }}>Supports JPG, PNG, PDF (Handwritten or Digital)</p>

                    <input
                        type="file"
                        id="rx-upload"
                        hidden
                        onChange={handleFileChange}
                        accept="image/*,.pdf"
                    />
                    <label htmlFor="rx-upload" className="btn-premium" style={{ cursor: 'pointer', display: 'inline-block', marginBottom: '1.5rem' }}>
                        Choose File
                    </label>

                    {preview && (
                        <div style={{ marginTop: '2rem' }}>
                            <img src={preview} alt="preview" style={{ maxWidth: '100%', borderRadius: '12px', border: '1px solid var(--glass-border)' }} />
                            <button className="btn-premium" style={{ width: '100%', marginTop: '1.5rem' }} onClick={startScan} disabled={loading}>
                                {loading ? 'Processing...' : 'Start AI Analysis →'}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* STEP 2: Scanning */}
            {step === 2 && (
                <div className="glass-card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '4rem 2rem' }}>
                    <div className="loading-spinner" style={{ margin: '0 auto 2rem' }}></div>
                    <h3>August is reading your prescription...</h3>
                    <p className="text-muted">OpenCV preprocessing → Tesseract OCR → Fuzzy Matching → AI Analysis</p>
                    <div style={{ marginTop: '2rem', textAlign: 'left', fontSize: '0.8rem', color: 'var(--primary)', fontFamily: 'monospace' }}>
                        {">"} Applying Otsu thresholding...<br/>
                        {">"} Grayscale & Gaussian Blur (5x5)...<br/>
                        {">"} Running Tesseract OCR (PSM 6, OEM 1)...<br/>
                        {">"} Fuzzy medicine name matching...<br/>
                        {">"} Checking drug interactions...
                    </div>
                </div>
            )}

            {/* STEP 3: Results */}
            {step === 3 && scanResult && (
                <div className="grid" style={{ gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
                    <div>
                        <h2 style={{ marginBottom: '1.5rem' }}>Extracted Medicines</h2>

                        {/* Drug Interaction Alerts */}
                        {interactions.length > 0 && (
                            <div className="glass-card" style={{ marginBottom: '1.5rem', borderLeft: '4px solid #ef4444', background: 'rgba(239, 68, 68, 0.05)' }}>
                                <h4 style={{ margin: '0 0 0.75rem', color: '#ef4444' }}>⚠ Drug Interaction Alerts</h4>
                                {interactions.map((alert, i) => (
                                    <p key={i} style={{ margin: '0.5rem 0', fontSize: '0.9rem', color: '#ef4444' }}>{alert}</p>
                                ))}
                            </div>
                        )}

                        {scanResult.map((med, i) => {
                            if (med.isFallback) {
                                return (
                                    <div key={i} className="glass-card" style={{ marginBottom: '1rem', borderLeft: '4px solid #f59e0b', background: 'rgba(245, 158, 11, 0.05)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                            <h3 style={{ margin: 0 }}>{med.name}</h3>
                                            <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: 'rgba(245, 158, 11, 0.2)', borderRadius: '4px' }}>FALLBACK</span>
                                        </div>
                                        <p style={{ fontSize: '0.9rem', color: '#f59e0b', marginBottom: '1rem' }}>{med.warning}</p>
                                        <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.85rem', whiteSpace: 'pre-wrap', maxHeight: '200px', overflowY: 'auto' }}>
                                            {med.rawText}
                                        </div>
                                    </div>
                                );
                            }
                            const isLocalMatch = med.warning && med.warning.includes("Local");
                            return (
                                <div key={i} className="glass-card" style={{ marginBottom: '1rem', borderLeft: isLocalMatch ? '4px solid var(--secondary)' : (med.warning ? '4px solid #ef4444' : '4px solid var(--primary)') }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <h3 style={{ margin: 0 }}>{med.name}</h3>
                                            <div style={{ fontSize: '0.9rem', color: 'var(--secondary)', fontWeight: 700 }}>{med.dosage} • {med.frequency}</div>
                                            <div className="text-muted" style={{ fontSize: '0.85rem' }}>Duration: {med.duration}</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <button
                                                className="nav-link"
                                                style={{ fontSize: '0.8rem' }}
                                                onClick={() => viewAlternatives(med)}
                                            >
                                                🔄 View Alternatives
                                            </button>
                                        </div>
                                    </div>
                                    {med.warning && (
                                        <div style={{
                                            marginTop: '1rem',
                                            padding: '0.5rem',
                                            background: isLocalMatch ? 'rgba(var(--secondary-rgb), 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                            color: isLocalMatch ? 'var(--secondary)' : '#ef4444',
                                            borderRadius: '8px',
                                            fontSize: '0.85rem'
                                        }}>
                                            {isLocalMatch ? '🔍 ' : '⚠ '}{med.warning}
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* AI Patient Guidance Section */}
                        <div className="glass-card" style={{ marginTop: '2rem', borderTop: '4px solid var(--secondary)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ margin: 0 }}>🧠 AI Patient Guidance</h2>
                                {summarizeLoading && <div className="loading-spinner" style={{ width: '20px', height: '20px' }}></div>}
                            </div>
                            
                            {aiSummary ? (
                                <div style={{ 
                                    lineHeight: '1.8', 
                                    whiteSpace: 'pre-line', 
                                    fontFamily: 'inherit',
                                    fontSize: '0.95rem',
                                    color: 'var(--text-main)'
                                }}>
                                    {aiSummary}
                                </div>
                            ) : (
                                <p className="text-muted">
                                    {summarizeLoading ? "August is generating a patient-friendly summary of your medicines..." : "No summary available."}
                                </p>
                            )}
                        </div>

                        {/* AI Safety Summary */}
                        <div className="glass-card" style={{ marginTop: '2rem', background: interactions.length > 0 ? 'rgba(239, 68, 68, 0.05)' : 'rgba(var(--primary-rgb), 0.05)', borderLeft: interactions.length > 0 ? '4px solid #ef4444' : '4px solid var(--primary)' }}>
                            <h3>AI Safety Summary</h3>
                            {hasFallback && (
                                <p style={{ fontSize: '0.9rem', color: '#f59e0b' }}>
                                    ⚠ Full AI verification was unavailable (rate limit). Results are shown from local database matching. Please double check dosage with a pharmacist.
                                </p>
                            )}
                            {interactions.length > 0 ? (
                                <p style={{ fontSize: '0.95rem', color: '#ef4444' }}>
                                    ⚠ {interactions.length} drug interaction(s) detected. Please consult your doctor before taking these medicines together.
                                </p>
                            ) : (
                                <p style={{ fontSize: '0.95rem' }}>
                                    ✅ {hasFallback ? 'Locally matched medicines detected.' : 'August has verified these medicines.'} No critical drug interactions found in this prescription.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Bill Panel */}
                    <div>
                        <h2 style={{ marginBottom: '1.5rem' }}>Generated Bill</h2>
                        {bill ? (
                            <div className="glass-card" style={{ position: 'sticky', top: '2rem' }}>
                                <div style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontWeight: 800 }}>{bill.billId}</span>
                                    <span className="text-muted">SmartMed Pharmacy</span>
                                </div>

                                {bill.items.map((item, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                                        <span style={{ fontSize: '0.9rem' }}>{item.name} x {item.quantity}</span>
                                        <span style={{ fontWeight: 700 }}>₹{item.total}</span>
                                    </div>
                                ))}

                                <div style={{ borderTop: '1px dashed var(--glass-border)', marginTop: '1.5rem', paddingTop: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span className="text-muted">Subtotal</span>
                                        <span>₹{bill.subtotal}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                        <span className="text-muted">GST (5%)</span>
                                        <span>₹{bill.tax.toFixed(2)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)' }}>
                                        <span>Total</span>
                                        <span>₹{bill.finalTotal.toFixed(2)}</span>
                                    </div>
                                </div>

                                <button 
                                    className="btn-premium" 
                                    style={{ width: '100%', marginTop: '2rem' }}
                                    onClick={handleCheckout}
                                >
                                    Proceed to Checkout
                                </button>
                                <button className="nav-link" style={{ width: '100%', marginTop: '1rem', fontSize: '0.8rem' }}>
                                    📥 Download Invoice (PDF)
                                </button>
                            </div>
                        ) : (
                            <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
                                <p className="text-muted">No billable medicines were detected. Upload a clearer image or retry.</p>
                                <button className="btn-premium" style={{ marginTop: '1.5rem' }} onClick={() => setStep(1)}>Try Again</button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default AIPharmacyScanner;
