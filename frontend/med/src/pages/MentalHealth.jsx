import React, { useState, useRef, useEffect } from 'react';
import { chatWithAugust } from '../services/api';

function MentalHealth() {
    const [messages, setMessages] = useState([
        { text: "Hello. I am August Mind. I'm here to listen and help you find peace. How are you feeling today?", sender: 'bot' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = { text: input, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = input;
        setInput('');
        setLoading(true);

        try {
            const res = await chatWithAugust(currentInput);
            setMessages(prev => [...prev, { text: res.data, sender: 'bot' }]);
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, { text: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.", sender: 'bot' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h1 style={{ color: '#8b5cf6', fontSize: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                    🌿 August Mind
                </h1>
                <p className="text-muted">A safe, private space for your mental well-being.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>

                {/* Chat Interface */}
                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '600px', padding: 0, overflow: 'hidden' }}>

                    <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', backgroundColor: '#faf5ff' }}>
                        {messages.map((msg, idx) => (
                            <div key={idx} style={{
                                display: 'flex',
                                justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                alignItems: 'flex-end',
                                gap: '0.5rem'
                            }}>
                                {msg.sender === 'bot' && (
                                    <div style={{ width: '35px', height: '35px', borderRadius: '50%', backgroundColor: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                                        🌿
                                    </div>
                                )}
                                <div style={{
                                    maxWidth: '70%',
                                    padding: '1rem 1.5rem',
                                    borderRadius: msg.sender === 'user' ? '20px 20px 0 20px' : '20px 20px 20px 0',
                                    backgroundColor: msg.sender === 'user' ? '#8b5cf6' : 'white',
                                    color: msg.sender === 'user' ? 'white' : '#1f2937',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                    fontSize: '1.05rem',
                                    lineHeight: '1.5'
                                }}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    <div style={{ padding: '1rem', backgroundColor: 'white', borderTop: '1px solid #e5e7eb' }}>
                        <form onSubmit={handleSend} style={{ display: 'flex', gap: '1rem' }}>
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Share what's on your mind..."
                                style={{
                                    flex: 1,
                                    padding: '1rem 1.5rem',
                                    borderRadius: '30px',
                                    border: '1px solid #d8b4fe',
                                    outline: 'none',
                                    fontSize: '1.1rem',
                                    backgroundColor: '#faf5ff'
                                }}
                            />
                            <button
                                type="submit"
                                style={{
                                    width: '50px',
                                    height: '50px',
                                    borderRadius: '50%',
                                    backgroundColor: '#8b5cf6',
                                    color: 'white',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '1.2rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'transform 0.2s',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                                onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                                onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                            >
                                ➤
                            </button>
                        </form>
                    </div>
                </div>

                {/* Resources Panel */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    <div className="glass-card" style={{ backgroundColor: '#fff1f2', border: '1px solid #fecdd3' }}>
                        <h3 style={{ color: '#e11d48', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>🆘</span> Need Immediate Help?
                        </h3>
                        <p style={{ fontSize: '0.9rem', color: '#881337', marginBottom: '1rem' }}>
                            If you are in distress, please reach out to professional support.
                        </p>
                        <button className="btn-emergency" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: 'none', backgroundColor: '#e11d48', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
                            Call Helpline (Kiran - 1800-599-0019)
                        </button>
                    </div>

                    <div className="glass-card" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                        <h3 style={{ color: '#166534', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>🧘</span> Quick Exercises
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            <button style={{ padding: '0.8rem', textAlign: 'left', borderRadius: '8px', border: '1px solid #86efac', backgroundColor: 'white', color: '#166534', cursor: 'pointer', fontWeight: '500' }}>
                                🌬️ 4-7-8 Breathing
                            </button>
                            <button style={{ padding: '0.8rem', textAlign: 'left', borderRadius: '8px', border: '1px solid #86efac', backgroundColor: 'white', color: '#166534', cursor: 'pointer', fontWeight: '500' }}>
                                🧘‍♀️ 5-Minute Meditation
                            </button>
                            <button style={{ padding: '0.8rem', textAlign: 'left', borderRadius: '8px', border: '1px solid #86efac', backgroundColor: 'white', color: '#166534', cursor: 'pointer', fontWeight: '500' }}>
                                🎶 Calming Sounds
                            </button>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}

export default MentalHealth;
