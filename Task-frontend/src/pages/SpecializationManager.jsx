import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Loader2, Hammer, AlertCircle, ChevronRight } from 'lucide-react';

const SpecializationManager = () => {
    const [specializations, setSpecializations] = useState([]);
    const [newName, setNewName] = useState('');
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [error, setError] = useState(null);
    const { hasRole } = useAuth();

    const canManage = hasRole('ROLE_SYSTEM_ADMIN') || hasRole('SYSTEM_ADMIN');

    useEffect(() => { fetchSpecs(); }, []);

    const fetchSpecs = async () => {
        try {
            setError(null);
            const res = await api.get('/specializations');
            setSpecializations(res.data);
        } catch (e) { setError("Failed to load project trades."); } 
        finally { setLoading(false); }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newName.trim() || !canManage) return;
        setIsAdding(true);
        try {
            await api.post('/specializations', { name: newName });
            setNewName('');
            fetchSpecs();
        } catch (e) { alert("Permission denied."); } 
        finally { setIsAdding(false); }
    };

    const handleDelete = async (id) => {
        if (!canManage || !window.confirm("Delete this trade category?")) return;
        try {
            await api.delete(`/specializations/${id}`);
            fetchSpecs();
        } catch (e) { alert("Could not delete. Trade may be in use."); }
    };

    return (
        <div className="p-6 md:p-10 max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-10">
                <h1 className="text-3xl font-black text-rose-950">Project Trades</h1>
                <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mt-1">Global Specialization Database</p>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-700 text-xs font-bold">
                    <AlertCircle size={16} /> {error}
                </div>
            )}

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Input Section */}
                <div className="bg-white p-8 rounded-3xl border border-rose-100 shadow-sm h-fit">
                    <h2 className="text-xs font-black text-rose-950 uppercase tracking-widest mb-4">Add New Trade</h2>
                    {canManage ? (
                        <form onSubmit={handleAdd} className="space-y-3">
                            <input 
                                type="text"
                                className="w-full px-5 py-3.5 bg-rose-50 rounded-2xl outline-none font-bold text-sm text-rose-900 border-2 border-transparent focus:border-rose-200 transition-all"
                                placeholder="e.g. Masonry"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                            />
                            <button 
                                disabled={isAdding || !newName.trim()}
                                type="submit" 
                                className="w-full bg-rose-900 hover:bg-rose-800 text-white py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest flex justify-center items-center gap-2 transition-all disabled:opacity-50"
                            >
                                {isAdding ? <Loader2 className="animate-spin" size={16} /> : <><Plus size={16} /> Create Trade</>}
                            </button>
                        </form>
                    ) : (
                        <div className="p-4 bg-slate-50 rounded-xl text-[10px] font-black uppercase text-center text-slate-400">Read-Only Access</div>
                    )}
                </div>

                {/* List Section */}
                <div className="lg:col-span-2">
                    <h3 className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-4 px-2">
                        Active Database ({specializations.length})
                    </h3>

                    {loading ? (
                        <div className="flex justify-center py-10 text-rose-300"><Loader2 className="animate-spin" size={32} /></div>
                    ) : (
                        <div className="grid gap-3">
                            {specializations.map((spec) => (
                                <div key={spec.id} className="flex justify-between items-center px-6 py-4 bg-white rounded-2xl border border-rose-50 hover:border-rose-200 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-400"><ChevronRight size={16} /></div>
                                        <span className="font-bold text-rose-900">{spec.name}</span>
                                    </div>
                                    {canManage && (
                                        <button 
                                            onClick={() => handleDelete(spec.id)} 
                                            className="text-rose-200 hover:text-rose-600 p-2 hover:bg-rose-50 rounded-lg transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SpecializationManager;