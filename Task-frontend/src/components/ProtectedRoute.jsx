import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, ShieldAlert } from 'lucide-react';

const ProtectedRoute = ({ children, requiredRole }) => {
    const { user, loading, hasRole } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [showDenied, setShowDenied] = useState(false);

    // 1. Loading State
    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
                <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
                <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Verifying Session</p>
            </div>
        );
    }

    // 2. Authentication Check
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 3. Authorization (Role) Check
    if (requiredRole) {
        const isAuthorized = hasRole(requiredRole);

        if (!isAuthorized) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
                    <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 flex flex-col items-center text-center max-w-md animate-in zoom-in-95 duration-300">
                        <div className="p-4 bg-red-50 rounded-2xl mb-6">
                            <ShieldAlert className="text-red-600" size={48} />
                        </div>
                        <h2 className="text-2xl font-black text-slate-950 mb-2">Access Denied</h2>
                        <p className="text-slate-500 text-sm font-medium mb-8">
                            Your account does not have the required permissions to view this command center.
                        </p>
                        <button 
                            onClick={() => navigate('/dashboard')}
                            className="w-full bg-slate-950 text-white py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all"
                        >
                            Return to Dashboard
                        </button>
                    </div>
                </div>
            );
        }
    }

    return children;
};

export default ProtectedRoute;