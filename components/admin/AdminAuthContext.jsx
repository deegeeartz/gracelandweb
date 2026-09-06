import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminAuth, adminRequest } from '../../lib/admin-api';

const AdminAuthContext = createContext({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
    login: async () => {},
    logout: () => {},
});

export function AdminAuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        verifyAuth();
    }, []);

    const verifyAuth = async () => {
        const storedToken = AdminAuth.getToken();
        if (!storedToken) {
            setIsLoading(false);
            setIsAuthenticated(false);
            return;
        }

        try {
            const res = await fetch('/api/auth/verify', {
                headers: { 'Authorization': `Bearer ${storedToken}` }
            });

            if (res.ok) {
                const data = await res.json();
                setToken(storedToken);
                setUser(data.user || { username: 'Admin' });
                setIsAuthenticated(true);
            } else {
                AdminAuth.removeToken();
                setToken(null);
                setUser(null);
                setIsAuthenticated(false);
            }
        } catch (err) {
            console.error('Auth verification failed:', err);
            AdminAuth.removeToken();
            setToken(null);
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (username, password) => {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Invalid credentials');
        }

        AdminAuth.setToken(data.token);
        setToken(data.token);
        setUser(data.user || { username });
        setIsAuthenticated(true);
        return data;
    };

    const logout = () => {
        AdminAuth.removeToken();
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
    };

    return (
        <AdminAuthContext.Provider
            value={{
                user,
                token,
                isLoading,
                isAuthenticated,
                login,
                logout,
                verifyAuth,
            }}
        >
            {children}
        </AdminAuthContext.Provider>
    );
}

export function useAdminAuth() {
    const context = useContext(AdminAuthContext);
    if (!context) {
        throw new Error('useAdminAuth must be used within an AdminAuthProvider');
    }
    return context;
}

export default AdminAuthContext;
