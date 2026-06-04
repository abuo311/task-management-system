import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import Sidebar from '../components/Sidebar';
import { Loader2, Menu, ClipboardList, CheckCircle2 } from 'lucide-react';

const MyTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        const fetchMyTasks = async () => {
            try {
                const res = await api.get('/tasks/my-tasks');
                setTasks(res.data);
            } catch (err) {
                console.error("Failed to fetch personal tasks", err);
            } finally {
                setLoading(false);
            }
        };
        fetchMyTasks();
    }, []);

    const handleStatusUpdate = async (taskId, newStatus) => {
        try {
            await api.patch(`/tasks/${taskId}`, { status: newStatus });
            setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
        } catch (err) {
            alert("Failed to update status");
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen text-slate-900">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            
            <main className="transition-all duration-300 min-h-screen flex flex-col md:ml-20 lg:ml-64">
                <header className="sticky top-0 bg-slate-50/80 backdrop-blur-md px-6 md:px-10 h-20 md:h-24 border-b border-slate-200/60 flex items-center justify-between z-30">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsSidebarOpen(true)} className="p-2.5 lg:hidden hover:bg-slate-200/50 rounded-xl text-slate-600">
                            <Menu size={22} />
                        </button>
                        <div>
                            <h1 className="text-xl md:text-2xl font-black text-slate-950 tracking-tight">My Assignments</h1>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Your Personal Worklist</p>
                        </div>
                    </div>
                </header>

                <div className="p-6 md:p-10 max-w-5xl">
                    {loading ? (
                        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={32} /></div>
                    ) : tasks.length > 0 ? (
                        <div className="grid gap-4">
                            {tasks.map(task => (
                                <div key={task.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex items-start gap-4 text-left">
                                        <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
                                            <ClipboardList size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-slate-900 text-lg">{task.title}</h3>
                                            <p className="text-slate-500 text-sm mt-1">{task.description}</p>
                                            <div className="flex gap-3 mt-3">
                                                <span className="text-[9px] bg-slate-100 text-slate-600 px-2 py-1 rounded-full font-black uppercase tracking-tighter">
                                                    Due: {task.deadline}
                                                </span>
                                                <span className={`text-[9px] px-2 py-1 rounded-full font-black uppercase tracking-tighter ${
                                                    task.status === 'COMPLETED' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                                                }`}>
                                                    {task.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {task.status !== 'COMPLETED' && (
                                        <button 
                                            onClick={() => handleStatusUpdate(task.id, 'COMPLETED')}
                                            className="bg-slate-950 hover:bg-green-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2"
                                        >
                                            <CheckCircle2 size={16} />
                                            Mark Done
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-200 text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                            No tasks currently assigned to you
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default MyTasks;