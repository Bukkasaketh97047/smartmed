import { useAuth } from '../context/AuthContext';
import { getFamilyProfiles, addFamilyProfile, deleteFamilyProfile as deleteFamilyProfileApi } from '../services/api';

function FamilyProfiles() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [profiles, setProfiles] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newName, setNewName] = useState("");
    const [newRelation, setNewRelation] = useState("");
    const [newAge, setNewAge] = useState("");
    const showToast = useToast();

    useEffect(() => {
        if (user) {
            fetchProfiles();
        }
    }, [user]);

    const fetchProfiles = async () => {
        try {
            const res = await getFamilyProfiles(user.username);
            setProfiles(res.data);
        } catch (error) {
            console.error("Fetch profiles failed");
        }
    };

    const handleAddProfile = async (e) => {
        e.preventDefault();
        if (!newName || !newRelation) return;

        try {
            const colors = ["#6366f1", "#f43f5e", "#22c55e", "#f59e0b", "#ec4899"];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];

            const profileData = {
                name: newName,
                relation: newRelation,
                age: parseInt(newAge) || 0,
                color: randomColor
            };

            await addFamilyProfile(user.username, profileData);
            fetchProfiles();
            setNewName("");
            setNewRelation("");
            setNewAge("");
            setShowAddForm(false);
            showToast(`${newName}'s profile created!`);
        } catch (error) {
            showToast("Failed to create profile");
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
        <div className="premium-container animate-fade-in" style={{ maxWidth: '900px' }}>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Family Health Profiles</h1>
                <p className="text-muted">Manage health records and reminders for your entire family from a single dashboard.</p>
            </div>

            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                {profiles.map(p => (
                    <div key={p.id} className="glass-card animate-slide-up" style={{ padding: '2rem', textAlign: 'center', position: 'relative' }}>
                        <button
                            onClick={() => handleDeleteProfile(p.id)}
                            style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', opacity: 0.5 }}
                        >
                            🗑️
                        </button>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            background: p.color,
                            margin: '0 auto 1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '2rem',
                            fontWeight: '700',
                            color: 'white',
                            boxShadow: `0 10px 20px ${p.color}44`
                        }}>
                            {p.name.charAt(0)}
                        </div>
                        <h2 style={{ marginBottom: '0.5rem' }}>{p.name}</h2>
                        <div style={{ color: 'var(--secondary)', fontWeight: '600', marginBottom: '0.5rem' }}>{p.relation}</div>
                        <div className="text-muted" style={{ fontSize: '0.9rem' }}>Age: {p.age || 'N/A'}</div>

                        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                            <button
                                className="nav-link"
                                style={{ fontSize: '0.8rem' }}
                                onClick={() => navigate('/reminders', { state: { forPerson: p.name } })}
                            >
                                📅 Reminders
                            </button>
                            <button
                                className="nav-link"
                                style={{ fontSize: '0.8rem' }}
                                onClick={() => navigate('/records', { state: { forPerson: p.name } })}
                            >
                                📋 Records
                            </button>
                        </div>
                    </div>
                ))}

                {/* Add Profile Card/Button */}
                {!showAddForm ? (
                    <div
                        className="glass-card"
                        onClick={() => setShowAddForm(true)}
                        style={{
                            padding: '2rem',
                            textAlign: 'center',
                            border: '2px dashed var(--glass-border)',
                            background: 'transparent',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <div style={{ fontSize: '3rem', color: 'var(--glass-border)', marginBottom: '1rem' }}>+</div>
                        <h3 className="text-muted">Add Family Member</h3>
                    </div>
                ) : (
                    <div className="glass-card animate-scale-in" style={{ padding: '2rem' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>New Profile</h3>
                        <form onSubmit={handleAddProfile}>
                            <div className="input-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    placeholder="Enter name"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="input-group" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '0.5rem' }}>
                                <div>
                                    <label>Relation</label>
                                    <input
                                        type="text"
                                        placeholder="Brother, Wife, etc."
                                        value={newRelation}
                                        onChange={(e) => setNewRelation(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label>Age</label>
                                    <input
                                        type="number"
                                        placeholder="Age"
                                        value={newAge}
                                        onChange={(e) => setNewAge(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="submit" className="btn-premium" style={{ flex: 1, padding: '0.7rem' }}>Save</button>
                                <button type="button" className="btn-logout" style={{ flex: 1, padding: '0.7rem' }} onClick={() => setShowAddForm(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}

export default FamilyProfiles;
