import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { chatWithAugust, getFamilyProfiles, addFamilyProfile, deleteFamilyProfile as deleteFamilyProfileApi } from '../services/api';

const AUGUST_MODES = [
    { id: 'health', label: 'August AI', icon: '🤖', description: 'Your personal health advisor' },
    { id: 'mind', label: 'August Mind', icon: '🌿', description: 'Mental wellness & support' },
    { id: 'family', label: 'Family Hub', icon: '👨‍👩‍👧‍👦', description: 'Manage family health' }
];

const SUGGESTED_PROMPTS = {
    health: [
        { label: "🌡️ Fever guidance", text: "I have a fever, what should I do?" },
        { label: "🤕 Headache relief", text: "Can you suggest something for a bad headache?" },
        { label: "🥗 Healthy diet", text: "Give me some tips for a heart-healthy diet." }
    ],
    mind: [
        { label: "🧘 Stress check", text: "I'm feeling very stressed lately." },
        { label: "😴 Better sleep", text: "I can't sleep, any advice?" },
        { label: "✨ Mindfulness", text: "How can I practice mindfulness today?" }
    ]
};

const HEALTH_TIPS = [
    "Drinking enough water is essential for your body to function properly.",
    "Walking just 30 minutes a day can significantly improve your cardiovascular health.",
    "Prioritize 7-9 hours of sleep each night for better focus and mood.",
    "Eating a variety of colorful vegetables ensures you get a wide range of vitamins.",
    "Taking short breaks from screens every 20 minutes can reduce eye strain."
];

