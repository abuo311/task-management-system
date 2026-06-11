import React, { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import { UserPlus, Trash2, Edit3, X, Loader2, User, Key, Phone, Calendar, Briefcase, Clock } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const InputField = ({ icon: Icon, value, onChange, ...props }) => (
    <div className="relative">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
            <Icon size={18} />
        </div>
        <input
            {...props}
            value={value || ''}
            onChange={onChange}
            className="w-full pl-12 pr-5 py-4 rounded-xl border-2 border-slate-100 text-lg font-semibold focus:border-rose-500 outline-none transition-all"
        />
    </div>
);

const LaborerList = () => {
    const [laborers, setLaborers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        id: null, username: '', password: '', name: '', contactNumber: '',
        employmentType: 'CASUAL', workCategory: '', hireDate: ''
    });

    useEffect(() => {
        fetchLaborers();
        fetchCategories();
    }, []);

    const fetchLaborers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/laborers');
            setLaborers(response.data);
        } catch (error) {
            toast.error("Failed to fetch laborers");
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await api.get('/specializations');
            setCategories(response.data);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to remove this laborer?")) {
            try {
                await api.delete(`/laborers/${id}`);
                toast.success("Laborer removed");
                fetchLaborers();
            } catch (error) {
                toast.error("Delete failed");
            }
        }
    };

    const handleOpenForm = (laborer = null) => {
        if (laborer) {
            setIsEditing(true);
            setFormData({ ...laborer, password: '' });
        } else {
            setIsEditing(false);
            setFormData({ id: null, username: '', password: '', name: '', contactNumber: '', employmentType: 'CASUAL', workCategory: '', hireDate: '' });
        }
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            isEditing ? await api.put(`/laborers/${formData.id}`, formData) : await api.post('/laborers', formData);
            toast.success(isEditing ? "Updated successfully" : "Registered successfully");
            setShowForm(false);
            fetchLaborers();
        } catch (error) {
            toast.error("Save failed.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-8 bg-slate-50 min-h-screen">
            <Toaster position="top-right" />

            <div className="flex justify-between items-center mb-10 pb-6 border-b border-rose-100">
                <div>
                    <h1 className="text-4xl font-extrabold text-rose-950">Labor Force</h1>
                    <p className="text-sm font-bold text-rose-500 uppercase tracking-widest mt-1">Registry Management</p>
                </div>
                <button
                    onClick={() => handleOpenForm()}
                    className="flex items-center gap-3 bg-rose-700 text-white px-8 py-4 rounded-2xl text-lg font-bold hover:bg-rose-800 transition-all shadow-lg"
                >
                    <UserPlus size={22} /> Add Laborer
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {loading ? <Loader2 className="animate-spin text-rose-600" size={40} /> :
                    laborers.map((laborer) => (
                        <div key={laborer.id} className="p-6 rounded-3xl border border-rose-100 bg-white shadow-sm hover:shadow-xl transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-black text-slate-950">{laborer.name}</h3>
                                    {laborer.employmentType === 'FULL_TIME' && (
                                        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md uppercase tracking-wider mt-1 block w-fit">
                                            On Govt Payroll
                                        </span>
                                    )}
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => handleOpenForm(laborer)} className="text-slate-400 hover:text-rose-700 p-2"><Edit3 size={18} /></button>
                                    <button onClick={() => handleDelete(laborer.id)} className="text-slate-400 hover:text-red-600 p-2"><Trash2 size={18} /></button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-slate-600 font-semibold text-sm">
                                    <Briefcase size={16} className="text-rose-400" /> {laborer.workCategory}
                                </div>
                                <div className="flex items-center gap-3 text-slate-600 font-semibold text-sm">
                                    <Phone size={16} className="text-rose-400" /> {laborer.contactNumber}
                                </div>
                                <div className="flex items-center gap-3 text-slate-600 font-semibold text-sm">
                                    <Clock size={16} className="text-rose-400" /> {laborer.employmentType.replace('_', ' ')}
                                </div>
                                <div className="flex items-center gap-3 text-slate-600 font-semibold text-sm">
                                    <Calendar size={16} className="text-rose-400" /> Hired: {laborer.hireDate}
                                </div>
                            </div>
                        </div>
                    ))
                }
            </div>

           {showForm && (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={() => setShowForm(false)}
        />
        
        {/* Modal Container */}
        <div className="relative bg-white p-8 md:p-10 rounded-[2rem] w-full max-w-2xl shadow-2xl z-[101]">
            
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-rose-950">
                    {isEditing ? 'Update Worker' : 'New Registration'}
                </h2>
                <button 
                    type="button" 
                    onClick={() => setShowForm(false)} 
                    className="p-2 bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 rounded-full transition-all"
                >
                    <X size={24} />
                </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 md:col-span-1">
                        <InputField icon={User} required placeholder="Username" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                        <InputField icon={User} required placeholder="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div className="col-span-2">
                        <InputField icon={Key} type="password" placeholder="New Password (or leave blank)" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                    </div>
                    <div className="col-span-2">
                        <InputField icon={Phone} required placeholder="Contact Number" value={formData.contactNumber} onChange={e => setFormData({...formData, contactNumber: e.target.value})} />
                    </div>
                    
                    <select className="col-span-2 md:col-span-1 p-4 rounded-xl border-2 border-slate-100 text-lg font-semibold text-slate-700 outline-none focus:border-rose-500" value={formData.employmentType} onChange={e => setFormData({...formData, employmentType: e.target.value})}>
                        <option value="CASUAL">Casual</option>
                        <option value="FULL_TIME">Full-time</option>
                        <option value="PART_TIME">Part-time</option>
                        <option value="CONTRACTOR">Contractor</option>
                    </select>

                    <select className="col-span-2 md:col-span-1 p-4 rounded-xl border-2 border-slate-100 text-lg font-semibold text-slate-700 outline-none focus:border-rose-500" value={formData.workCategory} onChange={e => setFormData({...formData, workCategory: e.target.value})}>
                        <option value="">Select Category</option>
                        {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                    </select>
                    
                    <div className="col-span-2">
                        <InputField icon={Calendar} required type="date" value={formData.hireDate} onChange={e => setFormData({...formData, hireDate: e.target.value})} />
                    </div>
                </div>

                <button disabled={isSaving} className="w-full bg-rose-700 text-white py-4 rounded-2xl text-lg font-black hover:bg-rose-800 transition-all mt-4">
                    {isSaving ? 'Processing...' : 'Save Registry'}
                </button>
            </form>
        </div>
    </div>
)}
        </div>
    );
};

export default LaborerList;