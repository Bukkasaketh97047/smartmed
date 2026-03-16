import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in Leaflet + Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons based on facility type
const getIconForType = (type) => {
    const color = type === 'Pharmacy' ? 'blue' : type === 'Hospital' ? 'red' : 'green';
    // Use a generic marker structure for simplicity, relying on popup or default colors
    return new L.Icon({
        iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
};

const userIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const mockFacilities = [
    { id: 1, name: "Apollo Pharmacy", type: "Pharmacy", distance: "0.8 km", status: "Open 24/7", phone: "1800-456-7890", address: "123 Main Road, City Center", lat: 17.3850, lng: 78.4867 },
    { id: 2, name: "City General Hospital", type: "Hospital", distance: "2.1 km", status: "Open 24/7", phone: "1800-111-2222", address: "45 Healthcare Blvd", lat: 17.3950, lng: 78.4900 },
    { id: 3, name: "MedPlus", type: "Pharmacy", distance: "1.2 km", status: "Closes at 11 PM", phone: "1800-999-8888", address: "Market Street, Block A", lat: 17.3750, lng: 78.4750 },
    { id: 4, name: "Sunrise Diagnostics", type: "Clinic", distance: "3.5 km", status: "Closes at 8 PM", phone: "1800-333-4444", address: "Green Valley Avenue", lat: 17.4050, lng: 78.4800 },
    { id: 5, name: "Care Emergency Center", type: "Hospital", distance: "4.0 km", status: "Open 24/7", phone: "1800-555-6666", address: "Ring Road, Sector 5", lat: 17.3650, lng: 78.4950 },
];

const USER_LOCATION = { lat: 17.3850, lng: 78.4867 }; // Central coordinates corresponding to Apollo roughly

function PharmacyFinder() {
    const [filter, setFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredFacilities = mockFacilities.filter(f => {
        const matchesType = filter === 'All' || f.type === filter;
        const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            f.address.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesType && matchesSearch;
    });

    return (
        <div className="dashboard-container">
            <div className="dashboard-header" style={{ marginBottom: '2rem' }}>
                <h2>📍 Medical Facility Finder</h2>
                <p className="text-muted">Find nearby pharmacies, hospitals, and clinics.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>

                {/* Interactive Map */}
                <div className="dashboard-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                        <h3 style={{ margin: 0 }}>Interactive Map</h3>
                    </div>
                    <div style={{ flex: 1, minHeight: '500px', position: 'relative', zIndex: 0 }}>
                        <MapContainer
                            center={[USER_LOCATION.lat, USER_LOCATION.lng]}
                            zoom={13}
                            style={{ height: "100%", width: "100%" }}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />

                            {/* User Location Marker */}
                            <Marker position={[USER_LOCATION.lat, USER_LOCATION.lng]} icon={userIcon}>
                                <Popup>
                                    <strong>Your Location</strong>
                                </Popup>
                            </Marker>

                            {/* Facility Markers */}
                            {filteredFacilities.map(facility => (
                                <Marker
                                    key={facility.id}
                                    position={[facility.lat, facility.lng]}
                                    icon={getIconForType(facility.type)}
                                >
                                    <Popup>
                                        <div style={{ textAlign: 'center' }}>
                                            <strong>{facility.name}</strong><br />
                                            <span style={{ color: '#4b5563', fontSize: '0.9em' }}>{facility.type}</span><br />
                                            <span style={{ color: facility.status.includes('24/7') || facility.status.includes('Open') ? '#10b981' : '#f59e0b', fontWeight: 'bold' }}>
                                                {facility.status}
                                            </span>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    </div>
                </div>

                {/* List View */}
                <div className="dashboard-card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ margin: 0 }}>Nearby Facilities</h3>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {['All', 'Pharmacy', 'Hospital', 'Clinic'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setFilter(type)}
                                    style={{
                                        padding: '0.4rem 1rem',
                                        borderRadius: '20px',
                                        border: '1px solid #e5e7eb',
                                        backgroundColor: filter === type ? '#0369a1' : 'white',
                                        color: filter === type ? 'white' : '#4b5563',
                                        cursor: 'pointer',
                                        fontWeight: '500',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <input
                            type="text"
                            placeholder="Search by name or address..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.8rem 1rem',
                                borderRadius: '8px',
                                border: '1px solid #e5e7eb',
                                outline: 'none',
                                fontSize: '0.95rem'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', flex: 1, paddingRight: '0.5rem' }}>
                        {filteredFacilities.map(facility => (
                            <div key={facility.id} style={{ padding: '1.5rem', border: '1px solid #e5e7eb', borderRadius: '12px', transition: 'box-shadow 0.2s ease' }} className="facility-card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{ fontSize: '1.5rem' }}>
                                            {facility.type === 'Pharmacy' ? '💊' : facility.type === 'Hospital' ? '🏥' : '🩺'}
                                        </span>
                                        <h4 style={{ margin: 0, fontSize: '1.2rem', color: '#111827' }}>{facility.name}</h4>
                                    </div>
                                    <span style={{ backgroundColor: '#dbeafe', color: '#1d4ed8', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                        {facility.distance}
                                    </span>
                                </div>

                                <p style={{ color: '#4b5563', margin: '0 0 1rem 0', fontSize: '0.95rem' }}>{facility.address}</p>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: facility.status.includes('24/7') || facility.status.includes('Open') ? '#10b981' : '#f59e0b', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                        {facility.status}
                                    </span>

                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${facility.lat},${facility.lng}`, '_blank')}
                                            style={{ padding: '0.5rem 1rem', border: '1px solid #e5e7eb', backgroundColor: 'white', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#374151' }}>
                                            📍 Directions
                                        </button>
                                        <button
                                            onClick={() => window.location.href = `tel:${facility.phone}`}
                                            style={{ padding: '0.5rem 1rem', border: 'none', backgroundColor: '#ecfdf5', color: '#047857', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 'bold' }}>
                                            📞 Call
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>

            </div>
        </div>
    );
}

export default PharmacyFinder;
