import React, { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import { UserPlus, Trash2, Edit3, X, Loader2, User, Key, Phone, Briefcase, Calendar, Award } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

// FIX: Move the functional component OUTSIDE the main component
const InputField = ({ icon: Icon, value, onChange, ...props }) => (
    <div className="relative">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
            <Icon size={18} />
        </div>
        <input
            {...props}
            value={value || ''}
            onChange={onChange}
            className="w-full pl-12 pr-5 py-4 rounded-2xl bg-white border-2 border-slate-100 text-base font-semibold focus:border-yellow-400 outline-none transition-all"
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

    const handleOpenForm = (laborer = null) => {
        if (laborer) {
            setIsEditing(true);
            setFormData({
                id: laborer.id || null,
                username: laborer.username ?? '',
                password: '',
                name: laborer.name ?? '',
                contactNumber: laborer.contactNumber ?? '',
                employmentType: laborer.employmentType || 'CASUAL',
                workCategory: laborer.workCategory ?? '',
                hireDate: laborer.hireDate ?? ''
            });
        } else {
            setIsEditing(false);
            setFormData({
                id: null, username: '', password: '', name: '',
                contactNumber: '', employmentType: 'CASUAL',
                workCategory: '', hireDate: ''
            });
        }
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (isEditing) {
                await api.put(`/laborers/${formData.id}`, formData);
                toast.success("Laborer updated successfully");
            } else {
                await api.post('/laborers', formData);
                toast.success("Laborer registered successfully");
            }
            setShowForm(false);
            fetchLaborers();
        } catch (error) {
            toast.error("Sync Error: " + (error.response?.data?.message || "Check connection"));
        } finally {
            setIsSaving(false);
        }
    };

    const deleteLaborer = async (id) => {
        if (window.confirm("Remove this worker?")) {
            try {
                await api.delete(`/laborers/${id}`);
                toast.success("Laborer removed");
                fetchLaborers();
            } catch (error) {
                toast.error("Could not delete worker");
            }
        }
    };

    return (
        <div className="p-6 md:p-10 bg-slate-50 min-h-screen">
            <Toaster position="top-right" />
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-4xl font-black text-slate-950">Labor Force</h1>
                    <p className="text-sm text-red-900 font-bold uppercase tracking-widest mt-1">Registry Management</p>
                </div>
                <button onClick={() => handleOpenForm()} className="flex items-center gap-3 bg-red-900 text-white px-8 py-4 rounded-2xl font-black text-lg hover:bg-red-800 shadow-xl shadow-red-900/20 transition-all">
                    <UserPlus size={22} /> Add Laborer
                </button>
            </div>

            {/* Table and Form remain the same... */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left">
                    {/* ... (Table content unchanged) */}
                    <tbody className="divide-y divide-slate-50">
                        {loading ? <tr><td colSpan="4" className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-yellow-500" size={40} /></td></tr> :
                            laborers.map((laborer) => (
                                <tr key={laborer.id} className="hover:bg-green-50/30 transition-colors">
                                    <td className="px-10 py-6 font-bold text-lg text-slate-900">{laborer.name}</td>
                                    <td className="px-10 py-6"><span className="bg-yellow-100 text-yellow-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">{laborer.workCategory}</span></td>
                                    <td className="px-10 py-6 text-base font-bold text-green-700">{laborer.employmentType}</td>
                                    <td className="px-10 py-6 text-right space-x-2">
                                        <button onClick={() => handleOpenForm(laborer)} className="text-slate-400 hover:text-yellow-600 p-2"><Edit3 size={20} /></button>
                                        <button onClick={() => deleteLaborer(laborer.id)} className="text-slate-400 hover:text-red-700 p-2"><Trash2 size={20} /></button>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex justify-center items-center p-4">
                    <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setShowForm(false)} className="absolute top-8 right-8 p-3 rounded-full bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-700"><X size={24} /></button>
                        <h2 className="text-3xl font-black mb-8 text-slate-950">{isEditing ? 'Update Worker' : 'New Registration'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <InputField icon={User} required placeholder="Username" value={formData.username} onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))} />
                            <InputField icon={User} required placeholder="Full Name" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} />
                            <InputField icon={Key} type="password" placeholder={isEditing ? "Password (leave blank to keep)" : "Password"} value={formData.password} onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))} />
                            <InputField icon={Phone} required placeholder="Contact Number" value={formData.contactNumber} onChange={(e) => setFormData(prev => ({ ...prev, contactNumber: e.target.value }))} />

                            {/* Employment Type Dropdown */}
                            <select
                                className="w-full px-5 py-4 rounded-2xl bg-white border-2 border-slate-100 text-base font-semibold focus:border-yellow-400 outline-none"
                                value={formData.employmentType}
                                onChange={(e) => setFormData(prev => ({ ...prev, employmentType: e.target.value }))}
                            >
                                <option value="CASUAL">Casual</option>
                                <option value="FULL_TIME">Full-time</option>
                                <option value="PART_TIME">Part-time</option>
                                <option value="CONTRACTOR">Contractor</option>
                            </select>

                            {/* Work Category Dropdown */}
                            <select
                                className="w-full px-5 py-4 rounded-2xl bg-white border-2 border-slate-100 text-base font-semibold focus:border-yellow-400 outline-none"
                                value={formData.workCategory}
                                onChange={(e) => setFormData(prev => ({ ...prev, workCategory: e.target.value }))}
                            >
                                <option value="">Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                                ))}
                            </select>

                            <InputField icon={Calendar} required type="date" value={formData.hireDate} onChange={(e) => setFormData(prev => ({ ...prev, hireDate: e.target.value }))} />

                            <button type="submit" disabled={isSaving} className="w-full bg-red-900 text-white py-5 rounded-2xl font-black text-lg uppercase tracking-widest hover:bg-green-700 transition-all mt-4">
                                {isSaving ? "Saving..." : "Save"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LaborerList;