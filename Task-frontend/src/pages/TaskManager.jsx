import React, { useEffect, useState, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import {
    Plus, User, Trash2, Calendar, Loader2, X, CheckCircle,
    Clock, Edit3, Filter, Menu, RefreshCw, Phone, ShieldCheck, FileText
} from 'lucide-react';

const TaskManager = () => {
    const { hasRole, user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [laborers, setLaborers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(null);
    const [filterCategory, setFilterCategory] = useState('All');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const [liveStats, setLiveStats] = useState({
        totalTasks: 0,
        pending: 0,
        progress: 0,
        completed: 0,
        overdue: 0
    });

    const initialFormState = {
        title: '', description: '', status: 'PENDING',
        laborerId: '', category: '', deadline: '', time: ''
    };

    const [formData, setFormData] = useState(initialFormState);

    const fetchData = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        setIsRefreshing(true);
        try {
            const [taskRes, laborerRes, specRes, statsRes] = await Promise.all([
                api.get('/tasks'),
                api.get('/laborers'),
                api.get('/specializations'),
                api.get('/dashboard/stats') 
            ]);

            setTasks(taskRes.data);
            setLaborers(laborerRes.data);
            setCategories(specRes.data.map(s => s.name));
            
            if (statsRes.data) {
                setLiveStats(statsRes.data);
            }
        } catch (error) {
            console.error("API Error Details:", error.response?.status, error.response?.data);
            if (error.response?.status === 403) {
                alert("Access Denied: You don't have permission to view this data.");
            }
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleOpenEdit = (task) => {
        setIsEditing(task.id);
        setFormData({
            title: task.title || '',
            description: task.description || '',
            status: task.status || 'PENDING',
            category: task.category || '',
            deadline: task.deadline || '',
            time: task.time || '',
            laborerId: task.laborer ? task.laborer.id.toString() : ''
        });
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setIsEditing(null);
        setFormData(initialFormState);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const selectedLaborer = laborers.find(l => l.id.toString() === formData.laborerId);
            const taskToSave = {
                ...formData,
                laborer: formData.laborerId ? { id: Number(formData.laborerId) } : null,
                laborerName: selectedLaborer ? selectedLaborer.name : "Unassigned",
                assignerName: user?.fullName || user?.username || "Admin",
                assignerPhone: user?.phoneNumber || ""
            };

            if (isEditing) {
                await api.put(`/tasks/${isEditing}`, taskToSave);
            } else {
                await api.post('/tasks', taskToSave);
            }

            handleCloseForm();
            await fetchData(true);
        } catch (error) {
            console.error("Save error", error);
            alert("Failed to save task.");
        } finally {
            setIsSaving(false);
        }
    };

    const updateTaskStatus = async (task, newStatus) => {
        const previousTasks = [...tasks];
        const previousStats = { ...liveStats };

        setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));

        try {
            await api.patch(`/tasks/${task.id}`, { status: newStatus });
            const statsRes = await api.get('/dashboard/stats');
            setLiveStats(statsRes.data);
        } catch (error) {
            setTasks(previousTasks);
            setLiveStats(previousStats);
            alert("Could not update status. Check server connection.");
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (window.confirm("Are you sure you want to delete this task?")) {
            try {
                await api.delete(`/tasks/${taskId}`);
                setTasks(prev => prev.filter(t => t.id !== taskId));
                const statsRes = await api.get('/dashboard/stats');
                setLiveStats(statsRes.data);
            } catch (error) {
                console.error("Delete error", error);
            }
        }
    };

    const filteredTasks = filterCategory === 'All' ? tasks : tasks.filter(t => t.category === filterCategory);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'COMPLETED': return 'bg-green-50 text-green-700 border-green-100';
            case 'OVERDUE': return 'bg-red-50 text-red-700 border-red-100';
            case 'CANCELLED': return 'bg-slate-200 text-slate-600 border-slate-300';
            case 'IN_PROGRESS': return 'bg-blue-50 text-blue-700 border-blue-100';
            default: return 'bg-amber-50 text-amber-700 border-amber-100';
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen text-slate-900">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="transition-all duration-300 min-h-screen flex flex-col md:ml-20 lg:ml-64">
                <header className="sticky top-0 bg-slate-50/80 backdrop-blur-md px-6 md:px-10 h-20 md:h-24 border-b border-slate-200/60 flex items-center justify-between z-30">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsSidebarOpen(true)} className="p-2.5 lg:hidden hover:bg-slate-200/50 rounded-xl transition-colors text-slate-600">
                            <Menu size={22} />
                        </button>
                        <div>
                            <h1 className="text-xl md:text-2xl font-black text-slate-950">Task Board</h1>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Live Operations</span>
                                {isRefreshing && <RefreshCw size={10} className="animate-spin text-blue-500" />}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => { setFormData(initialFormState); setIsEditing(null); setShowForm(true); }}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 md:px-6 py-2.5 md:py-3.5 rounded-xl text-xs md:text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
                    >
                        <Plus size={18} /> <span className="hidden xs:inline">New Task</span>
                    </button>
                </header>

                <div className="p-6 md:p-10 space-y-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: 'Pending', val: liveStats.pending, color: 'text-amber-500' },
                            { label: 'In Progress', val: liveStats.progress, color: 'text-blue-500' },
                            { label: 'Completed', val: liveStats.completed, color: 'text-green-500' },
                            { label: 'Overdue', val: liveStats.overdue, color: 'text-red-500' }
                        ].map((stat) => (
                            <div key={stat.label} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm transition-transform hover:scale-[1.02]">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                <p className={`text-2xl font-black ${stat.color}`}>{stat.val || 0}</p>
                            </div>
                        ))}
                    </div>

                    {/* Filter and Tasks List Rendering */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="relative w-full sm:w-64">
                            <Filter size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/5 appearance-none shadow-sm"
                            >
                                <option value="All">All Specialisations</option>
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                        {loading ? (
                            <div className="col-span-full py-20 flex flex-col items-center gap-4">
                                <Loader2 className="animate-spin text-blue-600" size={32} />
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Syncing Tasks...</p>
                            </div>
                        ) : filteredTasks.length > 0 ? (
                            filteredTasks.map((task) => (
                                <div key={task.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col hover:shadow-xl hover:shadow-slate-200/50 transition-all group relative overflow-hidden">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase border ${getStatusStyle(task.status)}`}>
                                            {task.status?.replace('_', ' ')}
                                        </span>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleOpenEdit(task)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit3 size={16} /></button>
                                            {hasRole('ROLE_SYSTEM_ADMIN') && (
                                                <button onClick={() => handleDeleteTask(task.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                                            )}
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-black text-slate-900 mb-2 leading-tight">{task.title}</h3>
                                    <div className="flex items-center gap-2 mb-4 bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                                        <User size={14} className="text-blue-500" />
                                        <span className="text-[11px] font-black text-slate-600 uppercase">Worker: {task.laborer?.name || 'Unassigned'}</span>
                                    </div>
                                    <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-3 min-h-[3rem]">{task.description || "No specific instructions provided."}</p>
                                    <div className="mt-auto pt-5 border-t border-slate-50 space-y-4">
                                        <div className="flex justify-between items-center px-1">
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-600"><Clock size={14} className="text-blue-500" /> {task.time || "---"}</div>
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-600"><Calendar size={14} className={task.status === 'OVERDUE' ? 'text-red-500' : 'text-blue-500'} /> {task.deadline || "TBD"}</div>
                                        </div>
                                        {task.status !== 'CANCELLED' && (
                                            <button
                                                onClick={() => updateTaskStatus(task, task.status === 'COMPLETED' ? 'IN_PROGRESS' : 'COMPLETED')}
                                                className={`w-full py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] ${task.status === 'COMPLETED' ? 'bg-green-100 text-green-700 hover:bg-green-200 shadow-green-100' : 'bg-slate-950 text-white hover:bg-slate-800 shadow-slate-200'}`}
                                            >
                                                <CheckCircle size={16} /> {task.status === 'COMPLETED' ? 'Re-open Task' : 'Mark Done'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center text-slate-400 font-bold italic">No tasks found.</div>
                        )}
                    </div>
                </div>

                {/* Form Modal */}
                {showForm && (
                    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[100] flex justify-center items-center p-4">
                        <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-950">{isEditing ? 'Edit Task' : 'New Task'}</h2>
                                    <p className="text-[10px] text-slate-400 font-black uppercase mt-1 tracking-widest">Project Workflow</p>
                                </div>
                                <button onClick={handleCloseForm} className="bg-slate-100 p-2 rounded-full hover:bg-slate-200 transition-colors"><X size={20} /></button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Task Title</label>
                                    <input required placeholder="e.g. Foundation Pouring" className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-bold text-sm"
                                        value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                                </div>

                                {/* Added Description Field */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                                    <textarea placeholder="Task details and instructions..." className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-bold text-sm h-24 resize-none"
                                        value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Deadline</label>
                                        <input type="date" className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-bold text-sm"
                                            value={formData.deadline} onChange={(e) => setFormData({ ...formData, deadline: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Time</label>
                                        <input type="time" className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-bold text-sm"
                                            value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                                        <select required className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-bold text-sm"
                                            value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                                            <option value="">Select</option>
                                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                                        <select required className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-bold text-sm"
                                            value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                                            <option value="PENDING">Pending</option>
                                            <option value="IN_PROGRESS">In Progress</option>
                                            <option value="COMPLETED">Completed</option>
                                            <option value="OVERDUE">Overdue</option>
                                            <option value="CANCELLED">Cancelled</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assign Laborer</label>
                                    <select className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-bold text-sm"
                                        value={formData.laborerId} onChange={(e) => setFormData({ ...formData, laborerId: e.target.value })}>
                                        <option value="">Unassigned</option>
                                        {laborers.map(lab => <option key={lab.id} value={lab.id}>{lab.name}</option>)}
                                    </select>
                                </div>

                                <button disabled={isSaving} type="submit" className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] flex justify-center items-center gap-3 shadow-xl transition-all hover:bg-blue-700 disabled:bg-slate-400 mt-4">
                                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : (isEditing ? 'Save Changes' : 'Create Task')}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default TaskManager;