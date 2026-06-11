import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext'; // Import this
import api from '../api/axiosConfig';
import { User, Phone, Save, Loader2, CheckCircle, ShieldCheck, BadgeCheck } from 'lucide-react';

const Profile = () => {
    const { user, setUser } = useAuth();
    const { themeConfig } = useTheme(); // Access the dynamic theme
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');

    const [formData, setFormData] = useState({
        fullName: user?.fullName || '',
        phoneNumber: user?.phoneNumber || ''
    });

    const handleUpdate = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage('');
        try {
            await api.put('/users/profile', formData);
            const updatedUser = { ...user, ...formData };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            setMessage('Profile updated!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage('Update failed.');
        } finally {
            setIsSaving(false);
        }
    };

    if (!themeConfig) return null;

    return (
        <div className="p-6 max-w-xl mx-auto">
            <div className="mb-6">
                {/* Dynamically styled text */}
                <h1 className={`text-2xl font-black ${themeConfig.text.replace('text-', 'text-opacity-100 text-')}`}>Account</h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Settings</p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                {/* Header uses the active theme color */}
                <div className={`${themeConfig.bg} p-8 text-center relative`}>
                    <div className="relative inline-block">
                        <div className="w-20 h-20 bg-white/10 rounded-2xl mx-auto flex items-center justify-center border-2 border-white/20">
                            <User size={32} className="text-white" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full border-2 border-white">
                            <BadgeCheck size={12} />
                        </div>
                    </div>
                    <h2 className="text-white font-black mt-4">{user?.username}</h2>
                    <div className="flex items-center justify-center gap-1 mt-1 opacity-70">
                        <ShieldCheck size={12} className="text-amber-400" />
                        <p className="text-[9px] font-black uppercase tracking-widest text-white">
                            {user?.roles?.[0]?.replace('ROLE_', '') || 'User'}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleUpdate} className="p-6 space-y-4">
                    {message && (
                        <div className={`flex items-center gap-2 p-3 rounded-lg text-[10px] font-black uppercase ${message.includes('updated') ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>
                            <CheckCircle size={14} /> {message}
                        </div>
                    )}

                    <div className="space-y-3">
                        <div>
                            <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Full Name</label>
                            <div className="relative mt-1">
                                <User size={16} className="absolute left-3 top-3 text-slate-300" />
                                <input 
                                    type="text" value={formData.fullName}
                                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 text-xs font-bold text-slate-700 outline-none focus:ring-2 ring-slate-200"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Phone</label>
                            <div className="relative mt-1">
                                <Phone size={16} className="absolute left-3 top-3 text-slate-300" />
                                <input 
                                    type="text" value={formData.phoneNumber}
                                    onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 text-xs font-bold text-slate-700 outline-none focus:ring-2 ring-slate-200"
                                />
                            </div>
                        </div>
                    </div>

                    <button 
                        disabled={isSaving}
                        type="submit"
                        className={`w-full ${themeConfig.bg} hover:opacity-90 text-white py-3 rounded-xl font-black uppercase text-[10px] tracking-widest flex justify-center items-center gap-2 transition-all`}
                    >
                        {isSaving ? <Loader2 className="animate-spin" size={16} /> : <><Save size={16} /> Save Changes</>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Profile;