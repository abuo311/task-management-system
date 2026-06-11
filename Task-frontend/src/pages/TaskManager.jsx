import React, { useEffect, useState, useCallback } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit3, Calendar, Clock, Hash, Briefcase, User, UserCheck, X, Phone, Trash2, Check, Clock3 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const TaskManager = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [laborers, setLaborers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(null);

    const taskStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE', 'CANCELLED'];

    const initialFormState = {
        title: '', description: '', status: 'PENDING',
        laborerId: '', category: '', deadline: '', time: '',
        assignerName: '', assignerPhone: ''
    };

    const [formData, setFormData] = useState(initialFormState);

    const fetchData = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const [taskRes, laborerRes, specRes] = await Promise.all([
                api.get('/tasks'),
                api.get('/laborers'),
                api.get('/specializations')
            ]);
            setTasks(taskRes.data);
            setLaborers(laborerRes.data);
            setCategories(specRes.data.map(s => s.name));
        } catch (error) {
            console.error("Error fetching data", error);
            toast.error("Failed to load tasks");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const taskToSave = { 
                ...formData, 
                laborer: formData.laborerId ? { id: Number(formData.laborerId) } : null 
            };
            isEditing ? await api.put(`/tasks/${isEditing}`, taskToSave) : await api.post('/tasks', taskToSave);
            setShowForm(false);
            toast.success("Task saved successfully");
            fetchData(true);
        } catch (err) { 
            toast.error("Error saving task"); 
        }
        finally { setIsSaving(false); }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this task?")) {
            try {
                await api.delete(`/tasks/${id}`);
                toast.success("Task deleted");
                fetchData(true);
            } catch (err) { toast.error("Error deleting task"); }
        }
    };

    const updateStatus = async (task, newStatus) => {
        try {
            await api.put(`/tasks/${task.id}`, { 
                ...task, 
                status: newStatus, 
                laborer: task.laborer ? { id: task.laborer.id } : null 
            });
            fetchData(true);
        } catch (err) { toast.error("Error updating status"); }
    };

    return (
        <div className="p-8 bg-slate-50 min-h-screen">
            <Toaster position="top-right" />
            <div className="flex justify-between items-center mb-10 pb-6 border-b border-rose-100">
                <h1 className="text-4xl font-extrabold text-rose-900">Task Management</h1>
                <button 
                    onClick={() => { setFormData(initialFormState); setIsEditing(null); setShowForm(true); }}
                    className="flex items-center gap-3 bg-rose-800 text-white px-8 py-4 rounded-2xl text-lg font-bold hover:bg-rose-900"
                >
                    <Plus size={24} /> Add New Task
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {tasks.map((task) => (
                    <div key={task.id} className="p-6 rounded-3xl border border-rose-100 bg-white shadow-sm hover:shadow-md transition-all space-y-4">
                        <div className="flex justify-between items-start">
                            <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase ${task.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                                {task.status}
                            </span>
                            <div className="flex gap-2">
                                <button onClick={() => updateStatus(task, task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED')} className="text-slate-400 hover:text-emerald-600 transition-colors">
                                    {task.status === 'COMPLETED' ? <Clock3 size={18} /> : <Check size={18} />}
                                </button>
                                <button onClick={() => { 
                                    setIsEditing(task.id); 
                                    setFormData({...task, laborerId: task.laborer?.id || ''}); 
                                    setShowForm(true); 
                                }} className="text-slate-400 hover:text-rose-700 transition-colors"><Edit3 size={18} /></button>
                                <button onClick={() => handleDelete(task.id)} className="text-slate-400 hover:text-red-600 transition-colors"><Trash2 size={18} /></button>
                            </div>
                        </div>
                        
                        <div>
                            <h3 className="text-xl font-black text-slate-900">{task.title}</h3>
                            <p className="text-sm text-slate-500 mt-1">{task.description}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-600 bg-slate-50 p-3 rounded-xl">
                            <div className="flex items-center gap-2"><Hash size={14}/> ID: {task.id}</div>
                            <div className="flex items-center gap-2"><Briefcase size={14}/> {task.category}</div>
                            <div className="flex items-center gap-2"><Calendar size={14}/> {task.deadline}</div>
                            <div className="flex items-center gap-2"><Clock size={14}/> {task.time}</div>
                        </div>

                        <div className="border-t pt-4 space-y-2 text-xs text-slate-400 font-bold">
                            <div className="flex items-center gap-2 text-rose-800"><User size={14}/> {task.assignerName || 'System Admin'}</div>
                            <div className="flex items-center gap-2 text-rose-600"><Phone size={14}/> {task.assignerPhone || 'No Phone'}</div>
                            <div className="flex items-center gap-2"><UserCheck size={14}/> Laborer: {task.laborer?.name || 'Unassigned'}</div>
                        </div>
                    </div>
                ))}
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                    <div className="bg-white p-10 rounded-[2rem] w-full max-w-2xl shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-slate-900">{isEditing ? 'Update Task' : 'Create Task'}</h2>
                            <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 rounded-full"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <input className="col-span-2 p-3 border rounded-xl" placeholder="Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                                <textarea className="col-span-2 p-3 border rounded-xl h-24" placeholder="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                                <input type="text" className="p-3 border rounded-xl" placeholder="Assigner Name" value={formData.assignerName} onChange={e => setFormData({...formData, assignerName: e.target.value})} />
                                <input type="text" className="p-3 border rounded-xl" placeholder="Assigner Phone" value={formData.assignerPhone} onChange={e => setFormData({...formData, assignerPhone: e.target.value})} />
                                <input type="date" className="p-3 border rounded-xl" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} />
                                <input type="time" className="p-3 border rounded-xl" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
                                <select className="p-3 border rounded-xl" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                                    {taskStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                                <select className="p-3 border rounded-xl" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                                    <option value="">Category</option>
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <select className="col-span-2 p-3 border rounded-xl" value={formData.laborerId} onChange={e => setFormData({...formData, laborerId: e.target.value})}>
                                    <option value="">Select Laborer</option>
                                    {laborers.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                </select>
                            </div>
                            <button className="w-full bg-rose-900 text-white py-4 rounded-xl font-bold mt-4 hover:bg-rose-950">
                                {isSaving ? 'Saving...' : 'Submit Task'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskManager;