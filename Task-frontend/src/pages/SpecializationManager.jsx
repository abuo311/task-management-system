import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext'; 
import { Plus, Trash2, Loader2, Hammer, AlertCircle, Menu, ChevronRight } from 'lucide-react';

const SpecializationManager = () => {
    const [specializations, setSpecializations] = useState([]);
    const [newName, setNewName] = useState('');
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [error, setError] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { hasRole } = useAuth();

    const canManage = hasRole('ROLE_SYSTEM_ADMIN') || hasRole('SYSTEM_ADMIN');

    useEffect(() => { 
        fetchSpecs(); 
    }, []);

    const fetchSpecs = async () => {
        try {
            setError(null);
            const res = await api.get('/specializations');
            setSpecializations(res.data);
        } catch (e) { 
            setError("Failed to load project trades. Please try again.");
        } finally { 
            setLoading(false); 
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newName.trim() || !canManage) return;

        setIsAdding(true);
        try {
            await api.post('/specializations', { name: newName });
            setNewName('');
            fetchSpecs();
        } catch (e) {
            const msg = e.response?.data?.message || "Permission denied.";
            alert(msg);
        } finally {
            setIsAdding(false);
        }
    };

    const handleDelete = async (id) => {
        if (!canManage) return;
        
        if (window.confirm("Delete this trade category?")) {
            try {
                await api.delete(`/specializations/${id}`);
                fetchSpecs();
            } catch (e) {
                alert("Could not delete trade. It may be in use by active laborers.");
            }
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen text-slate-900">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <main className="transition-all duration-300 min-h-screen flex flex-col md:ml-20 lg:ml-64">
                
                {/* Modern Header */}
                <header className="sticky top-0 bg-slate-50/80 backdrop-blur-md px-6 md:px-10 h-20 md:h-24 border-b border-slate-200/60 flex items-center justify-between z-30">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setIsSidebarOpen(true)} 
                            className="p-2.5 lg:hidden hover:bg-slate-200/50 rounded-xl transition-colors text-slate-600"
                        >
                            <Menu size={22} />
                        </button>
                        <div>
                            <div className="flex items-center gap-2">
                                <Hammer className="text-blue-600 hidden md:block" size={20} />
                                <h1 className="text-xl md:text-2xl font-black text-slate-950 tracking-tight">Project Trades</h1>
                            </div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Global Specializations</p>
                        </div>
                    </div>
                </header>

                <div className="p-6 md:p-10 max-w-4xl">
                    {error && (
                        <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold animate-in fade-in slide-in-from-top-4">
                            <AlertCircle size={20} />
                            {error}
                        </div>
                    )}

                    <div className="grid lg:grid-cols-5 gap-8">
                        {/* Left: Input Section */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 sticky top-32">
                                <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Add New Trade</h2>
                                <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                                    Create a new category to group laborers and organize project tasks more effectively.
                                </p>
                                
                                {canManage ? (
                                    <form onSubmit={handleAdd} className="space-y-3">
                                        <div className="relative group">
                                            <input 
                                                type="text" 
                                                className="w-full pl-5 pr-5 py-4 bg-slate-50 border border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none font-bold text-sm text-slate-700 transition-all shadow-inner"
                                                placeholder="e.g. Masonry"
                                                value={newName}
                                                onChange={(e) => setNewName(e.target.value)}
                                            />
                                        </div>
                                        <button 
                                            disabled={isAdding || !newName.trim()}
                                            type="submit" 
                                            className="w-full bg-slate-950 hover:bg-blue-600 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-200 transition-all active:scale-[0.98] flex justify-center items-center gap-2 disabled:opacity-50 disabled:scale-100 disabled:shadow-none"
                                        >
                                            {isAdding ? <Loader2 className="animate-spin" size={18} /> : <><Plus size={18} /> Create Trade</>}
                                        </button>
                                    </form>
                                ) : (
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase text-center tracking-widest">Read-Only Access</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right: List Section */}
                        <div className="lg:col-span-3">
                            <div className="flex items-center justify-between mb-6 px-2">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                    Active Database ({specializations.length})
                                </h3>
                            </div>

                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
                                    <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Syncing Trades...</p>
                                </div>
                            ) : specializations.length > 0 ? (
                                <div className="grid gap-3">
                                    {specializations.map((spec, index) => (
                                        <div 
                                            key={spec.id} 
                                            className="flex justify-between items-center px-6 py-5 bg-white rounded-[1.5rem] border border-slate-100 hover:border-blue-200 hover:shadow-md hover:shadow-blue-50/50 transition-all group animate-in fade-in slide-in-from-bottom-2"
                                            style={{ animationDelay: `${index * 50}ms` }}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                                    <ChevronRight size={18} />
                                                </div>
                                                <span className="font-bold text-slate-700 group-hover:text-slate-950 transition-colors">{spec.name}</span>
                                            </div>
                                            
                                            {canManage && (
                                                <button 
                                                    onClick={() => handleDelete(spec.id)} 
                                                    className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 p-2.5 hover:bg-red-50 rounded-xl transition-all"
                                                    title="Delete Trade"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 bg-slate-100/50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                                    <Hammer size={48} className="mx-auto text-slate-200 mb-4" />
                                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No Categories Found</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SpecializationManager;