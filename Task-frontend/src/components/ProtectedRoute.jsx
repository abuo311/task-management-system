import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, ShieldAlert } from 'lucide-react';

const ProtectedRoute = ({ children, requiredRole }) => {
    const { user, loading, hasRole } = useAuth();
    const location = useLocation();

    // 1. Loading State: Wait for AuthContext to check localStorage
    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
                <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
                <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Restoring Session...</p>
            </div>
        );
    }

    // 2. Authentication Check
    // If not logged in, redirect to login page
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 3. Authorization (Role) Check
    if (requiredRole && !hasRole(requiredRole)) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
                <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 flex flex-col items-center text-center max-w-md">
                    <div className="p-4 bg-red-50 rounded-2xl mb-6">
                        <ShieldAlert className="text-red-600" size={48} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-950 mb-2">Access Denied</h2>
                    <p className="text-slate-500 text-sm font-medium mb-8">
                        Your account does not have the required permissions to view this.
                    </p>
                    <button 
                        onClick={() => window.location.href = '/dashboard'}
                        className="w-full bg-slate-950 text-white py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return children;
};

export default ProtectedRoute;