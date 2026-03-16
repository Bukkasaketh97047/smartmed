import React, { createContext, useContext, useState, useEffect } from "react";

import { getWallet, addWalletMoney } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);
    const [wallet, setWallet] = useState({
        balance: 0,
        coins: 0,
        transactions: [],
    });

    useEffect(() => {
        if (user) {
            fetchWallet();
        }
    }, [user]);

    const fetchWallet = async () => {
        if (!user) return;
        try {
            const res = await getWallet(user.username);
            setWallet(res.data);
        } catch (error) {
            console.error("Wallet fetch failed");
        }
    };

    useEffect(() => {
        const status = localStorage.getItem("isLoggedIn") === "true";
        const username = localStorage.getItem("username");
        const role = localStorage.getItem("role");
        const token = localStorage.getItem("token");

        if (status && token) {
            setIsLoggedIn(true);
            setUser({ username, role, token });
        }
        setLoading(false);
    }, []);

    const login = (userData) => {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("username", userData.username);
        localStorage.setItem("token", userData.token);
        localStorage.setItem("role", userData.role);
        setUser(userData);
        setIsLoggedIn(true);
    };

    const logout = () => {
        localStorage.clear();
        setUser(null);
        setIsLoggedIn(false);
        window.location.href = "/signin";
    };

    const addMoney = async (amount) => {
        const a = Number(amount);
        if (!a || a < 1) return;
        try {
            const res = await addWalletMoney(user.username, a);
            setWallet(res.data);
        } catch (error) {
            console.error("Add money failed");
        }
    };

    const redeemCoins = (coins, benefit) => {
        // Redemption logic would go here, for now just update local or call API
        setWallet(prev => ({ ...prev, coins: prev.coins - coins }));
    };

    return (
        <AuthContext.Provider value={{ user, isLoggedIn, login, logout, loading, wallet, addMoney, redeemCoins, fetchWallet }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
