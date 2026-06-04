import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import api from '../api/axiosConfig';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Helper to ensure roles are consistently formatted
    const normalizeRoles = (roles) => {
        const rawRoles = Array.isArray(roles) ? roles : roles ? [roles] : [];
        // Optional: Pre-strip 'ROLE_' prefix if you want internal state to be clean
        return rawRoles.map(role => role.replace('ROLE_', '').toUpperCase());
    };

    useEffect(() => {
        const checkAuth = () => {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                try {
                    const parsedUser = JSON.parse(storedUser);
                    if (parsedUser && parsedUser.token) {
                        setUser({
                            ...parsedUser,
                            roles: normalizeRoles(parsedUser.roles)
                        });
                    } else {
                        localStorage.removeItem('user');
                    }
                } catch (e) {
                    console.error("Failed to parse stored user", e);
                    localStorage.removeItem('user');
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (username, password) => {
        try {
            const response = await api.post('/auth/login', { username, password });
            const { token, roles, username: returnedUsername, fullName, phoneNumber } = response.data;

            const userData = {
                username: returnedUsername || username,
                token: token,
                roles: normalizeRoles(roles),
                fullName: fullName,
                phoneNumber: phoneNumber
            };
            
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            
            return { success: true };
        } catch (error) {
            console.error("Login failed:", error.response?.data || error.message);
            const errorMessage = error.response?.data?.message || "Invalid credentials";
            return { success: false, message: errorMessage };
        }
    };

    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
        // Using window.location.href ensures a clean state on redirect
        window.location.href = '/login';
    };

    const updateUserData = (newData) => {
        setUser(prev => {
            if (!prev) return null;
            const updated = { 
                ...prev, 
                ...newData,
                // Re-normalize in case the update included roles
                roles: newData.roles ? normalizeRoles(newData.roles) : prev.roles 
            };
            localStorage.setItem('user', JSON.stringify(updated));
            return updated;
        });
    };

    const hasRole = useCallback((requiredRole) => {
        if (!user || !user.roles) return false;
        
        const rolesToMatch = Array.isArray(requiredRole) 
            ? requiredRole.map(r => r.replace('ROLE_', '').toUpperCase()) 
            : [requiredRole.replace('ROLE_', '').toUpperCase()];

        return user.roles.some(userRole => rolesToMatch.includes(userRole));
    }, [user]);

    // Convenient booleans for quick UI checks
    const isAdmin = useMemo(() => hasRole(['ADMIN', 'SYSTEM_ADMIN']), [hasRole]);
    const isManager = useMemo(() => hasRole(['MANAGER', 'ADMIN', 'SYSTEM_ADMIN']), [hasRole]);
    const isLaborer = useMemo(() => hasRole('LABORER'), [hasRole]);

    return (
        <AuthContext.Provider value={{ 
            user, 
            setUser, 
            updateUserData, 
            login, 
            logout, 
            loading, 
            hasRole,
            isAdmin,
            isManager,
            isLaborer
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
};