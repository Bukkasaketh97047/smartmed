import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
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

// A component to recenter the map when location changes
function ChangeView({ center }) {
    const map = useMap();
    map.setView(center, map.getZoom());
    return null;
}

// Fallback user location (Hyderabad roughly)
const FALLBACK_LOCATION = { lat: 17.3850, lng: 78.4867 };

function PharmacyFinder() {
    const [filter, setFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [facilities, setFacilities] = useState([]);
    const [userLocation, setUserLocation] = useState(FALLBACK_LOCATION);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        // 1. Get User Location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    setUserLocation({ lat, lng });
                    fetchNearbyFacilities(lat, lng);
                },
                (error) => {
                    console.warn("Geolocation denied or failed.", error);
                    setErrorMsg("Location access denied. Displaying default area.");
                    fetchNearbyFacilities(FALLBACK_LOCATION.lat, FALLBACK_LOCATION.lng);
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        } else {
            setErrorMsg("Geolocation is not supported by this browser.");
            fetchNearbyFacilities(FALLBACK_LOCATION.lat, FALLBACK_LOCATION.lng);
        }
    }, []);

    const fetchNearbyFacilities = async (lat, lng) => {
        setLoading(true);
        // Overpass QL Query: Search within 5km (5000m) for pharmacy, hospital, clinic
        const radius = 5000;
        const query = `
            [out:json];
            (
              node["amenity"="pharmacy"](around:${radius},${lat},${lng});
              node["amenity"="hospital"](around:${radius},${lat},${lng});
              node["amenity"="clinic"](around:${radius},${lat},${lng});
            );
            out body;
            >;
            out skel qt;
        `;
        
        try {
            const response = await axios.post('https://overpass-api.de/api/interpreter', `data=${encodeURIComponent(query)}`, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });
            
            const nodes = response.data.elements.filter(e => e.type === 'node' && e.tags && e.tags.name);
            
            // Map Overpass data to our format
            const parsedFacilities = nodes.map((node, index) => {
                const typeTag = node.tags.amenity;
                const type = typeTag === 'hospital' ? 'Hospital' : typeTag === 'clinic' ? 'Clinic' : 'Pharmacy';
                
                // Estimate distance via Haversine (straight line)
                const distKm = calculateDistance(lat, lng, node.lat, node.lon);
                
                return {
                    id: node.id || index,
                    name: node.tags.name,
                    type: type,
                    distance: `${distKm.toFixed(1)} km`,
                    status: node.tags.opening_hours || "Contact for timings",
                    phone: node.tags.phone || node.tags['contact:phone'] || "Not Available",
                    address: node.tags['addr:full'] || node.tags['addr:street'] || node.tags['addr:city'] || "Address not specified",
                    lat: node.lat,
                    lng: node.lon
                };
            }).sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance)); // Sort by closest
            
            setFacilities(parsedFacilities);
        } catch (error) {
            console.error("Failed to fetch from Overpass API", error);
            setErrorMsg("Failed to load live map data. Try again later.");
        } finally {
            setLoading(false);
        }
    };

    // Haversine formula
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Radius of the earth in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2); 
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        return R * c; // Distance in km
    };

    const filteredFacilities = facilities.filter(f => {
        const matchesType = filter === 'All' || f.type === filter;
        const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            f.address.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesType && matchesSearch;
    });

    return (
        <div className="dashboard-container">
            <div className="dashboard-header" style={{ marginBottom: '2rem' }}>
                <h2>📍 Medical Facility Finder</h2>
                <p className="text-muted">Find real nearby pharmacies, hospitals, and clinics around you.</p>
                {errorMsg && <p style={{ color: '#ef4444', marginTop: '0.5rem', fontWeight: 'bold' }}>⚠ {errorMsg}</p>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>

                {/* Interactive Map */}
                <div className="dashboard-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)', backgroundColor: 'var(--glass-bg)' }}>
                        <h3 style={{ margin: 0 }}>Interactive Live Map</h3>
                    </div>
                    <div style={{ flex: 1, minHeight: '500px', position: 'relative', zIndex: 0 }}>
                        <MapContainer
                            center={[userLocation.lat, userLocation.lng]}
                            zoom={13}
                            style={{ height: "100%", width: "100%" }}
                        >
                            <ChangeView center={[userLocation.lat, userLocation.lng]} />
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />

                            {/* User Location Marker */}
                            <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
                                <Popup>
                                    <strong>Your Live Location</strong>
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
                                            <span style={{ color: '#10b981', fontWeight: 'bold', display: 'block', marginTop: '4px' }}>
                                                {facility.distance} away
                                            </span>
                                            {facility.phone !== "Not Available" && (
                                                <a href={`tel:${facility.phone}`} style={{ display: 'block', marginTop: '8px', color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'none' }}>
                                                    📞 Call: {facility.phone}
                                                </a>
                                            )}
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
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {['All', 'Pharmacy', 'Hospital', 'Clinic'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setFilter(type)}
                                    style={{
                                        padding: '0.4rem 1rem',
                                        borderRadius: '20px',
                                        border: '1px solid var(--glass-border)',
                                        backgroundColor: filter === type ? 'var(--primary)' : 'var(--glass-bg)',
                                        color: filter === type ? 'white' : 'var(--text-main)',
                                        cursor: 'pointer',
                                        fontWeight: '500',
                                        transition: 'all 0.2s ease',
                                        fontSize: '0.85rem'
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
                                border: '1px solid var(--glass-border)',
                                backgroundColor: 'var(--glass-bg)',
                                color: 'var(--text-main)',
                                outline: 'none',
                                fontSize: '0.95rem'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', flex: 1, paddingRight: '0.5rem' }}>
                        {loading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column', gap: '1rem', padding: '3rem 0' }}>
                                <div className="loading-spinner"></div>
                                <span className="text-muted text-center">Finding your location & pulling real map data...</span>
                            </div>
                        ) : filteredFacilities.length === 0 ? (
                            <div style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>
                                No facilities found matching your criteria within a 5km radius.
                            </div>
                        ) : filteredFacilities.map(facility => (
                            <div key={facility.id} style={{ padding: '1.5rem', border: '1px solid var(--glass-border)', borderRadius: '12px', transition: 'box-shadow 0.2s ease' }} className="facility-card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{ fontSize: '1.5rem' }}>
                                            {facility.type === 'Pharmacy' ? '💊' : facility.type === 'Hospital' ? '🏥' : '🩺'}
                                        </span>
                                        <h4 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-main)' }}>{facility.name}</h4>
                                    </div>
                                    <span style={{ backgroundColor: 'rgba(var(--primary-rgb), 0.15)', color: 'var(--primary)', padding: '0.25rem 0.7rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                        {facility.distance}
                                    </span>
                                </div>

                                <p style={{ color: 'var(--text-muted)', margin: '0 0 1rem 0', fontSize: '0.95rem' }}>📍 {facility.address}</p>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        🕒 {facility.status}
                                    </span>

                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${facility.lat},${facility.lng}`, '_blank')}
                                            style={{ padding: '0.5rem 1rem', border: '1px solid var(--glass-border)', backgroundColor: 'var(--glass-bg)', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-main)', fontSize: '0.85rem' }}>
                                            🗺️ Directions
                                        </button>
                                        <button
                                            onClick={() => {
                                                if(facility.phone !== "Not Available") {
                                                    window.location.href = `tel:${facility.phone}`;
                                                } else {
                                                    alert("Phone number not available for this facility.");
                                                }
                                            }}
                                            style={{ padding: '0.5rem 1rem', border: 'none', backgroundColor: facility.phone === "Not Available" ? 'rgba(0,0,0,0.05)' : 'rgba(var(--primary-rgb), 0.1)', color: facility.phone === "Not Available" ? '#9ca3af' : 'var(--primary)', borderRadius: '8px', cursor: facility.phone === "Not Available" ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 'bold', fontSize: '0.85rem' }}>
                                            📞 {facility.phone !== "Not Available" ? "Call Now" : "No Number"}
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
