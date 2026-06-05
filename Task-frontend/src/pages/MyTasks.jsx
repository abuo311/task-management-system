import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import Sidebar from '../components/Sidebar';
import { Loader2, Menu, ClipboardList, CheckCircle2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const MyTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        fetchMyTasks();
    }, []);

    const fetchMyTasks = async () => {
        setLoading(true);
        try {
            const res = await api.get('/tasks/my-tasks');
            setTasks(res.data);
        } catch (err) {
            toast.error("Failed to load your assignments");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (taskId, newStatus) => {
        try {
            await api.patch(`/tasks/${taskId}`, { status: newStatus });
            // Update local state immediately
            setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
            toast.success("Task status updated!");
        } catch (err) {
            toast.error("Unable to update status");
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen text-slate-900">
            <Toaster position="top-right" />
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            
            <main className="transition-all duration-300 min-h-screen flex flex-col md:ml-20 lg:ml-64">
                <header className="sticky top-0 bg-slate-50/80 backdrop-blur-md px-6 md:px-10 h-24 border-b border-slate-100 flex items-center justify-between z-30">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsSidebarOpen(true)} className="p-2.5 lg:hidden hover:bg-slate-200/50 rounded-xl text-slate-600">
                            <Menu size={22} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-black text-slate-950 tracking-tight">My Assignments</h1>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-0.5">Your Personal Worklist</p>
                        </div>
                    </div>
                </header>

                <div className="p-6 md:p-10 max-w-5xl">
                    {loading ? (
                        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-rose-900" size={32} /></div>
                    ) : tasks.length > 0 ? (
                        <div className="grid gap-4">
                            {tasks.map(task => (
                                <div key={task.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow">
                                    <div className="flex items-start gap-4 text-left">
                                        <div className={`p-4 rounded-2xl ${task.status === 'COMPLETED' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                                            <ClipboardList size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-slate-900 text-lg">{task.title}</h3>
                                            <p className="text-slate-500 text-sm mt-1">{task.description}</p>
                                            <div className="flex gap-3 mt-3">
                                                <span className="text-[9px] bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-black uppercase tracking-wider">
                                                    Due: {new Date(task.deadline).toLocaleDateString()}
                                                </span>
                                                <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-wider ${
                                                    task.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                                }`}>
                                                    {task.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {task.status !== 'COMPLETED' && (
                                        <button 
                                            onClick={() => handleStatusUpdate(task.id, 'COMPLETED')}
                                            className="bg-slate-950 hover:bg-green-700 text-white px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.15em] transition-all flex items-center gap-2"
                                        >
                                            <CheckCircle2 size={16} />
                                            Mark Done
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-200 text-slate-400 font-black uppercase text-[10px] tracking-[0.2em]">
                            No tasks currently assigned to you
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default MyTasks;