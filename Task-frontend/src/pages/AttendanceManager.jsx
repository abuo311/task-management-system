import React, { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import { User, Loader2, Save, CheckCircle, Clock } from 'lucide-react'; // Added Clock
import toast, { Toaster } from 'react-hot-toast';

const AttendanceManager = () => {
    const [laborers, setLaborers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [attendance, setAttendance] = useState({});
    const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
    const [mode, setMode] = useState('LOG');

    useEffect(() => {
        fetchData();
    }, [filterDate, mode]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [laborerRes, attendanceRes] = await Promise.all([
                api.get('/laborers'),
                api.get(`/attendance?date=${filterDate}`)
            ]);
            
            setLaborers(laborerRes.data);
            
            const attMap = {};
            attendanceRes.data.forEach(item => {
                attMap[item.laborerId] = {
                    completedCoreShift: item.completedCoreShift,
                    overtimeHours: item.overtimeHours || 0,
                    status: item.status
                };
            });
            setAttendance(attMap);
        } catch (err) {
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    // Modified to handle both boolean toggles and numeric inputs
    const handleUpdate = (id, field, value) => {
        if (mode === 'VIEW' || attendance[id]?.status === 'APPROVED') return;
        
        setAttendance(prev => ({
            ...prev,
            [id]: { 
                ...prev[id], 
                [field]: value !== undefined ? value : !prev[id]?.[field] 
            }
        }));
    };

    const handleSave = async (laborerId) => {
        const record = attendance[laborerId] || {};
        try {
            await api.post('/attendance', {
                laborerId,
                workDate: filterDate,
                completedCoreShift: record.completedCoreShift || false,
                overtimeHours: parseInt(record.overtimeHours || 0),
            });
            toast.success("Attendance saved successfully!");
            fetchData();
        } catch (err) {
            const errorMessage = err.response?.data || "Failed to save.";
            toast.error(errorMessage);
        }
    };

    return (
        <div className="p-8 bg-white min-h-screen">
            <Toaster position="top-right" />
            
            <div className="flex flex-col gap-6 mb-10 pb-6 border-b border-rose-100">
                <div className="flex justify-between items-center">
                    <h1 className="text-4xl font-extrabold text-rose-900">Attendance</h1>
                    <div className="bg-rose-50 p-1 rounded-2xl flex gap-1">
                        <button onClick={() => setMode('LOG')} className={`px-6 py-2 rounded-xl font-bold transition-all ${mode === 'LOG' ? 'bg-rose-800 text-white' : 'text-rose-800'}`}>Log</button>
                        <button onClick={() => setMode('VIEW')} className={`px-6 py-2 rounded-xl font-bold transition-all ${mode === 'VIEW' ? 'bg-rose-800 text-white' : 'text-rose-800'}`}>History</button>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <input 
                        type="date" 
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="p-4 rounded-xl border-2 border-emerald-100 text-lg font-bold text-slate-700 bg-white outline-none focus:border-emerald-500"
                    />
                    <p className="text-sm text-slate-500 font-medium">Viewing date: <span className="font-bold text-slate-900">{filterDate}</span></p>
                </div>
            </div>

            {loading ? (
                <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-rose-600" size={48} /></div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {laborers.map(lab => {
                        const rec = attendance[lab.id] || { completedCoreShift: false, overtimeHours: 0 };
                        const isApproved = rec.status === 'APPROVED';

                        return (
                            <div key={lab.id} className={`p-8 rounded-3xl border-2 ${rec.completedCoreShift ? 'border-emerald-200' : 'border-rose-50'} bg-white shadow-sm flex items-center justify-between`}>
                                <div className="flex items-center gap-4">
                                    <div className={`w-14 h-14 rounded-full flex items-center justify-center ${rec.completedCoreShift ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                                        <User size={24} className={rec.completedCoreShift ? 'text-emerald-700' : 'text-rose-700'}/>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900">{lab.name}</h3>
                                        <span className="text-xs font-bold text-amber-800 uppercase bg-amber-50 px-2 py-0.5 rounded-md">{lab.workCategory}</span>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                    {/* Overtime Input Field */}
                                    {rec.completedCoreShift && (
                                        <div className="flex flex-col items-center">
                                            <input 
                                                type="number" 
                                                min="0"
                                                value={rec.overtimeHours}
                                                onChange={(e) => handleUpdate(lab.id, 'overtimeHours', e.target.value)}
                                                className="w-16 p-2 text-center border rounded-lg font-bold text-amber-700 bg-amber-50"
                                                disabled={mode === 'VIEW' || isApproved}
                                            />
                                            <span className="text-[9px] font-bold text-slate-400 uppercase">OT Hrs</span>
                                        </div>
                                    )}

                                    <button 
                                        onClick={() => handleUpdate(lab.id, 'completedCoreShift')}
                                        disabled={mode === 'VIEW' || isApproved}
                                        className={`px-5 py-3 rounded-xl text-sm font-black uppercase ${rec.completedCoreShift ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-500'}`}
                                    >
                                        <CheckCircle size={16} className="inline mr-2" /> 
                                        {rec.completedCoreShift ? 'Present' : 'Absent'}
                                    </button>
                                    
                                    {mode === 'LOG' && !isApproved && (
                                        <button onClick={() => handleSave(lab.id)} className="bg-rose-800 text-white p-4 rounded-xl hover:bg-rose-900 transition-all">
                                            <Save size={20} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default AttendanceManager;