import React, { useState } from 'react';

const availableDrugs = [
    'Aspirin', 'Warfarin', 'Lisinopril', 'Potassium', 'Ibuprofen',
    'Naproxen', 'Amoxicillin', 'Birth Control', 'Metformin', 'Alcohol',
    'Paracetamol', 'Cetirizine', 'Dolo 650', 'Rosuvastatin'
];

const interactionDatabase = [
    { drugs: ['Aspirin', 'Warfarin'], severity: 'High', description: 'Increased risk of severe bleeding. Avoid combining.' },
    { drugs: ['Lisinopril', 'Potassium'], severity: 'Moderate', description: 'May cause elevated potassium levels in the blood. Monitor closely.' },
    { drugs: ['Ibuprofen', 'Naproxen'], severity: 'High', description: 'Increased risk of gastrointestinal bleeding and kidney issues.' },
    { drugs: ['Amoxicillin', 'Birth Control'], severity: 'Low', description: 'May slightly reduce birth control effectiveness. Consider backup method.' },
    { drugs: ['Metformin', 'Alcohol'], severity: 'High', description: 'Increased risk of rare but serious condition called lactic acidosis.' },
    { drugs: ['Paracetamol', 'Alcohol'], severity: 'Moderate', description: 'Increased risk of liver damage when combined.' }
];

function DrugInteraction() {
    const [selectedDrugs, setSelectedDrugs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [interactions, setInteractions] = useState([]);

    const handleAddDrug = (drug) => {
        if (!selectedDrugs.includes(drug)) {
            const newSelections = [...selectedDrugs, drug];
            setSelectedDrugs(newSelections);
            checkInteractions(newSelections);
        }
        setSearchTerm('');
    };

    const handleRemoveDrug = (drugToRemove) => {
        const newSelections = selectedDrugs.filter(d => d !== drugToRemove);
        setSelectedDrugs(newSelections);
        checkInteractions(newSelections);
    };

    const checkInteractions = (drugs) => {
        const foundInteractions = [];
        for (let i = 0; i < drugs.length; i++) {
            for (let j = i + 1; j < drugs.length; j++) {
                const drugA = drugs[i];
                const drugB = drugs[j];

                const match = interactionDatabase.find(
                    entry => (entry.drugs.includes(drugA) && entry.drugs.includes(drugB))
                );

                if (match) {
                    foundInteractions.push({
                        pair: [drugA, drugB],
                        ...match
                    });
                }
            }
        }
        setInteractions(foundInteractions);
    };

    const filteredDrugs = availableDrugs.filter(d =>
        d.toLowerCase().includes(searchTerm.toLowerCase()) && !selectedDrugs.includes(d)
    );

    const getSeverityStyle = (severity) => {
        switch (severity) {
            case 'High': return { backgroundColor: '#ef4444', color: 'white' };
            case 'Moderate': return { backgroundColor: '#f59e0b', color: 'white' };
            case 'Low': return { backgroundColor: '#3b82f6', color: 'white' };
            default: return { backgroundColor: '#6b7280', color: 'white' };
        }
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header" style={{ marginBottom: '2rem' }}>
                <h2>💊 Drug Interaction Checker</h2>
                <p className="text-muted">Analyze potential interactions between multiple medications.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div className="dashboard-card">
                    <h3>Add Medications</h3>
                    <div style={{ marginBottom: '1rem', position: 'relative' }}>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search medication name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', zIndex: 10, maxHeight: '200px', overflowY: 'auto', marginTop: '4px' }}>
                                {filteredDrugs.length > 0 ? (
                                    filteredDrugs.map(drug => (
                                        <div
                                            key={drug}
                                            style={{ padding: '10px 15px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6' }}
                                            onClick={() => handleAddDrug(drug)}
                                        >
                                            {drug}
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ padding: '10px 15px', color: '#6b7280' }}>No medicines found.</div>
                                )}
                            </div>
                        )}
                    </div>

                    <div>
                        <h4>Selected Medicines:</h4>
                        {selectedDrugs.length === 0 ? (
                            <p className="text-muted">No medicines added yet.</p>
                        ) : (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
                                {selectedDrugs.map(drug => (
                                    <span key={drug} style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '0.4rem 0.8rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500' }}>
                                        {drug}
                                        <button onClick={() => handleRemoveDrug(drug)} style={{ background: 'none', border: 'none', color: '#0369a1', cursor: 'pointer', padding: 0, fontSize: '1.2rem', lineHeight: 1 }}>&times;</button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="dashboard-card">
                    <h3>Interaction Analysis Results</h3>
                    {selectedDrugs.length < 2 ? (
                        <div style={{ textAlign: 'center', padding: '2rem 0', color: '#6b7280' }}>
                            <p>Add at least 2 medications to see potential interactions.</p>
                        </div>
                    ) : interactions.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem 0', color: '#10b981' }}>
                            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>✅</span>
                            <h4>No Known Interactions Found</h4>
                            <p>Based on our database, there are no documented interactions between the selected medications.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {interactions.map((interaction, idx) => (
                                <div key={idx} style={{ padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                        <h4 style={{ margin: 0 }}>
                                            {interaction.pair[0]} <span style={{ color: '#9ca3af', margin: '0 0.5rem' }}>+</span> {interaction.pair[1]}
                                        </h4>
                                        <span style={{ padding: '0.2rem 0.6rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold', ...getSeverityStyle(interaction.severity) }}>
                                            {interaction.severity} Risk
                                        </span>
                                    </div>
                                    <p style={{ margin: 0, color: '#4b5563', lineHeight: 1.5 }}>
                                        {interaction.description}
                                    </p>
                                </div>
                            ))}
                            <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#fffbeb', color: '#b45309', borderRadius: '8px', fontSize: '0.9rem' }}>
                                <strong>Disclaimer:</strong> This tool provides general information and does not replace professional medical advice. Always consult your doctor before changing medication.
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default DrugInteraction;
