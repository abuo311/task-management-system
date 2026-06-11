import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import api from '../api/axiosConfig';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Helper to ensure roles are consistently formatted (e.g., 'LABORER')
    const normalizeRoles = (roles) => {
        const rawRoles = Array.isArray(roles) ? roles : roles ? [roles] : [];
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
            setLoading(false); // Signal that session check is complete
        };
        checkAuth();
    }, []);

    const login = async (username, password) => {
        try {
            const response = await api.post('/auth/login', { username, password });
            const userData = response.data;
            
            const authenticatedUser = {
                ...userData,
                roles: normalizeRoles(userData.roles || [])
            };

            localStorage.setItem('user', JSON.stringify(authenticatedUser));
            setUser(authenticatedUser);
            return { success: true };
        } catch (error) {
            console.error("Login Error:", error.response?.data || error.message);
            return { 
                success: false, 
                message: error.response?.data?.message || "Login failed. Check your credentials." 
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
        window.location.href = '/login';
    };

    const updateUserData = (newData) => {
        setUser(prev => {
            if (!prev) return null;
            const updated = {
                ...prev,
                ...newData,
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

    // Role helpers
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
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
};