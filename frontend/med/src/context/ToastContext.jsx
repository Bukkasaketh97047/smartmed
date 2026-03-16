import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'success') => {
        setToasts((prev) => {
            if (prev.find(t => t.message === message)) return prev;
            const id = Date.now();
            setTimeout(() => {
                setToasts((current) => current.filter((t) => t.id !== id));
            }, 3000);
            return [...prev, { id, message, type }];
        });
    }, []);

    return (
        <ToastContext.Provider value={showToast}>
            {children}
            <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className="glass-card animate-fade-in"
                        style={{
                            padding: '1rem 1.5rem',
                            borderRadius: '12px',
                            minWidth: '250px',
                            background: toast.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                            borderColor: toast.type === 'success' ? '#10b981' : '#ef4444',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
                        }}
                    >
                        <span style={{ fontSize: '1.2rem' }}>{toast.type === 'success' ? '✓' : '✕'}</span>
                        <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{toast.message}</span>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => useContext(ToastContext);
