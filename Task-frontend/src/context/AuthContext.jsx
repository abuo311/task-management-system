import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import api from '../api/axiosConfig';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Helper to ensure roles are consistently formatted
    const normalizeRoles = (roles) => {
        const rawRoles = Array.isArray(roles) ? roles : roles ? [roles] : [];
        // Strips 'ROLE_' prefix if present and ensures uppercase
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
            console.log("Attempting login for:", username);
            const response = await api.post('/auth/login', { username, password });
            
            // 1. Process the response data
            const userData = response.data;
            
            // 2. Prepare user object with normalized roles
            const authenticatedUser = {
                ...userData,
                roles: normalizeRoles(userData.roles || [])
            };

            // 3. Save to LocalStorage so it persists on refresh
            localStorage.setItem('user', JSON.stringify(authenticatedUser));

            // 4. Update state to trigger UI re-render
            setUser(authenticatedUser);

            console.log("Login successful", authenticatedUser);
            return { success: true };
            
        } catch (error) {
            if (error.response) {
                console.error("Server Error:", error.response.status, error.response.data);
                return { success: false, message: error.response.data.message || "Unauthorized" };
            } else if (error.request) {
                console.error("No response from server:", error.request);
                return { success: false, message: "Server is unreachable" };
            } else {
                console.error("Error setting up request:", error.message);
                return { success: false, message: "Client error" };
            }
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
    // This will return true if the backend returns 'ROLE_LABORER' or 'LABORER'
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