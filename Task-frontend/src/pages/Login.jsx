import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, User, Loader2, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const Login = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const { login, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/dashboard";

    useEffect(() => {
        if (user) navigate(from, { replace: true });
    }, [user, navigate, from]);

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            const result = await login(credentials.username, credentials.password);
            
            if (result.success) {
                toast.success('Access Granted! Redirecting...');
                // Smooth transition
                setTimeout(() => navigate(from, { replace: true }), 800);
            } else {
                toast.error(result.message || 'Invalid identity or security code.');
                setIsSubmitting(false);
            }
        } catch (err) {
            toast.error('Connection to server failed.');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-rose-50 relative overflow-hidden px-4">
            <Toaster position="top-right" />
            
            {/* Background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-yellow-200/40 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-200/40 rounded-full blur-[120px]" />

            <div className="max-w-md w-full z-10">
                <div className="bg-white/90 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-2xl border border-rose-100">
                    <div className="text-center mb-10">
                        <div className="mx-auto h-20 w-20 bg-rose-950 rounded-3xl flex items-center justify-center mb-6 shadow-xl transform -rotate-3">
                            <ShieldCheck className="text-yellow-400" size={40} />
                        </div>
                        <h2 className="text-3xl font-black text-rose-950 tracking-tight">Welcome Back</h2>
                        <p className="mt-2 text-[10px] text-rose-400 font-black uppercase tracking-[0.2em]">
                            Labor Management System
                        </p>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {/* Username */}
                        <div className="relative">
                            <User className="absolute left-4 top-4 text-rose-300" size={20} />
                            <input
                                name="username" type="text" required
                                className="w-full pl-12 pr-4 py-4 bg-rose-50 border-2 border-transparent focus:border-rose-200 text-rose-950 rounded-2xl outline-none font-bold text-sm transition-all"
                                placeholder="Username"
                                value={credentials.username}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Password */}
                        <div className="relative">
                            <Lock className="absolute left-4 top-4 text-rose-300" size={20} />
                            <input
                                name="password" type={showPassword ? "text" : "password"} required
                                className="w-full pl-12 pr-12 py-4 bg-rose-50 border-2 border-transparent focus:border-rose-200 text-rose-950 rounded-2xl outline-none font-bold text-sm transition-all"
                                placeholder="Security Code"
                                value={credentials.password}
                                onChange={handleChange}
                            />
                            <button 
                                type="button" onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-4 text-rose-300 hover:text-rose-600 transition-colors"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        <button
                            type="submit" disabled={isSubmitting}
                            className="w-full py-4 font-black rounded-2xl text-white bg-rose-900 hover:bg-rose-800 shadow-lg transition-all active:scale-[0.98] uppercase tracking-widest text-xs mt-4 disabled:opacity-70"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Enter System'}
                        </button>
                    </form>

                    <p className="mt-10 text-center text-[9px] text-rose-300 font-bold uppercase tracking-widest">
                        &copy; 2026 LaborFlow. Unauthorized access is strictly prohibited.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;