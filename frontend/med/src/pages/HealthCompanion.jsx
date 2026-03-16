import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProducts } from '../services/api';

function HealthCompanion() {
    const { user } = useAuth();
    const [language, setLanguage] = useState(null); // 'en' or 'te'
    const [messages, setMessages] = useState([
        { id: 1, text: "Hi, I'm August, your AI health companion 👋", sender: 'ai' },
        { id: 2, text: "By continuing, you agree to t&c. I provide health info only - always consult your doctor.", sender: 'ai' },
        { id: 3, text: "Which language should we chat in?\nEnglish | తెలుగు | Hindi | any other language", sender: 'ai' }
    ]);
    const [input, setInput] = useState("");
    const [allProducts, setAllProducts] = useState([]);
    const chatEndRef = useRef(null);

    useEffect(() => {
        getProducts().then(res => setAllProducts(res.data));
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || !language) return;

        const userMsg = { id: Date.now(), text: input, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        const currentInput = input;
        setInput("");

        try {
            const res = await chatWithAugust(currentInput);
            const aiMsg = { id: Date.now() + 1, text: res.data, sender: 'ai' };
            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            console.error("HealthCompanion error:", error);
            const errorMsg = { id: Date.now() + 1, text: "I'm sorry, I'm having trouble with my clinical data connection. Please try again later.", sender: 'ai' };
            setMessages(prev => [...prev, errorMsg]);
        }
    };

    return (
        <div className="premium-container animate-fade-in" style={{ padding: '2rem 1rem' }}>
            <div className="chat-window glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                {/* Custom Header */}
                <div className="chat-header">
                    <div style={{
                        width: '45px',
                        height: '45px',
                        background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        color: 'white'
                    }}>
                        A
                    </div>
                    <div>
                        <div style={{ fontWeight: '700', fontSize: '1.1rem', color: 'white' }}>August AI</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            <div className="chat-status-dot"></div>
                            Always Online
                        </div>
                    </div>
                </div>

                {/* Chat Area */}
                <div className="chat-messages">
                    {messages.map(m => (
                        <div
                            key={m.id}
                            className={`chat-bubble ${m.sender === 'ai' ? 'bubble-ai' : 'bubble-user'}`}
                        >
                            {m.text}
                        </div>
                    ))}
                    <div ref={chatEndRef} />
                </div>

                {/* Input Area */}
                <div className="chat-input-container">
                    <div className="chat-input-wrapper">
                        <input
                            type="text"
                            placeholder="Type a message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button
                            className="chat-send-btn"
                            onClick={handleSend}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)' }}>
                SmartMed AI can be wrong. Consult a professional for serious medical issues.
            </p>
        </div >
    );
}

export default HealthCompanion;
