import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { 
    UserPlus, Users, Shield, Loader2, Search, Trash2, 
    UserCheck, Eye, EyeOff, Edit2, X
} from 'lucide-react';

const UserManagement = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingUser, setEditingUser] = useState(null); // Track user being edited
    const [formData, setFormData] = useState({
        username: '', password: '', fullName: '', phoneNumber: '', role: 'ROLE_USER' 
    });

    useEffect(() => { fetchUsers(); }, []);

    const fetchUsers = async () => {
        try { const res = await api.get('/users'); setUsers(res.data); } 
        catch (err) { console.error(err); } 
        finally { setLoading(false); }
    };

    const handleFormSubmit = async (e) => {
    e.preventDefault();

    // 1. Simple Client-Side Validation
    if (!formData.username || !formData.password || !formData.fullName) {
        alert("Please fill in all required fields (Username, Full Name, and Password).");
        return;
    }

    setIsSubmitting(true);
    try {
        if (editingUser) {
            // Update
            await api.put(`/users/${editingUser.id}`, formData);
            alert("Account updated successfully!");
        } else {
            // Register
            await api.post('/auth/register', formData);
            alert("Account created successfully!");
        }
        
        // 2. Ensure form resets after success
        resetForm();
        fetchUsers();
    } catch (err) { 
        console.error(err);
        alert(err.response?.data || "Error processing request. Check console for details."); 
    } finally { 
        setIsSubmitting(false); 
    }
};

    const startEdit = (user) => {
        setEditingUser(user);
        setFormData({ 
            username: user.username, 
            password: '', // Keep empty if not changing
            fullName: user.fullName || '', 
            phoneNumber: user.phoneNumber || '', 
            role: user.role 
        });
    };

    const resetForm = () => {
        setEditingUser(null);
        setFormData({ username: '', password: '', fullName: '', phoneNumber: '', role: 'ROLE_USER' });
    };

    const handleDelete = async (id, username) => {
        if (!window.confirm(`Remove ${username}?`)) return;
        try { await api.delete(`/users/${id}`); fetchUsers(); } 
        catch (err) { alert("Failed to delete user"); }
    };

    const filteredUsers = users.filter(u => 
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 md:p-10 max-w-6xl mx-auto">
            <div className="mb-10">
                <h1 className="text-3xl font-black text-rose-950">User Controls</h1>
                <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mt-1">System Access Management</p>
            </div>

            <div className="grid xl:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-3xl border border-rose-100 shadow-sm h-fit">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-rose-900 rounded-xl text-white">
                                {editingUser ? <Edit2 size={18} /> : <UserPlus size={18} />}
                            </div>
                            <h2 className="text-sm font-black text-rose-950 uppercase tracking-widest">
                                {editingUser ? 'Edit Member' : 'Register Member'}
                            </h2>
                        </div>
                        {editingUser && <button onClick={resetForm} className="text-rose-400 hover:text-rose-600"><X size={18} /></button>}
                    </div>

                    <form onSubmit={handleFormSubmit} className="space-y-4">
                        <select className="w-full px-4 py-3 bg-rose-50 rounded-xl outline-none font-bold text-xs text-rose-900 border-2 border-transparent focus:border-rose-200"
                            value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                            <option value="ROLE_USER">Standard User</option>
                            <option value="ROLE_ADMIN">Administrator</option>
                            <option value="ROLE_SYSTEM_ADMIN">System Root</option>
                        </select>
                        <input className="w-full px-4 py-3 bg-rose-50 rounded-xl outline-none font-bold text-xs text-rose-900 border-2 border-transparent focus:border-rose-200"
                            placeholder="Username" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} />
                        <input className="w-full px-4 py-3 bg-rose-50 rounded-xl outline-none font-bold text-xs text-rose-900 border-2 border-transparent focus:border-rose-200"
                            placeholder="Full Name" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} />
                        <input className="w-full px-4 py-3 bg-rose-50 rounded-xl outline-none font-bold text-xs text-rose-900 border-2 border-transparent focus:border-rose-200"
                            placeholder="Phone Number" value={formData.phoneNumber} onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} />
                        
                        <div className="relative">
                            <input type={showPassword ? "text" : "password"} className="w-full px-4 py-3 bg-rose-50 rounded-xl outline-none font-bold text-xs text-rose-900 border-2 border-transparent focus:border-rose-200 pr-10"
                                placeholder={editingUser ? "New Password (Optional)" : "Temporary Password"} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-rose-300">
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        <button disabled={isSubmitting} type="submit" className="w-full bg-rose-900 hover:bg-rose-800 text-white py-3.5 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all">
                            {isSubmitting ? <Loader2 className="animate-spin mx-auto" size={16} /> : (editingUser ? "Update Account" : "Provision Account")}
                        </button>
                    </form>
                </div>

                <div className="xl:col-span-2 space-y-6">
                    {/* ...Stats remain same... */}
                    <div className="bg-white p-6 rounded-3xl border border-rose-100">
                        <div className="relative mb-6">
                            <Search className="absolute left-4 top-3.5 text-rose-300" size={16} />
                            <input className="w-full pl-11 pr-4 py-3 bg-rose-50 rounded-xl outline-none font-bold text-xs text-rose-900 border-2 border-transparent focus:border-rose-200"
                                placeholder="Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>

                        {loading ? <div className="text-center py-10 text-rose-400"><Loader2 className="animate-spin mx-auto" /></div> : (
                            <div className="space-y-3">
                                {filteredUsers.map((u) => (
                                    <div key={u.id} className="flex items-center justify-between p-4 bg-rose-50/50 rounded-2xl hover:bg-white hover:border hover:border-rose-100 transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-rose-400 border border-rose-100"><UserCheck size={18} /></div>
                                            <div>
                                                <h3 className="font-black text-rose-900 text-xs">{u.fullName}</h3>
                                                <p className="text-[9px] text-rose-400 font-bold uppercase">@{u.username} • {u.role?.replace('ROLE_', '')}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => startEdit(u)} className="p-2 text-rose-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={16} /></button>
                                            {u.username !== currentUser?.username && (
                                                <button onClick={() => handleDelete(u.id, u.username)} className="p-2 text-rose-200 hover:text-rose-600 hover:bg-rose-50 rounded-lg"><Trash2 size={16} /></button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;