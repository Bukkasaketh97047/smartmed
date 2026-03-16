import React from 'react';

function AdherenceAnalytics() {

    // Mock data for the bar chart
    const weeklyData = [
        { day: 'Mon', percentage: 100 },
        { day: 'Tue', percentage: 100 },
        { day: 'Wed', percentage: 50 }, // Missed a dose
        { day: 'Thu', percentage: 100 },
        { day: 'Fri', percentage: 100 },
        { day: 'Sat', percentage: 100 },
        { day: 'Sun', percentage: 80 }
    ];

    return (
        <div className="dashboard-container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div className="dashboard-header" style={{ marginBottom: '2rem' }}>
                <h2>📈 Adherence Analytics</h2>
                <p className="text-muted">Track your medication habits and stay on top of your health goals.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>

                <div className="glass-card" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ fontSize: '1.2rem', color: '#6b7280', marginBottom: '0.5rem' }}>Current Streak</div>
                    <div style={{ fontSize: '3.5rem', fontWeight: 'bold', color: '#f59e0b', textShadow: '0 2px 10px rgba(245, 158, 11, 0.3)' }}>
                        🔥 4<span style={{ fontSize: '1.5rem', color: '#9ca3af', fontWeight: 'normal' }}> days</span>
                    </div>
                </div>

                <div className="glass-card" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ fontSize: '1.2rem', color: '#6b7280', marginBottom: '0.5rem' }}>Best Streak</div>
                    <div style={{ fontSize: '3.5rem', fontWeight: 'bold', color: '#10b981', textShadow: '0 2px 10px rgba(16, 185, 129, 0.3)' }}>
                        🏆 14<span style={{ fontSize: '1.5rem', color: '#9ca3af', fontWeight: 'normal' }}> days</span>
                    </div>
                </div>

                <div className="glass-card" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', backgroundColor: '#e0e7ff', border: '1px solid #c7d2fe' }}>
                    <div style={{ fontSize: '1.2rem', color: '#4338ca', marginBottom: '0.5rem' }}>Overall Adherence</div>
                    <div style={{ fontSize: '3.5rem', fontWeight: 'bold', color: '#4f46e5' }}>
                        92%
                    </div>
                    <div style={{ color: '#4338ca', fontSize: '0.9rem', marginTop: '0.5rem' }}>Awesome work!</div>
                </div>

            </div>

            <div className="glass-card" style={{ padding: '2rem' }}>
                <h3 style={{ marginBottom: '2rem' }}>Weekly Overview</h3>

                {/* Simple CSS Bar Chart */}
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '250px', paddingBottom: '1rem', borderBottom: '2px solid #e5e7eb', gap: '1rem' }}>
                    {weeklyData.map((data, idx) => (
                        <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: 'bold' }}>{data.percentage}%</div>

                            <div style={{
                                width: '100%',
                                maxWidth: '60px',
                                height: '200px',
                                backgroundColor: '#f3f4f6',
                                borderRadius: '8px',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    height: `${data.percentage}%`,
                                    backgroundColor: data.percentage === 100 ? '#10b981' : data.percentage > 50 ? '#f59e0b' : '#ef4444',
                                    borderRadius: '8px',
                                    transition: 'height 1s ease'
                                }} />
                            </div>

                            <div style={{ fontWeight: '500', color: '#374151' }}>{data.day}</div>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '15px', height: '15px', borderRadius: '50%', backgroundColor: '#10b981' }}></div>
                        <span style={{ color: '#4b5563' }}>Perfect (100%)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '15px', height: '15px', borderRadius: '50%', backgroundColor: '#f59e0b' }}></div>
                        <span style={{ color: '#4b5563' }}>Missed 1 Dose</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '15px', height: '15px', borderRadius: '50%', backgroundColor: '#ef4444' }}></div>
                        <span style={{ color: '#4b5563' }}>Missed Mutiple</span>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default AdherenceAnalytics;
