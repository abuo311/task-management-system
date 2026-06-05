import React, { useEffect, useState, useCallback } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { Plus, User, Trash2, Calendar, Loader2, X, CheckCircle, Clock, Edit3, Filter, RefreshCw } from 'lucide-react';

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
    
    // Color Palette Definition: 
    // Light Wine: bg-rose-50 / text-rose-800
    // Green: bg-emerald-50 / text-emerald-700
    // Yellow: bg-amber-50 / text-amber-700
    // White: bg-white

    const initialFormState = {
        title: '', description: '', status: 'PENDING',
        laborerId: '', category: '', deadline: '', time: ''
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
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const taskToSave = { ...formData, laborer: formData.laborerId ? { id: Number(formData.laborerId) } : null };
            isEditing ? await api.put(`/tasks/${isEditing}`, taskToSave) : await api.post('/tasks', taskToSave);
            setShowForm(false);
            fetchData(true);
        } catch (err) { alert("Error saving task"); }
        finally { setIsSaving(false); }
    };

    return (
        <div className="p-8 bg-white min-h-screen text-lg">
            {/* Action Bar */}
            <div className="flex justify-between items-center mb-10 pb-6 border-b border-rose-100">
                <h1 className="text-4xl font-extrabold text-rose-900">Task Management</h1>
                <button 
                    onClick={() => { setFormData(initialFormState); setShowForm(true); }}
                    className="flex items-center gap-3 bg-rose-800 text-white px-8 py-4 rounded-2xl text-lg font-bold hover:bg-rose-900 transition-all"
                >
                    <Plus size={24} /> Add New Task
                </button>
            </div>

            {/* Task Grid - Increased font sizes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {tasks.map((task) => (
                    <div key={task.id} className="p-8 rounded-3xl border-2 border-rose-50 bg-white shadow-sm hover:shadow-lg transition-all">
                        <div className="flex justify-between items-start mb-6">
                            <span className="px-4 py-1.5 rounded-full text-sm font-bold bg-amber-50 text-amber-800">{task.status}</span>
                            <div className="flex gap-3">
                                <button onClick={() => { setIsEditing(task.id); setFormData(task); setShowForm(true); }} className="text-rose-700"><Edit3 size={20} /></button>
                            </div>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-3">{task.title}</h3>
                        <p className="text-slate-600 mb-6 text-base">{task.description}</p>
                        <div className="flex justify-between text-emerald-800 font-semibold">
                            <span><Calendar className="inline mr-2" size={18}/>{task.deadline}</span>
                            <span><Clock className="inline mr-2" size={18}/>{task.time}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Form Modal with Palette Colors */}
            {showForm && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
                    <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[2rem] w-full max-w-2xl shadow-2xl space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-3xl font-black text-rose-900">{isEditing ? 'Update Task' : 'Create Task'}</h2>
                            <button type="button" onClick={() => setShowForm(false)}><X size={30} /></button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-6">
                            <input className="col-span-2 p-4 rounded-xl border-2 border-rose-100 text-lg" placeholder="Task Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                            <textarea className="col-span-2 p-4 rounded-xl border-2 border-rose-100 text-lg h-32" placeholder="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                            <input type="date" className="p-4 rounded-xl border-2 border-emerald-100 text-lg" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} />
                            <input type="time" className="p-4 rounded-xl border-2 border-emerald-100 text-lg" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
                            <select className="p-4 rounded-xl border-2 border-amber-100 text-lg" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                                <option value="">Select Category</option>
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <select className="p-4 rounded-xl border-2 border-amber-100 text-lg" value={formData.laborerId} onChange={e => setFormData({...formData, laborerId: e.target.value})}>
                                <option value="">Select Laborer</option>
                                {laborers.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                            </select>
                        </div>

                        <button className="w-full bg-emerald-700 text-white py-5 rounded-xl text-xl font-black hover:bg-emerald-800">
                            {isSaving ? 'Saving...' : 'Submit Task'}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default TaskManager;