function AugustCompanion() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const showToast = useToast();
    
    // UI State
    const [loading, setLoading] = useState(false);
    const [activeMode, setActiveMode] = useState('health');
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [zenMode, setZenMode] = useState(false);
    const [timer, setTimer] = useState(0); 
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [dailyTip] = useState(HEALTH_TIPS[Math.floor(Math.random() * HEALTH_TIPS.length)]);
    const chatEndRef = useRef(null);
    const timerRef = useRef(null);

    // Family State
    const [profiles, setProfiles] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newName, setNewName] = useState("");
    const [newRelation, setNewRelation] = useState("");
    const [newAge, setNewAge] = useState("");

    useEffect(() => {
        // Initial messages based on mode
        if (activeMode === 'health') {
            setMessages([{ id: 1, text: "Hi, I'm August, your AI health companion 👋. How can I help you today?", sender: 'ai' }]);
        } else if (activeMode === 'mind') {
            setMessages([{ id: 1, text: "Welcome to August Mind. I'm here to listen. How are you feeling right now?", sender: 'ai' }]);
        }
    }, [activeMode]);

    useEffect(() => {
        if (user) {
            fetchProfiles();
        }
    }, [user, activeMode === 'family']); // Stable condition

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchProfiles = async () => {
        if (!user) return;
        try {
            const res = await getFamilyProfiles(user.username);
            setProfiles(res.data);
        } catch (error) {
            console.error("Fetch profiles failed");
        }
    };

    useEffect(() => {
        if (isTimerRunning && timer > 0) {
            timerRef.current = setInterval(() => {
                setTimer(prev => prev - 1);
            }, 1000);
        } else if (timer === 0 && isTimerRunning) {
            handleTimerComplete();
        }
        return () => clearInterval(timerRef.current);
    }, [isTimerRunning, timer]);

    const handleTimerComplete = async () => {
        setIsTimerRunning(false);
        setZenMode(false);
        showToast("Mindfulness session complete! You've earned 5 SmartMed Coins! 🪙");
        // Reward user
        try {
            const { addWalletMoney } = await import("../context/AuthContext"); // Dynamic import for context hook isn't ideal but we have access to context via useAuth
            // Use user context to add money
            if (user) {
                // We'll use the existing addWalletMoney API
                const { addWalletMoney } = await import("../services/api");
                await addWalletMoney(user.username, 5);
                // Trigger context update if possible, but simplest is showing success
            }
        } catch (err) {
            console.error("Reward failed", err);
        }
    };

    const startZen = (duration) => {
        setTimer(duration * 60);
        setIsTimerRunning(true);
        setZenMode(true);
    };

    const handleSend = async (customInput) => {
        const messageToSend = customInput || input;
        if (!messageToSend.trim() || loading) return;

        const userMsg = { id: Date.now(), text: messageToSend, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        if (!customInput) setInput("");
        setLoading(true);

        try {
            const res = await chatWithAugust(messageToSend);
            let responseText = res.data;
            
            // Handle JSON objects (like errors or structured responses)
            if (typeof res.data === 'object' && res.data !== null) {
                responseText = res.data.message || res.data.error || JSON.stringify(res.data);
            }

            const aiMsg = { id: Date.now() + 1, text: responseText, sender: 'ai' };
            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            setMessages(prev => [...prev, { id: Date.now() + 1, text: "I'm having a bit of trouble connecting to my knowledge base. Let me try again in a bit!", sender: 'ai' }]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddProfile = async (e) => {
        e.preventDefault();
        try {
            const colors = ["#6366f1", "#f43f5e", "#22c55e", "#f59e0b", "#ec4899"];
            const profileData = {
                name: newName,
                relation: newRelation,
                age: parseInt(newAge) || 0,
                color: colors[Math.floor(Math.random() * colors.length)]
            };
            await addFamilyProfile(user.username, profileData);
            fetchProfiles();
            setNewName(""); setNewRelation(""); setNewAge("");
            setShowAddForm(false);
            showToast(`${newName}'s profile added to your family.`);
        } catch (error) {
            showToast("Failed to add profile");
        }
    };

    const handleDeleteProfile = async (id) => {
        try {
            await deleteFamilyProfileApi(id);
            fetchProfiles();
            showToast("Profile removed.");
        } catch (error) {
            showToast("Failed to delete profile");
        }
    };

    return (
        <div className="premium-container animate-fade-in" style={{ maxWidth: '1100px' }}>
            {/* Header */}
            <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '3.2rem', fontWeight: 900, marginBottom: '0.5rem' }}>
                    Welcome to <span style={{ background: 'linear-gradient(to right, #06b6d4, #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>August AI</span>
                </h1>
                <p className="text-muted">Your unified health, wellness, and family companion.</p>
            </header>

            <div className="grid" style={{ gridTemplateColumns: '300px 1fr', gap: '2rem', alignItems: 'start' }}>
                {/* Left Sidebar: Modes */}
                <div style={{ position: 'sticky', top: '2rem' }}>
                    <div className="glass-card" style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        {AUGUST_MODES.map(mode => (
                            <button
                                key={mode.id}
                                onClick={() => setActiveMode(mode.id)}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                    gap: '0.4rem',
                                    padding: '1.2rem',
                                    borderRadius: '16px',
                                    border: '1px solid',
                                    borderColor: activeMode === mode.id ? 'var(--primary)' : 'var(--glass-border)',
                                    background: activeMode === mode.id ? 'rgba(6, 182, 212, 0.1)' : 'transparent',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    textAlign: 'left',
                                    width: '100%'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                    <span style={{ fontSize: '1.5rem' }}>{mode.icon}</span>
                                    <span style={{ fontWeight: 800, color: activeMode === mode.id ? 'var(--primary)' : 'white' }}>{mode.label}</span>
                                </div>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{mode.description}</span>
                            </button>
                        ))}
                    </div>

                    {activeMode === 'mind' && (
                        <div className="glass-card animate-slide-up" style={{ marginTop: '1.5rem', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                            <h4 style={{ color: '#10b981', marginBottom: '0.8rem' }}>🧘 Peace Exercises</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <button className="nav-link" style={{ fontSize: '0.85rem', textAlign: 'left' }}>🌬️ 4-7-8 Breathing</button>
                                <button className="nav-link" style={{ fontSize: '0.85rem', textAlign: 'left' }}>🧘 5-Min Meditation</button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Main Content Area */}
                <div>
                    {activeMode === 'family' ? (
                        <div className="animate-fade-in">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <h3>Manage Family Profiles</h3>
                                <button className="btn-premium" onClick={() => setShowAddForm(true)}>+ Add Member</button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
                                {profiles.map(p => (
                                    <div key={p.id} className="glass-card" style={{ padding: '2rem', textAlign: 'center', position: 'relative' }}>
                                        <button onClick={() => handleDeleteProfile(p.id)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.3 }}>🗑️</button>
                                        <div style={{ 
                                            width: '60px', height: '60px', borderRadius: '50%', background: p.color, 
                                            margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                            fontSize: '1.5rem', fontWeight: 900, color: 'white' 
                                        }}>
                                            {p.name.charAt(0)}
                                        </div>
                                        <h4 style={{ marginBottom: '0.2rem' }}>{p.name}</h4>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>{p.relation}</div>
                                        <div style={{ marginTop: '1.2rem', display: 'flex', gap: '0.5rem' }}>
                                            <button className="nav-link" style={{ fontSize: '0.75rem', flex: 1 }} onClick={() => navigate('/reminders', { state: { forPerson: p.name } })}>⏰ Remind</button>
                                            <button className="nav-link" style={{ fontSize: '0.75rem', flex: 1 }} onClick={() => navigate('/records', { state: { forPerson: p.name } })}>📋 Records</button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {showAddForm && (
                                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
                                    <div className="glass-card animate-scale-in" style={{ maxWidth: '400px', width: '100%', padding: '2rem' }}>
                                        <h3 style={{ marginBottom: '1.5rem' }}>Add New Family Member</h3>
                                        <form onSubmit={handleAddProfile}>
                                            <div className="input-group">
                                                <label>Name</label>
                                                <input type="text" value={newName} onChange={e => setNewName(e.target.value)} required />
                                            </div>
                                            <div className="input-group">
                                                <label>Relation</label>
                                                <input type="text" value={newRelation} onChange={e => setNewRelation(e.target.value)} placeholder="Brother, Father, etc." required />
                                            </div>
                                            <div className="input-group">
                                                <label>Age</label>
                                                <input type="number" value={newAge} onChange={e => setNewAge(e.target.value)} />
                                            </div>
                                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                                <button type="submit" className="btn-premium" style={{ flex: 1 }}>Add</button>
                                                <button type="button" className="btn-logout" style={{ flex: 1 }} onClick={() => setShowAddForm(false)}>Cancel</button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Chat Mode (Health or Mind) */
                        <div className="glass-card animate-fade-in" style={{ height: '700px', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', position: 'relative' }}>
                            {/* Zen Mode Overlay */}
                            {zenMode && (
                                <div style={{
                                    position: 'absolute', inset: 0, background: 'rgba(2, 6, 23, 0.95)',
                                    zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'center',
                                    justifyContent: 'center', backdropFilter: 'blur(10px)', animation: 'fadeIn 0.5s'
                                }}>
                                    <div className="pulse-dot" style={{ 
                                        width: '200px', height: '200px', borderRadius: '50%',
                                        background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '3rem', fontWeight: '800', border: '5px solid rgba(255,255,255,0.1)',
                                        boxShadow: '0 0 50px var(--primary-glow)'
                                    }}>
                                        {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                                    </div>
                                    <p style={{ marginTop: '2rem', fontSize: '1.2rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                                        Breathe in... Breathe out...
                                    </p>
                                    <button 
                                        onClick={() => { setZenMode(false); setIsTimerRunning(false); }}
                                        style={{ marginTop: '3rem', padding: '0.8rem 2rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white' }}
                                    >
                                        End Session
                                    </button>
                                </div>
                            )}

                            <div className="chat-header" style={{ padding: '1.2rem 2rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ 
                                        width: '45px', height: '45px', borderRadius: '14px', 
                                        background: activeMode === 'mind' ? 'linear-gradient(135deg, #10b981 0%, #34d399 100%)' : 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)', 
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' 
                                    }}>
                                        {activeMode === 'mind' ? '🌿' : '🤖'}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>August AI • {activeMode === 'mind' ? 'Wellness' : 'Healthcare'}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div> Online & Thinking
                                        </div>
                                    </div>
                                </div>
                                {activeMode === 'mind' && (
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        {[1, 3, 5].map(min => (
                                            <button 
                                                key={min}
                                                onClick={() => startZen(min)}
                                                style={{ 
                                                    padding: '0.5rem 1rem', borderRadius: '12px', 
                                                    background: 'rgba(0, 200, 150, 0.1)', border: '1px solid var(--primary)',
                                                    color: 'var(--primary)', fontSize: '0.8rem', cursor: 'pointer'
                                                }}
                                            >
                                                {min}m Zen
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Health Tip Banner */}
                            {activeMode === 'health' && (
                                <div style={{ padding: '0.6rem 2rem', background: 'rgba(0, 200, 150, 0.05)', borderBottom: '1px solid rgba(0, 200, 150, 0.1)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <span style={{ fontSize: '1rem' }}>💡</span>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        <strong>Pro Tip:</strong> {dailyTip}
                                    </p>
                                </div>
                            )}

                            <div className="chat-messages" style={{ flex: 1, padding: '2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'rgba(0,0,0,0.1)' }}>
                                {messages.map(m => (
                                    <div key={m.id} style={{ 
                                        display: 'flex', justifyContent: m.sender === 'user' ? 'flex-end' : 'flex-start',
                                        maxWidth: '100%'
                                    }}>
                                        <div style={{
                                            maxWidth: '80%',
                                            padding: '1.2rem 1.6rem',
                                            borderRadius: m.sender === 'user' ? '24px 24px 4px 24px' : '24px 24px 24px 4px',
                                            background: m.sender === 'user' ? 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' : 'rgba(255,255,255,0.06)',
                                            color: 'white',
                                            border: m.sender === 'ai' ? '1px solid var(--glass-border)' : 'none',
                                            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                                            lineHeight: 1.6,
                                            fontSize: '0.95rem'
                                        }}>
                                            {m.text.split('\n').map((line, i) => (
                                                <p key={i} style={{ margin: 0 }}>{line}</p>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                {loading && (
                                    <div style={{ display: 'flex', gap: '8px', padding: '1rem' }}>
                                        <div className="pulse-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', animation: 'pulse 1.5s infinite' }}></div>
                                        <div className="pulse-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', animation: 'pulse 1.5s infinite 0.2s' }}></div>
                                        <div className="pulse-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', animation: 'pulse 1.5s infinite 0.4s' }}></div>
                                    </div>
                                )}
                                <div ref={chatEndRef} />
                            </div>

                            {/* Suggested Prompts */}
                            {SUGGESTED_PROMPTS[activeMode] && messages.length < 3 && (
                                <div style={{ padding: '1rem 2rem', display: 'flex', gap: '0.8rem', overflowX: 'auto', background: 'rgba(255,255,255,0.01)' }}>
                                    {SUGGESTED_PROMPTS[activeMode].map((prompt, i) => (
                                        <button 
                                            key={i} 
                                            onClick={() => handleSend(prompt.text)}
                                            style={{ 
                                                whiteSpace: 'nowrap', padding: '0.6rem 1.2rem', borderRadius: '20px', 
                                                background: 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)',
                                                color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer',
                                                transition: 'all 0.3s'
                                            }}
                                            onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
                                            onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'var(--glass-border)'; }}
                                        >
                                            {prompt.label}
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div className="chat-input-container" style={{ padding: '1.5rem 2rem', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid var(--glass-border)' }}>
                                <div style={{ position: 'relative', display: 'flex', gap: '1rem' }}>
                                    <input 
                                        type="text" 
                                        placeholder={activeMode === 'mind' ? "What's on your mind? I'm here to listen..." : "Ask me anything about your health..."}
                                        value={input}
                                        onChange={e => setInput(e.target.value)}
                                        onKeyPress={e => e.key === 'Enter' && handleSend()}
                                        style={{
                                            flex: 1, padding: '1.2rem 1.8rem', borderRadius: '24px', 
                                            background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
                                            color: 'white', outline: 'none', transition: 'all 0.3s'
                                        }}
                                    />
                                    <button 
                                        onClick={handleSend}
                                        disabled={!input.trim() || loading}
                                        className="btn-premium"
                                        style={{ height: '58px', width: '58px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}
                                    >
                                        ➤
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AugustCompanion;
