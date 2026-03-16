import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getReminders, addReminder, deleteReminder as deleteReminderApi } from '../services/api';

function MedicineReminders() {
    const { user } = useAuth();
    const location = useLocation();
    const [reminders, setReminders] = useState([]);
    const [newName, setNewName] = useState("");
    const [newTime, setNewTime] = useState("");
    const [newFreq, setNewFreq] = useState("1-0-1");
    const [newFor, setNewFor] = useState(location.state?.forPerson || "Self");
    const showToast = useToast();

    useEffect(() => {
        if (user) {
            fetchReminders();
        }
        if ("Notification" in window) {
            Notification.requestPermission();
        }
    }, [user]);

    const fetchReminders = async () => {
        try {
            const res = await getReminders(user.username);
            setReminders(res.data);
        } catch (error) {
            console.error("Fetch reminders failed");
        }
    };

    const handleAddReminder = async (e) => {
        e.preventDefault();
        if (!newName || !newTime) return;

        try {
            const reminderData = {
                medicineName: newName,
                time: newTime,
                frequency: newFreq,
                forPerson: newFor,
                active: true
            };
            await addReminder(user.username, reminderData);
            fetchReminders();
            setNewName("");
            setNewTime("");
            showToast(`Reminder set for ${newName} (${newFor})!`);
        } catch (error) {
            showToast("Failed to add reminder");
        }
    };

    const toggleReminder = (id) => {
        // Toggle logic could call an update API if needed
        setReminders(reminders.map(r =>
            r.id === id ? { ...r, active: !r.active } : r
        ));
    };

    const handleDeleteReminder = async (id) => {
        try {
            await deleteReminderApi(id);
            fetchReminders();
            showToast("Reminder removed.");
        } catch (error) {
            showToast("Failed to delete reminder");
        }
    };

    const triggerTestNotification = () => {
        if (Notification.permission === "granted") {
            new Notification("SmartMed Reminder", {
                body: "Time to take your Dolo 650. Stay healthy!",
                icon: "/logo192.png"
            });
        } else {
            showToast("Please enable notifications in your browser.");
        }
    };

    return (
        <div className="premium-container animate-fade-in" style={{ maxWidth: '800px' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>Medicine Reminders</h1>
                <p className="text-muted">Set up your schedule and never miss a dose. August will alert you.</p>
                <button className="nav-link" onClick={triggerTestNotification} style={{ marginTop: '1rem' }}>🔔 Test Notification</button>
            </div>

            {/* Add Reminder Form */}
            <div className="glass-card" style={{ marginBottom: '3rem' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>Add New Schedule</h3>
                <form onSubmit={handleAddReminder} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
                    <div className="input-group" style={{ marginBottom: 0 }}>
                        <label>Medicine</label>
                        <input
                            type="text"
                            placeholder="e.g. Dolo 650"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                        />
                    </div>
                    <div className="input-group" style={{ marginBottom: 0 }}>
                        <label>For Whom</label>
                        <select
                            value={newFor}
                            onChange={(e) => setNewFor(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '1.1rem 1.4rem',
                                background: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '16px',
                                color: 'white'
                            }}
                        >
                            <option value="Self">Self</option>
                            <option value="Mother">Mother</option>
                            <option value="Father">Father</option>
                            <option value="Brother">Brother</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div className="input-group" style={{ marginBottom: 0 }}>
                        <label>Time</label>
                        <input
                            type="time"
                            value={newTime}
                            onChange={(e) => setNewTime(e.target.value)}
                        />
                    </div>
                    <div className="input-group" style={{ marginBottom: 0 }}>
                        <label>Frequency</label>
                        <select
                            value={newFreq}
                            onChange={(e) => setNewFreq(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '1.1rem 1.4rem',
                                background: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '16px',
                                color: 'white'
                            }}
                        >
                            <option value="1-0-1">1-0-1 (M&N)</option>
                            <option value="1-1-1">1-1-1 (M,A,N)</option>
                            <option value="Daily">Daily</option>
                            <option value="Weekly">Weekly</option>
                        </select>
                    </div>
                    <button type="submit" className="btn-premium" style={{ height: '58px', borderRadius: '16px' }}>Add</button>
                </form>
            </div>

            {/* Active Reminders List */}
            <div className="glass-card">
                <h3 style={{ marginBottom: '1.5rem' }}>Your Active Schedule</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {reminders.length === 0 && <p className="text-muted" style={{ textAlign: 'center' }}>No active reminders set.</p>}
                    {reminders.map(r => (
                        <div key={r.id} className="glass-card" style={{ padding: '1.2rem', background: r.active ? 'rgba(99, 102, 241, 0.03)' : 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ opacity: r.active ? 1 : 0.5 }}>
                                <div style={{ fontWeight: '700', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {r.medicineName}
                                    {!r.active && <span style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.1)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>Paused</span>}
                                </div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                    ⏰ {r.time} • 🔄 {r.frequency} • 👤 {r.forPerson}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button
                                    onClick={() => toggleReminder(r.id)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                                    title={r.active ? "Pause" : "Resume"}
                                >
                                    {r.active ? "⏸️" : "▶️"}
                                </button>
                                <button
                                    onClick={() => handleDeleteReminder(r.id)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                                    title="Delete"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default MedicineReminders;
