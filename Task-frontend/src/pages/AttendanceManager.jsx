import React, { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import { User, Loader2, Save, CheckCircle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const AttendanceManager = () => {
    const [laborers, setLaborers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [attendance, setAttendance] = useState({});
    const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/laborers');
            setLaborers(res.data);
        } catch (err) {
            toast.error("Failed to load laborers");
        } finally {
            setLoading(false);
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
        
        try {
            await api.post('/attendance', {
                laborerId,
                workDate: filterDate,
                completedCoreShift: record.completedCoreShift || false,
                overtimeHours: otHours,
                workedOvertime: otHours > 0 
            });
            toast.success("Attendance updated!");
        } catch (err) {
            toast.error("Failed to save.");
        }
    };

    return (
        <div className="p-4 md:p-8 bg-white min-h-screen text-base">
            <Toaster position="top-right" />
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-6 border-b border-rose-100 gap-4">
                <h1 className="text-3xl md:text-4xl font-extrabold text-rose-900">Attendance Log</h1>
                <input 
                    type="date" 
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="w-full sm:w-auto p-4 rounded-xl border-2 border-rose-100 font-bold text-rose-900 bg-rose-50"
                />
            </div>

            {loading ? (
                <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-rose-600" size={48} /></div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {laborers.map(lab => (
                        <div key={lab.id} className="bg-white p-4 md:p-6 rounded-[2rem] border-2 border-rose-50 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-center justify-between gap-4">
                            {/* Profile Info */}
                            <div className="flex items-center gap-4 w-full sm:w-auto">
                                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-rose-50 flex items-center justify-center flex-shrink-0">
                                    <User size={24} className="text-rose-700"/>
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-lg md:text-xl font-black text-slate-900 truncate">{lab.name}</h3>
                                    <p className="text-xs font-bold text-amber-700 uppercase tracking-widest">{lab.workCategory || 'General'}</p>
                                </div>
                            </div>
                            
                            {/* Controls - Flex wrapped for mobile */}
                            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                                <button 
                                    onClick={() => handleToggle(lab.id, 'completedCoreShift')}
                                    className={`flex-grow sm:flex-grow-0 px-4 py-3 rounded-xl text-sm font-black uppercase transition-all ${attendance[lab.id]?.completedCoreShift ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-50 text-slate-500'}`}
                                >
                                    <CheckCircle size={18} className="inline mr-2" /> 
                                    {attendance[lab.id]?.completedCoreShift ? 'In' : 'Out'}
                                </button>
                                
                                <input 
                                    type="number" 
                                    placeholder="OT" 
                                    className="w-16 p-3 rounded-xl border-2 border-amber-100 bg-amber-50 text-center font-bold outline-none focus:border-amber-300"
                                    onChange={(e) => setAttendance(prev => ({...prev, [lab.id]: {...prev[lab.id], overtimeHours: e.target.value}}))}
                                />
                                
                                <button onClick={() => handleSave(lab.id)} className="bg-rose-800 text-white p-4 rounded-xl hover:bg-rose-900 transition-all shadow-md">
                                    <Save size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AttendanceManager;