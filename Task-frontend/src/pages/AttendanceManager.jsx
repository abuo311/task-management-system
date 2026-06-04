import React, { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import { User, Loader2, Save, CheckCircle, Clock, Filter, Menu, RefreshCw } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import toast, { Toaster } from 'react-hot-toast';

const AttendanceManager = () => {
    const [laborers, setLaborers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [attendance, setAttendance] = useState({});
    const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsRefreshing(true);
        try {
            const res = await api.get('/laborers');
            setLaborers(res.data);
        } catch (err) {
            toast.error("Failed to load laborers");
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    const handleToggle = (id, field) => {
        setAttendance(prev => ({
            ...prev,
            [id]: { ...prev[id], [field]: !prev[id]?.[field] }
        }));
    };

    const handleSave = async (laborerId) => {
        const record = attendance[laborerId] || {};
        const otHours = parseInt(record.overtimeHours || 0);
        
        const loadingToast = toast.loading("Saving attendance...");
        try {
            await api.post('/attendance', {
                laborerId,
                workDate: filterDate,
                completedCoreShift: record.completedCoreShift || false,
                overtimeHours: otHours,
                workedOvertime: otHours > 0 
            });
            toast.dismiss(loadingToast);
            toast.success("Attendance saved successfully!");
        } catch (err) {
            toast.dismiss(loadingToast);
            toast.error(err.response?.data || "Failed to save.");
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen text-slate-900">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="transition-all duration-300 min-h-screen flex flex-col md:ml-20 lg:ml-64">
                {/* Header */}
                <header className="sticky top-0 bg-slate-50/80 backdrop-blur-md px-6 md:px-10 h-20 md:h-24 border-b border-slate-200/60 flex items-center justify-between z-30">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsSidebarOpen(true)} className="p-2.5 lg:hidden hover:bg-slate-200/50 rounded-xl transition-colors text-slate-600">
                            <Menu size={22} />
                        </button>
                        <div>
                            <h1 className="text-xl md:text-2xl font-black text-slate-950">Attendance</h1>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Daily Log</span>
                                {isRefreshing && <RefreshCw size={10} className="animate-spin text-blue-500" />}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="p-6 md:p-10 space-y-8">
                    {/* Date Filter */}
                    <div className="relative w-full sm:w-64">
                        <Filter size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="date" 
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/5 shadow-sm"
                        />
                    </div>

                    {loading ? (
                        <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-blue-600" size={32} /></div>
                    ) : (
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                            {laborers.map(lab => (
                                <div key={lab.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-lg transition-all">
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="w-12 h-12 rounded-full bg-blue-50 flex-none flex items-center justify-center">
                                            <User size={24} className="text-blue-600"/>
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="text-sm font-black text-slate-900 truncate">{lab.name}</h3>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lab.workCategory || 'N/A'}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => handleToggle(lab.id, 'completedCoreShift')}
                                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${attendance[lab.id]?.completedCoreShift ? 'bg-green-100 border-green-200 text-green-700' : 'bg-slate-50 border-slate-100 text-slate-500'}`}
                                        >
                                            <CheckCircle size={14} className="inline mr-1" /> Core
                                        </button>
                                        
                                        <input 
                                            type="number" 
                                            placeholder="OT" 
                                            className="w-14 p-2.5 rounded-xl border border-slate-100 bg-slate-50 text-center text-xs font-bold outline-none focus:border-blue-300"
                                            onChange={(e) => setAttendance(prev => ({...prev, [lab.id]: {...prev[lab.id], overtimeHours: e.target.value}}))}
                                        />
                                        
                                        <button onClick={() => handleSave(lab.id)} className="bg-slate-900 text-white p-3 rounded-xl hover:bg-blue-600 transition-all shadow-lg shadow-slate-200">
                                            <Save size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
            <Toaster position="top-right" />
        </div>
    );
};

export default AttendanceManager;