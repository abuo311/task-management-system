import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../api/axiosConfig';
import { UserPlus, Trash2, Edit3, X, Loader2, Menu } from 'lucide-react';

const LaborerList = () => {
    const [laborers, setLaborers] = useState([]);
    const [categories, setCategories] = useState([]); // New state for dynamic categories
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const [formData, setFormData] = useState({
        id: null,
        name: '',
        contactNumber: '',
        employmentType: 'CASUAL',
        workCategory: '',
        hireDate: ''
    });

    useEffect(() => {
        fetchLaborers();
        fetchCategories(); // Fetch dynamic categories on mount
    }, []);

    const fetchLaborers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/laborers');
            setLaborers(response.data);
        } catch (error) {
            console.error("Fetch Error:", error);
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
                id: laborer.id,
                name: laborer.name,
                contactNumber: laborer.contactNumber || '',
                employmentType: laborer.employmentType || 'CASUAL',
                workCategory: laborer.workCategory || '',
                hireDate: laborer.hireDate || ''
            });
        } else {
            setIsEditing(false);
            setFormData({ id: null, name: '', contactNumber: '', employmentType: 'CASUAL', workCategory: '', hireDate: '' });
        }
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (isEditing) {
                await api.put(`/laborers/${formData.id}`, formData);
            } else {
                await api.post('/laborers', formData);
            }
            setShowForm(false);
            fetchLaborers();
        } catch (error) {
            console.error("API Error:", error.response?.data || error.message);
            alert("Sync Error: Check console for details.");
        } finally {
            setIsSaving(false);
        }
    };

    const deleteLaborer = async (id) => {
        if (window.confirm("Remove this worker?")) {
            try {
                await api.delete(`/laborers/${id}`);
                fetchLaborers();
            } catch (error) {
                alert("Could not delete worker.");
            }
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen text-slate-900">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            {isSidebarOpen && <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}

            <main className="transition-all duration-300 min-h-screen flex flex-col md:ml-20 lg:ml-64">
                <header className="sticky top-0 bg-slate-50/80 backdrop-blur-md px-6 md:px-10 h-20 md:h-24 border-b border-slate-200/60 flex items-center justify-between z-30">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsSidebarOpen(true)} className="p-2.5 lg:hidden hover:bg-slate-200/50 rounded-xl transition-colors text-slate-600"><Menu size={22} /></button>
                        <div>
                            <h1 className="text-xl md:text-2xl font-black text-slate-950">Labor Force</h1>
                            <p className="hidden sm:block text-[10px] text-slate-500 font-bold uppercase tracking-wider">USTED Registry</p>
                        </div>
                    </div>
                    <button onClick={() => handleOpenForm()} className="flex items-center gap-2 bg-blue-600 text-white px-4 md:px-7 py-2.5 md:py-3.5 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold hover:bg-blue-700 shadow-lg transition-all active:scale-95">
                        <UserPlus size={18} /> <span className="hidden xs:inline">Add Laborer</span>
                    </button>
                </header>

                <div className="p-6 md:p-10">
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left min-w-[700px]">
                                <thead className="bg-slate-50/50">
                                    <tr>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Name</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {loading ? (<tr><td colSpan="4" className="px-8 py-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" size={32} /></td></tr>) :
                                        laborers.map((laborer) => (
                                            <tr key={laborer.id} className="hover:bg-slate-50/30">
                                                <td className="px-8 py-5 font-bold text-slate-900">{laborer.name}</td>
                                                <td className="px-8 py-5"><span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase">{laborer.workCategory}</span></td>
                                                <td className="px-8 py-5 text-xs font-bold text-slate-600">{laborer.employmentType}</td>
                                                <td className="px-8 py-5 text-right">
                                                    <button onClick={() => handleOpenForm(laborer)} className="text-slate-400 hover:text-blue-600 p-2"><Edit3 size={18} /></button>
                                                    <button onClick={() => deleteLaborer(laborer.id)} className="text-slate-400 hover:text-red-600 p-2"><Trash2 size={18} /></button>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {showForm && (
                    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[60] flex justify-center items-center p-4">
                        <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative">
                            <button onClick={() => setShowForm(false)} className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors">
                                <X size={20} />
                            </button>
                            <h2 className="text-2xl font-black mb-6">{isEditing ? 'Update Laborer' : 'Register Laborer'}</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Full Name</label>
                                    <input required type="text" className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold text-sm" placeholder="Enter name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Category</label>
                                    <select required className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold text-sm" value={formData.workCategory} onChange={(e) => setFormData({ ...formData, workCategory: e.target.value })}>
                                        <option value="">Select Category</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Employment Type</label>
                                    <select className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold text-sm" value={formData.employmentType} onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}>
                                        <option value="CASUAL">Casual</option>
                                        <option value="FULL_TIME">Full-Time</option>
                                        <option value="PART_TIME">Part-Time</option>
                                        <option value="CONTRACTOR">Contractor</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Hire Date</label>
                                    <input required type="date" className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold text-sm" value={formData.hireDate} onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })} />
                                </div>
                                <button disabled={isSaving} type="submit" className="w-full bg-slate-950 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl mt-2">
                                    {isSaving ? 'Saving...' : 'Save Laborer'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default LaborerList;