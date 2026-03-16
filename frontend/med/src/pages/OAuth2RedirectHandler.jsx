import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function OAuth2RedirectHandler() {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        console.log("OAuth2RedirectHandler mounted");
        const params = new URLSearchParams(location.search);
        const token = params.get("token");
        console.log("Token from URL:", token ? "Found (masked)" : "Not Found");
        const role = params.get("role");
        const username = params.get("username");

        if (token) {
            localStorage.setItem("token", token);
            localStorage.setItem("role", role);
            localStorage.setItem("username", username);
            localStorage.setItem("isLoggedIn", "true");

            if (role === "ROLE_ADMIN") {
                navigate("/admin");
            } else {
                navigate("/products");
            }
        } else {
            navigate("/signin");
        }
    }, [location, navigate]);

    return (
        <div className="flex-center" style={{ minHeight: '100vh', flexDirection: 'column' }}>
            <h2 className="text-muted">Finalizing Social Login...</h2>
            <div className="spinner"></div> // Optional: Add a spinner style to index.css later
        </div>
    );
}

export default OAuth2RedirectHandler;
