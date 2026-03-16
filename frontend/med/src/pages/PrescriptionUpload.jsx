import React, { useState, useEffect, useRef } from 'react';
import { getProducts, analyzePrescription, checkInteractions, suggestSubstitutes } from '../services/api';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { matchMedicine } from '../utils/medicineUtils';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

function PrescriptionUpload() {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [scanning, setScanning] = useState(false);
    const [scannedItems, setScannedItems] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [hoveredBox, setHoveredBox] = useState(null);
    const [isExporting, setIsExporting] = useState(false);
    const [interactions, setInteractions] = useState(null);
    const [checkingSafety, setCheckingSafety] = useState(false);
    const [substitutes, setSubstitutes] = useState({}); // {medicineName: "results..."}
    const [loadingSubst, setLoadingSubst] = useState({});

    const { addToCart, cartItems } = useCart();
    const showToast = useToast();
    const imageRef = useRef(null);
    const exportRef = useRef(null);

    const isInCart = (productId) => cartItems.some(item => item.id === productId);

    useEffect(() => {
        getProducts().then(res => setAllProducts(res.data));
    }, []);

    const handleCheckSafety = async () => {
        if (scannedItems.length < 2) {
            showToast("Add at least 2 medicines to check for interactions.", "info");
            return;
        }
        setCheckingSafety(true);
        try {
            const names = scannedItems.map(i => i.name);
            const res = await checkInteractions(names);
            setInteractions(res.data);
            showToast("Safety check complete!", "success");
        } catch (err) {
            showToast("Failed to perform safety check.");
        } finally {
            setCheckingSafety(false);
        }
    };

    const handleViewSubstitutes = async (item) => {
        if (substitutes[item.name]) return; // Already loaded

        setLoadingSubst(prev => ({ ...prev, [item.name]: true }));
        try {
            const res = await suggestSubstitutes(item.name);
            setSubstitutes(prev => ({ ...prev, [item.name]: res.data }));
        } catch (err) {
            showToast("Could not find substitutes.");
        } finally {
            setLoadingSubst(prev => ({ ...prev, [item.name]: false }));
        }
    };

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected) {
            setFile(selected);
            setPreview(URL.createObjectURL(selected));
            setScannedItems([]);
            setHoveredBox(null);
        }
    };

    const runAnalysis = async () => {
        if (!file) {
            showToast("Please upload a prescription image first.");
            return;
        }

        setScanning(true);
        setScannedItems([]);
        setInteractions(null);
        setSubstitutes({});
        setLoadingSubst({});

        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await analyzePrescription(formData);
            let aiResults = res.data;

            // 1. Check for specific Error Signals FIRST
            if (aiResults === "ERROR_RATE_LIMIT") {
                showToast("AI service is busy (Rate Limit). Retrying in background...", "warning");
                setScanning(false);
                return;
            }

            if (aiResults === "ERROR_QUOTA_EXCEEDED") {
                showToast("API quota exceeded. Please check your Google AI usage limits.", "error");
                setScanning(false);
                return;
            }

            if (aiResults === "ERROR_MODEL_NOT_FOUND") {
                showToast("Requested AI model is not available in your region.", "error");
                setScanning(false);
                return;
            }

            if (aiResults === "ERROR_SERVER") {
                showToast("Google AI server error. Please try again in a few minutes.", "error");
                setScanning(false);
                return;
            }

            if (aiResults === "ERROR_IN_RESPONSE") {
                showToast("AI returned an error instead of medicine data. Please try a clearer image.", "error");
                setScanning(false);
                return;
            }

            // 2. Now attempt to parse the results
            if (typeof aiResults === "string") {
                try {
                    // Try to extract JSON array if it's wrapped in markers or text
                    let cleaned = aiResults.trim();
                    if (cleaned.includes("[") && cleaned.includes("]")) {
                        const start = cleaned.indexOf("[");
                        const end = cleaned.lastIndexOf("]") + 1;
                        cleaned = cleaned.substring(start, end);
                    }
                    aiResults = JSON.parse(cleaned);
                } catch (e) {
                    console.warn("AI returned non-JSON text, attempting to convert...");
                    // Fallback: Convert a text-list into the expected object format
                    const lines = aiResults.split('\n').filter(l => l.trim());
                    aiResults = lines.map(line => ({
                        name: line.replace(/^[0-9.]+\s*/, '').trim(),
                        originalText: line.trim(),
                        dosage: "",
                        type: "Medicine",
                        instructions: ""
                    }));
                }
            }

            if (!Array.isArray(aiResults) || aiResults.length === 0) {
                showToast("Could not extract any medicines. Please try a clearer image.", "error");
                setScanning(false);
                return;
            }

            const processedResults = aiResults.map(item => {
                // Use the bulletproof matchMedicine utility (handles OCR quirks, typos, brand names, etc.)
                const matchedInStore = matchMedicine(item.name, allProducts);

                return {
                    ...item,
                    id: matchedInStore ? matchedInStore.id : `new-${Math.random()}`,
                    price: matchedInStore ? matchedInStore.price : 0,
                    image: matchedInStore ? matchedInStore.imageUrl : null,
                    inStock: !!matchedInStore,
                    originalProduct: matchedInStore,
                    isEditing: false
                };
            });

            setScannedItems(processedResults);

            // Auto-add all available medicines to cart
            const autoCartItems = processedResults.filter(i => i.inStock && i.originalProduct);
            autoCartItems.forEach(item => addToCart(item.originalProduct));

            if (autoCartItems.length > 0) {
                showToast(`${autoCartItems.length} medicines were added to your cart from the scanned prescription.`, "success");
            } else {
                showToast("August AI has translated your prescription, but no matching store medicines were found.", "info");
            }
        } catch (error) {
            console.error("Analysis error:", error);
            showToast("Error interpreting handwriting. Please check your image.");
        } finally {
            setScanning(false);
        }
    };

    const handleAddToCart = (item) => {
        if (!item.inStock) {
            showToast("This item is not available in our store.", "error");
            return;
        }
        addToCart(item.originalProduct);
        showToast(`${item.name} added to cart!`);
    };

    const updateItem = (id, field, value) => {
        setScannedItems(prev => prev.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const removeItem = (id) => {
        setScannedItems(prev => prev.filter(item => item.id !== id));
        showToast("Item removed.");
    };

    const addItem = () => {
        const newItem = {
            id: `manual-${Math.random()}`,
            name: "New Medicine",
            originalText: "Manually Added",
            confidence: 100,
            ingredients: "N/A",
            uses: "Add details here",
            frequency: "1-0-1",
            duration: "5 days",
            instructions: "Take as directed",
            inStock: false,
            isEditing: true,
            boundingBox: null
        };
        setScannedItems([...scannedItems, newItem]);
    };

    const toggleEdit = (id) => {
        setScannedItems(prev => prev.map(item =>
            item.id === id ? { ...item, isEditing: !item.isEditing } : item
        ));
    };

    const addAvailableToCart = () => {
        const availableItems = scannedItems.filter(i => i.inStock && i.originalProduct);
        availableItems.forEach(item => addToCart(item.originalProduct));
        showToast(`${availableItems.length} items added to your cart.`);
    };

    const exportPDF = async () => {
        setIsExporting(true);
        try {
            const element = exportRef.current;
            const canvas = await html2canvas(element, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save('Translated_Prescription.pdf');
            showToast("PDF Downloaded!");
        } catch (err) {
            console.error("PDF Export error:", err);
            showToast("Failed to generate PDF.");
        } finally {
            setIsExporting(false);
        }
    };

    const getConfidenceColor = (score) => {
        if (score >= 90) return '#10b981';
        if (score >= 70) return '#f59e0b';
        return '#ef4444';
    };

    const getRectProps = (box) => {
        if (!box || !imageRef.current) return null;
        const { offsetWidth, offsetHeight } = imageRef.current;
        const top = (box[0] / 1000) * offsetHeight;
        const left = (box[1] / 1000) * offsetWidth;
        const width = ((box[3] - box[1]) / 1000) * offsetWidth;
        const height = ((box[2] - box[0]) / 1000) * offsetHeight;
        return { top, left, width, height };
    };

    return (
        <div className="premium-container animate-fade-in">
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem', background: 'linear-gradient(45deg, #fff, var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: '900' }}>
                    AI Doctor Handwriting Translator
                </h1>
                <p className="text-muted" style={{ maxWidth: '650px', margin: '0 auto', fontSize: '1.2rem' }}>
                    Decipher messy medical prescriptions instantly. Convert handwriting into structured digital records with high-precision AI vision.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: preview ? '1.1fr 1fr' : '1fr', gap: '3rem', maxWidth: '1400px', margin: '0 auto' }}>

                {/* VISUAL TRANSLATOR SECTION */}
                <div style={{ position: 'sticky', top: '2rem', height: 'fit-content' }}>
                    <div className="glass-card" style={{ padding: '0.5rem', position: 'relative', overflow: 'hidden' }}>
                        {!preview ? (
                            <div style={{
                                height: '500px',
                                border: '3px dashed var(--glass-border)',
                                borderRadius: '24px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'rgba(255,255,255,0.02)',
                                cursor: 'pointer'
                            }}>
                                <input type="file" accept="image/*" onChange={handleFileChange} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                                <div style={{ fontSize: '5rem', marginBottom: '1.5rem' }}>🖋️</div>
                                <h2>Upload Handwritten Rx</h2>
                                <p className="text-muted">Supports messy doctor scripts</p>
                            </div>
                        ) : (
                            <div style={{ position: 'relative' }}>
                                <img
                                    ref={imageRef}
                                    src={preview}
                                    alt="Prescription"
                                    style={{ width: '100%', borderRadius: '16px', opacity: scanning ? 0.3 : 1, transition: 'all 0.5s ease' }}
                                />
                                <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                                    {scannedItems.map(item => {
                                        const rect = getRectProps(item.boundingBox);
                                        if (!rect) return null;
                                        const isHovered = hoveredBox === item.id;
                                        return (
                                            <g key={item.id}>
                                                <rect
                                                    x={rect.left}
                                                    y={rect.top}
                                                    width={rect.width}
                                                    height={rect.height}
                                                    fill="none"
                                                    stroke={isHovered ? 'var(--secondary)' : 'rgba(255,255,255,0.3)'}
                                                    strokeWidth={isHovered ? 4 : 2}
                                                    strokeDasharray={isHovered ? "0" : "5,5"}
                                                    style={{ transition: 'all 0.3s ease' }}
                                                />
                                                {isHovered && (
                                                    <foreignObject x={rect.left} y={rect.top - 35} width="200" height="40">
                                                        <div style={{ background: 'var(--secondary)', color: 'white', padding: '4px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold', width: 'fit-content' }}>
                                                            {item.name}
                                                        </div>
                                                    </foreignObject>
                                                )}
                                            </g>
                                        );
                                    })}
                                </svg>

                                {scanning && (
                                    <>
                                        <div className="scan-bar"></div>
                                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', borderRadius: '16px' }}>
                                            <div className="spinner"></div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {preview && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
                            <button className="btn-premium" style={{ width: '100%' }} onClick={runAnalysis} disabled={scanning}>
                                {scanning ? "Decoding..." : "Decode Handwriting"}
                            </button>
                            <label className="nav-link" style={{ textAlign: 'center', padding: '1rem', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                                Change Image
                                <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                            </label>
                        </div>
                    )}
                </div>

                {/* TRANSCRIPTION HUB */}
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {scannedItems.length > 0 ? (
                        <div ref={exportRef} className="glass-card" style={{ padding: '2.5rem', background: 'rgba(255,255,255,0.03)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                                <div>
                                    <h2 style={{ margin: 0 }}>Digital Records</h2>
                                    <p className="text-muted">Handwriting interpretation active</p>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <button
                                        className="btn-premium"
                                        style={{ background: checkingSafety ? 'rgba(255,255,255,0.1)' : 'var(--secondary)', padding: '0.8rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                        onClick={handleCheckSafety}
                                        disabled={checkingSafety}
                                    >
                                        {checkingSafety ? <div className="spinner-mini"></div> : '🛡️'} AI Safety Check
                                    </button>
                                    <button className="nav-link" onClick={addItem}>➕ Add Item</button>
                                    <button className="btn-premium" style={{ background: 'var(--accent)', padding: '0.8rem 1.5rem' }} onClick={exportPDF} disabled={isExporting}>
                                        {isExporting ? "Exporting..." : "Download PDF"}
                                    </button>
                                </div>
                            </div>

                            {interactions && (
                                <div className="glass-card animate-fade-in" style={{ marginBottom: '2rem', padding: '1.5rem', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                        <h4 style={{ margin: 0, color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            ⚠️ Drug-to-Drug Interaction Report
                                        </h4>
                                        <button className="text-muted" style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setInteractions(null)}>Dismiss</button>
                                    </div>
                                    <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem', color: '#fca5a5' }}>
                                        {interactions}
                                    </div>
                                </div>
                            )}

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {scannedItems.map(item => (
                                    <div
                                        key={item.id}
                                        className="glass-card transition-all"
                                        style={{
                                            padding: '1.5rem',
                                            border: `2px solid ${hoveredBox === item.id ? 'var(--secondary)' : 'transparent'}`,
                                            background: hoveredBox === item.id ? 'rgba(59, 130, 246, 0.05)' : 'rgba(255,255,255,0.01)',
                                        }}
                                        onMouseEnter={() => setHoveredBox(item.id)}
                                        onMouseLeave={() => setHoveredBox(null)}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <div style={{ flex: 1 }}>
                                                {item.isEditing ? (
                                                    <input
                                                        value={item.name}
                                                        onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                                                        className="form-control"
                                                        style={{ fontSize: '1.4rem', fontWeight: 'bold' }}
                                                    />
                                                ) : (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
                                                        <h3 style={{ margin: 0, fontSize: '1.4rem' }}>{item.name}</h3>
                                                        {item.inStock && (
                                                            <span style={{
                                                                padding: '4px 10px',
                                                                borderRadius: '6px',
                                                                fontSize: '0.7rem',
                                                                fontWeight: '800',
                                                                letterSpacing: '0.5px',
                                                                background: isInCart(item.id) ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                                                                color: isInCart(item.id) ? '#10b981' : '#3b82f6',
                                                                border: isInCart(item.id) ? '1px solid #10b981' : '1px solid #3b82f6'
                                                            }}>
                                                                {isInCart(item.id) ? '✓ IN CART' : 'AVAILABLE'}
                                                            </span>
                                                        )}
                                                        {!item.inStock && (
                                                            <span style={{
                                                                padding: '4px 10px',
                                                                borderRadius: '6px',
                                                                fontSize: '0.7rem',
                                                                fontWeight: '800',
                                                                letterSpacing: '0.5px',
                                                                background: 'rgba(239, 68, 68, 0.2)',
                                                                color: '#ef4444',
                                                                border: '1px solid #ef4444'
                                                            }}>
                                                                OUT OF STOCK
                                                            </span>
                                                        )}
                                                        {item.price > 0 && (
                                                            <span style={{ color: 'var(--secondary)', fontWeight: 'bold' }}>
                                                                ₹{item.price}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                                                    Original: "{item.originalText}"
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                                {item.inStock && (
                                                    <button
                                                        className="btn-premium"
                                                        style={{
                                                            padding: '0.5rem 1rem',
                                                            fontSize: '0.8rem',
                                                            background: isInCart(item.id) ? 'rgba(16, 185, 129, 0.2)' : 'var(--secondary)',
                                                            color: isInCart(item.id) ? '#10b981' : 'white',
                                                            border: isInCart(item.id) ? '1px solid #10b981' : 'none'
                                                        }}
                                                        onClick={() => handleAddToCart(item)}
                                                    >
                                                        {isInCart(item.id) ? '🛒 Add More' : '🛒 Add to Cart'}
                                                    </button>
                                                )}
                                                {!item.inStock && (
                                                    <button
                                                        className="nav-link"
                                                        style={{ fontSize: '0.8rem', opacity: 0.6 }}
                                                        onClick={() => handleViewSubstitutes(item)}
                                                        disabled={loadingSubst[item.name]}
                                                    >
                                                        {loadingSubst[item.name] ? 'Searching...' : '🔍 Find Substitute'}
                                                    </button>
                                                )}
                                                <button onClick={() => toggleEdit(item.id)}>{item.isEditing ? 'Save' : 'Edit'}</button>
                                                <button onClick={() => removeItem(item.id)} style={{ color: '#ef4444' }}>Remove</button>
                                            </div>
                                        </div>

                                        {substitutes[item.name] && !item.inStock && (
                                            <div className="animate-fade-in" style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '12px', borderLeft: '4px solid #10b981' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                                    <strong style={{ fontSize: '0.8rem', color: '#10b981' }}>🤖 AI RECOMMENDED SUBSTITUTES</strong>
                                                    <button style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', fontSize: '0.7rem' }} onClick={() => setSubstitutes(prev => ({ ...prev, [item.name]: null }))}>Close</button>
                                                </div>
                                                <div style={{ fontSize: '0.85rem', whiteSpace: 'pre-wrap' }}>{substitutes[item.name]}</div>
                                            </div>
                                        )}

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem', padding: '1.5rem', background: 'rgba(0,0,0,0.3)', borderRadius: '16px' }}>
                                            <div>
                                                <div className="label-tiny">DOSAGE</div>
                                                <div style={{ fontSize: '1.1rem', marginTop: '0.5rem', fontWeight: 'bold' }}>
                                                    {item.frequency} | {item.duration}
                                                </div>
                                                <div style={{ fontSize: '0.85rem', marginTop: '0.3rem' }}>{item.instructions}</div>
                                            </div>
                                            <div>
                                                <div className="label-tiny">MEDICAL NOTE</div>
                                                <div style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
                                                    {item.uses}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="glass-card" style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed rgba(255,255,255,0.05)' }}>
                            <div style={{ textAlign: 'center', opacity: 0.3 }}>
                                <div style={{ fontSize: '4rem' }}>🤖</div>
                                <h3>Ready for Translation</h3>
                                <p>Upload an image to decipher handwriting</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .scan-bar {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 5px;
                    background: var(--secondary);
                    box-shadow: 0 0 15px var(--secondary);
                    animation: scanLine 3s infinite ease-in-out;
                }
                @keyframes scanLine {
                    0%, 100% { top: 0; }
                    50% { top: 100%; }
                }
                .spinner {
                    width: 50px;
                    height: 50px;
                    border: 5px solid rgba(255,255,255,0.1);
                    border-top: 5px solid var(--secondary);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                .spinner-mini {
                    width: 14px;
                    height: 14px;
                    border: 2px solid rgba(255,255,255,0.1);
                    border-top: 2px solid white;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin { 100% { transform: rotate(360deg); } }
                .label-tiny {
                    font-size: 0.6rem;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    opacity: 0.5;
                    font-weight: 800;
                }
                .transition-all { transition: all 0.2s ease; }
            `}</style>
        </div>
    );
}

export default PrescriptionUpload;
