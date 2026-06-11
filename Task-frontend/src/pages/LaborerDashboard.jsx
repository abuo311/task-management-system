import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { Loader2, LayoutDashboard, Clock, CheckCircle2, AlertCircle, Menu } from 'lucide-react';

const LaborerDashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const res = await api.get('/tasks/my-tasks');
                setTasks(res.data);
            } catch (err) {
                console.error("Error loading tasks", err);
            } finally {
                setLoading(false);
            }
        };
        fetchTasks();
    }, []);

    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'COMPLETED').length;
    const pending = total - completed;

    return (
        <div className="min-h-screen">
            {/* Header matches your MyTasks design */}
            <header className="sticky top-0 bg-slate-50/80 backdrop-blur-md px-6 md:px-10 h-24 border-b border-slate-100 flex items-center justify-between z-30">
                <div className="flex items-center gap-4">
                    <button onClick={() => setIsSidebarOpen(true)} className="p-2.5 lg:hidden hover:bg-slate-200/50 rounded-xl text-slate-600">
                        <Menu size={22} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-950 tracking-tight">Work Dashboard</h1>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-0.5">Overview & Summary</p>
                    </div>
                </div>
            </header>

            <main className="p-6 md:p-10 max-w-5xl">
                {loading ? (
                    <div className="flex justify-center py-20"><Loader2 className="animate-spin text-rose-900" size={32} /></div>
                ) : (
                    <div className="space-y-6">
                        {/* Stats Row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <StatCard label="Total Tasks" value={total} icon={<LayoutDashboard />} />
                            <StatCard label="Pending" value={pending} icon={<Clock className="text-orange-500" />} />
                            <StatCard label="Completed" value={completed} icon={<CheckCircle2 className="text-green-500" />} />
                        </div>

                        {/* Urgent Tasks List */}
                        <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100">
                            <h2 className="font-black text-lg mb-6 flex items-center gap-2">
                                <AlertCircle size={20} className="text-rose-600" /> Recent Activity
                            </h2>
                            <div className="space-y-4">
                                {tasks.length > 0 ? (
                                    tasks.slice(0, 5).map(task => (
                                        <div key={task.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex justify-between items-center">
                                            <div>
                                                <p className="font-bold text-slate-900">{task.title}</p>
                                                <p className="text-xs text-slate-500">{task.description}</p>
                                            </div>
                                            <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full ${task.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                                {task.status}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-slate-400 text-xs font-bold uppercase">No tasks available</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

const StatCard = ({ label, value, icon }) => (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-4">
        <div className="p-3 bg-slate-50 text-slate-600 rounded-2xl">{icon}</div>
        <div>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">{label}</p>
            <p className="text-2xl font-black">{value}</p>
        </div>
    </div>
);

export default LaborerDashboard;