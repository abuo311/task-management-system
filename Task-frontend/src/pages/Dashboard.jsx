import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';
import { Users, CheckCircle, Clock, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
        <div>
            <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">{title}</p>
            <h3 className="text-2xl font-extrabold mt-1 text-rose-950">{value}</h3>
        </div>
        <div className={`p-4 rounded-2xl ${color} bg-opacity-10`}>
            <Icon className={color.replace('bg-', 'text-')} size={24} />
        </div>
    </div>
);

const Dashboard = () => {
    const { hasRole } = useAuth();
    const [stats, setStats] = useState({ totalLaborers: 0, completed: 0, pending: 0, progress: 0, overdue: 0 });
    const [recentTasks, setRecentTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [statsRes, tasksRes] = await Promise.all([
                api.get('/dashboard/stats'),
                api.get('/tasks')
            ]);
            setStats(statsRes.data);
            setRecentTasks(tasksRes.data);
        } catch (error) {
            console.error("Dashboard error:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin text-rose-600" size={48} /></div>;

    return (
        <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
            {/* Stats Grid - Responsive 1 to 4 cols */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Workforce" value={stats.totalLaborers} icon={Users} color="bg-rose-600" />
                <StatCard title="Completed" value={stats.completed} icon={CheckCircle} color="bg-emerald-600" />
                <StatCard title="Ongoing" value={stats.pending + stats.progress} icon={Clock} color="bg-yellow-500" />
                <StatCard title="Overdue" value={stats.overdue} icon={AlertTriangle} color="bg-rose-950" />
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Recent Tasks Table */}
                <div className="xl:col-span-2 bg-white rounded-3xl shadow-sm border border-rose-100 p-6 md:p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="font-black text-xs uppercase tracking-widest text-rose-950">Recent Tasks</h2>
                        <Link to="/tasks" className="text-[10px] font-black text-rose-600 hover:text-rose-800 uppercase tracking-widest flex items-center gap-1">
                            View Board <ArrowRight size={14} />
                        </Link>
                    </div>
                    
                    <div className="w-full overflow-x-auto">
                        <table className="w-full text-left min-w-[500px]">
                            <thead>
                                <tr className="text-[10px] text-rose-400 uppercase">
                                    <th className="pb-4 font-black">Task</th>
                                    <th className="pb-4 font-black">Assignee</th>
                                    <th className="pb-4 font-black">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-rose-50 text-xs">
                                {recentTasks.slice(0, 5).map(task => (
                                    <tr key={task.id}>
                                        <td className="py-4 font-bold text-slate-800 truncate max-w-[200px]">{task.title}</td>
                                        <td className="py-4 text-rose-600 font-medium">{task.laborer?.name || 'Unassigned'}</td>
                                        <td className="py-4">
                                            <span className="px-3 py-1 bg-rose-50 text-rose-700 rounded-lg uppercase font-black text-[10px]">
                                                {task.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* System Monitor */}
                <div className="bg-white rounded-3xl border border-rose-100 p-8 shadow-sm h-fit">
                    <h2 className="font-black text-xs uppercase tracking-widest mb-6 text-rose-950">System Monitor</h2>
                    <div className="space-y-6">
                        <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-rose-600">Gateway</span>
                            <span className="font-black text-emerald-600 uppercase bg-emerald-50 px-2 py-1 rounded">Active</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-rose-600">Sync Status</span>
                            <span className="font-black text-rose-400">100% Complete</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;