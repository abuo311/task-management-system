import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';
import {
    Users, CheckCircle, Clock, AlertTriangle, Search,
    Bell, ArrowRight, Loader2, Check, Trash2, X, Menu
} from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, bgColor }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group transition-all hover:shadow-lg hover:border-slate-200">
        <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
            <h3 className="text-2xl md:text-3xl font-extrabold mt-1 text-slate-950">{value}</h3>
        </div>
        <div className={`p-3 md:p-3.5 rounded-xl ${color} ${bgColor}`}>
            <Icon className="text-white" size={24} />
        </div>
    </div>
);

const Dashboard = () => {
    const { user, hasRole } = useAuth();
    // Updated initial state to match Backend Map keys
    const [stats, setStats] = useState({
        totalLaborers: 0,
        completed: 0,
        pending: 0,
        progress: 0,
        overdue: 0
    });
    const [recentTasks, setRecentTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });
    const [selectedTasks, setSelectedTasks] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const notificationRef = useRef(null);

    const isPrivileged = hasRole('ROLE_ADMIN') || hasRole('ROLE_SYSTEM_ADMIN') || hasRole('ROLE_MANAGER');

    useEffect(() => {
        fetchDashboardData();
        const handleClickOutside = (e) => {
            if (notificationRef.current && !notificationRef.current.contains(e.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            // 1. Get stats from our new optimized endpoint
            // 2. Get recent tasks for the table
            const [statsRes, tasksRes] = await Promise.all([
                api.get('/dashboard/stats'),
                api.get('/tasks')
            ]);

            setStats(statsRes.data);
            setRecentTasks(tasksRes.data);

            // Set unread notifications based on pending tasks
            const pendingCount = tasksRes.data.filter(t => t.status === 'PENDING').length;
            setUnreadCount(pendingCount);

        } catch (error) {
            console.error("Dashboard data error", error);
        } finally {
            setLoading(false);
        }
    };

    // Note: calculateStats is no longer needed as the backend does the math now!

    const handleBulkComplete = async () => {
        if (selectedTasks.length === 0) return;
        setActionLoading(true);
        try {
            await Promise.all(selectedTasks.map(id =>
                api.patch(`/tasks/${id}`, { status: 'COMPLETED' })
            ));
            setSelectedTasks([]);
            await fetchDashboardData();
        } catch (error) {
            console.error("Bulk update failed", error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleBulkDelete = async () => {
        if (!isPrivileged) return;
        if (!window.confirm(`Delete ${selectedTasks.length} tasks?`)) return;
        setActionLoading(true);
        try {
            await Promise.all(selectedTasks.map(id => api.delete(`/tasks/${id}`)));
            setSelectedTasks([]);
            await fetchDashboardData();
        } catch (error) {
            console.error("Bulk delete failed", error);
        } finally {
            setActionLoading(false);
        }
    };

    const processedTasks = useMemo(() => {
        let filtered = recentTasks.filter(task =>
            task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (task.laborer?.name || 'Unassigned').toLowerCase().includes(searchTerm.toLowerCase())
        );
        return filtered.sort((a, b) => {
            let aValue = a[sortConfig.key];
            let bValue = b[sortConfig.key];
            if (sortConfig.key === 'laborer') {
                aValue = a.laborer?.name || '';
                bValue = b.laborer?.name || '';
            }
            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        }).slice(0, 8);
    }, [recentTasks, searchTerm, sortConfig]);

    const handleSelectAll = () => {
        const taskIds = processedTasks.map(task => task.id);
        if (selectedTasks.length === taskIds.length && taskIds.length > 0) {
            setSelectedTasks([]);
        } else {
            setSelectedTasks(taskIds);
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen text-slate-900 flex overflow-x-hidden">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            {isSidebarOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
            )}

            <main className="flex-1 transition-all duration-300 min-h-screen flex flex-col md:ml-20 lg:ml-64 w-full">
                <header className="sticky top-0 bg-slate-50/80 backdrop-blur-md px-6 md:px-10 h-20 border-b border-slate-200/60 flex items-center justify-between z-30">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsSidebarOpen(true)} className="p-2.5 lg:hidden hover:bg-slate-200/50 rounded-xl transition-colors text-slate-600">
                            <Menu size={22} />
                        </button>
                        <div>
                            <h1 className="text-lg md:text-xl font-black text-slate-950">Project Pulse</h1>
                            <p className="hidden sm:block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Operations Command</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        <div className="relative group hidden md:block">
                            <Search className="absolute left-3.5 top-2.5 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={16} />
                            <input
                                type="search" placeholder="Search tasks..." value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-white px-10 py-2.5 rounded-xl border border-slate-200 text-xs w-48 lg:w-64 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all"
                            />
                        </div>

                        <div className="relative" ref={notificationRef}>
                            <button onClick={() => { setShowNotifications(!showNotifications); setUnreadCount(0); }}
                                className={`p-2.5 rounded-xl border transition-all relative ${showNotifications ? 'bg-slate-950 text-white border-slate-950' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-100'}`}>
                                <Bell size={18} />
                                {unreadCount > 0 && <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[8px] font-bold text-white border-2 border-slate-50">{unreadCount}</span>}
                            </button>

                            {showNotifications && (
                                <div className="absolute right-0 mt-3 w-72 md:w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                    <div className="px-5 py-4 border-b border-slate-50 bg-slate-50/50">
                                        <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-400">Recent Updates</h3>
                                    </div>
                                    <div className="max-h-64 overflow-y-auto">
                                        {recentTasks.slice(0, 5).map(task => (
                                            <div key={task.id} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                                <p className="text-xs font-bold text-slate-800 line-clamp-1">{task.title}</p>
                                                <p className="text-[9px] text-slate-500 mt-1 uppercase font-bold">{task.status}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <Link to="/tasks" className="block py-3 text-center text-[10px] font-black uppercase text-blue-600 hover:bg-blue-50">View All</Link>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                            <img src={`https://ui-avatars.com/api/?name=${user?.fullName || 'User'}&background=2563eb&color=fff`} className="w-8 h-8 rounded-lg shadow-sm" alt="User Avatar" />
                        </div>
                    </div>
                </header>

                <div className="p-6 md:p-10 space-y-8">
                    {/* Bulk Action Bar */}
                    {selectedTasks.length > 0 && (
                        <div className="sticky top-24 z-30 bg-slate-950 text-white px-6 py-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl border border-white/5 animate-in slide-in-from-top-4">
                            <div className="flex items-center gap-4">
                                <span className="text-xs font-bold bg-blue-600 px-2 py-1 rounded-md">{selectedTasks.length} selected</span>
                                <button onClick={() => setSelectedTasks([])} className="text-slate-400 hover:text-white transition-colors"><X size={16} /></button>
                            </div>
                            <div className="flex gap-2 w-full md:w-auto">
                                <button onClick={handleBulkComplete} disabled={actionLoading} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                                    {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Complete
                                </button>
                                {isPrivileged && (
                                    <button onClick={handleBulkDelete} disabled={actionLoading} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                                        <Trash2 size={14} /> Delete
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Workforce maps to totalLaborers */}
                        <StatCard title="Workforce" value={stats.totalLaborers || 0} icon={Users} color="bg-blue-600" bgColor="bg-blue-50" />

                        {/* Completed maps to completed */}
                        <StatCard title="Completed" value={stats.completed || 0} icon={CheckCircle} color="bg-green-600" bgColor="bg-green-50" />

                        {/* Ongoing logic: Backend provides 'pending' and 'progress' */}
                        <StatCard
                            title="Ongoing"
                            value={(Number(stats.pending) || 0) + (Number(stats.progress) || 0)}
                            icon={Clock}
                            color="bg-amber-600"
                            bgColor="bg-amber-50"
                        />

                        {/* Overdue maps to overdue */}
                        <StatCard title="Overdue" value={stats.overdue || 0} icon={AlertTriangle} color="bg-red-600" bgColor="bg-red-50" />
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        {/* Table Section */}
                        <div className="xl:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
                                <h2 className="font-black text-xs uppercase tracking-widest text-slate-900">Task Overview</h2>
                                <Link to="/tasks" className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1.5 hover:gap-2 transition-all">
                                    View Board <ArrowRight size={14} />
                                </Link>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left min-w-[500px]">
                                    <thead className="bg-slate-50/50">
                                        <tr>
                                            <th className="px-8 py-4 w-10">
                                                <input type="checkbox" checked={processedTasks.length > 0 && selectedTasks.length === processedTasks.length} onChange={handleSelectAll} className="w-4 h-4 rounded border-slate-300 text-blue-600" />
                                            </th>
                                            <th onClick={() => setSortConfig({ key: 'title', direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' })} className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer">Task</th>
                                            <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Assignee</th>
                                            <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {loading ? (
                                            <tr><td colSpan="4" className="p-16 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" size={32} /></td></tr>
                                        ) : processedTasks.map((task) => (
                                            <tr key={task.id} className={`hover:bg-slate-50/50 transition-colors ${selectedTasks.includes(task.id) ? 'bg-blue-50/50' : ''}`}>
                                                <td className="px-8 py-4">
                                                    <input type="checkbox" checked={selectedTasks.includes(task.id)} onChange={() => setSelectedTasks(prev => prev.includes(task.id) ? prev.filter(i => i !== task.id) : [...prev, task.id])} className="w-4 h-4 rounded border-slate-300 text-blue-600" />
                                                </td>
                                                <td className="px-4 py-4 text-xs font-bold text-slate-800">{task.title}</td>
                                                <td className="px-4 py-4 text-slate-600 text-xs font-medium">{task.laborer?.name || 'Unassigned'}</td>
                                                <td className="px-4 py-4">
                                                    <span className={`text-[9px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider ${task.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : task.status === 'OVERDUE' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                                        {task.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Sidebar Monitor */}
                        <div className="bg-white rounded-3xl border border-slate-100 p-8 h-fit shadow-sm">
                            <h2 className="font-black text-xs uppercase tracking-widest text-slate-900 mb-8 border-b border-slate-50 pb-4">Live System Monitor</h2>
                            <div className="space-y-8">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
                                        <span className="text-xs font-bold text-slate-600">Gateway Status</span>
                                    </div>
                                    <span className="text-[10px] font-black text-green-600 uppercase">Active</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                                        <span className="text-xs font-bold text-slate-600">DB Synchronization</span>
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase">100%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;