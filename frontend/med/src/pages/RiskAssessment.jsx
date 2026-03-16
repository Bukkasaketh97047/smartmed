import React, { useState } from 'react';

function RiskAssessment() {
    const [step, setStep] = useState(1);
    const [answers, setAnswers] = useState({
        age: '',
        weightStatus: '',
        activityLevel: '',
        familyHistory: '',
        smoking: ''
    });
    const [result, setResult] = useState(null);

    const handleNext = () => setStep(step + 1);
    const handlePrev = () => setStep(step - 1);

    const handleAnswer = (field, value) => {
        setAnswers({ ...answers, [field]: value });
    };

    const calculateRisk = () => {
        let score = 0;

        // Simple mock scoring logic
        if (answers.age === '>50') score += 2;
        if (answers.weightStatus === 'overweight') score += 2;
        if (answers.activityLevel === 'low') score += 2;
        if (answers.familyHistory === 'yes') score += 3;
        if (answers.smoking === 'yes') score += 3;

        let riskLevel = 'Low Risk';
        let riskColor = '#10b981';
        let recommendations = [];

        if (score >= 8) {
            riskLevel = 'High Risk';
            riskColor = '#ef4444';
            recommendations = [
                "Consult a doctor for a comprehensive checkup immediately.",
                "Consider our August Diagnoser for specific symptoms.",
                "Strictly monitor your blood pressure and sugar levels."
            ];
        } else if (score >= 4) {
            riskLevel = 'Moderate Risk';
            riskColor = '#f59e0b';
            recommendations = [
                "Increase daily physical activity (aim for 30 mins/day).",
                "Schedule a routine health checkup this year.",
                "Consider dietary improvements and reducing stress."
            ];
        } else {
            recommendations = [
                "Maintain your current healthy lifestyle!",
                "Continue regular exercising and balanced diet.",
                "Keep up with regular annual checkups."
            ];
        }

        setResult({ level: riskLevel, color: riskColor, details: recommendations });
        setStep(6);
    };

    return (
        <div className="dashboard-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="dashboard-header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📋 Disease Risk Assessment</h2>
                <p className="text-muted">Take this quick 5-question survey to understand your general health risks.</p>
            </div>

            <div className="glass-card" style={{ padding: '3rem 2rem' }}>
                {step === 1 && (
                    <div className="animate-fade-in">
                        <h3 style={{ marginBottom: '2rem', textAlign: 'center' }}>1. What is your age group?</h3>
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {['<30', '30-50', '>50'].map(val => (
                                <button
                                    key={val}
                                    onClick={() => { handleAnswer('age', val); handleNext(); }}
                                    className={`btn-outline ${answers.age === val ? 'active' : ''}`}
                                    style={{ padding: '1rem', fontSize: '1.2rem', borderRadius: '12px' }}
                                >
                                    {val === '<30' ? 'Under 30' : val === '30-50' ? '30 to 50' : 'Over 50'}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="animate-slide-up">
                        <h3 style={{ marginBottom: '2rem', textAlign: 'center' }}>2. How would you describe your weight?</h3>
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {['underweight', 'normal', 'overweight'].map(val => (
                                <button
                                    key={val}
                                    onClick={() => { handleAnswer('weightStatus', val); handleNext(); }}
                                    className={`btn-outline ${answers.weightStatus === val ? 'active' : ''}`}
                                    style={{ padding: '1rem', fontSize: '1.2rem', borderRadius: '12px', textTransform: 'capitalize' }}
                                >
                                    {val}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="animate-slide-up">
                        <h3 style={{ marginBottom: '2rem', textAlign: 'center' }}>3. What is your activity level?</h3>
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {[
                                { val: 'high', label: 'High (Exercise 4+ times/week)' },
                                { val: 'moderate', label: 'Moderate (Exercise 1-3 times/week)' },
                                { val: 'low', label: 'Low (Rarely exercise)' }
                            ].map(opt => (
                                <button
                                    key={opt.val}
                                    onClick={() => { handleAnswer('activityLevel', opt.val); handleNext(); }}
                                    className={`btn-outline ${answers.activityLevel === opt.val ? 'active' : ''}`}
                                    style={{ padding: '1rem', fontSize: '1.2rem', borderRadius: '12px' }}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div className="animate-slide-up">
                        <h3 style={{ marginBottom: '2rem', textAlign: 'center' }}>4. Do you have a family history of chronic diseases? <br /><span style={{ fontSize: '1rem', color: '#6b7280' }}>(e.g., Heart disease, Diabetes)</span></h3>
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {['yes', 'no'].map(val => (
                                <button
                                    key={val}
                                    onClick={() => { handleAnswer('familyHistory', val); handleNext(); }}
                                    className={`btn-outline ${answers.familyHistory === val ? 'active' : ''}`}
                                    style={{ padding: '1rem', fontSize: '1.2rem', borderRadius: '12px', textTransform: 'capitalize' }}
                                >
                                    {val}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {step === 5 && (
                    <div className="animate-slide-up">
                        <h3 style={{ marginBottom: '2rem', textAlign: 'center' }}>5. Do you currently smoke?</h3>
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {['yes', 'no'].map(val => (
                                <button
                                    key={val}
                                    onClick={() => { handleAnswer('smoking', val); calculateRisk(); }}
                                    className={`btn-outline ${answers.smoking === val ? 'active' : ''}`}
                                    style={{ padding: '1rem', fontSize: '1.2rem', borderRadius: '12px', textTransform: 'capitalize' }}
                                >
                                    {val}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {step === 6 && result && (
                    <div className="animate-scale-in" style={{ textAlign: 'center' }}>
                        <h2 style={{ marginBottom: '1rem' }}>Your Assessment Result</h2>
                        <div style={{
                            display: 'inline-block',
                            padding: '1.5rem 3rem',
                            borderRadius: '50px',
                            backgroundColor: `${result.color}22`,
                            color: result.color,
                            border: `2px solid ${result.color}`,
                            fontSize: '2rem',
                            fontWeight: 'bold',
                            marginBottom: '2rem'
                        }}>
                            {result.level}
                        </div>

                        <div style={{ textAlign: 'left', backgroundColor: 'rgba(255,255,255,0.05)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                            <h3 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Recommendations:</h3>
                            <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.8' }}>
                                {result.details.map((rec, idx) => (
                                    <li key={idx} style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{rec}</li>
                                ))}
                            </ul>
                        </div>

                        <button
                            onClick={() => { setStep(1); setAnswers({ age: '', weightStatus: '', activityLevel: '', familyHistory: '', smoking: '' }); setResult(null); }}
                            className="nav-link"
                            style={{ marginTop: '2rem' }}
                        >
                            🔄 Retake Assessment
                        </button>
                    </div>
                )}

                {/* Progress Navigation */}
                {step > 1 && step < 6 && (
                    <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-start' }}>
                        <button onClick={handlePrev} className="nav-link" style={{ padding: '0.5rem 1rem' }}>← Previous</button>
                    </div>
                )}

                {step < 6 && (
                    <div style={{ marginTop: '1rem', textAlign: 'center', color: '#6b7280', fontSize: '0.9rem' }}>
                        Step {step} of 5
                    </div>
                )}

            </div>
        </div>
    );
}

export default RiskAssessment;
