import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';

function MedicalRecords() {
    const location = useLocation();
    const forPerson = location.state?.forPerson || "Self";

    const [records, setRecords] = useState([
        { id: 1, type: "Prescription", date: "Oct 20, 2023", doctor: "Dr. Smith", file: "prescription_v1.pdf", person: "Self" },
        { id: 2, type: "Lab Report", date: "Oct 15, 2023", hospital: "Apollo Hospitals", file: "blood_test.pdf", person: "Mother" }
    ]);

    const filteredRecords = records.filter(r => r.person === forPerson || forPerson === "All");

    return (
        <div className="premium-container animate-fade-in">
            <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Medical Records</h1>
                <p className="text-muted">Securely store and access medical documents for <strong>{forPerson === "All" ? "the whole family" : forPerson}</strong>.</p>
            </header>

            <div className="glass-card" style={{ maxWidth: '900px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ margin: 0 }}>Documents</h2>
                    <button className="btn-premium" style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}>+ Upload New</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {filteredRecords.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', opacity: 0.5 }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📂</div>
                            <p>No records found for {forPerson}.</p>
                        </div>
                    ) : (
                        filteredRecords.map(r => (
                            <div key={r.id} className="glass-card" style={{ padding: '1.2rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                    <div style={{ fontSize: '2rem' }}>📄</div>
                                    <div>
                                        <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>{r.type}</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                            {r.date} • {r.doctor || r.hospital} • 👤 {r.person}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button className="nav-link" style={{ fontSize: '0.85rem' }}>View</button>
                                    <button className="nav-link" style={{ fontSize: '0.85rem' }}>Download</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="glass-card" style={{ maxWidth: '900px', margin: '2rem auto', background: 'rgba(34, 197, 94, 0.05)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ fontSize: '1.5rem' }}>🛡️</div>
                    <div>
                        <h4 style={{ margin: 0, color: '#22c55e' }}>Secure Storage</h4>
                        <p className="text-muted" style={{ fontSize: '0.85rem', margin: '0.2rem 0 0' }}>All your medical records are encrypted and only accessible by you.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MedicalRecords;
