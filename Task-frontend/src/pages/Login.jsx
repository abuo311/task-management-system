import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, User, Loader2, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import PageContainer from '../components/PageContainer';

const Login = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const { login, user, loading } = useAuth(); // Added loading from AuthContext
    const { themeConfig } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    
    // Default redirect to dashboard if no 'from' state exists
    const from = location.state?.from?.pathname || "/dashboard";

    // Only navigate if we are NOT loading and the user is already authenticated
    useEffect(() => {
        if (!loading && user) {
            navigate(from, { replace: true });
        }
    }, [user, loading, navigate, from]);

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
                // The useEffect above will handle the navigation once the user state updates
            } else {
                toast.error(result.message || 'Invalid identity or security code.');
                setIsSubmitting(false);
            }
        } catch (err) {
            toast.error('Connection to server failed.');
            setIsSubmitting(false);
        }
    };

    if (!themeConfig) return null;

    return (
        <PageContainer>
        <div className={`min-h-screen flex items-center justify-center ${themeConfig.bg} relative overflow-hidden px-4`}>
            <Toaster position="top-right" />
            
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-black/10 rounded-full blur-[120px]" />

            <div className="max-w-md w-full z-10">
                <div className="bg-white/90 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-2xl border border-white/20">
                    <div className="text-center mb-10">
                        <div className={`mx-auto h-20 w-20 ${themeConfig.active} rounded-3xl flex items-center justify-center mb-6 shadow-xl transform -rotate-3`}>
                            <ShieldCheck className="text-white" size={40} />
                        </div>
                        <h2 className="text-3xl font-black text-slate-950 tracking-tight">Welcome Back</h2>
                        <p className="mt-2 text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">
                            Labor Management System
                        </p>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div className="relative">
                            <User className="absolute left-4 top-4 text-slate-300" size={20} />
                            <input
                                name="username" type="text" required
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-slate-200 text-slate-950 rounded-2xl outline-none font-bold text-sm transition-all"
                                placeholder="Username"
                                value={credentials.username}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-4 top-4 text-slate-300" size={20} />
                            <input
                                name="password" type={showPassword ? "text" : "password"} required
                                className="w-full pl-12 pr-12 py-4 bg-slate-50 border-2 border-transparent focus:border-slate-200 text-slate-950 rounded-2xl outline-none font-bold text-sm transition-all"
                                placeholder="Security Code"
                                value={credentials.password}
                                onChange={handleChange}
                            />
                            <button 
                                type="button" onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-4 text-slate-300 hover:text-slate-600 transition-colors"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        <button
                            type="submit" disabled={isSubmitting || loading}
                            className={`w-full py-4 font-black rounded-2xl text-white ${themeConfig.active} shadow-lg transition-all active:scale-[0.98] uppercase tracking-widest text-xs mt-4 disabled:opacity-70`}
                        >
                            {isSubmitting ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Enter System'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
        </PageContainer>
    );
};

export default Login;