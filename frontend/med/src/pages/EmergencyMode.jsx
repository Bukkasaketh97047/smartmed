import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

function EmergencyMode() {
    const { user } = useAuth();
    const { showToast } = useToast();

    const handleCall = (number, name) => {
        showToast(`Calling ${name} (${number})...`, "error");
        window.location.href = `tel:${number}`;
    };

    const handleSOS = () => {
        showToast("SOS Alert sent to Emergency Contacts with your Location!", "error");
        // Simulate SOS sending delay
        setTimeout(() => {
            showToast("Ambulance dispatched to your location.", "success");
        }, 3000);
    };

    return (
        <div style={{ minHeight: '80vh', backgroundColor: '#fef2f2', padding: '2rem', borderRadius: '16px', border: '2px solid #fee2e2' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 style={{ color: '#dc2626', fontSize: '3rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '4rem' }}>🚨</span> EMERGENCY MODE
                </h1>
                <p style={{ color: '#991b1b', fontSize: '1.2rem', fontWeight: '500' }}>If this is a life-threatening emergency, call 108 immediately.</p>

                <button
                    onClick={handleSOS}
                    style={{
                        marginTop: '2rem',
                        padding: '1.5rem 4rem',
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        backgroundColor: '#dc2626',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50px',
                        cursor: 'pointer',
                        boxShadow: '0 10px 25px rgba(220, 38, 38, 0.4)',
                        transition: 'transform 0.2s ease',
                        textTransform: 'uppercase',
                        letterSpacing: '2px'
                    }}
                    onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                    onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                >
                    Send SOS Alert
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', maxWidth: '1200px', margin: '0 auto' }}>

                {/* Quick Contacts */}
                <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                    <h2 style={{ color: '#1f2937', marginBottom: '1.5rem', borderBottom: '2px solid #f3f4f6', paddingBottom: '0.5rem' }}>
                        Quick Call Lines
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <button onClick={() => handleCall('108', 'Ambulance')} className="btn-emergency-contact" style={contactBtnStyle('#dc2626')}>
                            <span style={{ fontSize: '1.5rem' }}>🚑</span>
                            <div style={{ textAlign: 'left', flex: 1 }}>
                                <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Ambulance (Emergency)</div>
                                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>108</div>
                            </div>
                        </button>
                        <button onClick={() => handleCall('100', 'Police')} className="btn-emergency-contact" style={contactBtnStyle('#2563eb')}>
                            <span style={{ fontSize: '1.5rem' }}>🚓</span>
                            <div style={{ textAlign: 'left', flex: 1 }}>
                                <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Police</div>
                                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>100</div>
                            </div>
                        </button>
                        <button onClick={() => handleCall('1066', 'Poison Control')} className="btn-emergency-contact" style={contactBtnStyle('#d97706')}>
                            <span style={{ fontSize: '1.5rem' }}>☣️</span>
                            <div style={{ textAlign: 'left', flex: 1 }}>
                                <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Poison Control</div>
                                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>1066</div>
                            </div>
                        </button>

                        {user && (
                            <div style={{ marginTop: '1rem' }}>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#4b5563' }}>Personal Contacts</h3>
                                <button onClick={() => handleCall('+91 9876543210', 'Primary Relative')} className="btn-emergency-contact" style={contactBtnStyle('#10b981')}>
                                    <span style={{ fontSize: '1.5rem' }}>👤</span>
                                    <div style={{ textAlign: 'left', flex: 1 }}>
                                        <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Primary Relative</div>
                                        <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>+91 9876543210</div>
                                    </div>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* First Aid Guide */}
                <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                    <h2 style={{ color: '#1f2937', marginBottom: '1.5rem', borderBottom: '2px solid #f3f4f6', paddingBottom: '0.5rem' }}>
                        Immediate First Aid Guides
                    </h2>
                    <div className="accordion-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                        <details style={accordionStyle}>
                            <summary style={summaryStyle}>❤️ CPR (Cardiopulmonary Resuscitation)</summary>
                            <div style={accordionContentStyle}>
                                <ol style={{ paddingLeft: '1.5rem', margin: 0, color: '#4b5563' }}>
                                    <li>Check for responsiveness and breathing.</li>
                                    <li>Call emergency services (108).</li>
                                    <li>Place hands in center of chest.</li>
                                    <li>Push hard and fast (100-120 beats per minute, 2 inches deep).</li>
                                    <li>Continue until help arrives or person breathes.</li>
                                </ol>
                            </div>
                        </details>

                        <details style={accordionStyle}>
                            <summary style={summaryStyle}>🔥 Burns</summary>
                            <div style={accordionContentStyle}>
                                <ul style={{ paddingLeft: '1.5rem', margin: 0, color: '#4b5563' }}>
                                    <li>Cool the burn under cool (not cold) running water for 10-15 mins.</li>
                                    <li>Remove rings or tight items from the burned area.</li>
                                    <li>Don't break blisters.</li>
                                    <li>Apply aloe vera lotion or gel.</li>
                                    <li>Loosely wrap with sterile gauze.</li>
                                </ul>
                            </div>
                        </details>

                        <details style={accordionStyle}>
                            <summary style={summaryStyle}>🩸 Severe Bleeding</summary>
                            <div style={accordionContentStyle}>
                                <ul style={{ paddingLeft: '1.5rem', margin: 0, color: '#4b5563' }}>
                                    <li>Apply direct, firm pressure to the wound with a clean cloth.</li>
                                    <li>Do not remove the cloth if it soaks through; add another on top.</li>
                                    <li>Elevate the injured area above the heart if possible.</li>
                                    <li>Keep pressure applied until help arrives.</li>
                                </ul>
                            </div>
                        </details>

                        <details style={accordionStyle}>
                            <summary style={summaryStyle}>😮 Choking</summary>
                            <div style={accordionContentStyle}>
                                <ul style={{ paddingLeft: '1.5rem', margin: 0, color: '#4b5563' }}>
                                    <li>Give 5 back blows between shoulder blades with heel of hand.</li>
                                    <li>Give 5 abdominal thrusts (Heimlich maneuver).</li>
                                    <li>Alternate until the blockage is dislodged.</li>
                                </ul>
                            </div>
                        </details>

                    </div>
                </div>

            </div>
        </div>
    );
}

const contactBtnStyle = (color) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem 1.5rem',
    backgroundColor: color,
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    width: '100%',
    transition: 'opacity 0.2s ease',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
});

const accordionStyle = {
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    overflow: 'hidden'
};

const summaryStyle = {
    padding: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    backgroundColor: '#f3f4f6',
    outline: 'none'
};

const accordionContentStyle = {
    padding: '1rem',
    backgroundColor: 'white',
    borderTop: '1px solid #e5e7eb'
};

export default EmergencyMode;
