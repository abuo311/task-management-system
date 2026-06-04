import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { 
    UserPlus, 
    Users, 
    Shield, 
    Loader2, 
    Menu, 
    Search, 
    Trash2, 
    UserCheck,
    Eye,
    EyeOff,
    Phone
} from 'lucide-react';

const UserManagement = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    
    // Form State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        fullName: '',
        phoneNumber: '',
        role: 'ROLE_USER' 
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/users');
            setUsers(res.data);
        } catch (err) {
            console.error("Failed to fetch users", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.post('/auth/register', formData); 
            // Reset form and clear search so the new user is visible
            setFormData({ username: '', password: '', fullName: '', phoneNumber: '', role: 'ROLE_USER' });
            setSearchTerm(''); 
            fetchUsers();
            alert("Account provisioned successfully!");
        } catch (err) {
            alert(err.response?.data || "Error creating user");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id, username) => {
        if (window.confirm(`Are you sure you want to remove ${username}?`)) {
            try {
                await api.delete(`/users/${id}`);
                fetchUsers();
            } catch (err) {
                alert(err.response?.data || "Failed to delete user");
            }
        }
    };

    const filteredUsers = users.filter(u => 
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-slate-50 min-h-screen text-slate-900">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="transition-all duration-300 min-h-screen flex flex-col md:ml-20 lg:ml-64">
                
                {/* Header */}
                <header className="sticky top-0 bg-slate-50/80 backdrop-blur-md px-6 md:px-10 h-20 md:h-24 border-b border-slate-200/60 flex items-center justify-between z-30">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsSidebarOpen(true)} className="p-2.5 lg:hidden hover:bg-slate-200/50 rounded-xl text-slate-600">
                            <Menu size={22} />
                        </button>
                        <div>
                            <h1 className="text-xl md:text-2xl font-black text-slate-950 tracking-tight">User Controls</h1>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">System Access Management</p>
                        </div>
                    </div>
                </header>

                <div className="p-6 md:p-10 grid xl:grid-cols-3 gap-8">
                    
                    {/* Left: Registration Form */}
                    <div className="xl:col-span-1">
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 sticky top-32">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-100">
                                    <UserPlus size={20} />
                                </div>
                                <h2 className="text-lg font-black text-slate-900 tracking-tight">Register Member</h2>
                            </div>

                            <form onSubmit={handleCreateUser} className="space-y-5">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Account Role</label>
                                    <select 
                                        className="w-full px-5 py-4 bg-slate-50 border border-transparent focus:border-blue-500 rounded-2xl outline-none font-bold text-sm text-slate-700 cursor-pointer shadow-inner appearance-none"
                                        value={formData.role}
                                        onChange={(e) => setFormData({...formData, role: e.target.value})}
                                    >
                                        <option value="ROLE_USER">Standard User</option>
                                        <option value="ROLE_ADMIN">Administrator</option>
                                        <option value="ROLE_SYSTEM_ADMIN">System Root</option>
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
                                    <input 
                                        required
                                        className="w-full px-5 py-4 bg-slate-50 border border-transparent focus:border-blue-500 rounded-2xl outline-none font-bold text-sm text-slate-700 shadow-inner"
                                        placeholder="e.g. bbernard"
                                        value={formData.username}
                                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                    <input 
                                        required
                                        className="w-full px-5 py-4 bg-slate-50 border border-transparent focus:border-blue-500 rounded-2xl outline-none font-bold text-sm text-slate-700 shadow-inner"
                                        placeholder="Enter display name"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                                    />
                                </div>

                                {/* Phone Number Field - Added Change */}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                                    <input 
                                        className="w-full px-5 py-4 bg-slate-50 border border-transparent focus:border-blue-500 rounded-2xl outline-none font-bold text-sm text-slate-700 shadow-inner"
                                        placeholder="e.g. 024XXXXXXX"
                                        value={formData.phoneNumber}
                                        onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Temporary Password</label>
                                    <div className="relative">
                                        <input 
                                            required
                                            type={showPassword ? "text" : "password"}
                                            className="w-full px-5 py-4 bg-slate-50 border border-transparent focus:border-blue-500 rounded-2xl outline-none font-bold text-sm text-slate-700 shadow-inner pr-12"
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <button 
                                    disabled={isSubmitting}
                                    type="submit" 
                                    className="w-full bg-slate-950 hover:bg-blue-600 text-white py-5 rounded-[1.8rem] font-black uppercase text-xs tracking-widest transition-all flex justify-center items-center gap-2 mt-4"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : "Provision Account"}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Right: User Directory */}
                    <div className="xl:col-span-2 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center gap-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Users size={20}/></div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-slate-400">Total Users</p>
                                    <h3 className="text-xl font-black">{users.length}</h3>
                                </div>
                            </div>
                            <div className="bg-slate-900 p-6 rounded-[2rem] text-white flex items-center gap-4">
                                <div className="p-3 bg-white/10 text-white rounded-2xl"><Shield size={20}/></div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-white/40">Unique Roles</p>
                                    <h3 className="text-xl font-black">{[...new Set(users.map(u => u.role))].length}</h3>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
                            <div className="relative mb-6">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input 
                                    type="text"
                                    placeholder="Search by name or username..."
                                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-transparent focus:border-blue-200 rounded-2xl outline-none font-bold text-sm text-slate-700 transition-all"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div className="space-y-3">
                                {loading ? (
                                    <div className="text-center py-20"><Loader2 className="animate-spin mx-auto text-blue-600" /></div>
                                ) : filteredUsers.length > 0 ? (
                                    filteredUsers.map((u) => (
                                        <div key={u.id} className="flex items-center justify-between p-5 bg-slate-50/50 rounded-3xl border border-slate-100 hover:bg-white hover:border-blue-100 transition-all group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 border border-slate-100 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                                    <UserCheck size={20} />
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-slate-900 text-sm">{u.fullName}</h3>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] text-slate-400 font-bold">@{u.username}</span>
                                                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                                        <span className="text-[9px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">
                                                            {u.role?.replace('ROLE_', '')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {u.username !== currentUser?.username && (
                                                <button 
                                                    onClick={() => handleDelete(u.id, u.username)}
                                                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-20 text-slate-400 font-bold uppercase text-[10px] tracking-widest">No matching users found</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UserManagement;