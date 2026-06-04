import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, User, AlertCircle, Loader2, Eye, EyeOff, ShieldCheck } from 'lucide-react';

const Login = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const { login, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || "/dashboard";

    useEffect(() => {
        if (user) {
            navigate(from, { replace: true });
        }
    }, [user, navigate, from]);

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
        if (error) setError(''); 
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        
        try {
            const result = await login(credentials.username, credentials.password);
            if (result.success) {
                navigate(from, { replace: true }); 
            } else {
                setError(result.message || 'Invalid username or password.');
            }
        } catch (err) {
            setError('Server connection failed. Please try again later.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] relative overflow-hidden px-4">
            {/* Decorative Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-[120px] opacity-50" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-[120px] opacity-50" />

            <div className="max-w-md w-full z-10">
                <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white">
                    
                    {/* Header Section */}
                    <div className="text-center mb-10">
                        <div className="mx-auto h-16 w-16 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-blue-200 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                            <ShieldCheck className="text-white" size={32} />
                        </div>
                        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome Back</h2>
                        <p className="mt-2 text-sm text-gray-500 font-medium italic">
                            Labor Management Information System
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-100 p-4 flex items-center rounded-2xl animate-in fade-in zoom-in duration-300">
                            <AlertCircle className="text-red-500 mr-3 shrink-0" size={20} />
                            <span className="text-sm text-red-700 font-semibold">{error}</span>
                        </div>
                    )}

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {/* Username Field */}
                        <div className="group">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1 transition-colors group-focus-within:text-blue-600">
                                Identity
                            </label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                                <input
                                    name="username"
                                    type="text"
                                    required
                                    className="block w-full pl-12 pr-4 py-4 bg-gray-100/50 border border-transparent focus:border-blue-500 focus:bg-white text-gray-900 rounded-2xl focus:outline-none transition-all font-semibold placeholder:text-gray-400"
                                    placeholder="Username"
                                    value={credentials.username}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="group">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1 transition-colors group-focus-within:text-blue-600">
                                Security Code
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="block w-full pl-12 pr-12 py-4 bg-gray-100/50 border border-transparent focus:border-blue-500 focus:bg-white text-gray-900 rounded-2xl focus:outline-none transition-all font-semibold"
                                    placeholder="••••••••"
                                    value={credentials.password}
                                    onChange={handleChange}
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Action Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full flex justify-center items-center py-4 px-4 border border-transparent text-sm font-bold rounded-2xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none shadow-xl shadow-blue-200 transition-all active:scale-[0.98] disabled:opacity-70 uppercase tracking-widest mt-8"
                        >
                            {isSubmitting ? (
                                <Loader2 className="animate-spin" size={22} />
                            ) : (
                                'Enter System'
                            )}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-xs text-gray-400 font-medium">
                        &copy; 2026 Labor System Admin. All Rights Reserved.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;