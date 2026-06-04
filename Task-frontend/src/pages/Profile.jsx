import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';
import { User, Phone, Save, Loader2, CheckCircle, Menu, ShieldCheck, BadgeCheck } from 'lucide-react';
import Sidebar from '../components/Sidebar';

const Profile = () => {
    const { user, setUser } = useAuth();
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
            
            // Update the Context and LocalStorage so the app knows the new info
            const updatedUser = { ...user, ...formData };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            
            setMessage('Profile updated successfully!');
            setTimeout(() => setMessage(''), 3000); // Clear message after 3s
        } catch (error) {
            console.error(error);
            setMessage('Failed to update profile.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen text-slate-900">
            {/* Sidebar with Mobile Controls */}
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <main className="transition-all duration-300 min-h-screen flex flex-col md:ml-20 lg:ml-64">
                
                {/* Responsive Header */}
                <header className="sticky top-0 bg-slate-50/80 backdrop-blur-md px-6 md:px-10 h-20 md:h-24 border-b border-slate-200/60 flex items-center justify-between z-30">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setIsSidebarOpen(true)} 
                            className="p-2.5 lg:hidden hover:bg-slate-200/50 rounded-xl transition-colors text-slate-600"
                        >
                            <Menu size={22} />
                        </button>
                        <div>
                            <h1 className="text-xl md:text-2xl font-black text-slate-950">Account Settings</h1>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Manage your presence</p>
                        </div>
                    </div>
                </header>

                {/* Profile Content */}
                <div className="p-6 md:p-10 flex justify-center">
                    <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                        
                        {/* Profile Header Visual */}
                        <div className="bg-slate-950 p-10 text-center relative overflow-hidden">
                            {/* Decorative background element */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                            
                            <div className="relative inline-block">
                                <div className="w-28 h-28 bg-blue-600 rounded-[2rem] mx-auto flex items-center justify-center shadow-2xl transform -rotate-6 border-4 border-slate-900 group transition-transform hover:rotate-0 duration-500">
                                    <User size={54} className="text-white rotate-6 group-hover:rotate-0 transition-transform duration-500" />
                                </div>
                                <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-1.5 rounded-full border-4 border-slate-950">
                                    <BadgeCheck size={16} />
                                </div>
                            </div>
                            
                            <h2 className="text-white text-3xl font-black mt-6 tracking-tight">{user?.username}</h2>
                            <div className="flex items-center justify-center gap-2 mt-2">
                                <ShieldCheck size={14} className="text-blue-500" />
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                                    {user?.roles[0]?.replace('ROLE_', '') || 'User'}
                                </p>
                            </div>
                        </div>

                        {/* Form Section */}
                        <form onSubmit={handleUpdate} className="p-8 md:p-12 space-y-8">
                            {message && (
                                <div className={`flex items-center gap-3 p-4 rounded-2xl border text-sm font-bold animate-in fade-in slide-in-from-top-2 ${
                                    message.includes('successfully') 
                                    ? 'bg-green-50 text-green-700 border-green-100' 
                                    : 'bg-red-50 text-red-700 border-red-100'
                                }`}>
                                    <CheckCircle size={20} /> {message}
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-6">
                                {/* Full Name Field */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Display Name</label>
                                    <div className="relative group">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors">
                                            <User size={20} />
                                        </div>
                                        <input 
                                            type="text"
                                            value={formData.fullName}
                                            onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                                            placeholder="Update your name..."
                                            className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 border border-transparent focus:border-blue-500 focus:bg-white outline-none transition-all font-bold text-slate-700 shadow-inner group-hover:bg-slate-100/50"
                                        />
                                    </div>
                                </div>

                                {/* Phone Number Field */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Number</label>
                                    <div className="relative group">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors">
                                            <Phone size={20} />
                                        </div>
                                        <input 
                                            type="text"
                                            value={formData.phoneNumber}
                                            onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                                            placeholder="+233..."
                                            className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 border border-transparent focus:border-blue-500 focus:bg-white outline-none transition-all font-bold text-slate-700 shadow-inner group-hover:bg-slate-100/50"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button 
                                disabled={isSaving}
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-[1.5rem] font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-blue-200 flex justify-center items-center gap-3 transition-all active:scale-[0.98] disabled:bg-slate-300 disabled:shadow-none mt-4"
                            >
                                {isSaving ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>
                                        <Save size={20} />
                                        <span>Update Profile</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Profile;