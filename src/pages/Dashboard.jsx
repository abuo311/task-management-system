import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';
import {
    Users,
    CheckCircle2,
    Clock3,
    AlertTriangle,
    Search,
    Bell,
    ArrowRight,
    Loader2,
    Check,
    Trash2,
    X,
    Menu,
    Activity,
    TrendingUp,
    ShieldCheck
} from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, accent }) => (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
        
        <div className={`absolute top-0 right-0 h-24 w-24 rounded-full blur-3xl opacity-10 ${accent}`}></div>

        <div className="flex items-start justify-between relative z-10">
            <div>
                <p className="text-[11px] uppercase tracking-[0.25em] font-black text-slate-400">
                    {title}
                </p>

                <h3 className="mt-3 text-3xl md:text-4xl font-black text-slate-950 tracking-tight">
                    {value}
                </h3>
            </div>

            <div className={`p-4 rounded-2xl text-white shadow-lg ${accent}`}>
                <Icon size={24} />
            </div>
        </div>
    </div>
);

const Dashboard = () => {
    const { user, hasRole } = useAuth();

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

    const [sortConfig, setSortConfig] = useState({
        key: 'id',
        direction: 'desc'
    });

    const [selectedTasks, setSelectedTasks] = useState([]);

    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const notificationRef = useRef(null);

    const isPrivileged =
        hasRole('ROLE_ADMIN') || hasRole('ROLE_SYSTEM_ADMIN');

    // Determine if user is a laborer
    const isLaborer = hasRole('ROLE_LABORER');

    useEffect(() => {
        fetchDashboardData();

        const handleClickOutside = (e) => {
            if (
                notificationRef.current &&
                !notificationRef.current.contains(e.target)
            ) {
                setShowNotifications(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Laborers fetch their own tasks, others fetch all tasks
            const tasksEndpoint = isLaborer ? '/api/tasks/my-tasks' : '/api/tasks';

            const [statsRes, tasksRes] = await Promise.all([
                api.get('/api/dashboard/stats'),
                api.get(tasksEndpoint)
            ]);

            setStats(statsRes.data);
            setRecentTasks(tasksRes.data);

            const pendingCount = tasksRes.data.filter(
                (t) => t.status === 'PENDING'
            ).length;

            setUnreadCount(pendingCount);

        } catch (error) {
            console.error('Dashboard data error', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBulkComplete = async () => {
        if (selectedTasks.length === 0) return;

        setActionLoading(true);

        try {
            await Promise.all(
                selectedTasks.map((id) =>
                    api.patch(`/api/tasks/${id}`, {
                        status: 'COMPLETED'
                    })
                )
            );

            setSelectedTasks([]);

            await fetchDashboardData();

        } catch (error) {
            console.error('Bulk update failed', error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleBulkDelete = async () => {
        if (!isPrivileged) return;

        if (
            !window.confirm(
                `Delete ${selectedTasks.length} selected tasks?`
            )
        ) {
            return;
        }

        setActionLoading(true);

        try {
            await Promise.all(
                selectedTasks.map((id) =>
                    api.delete(`/api/tasks/${id}`)
                )
            );

            setSelectedTasks([]);

            await fetchDashboardData();

        } catch (error) {
            console.error('Bulk delete failed', error);
        } finally {
            setActionLoading(false);
        }
    };

    const processedTasks = useMemo(() => {
        let filtered = recentTasks.filter(
            (task) =>
                task.title
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                (task.laborer?.name || 'Unassigned')
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
        );

        return filtered
            .sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                if (sortConfig.key === 'laborer') {
                    aValue = a.laborer?.name || '';
                    bValue = b.laborer?.name || '';
                }

                if (aValue < bValue)
                    return sortConfig.direction === 'asc'
                        ? -1
                        : 1;

                if (aValue > bValue)
                    return sortConfig.direction === 'asc'
                        ? 1
                        : -1;

                return 0;
            })
            .slice(0, 8);

    }, [recentTasks, searchTerm, sortConfig]);

    const handleSelectAll = () => {
        const taskIds = processedTasks.map((task) => task.id);

        if (
            selectedTasks.length === taskIds.length &&
            taskIds.length > 0
        ) {
            setSelectedTasks([]);
        } else {
            setSelectedTasks(taskIds);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'COMPLETED':
                return 'bg-emerald-50 text-emerald-700 border border-emerald-100';

            case 'OVERDUE':
                return 'bg-red-50 text-red-700 border border-red-100';

            case 'IN_PROGRESS':
                return 'bg-blue-50 text-blue-700 border border-blue-100';

            default:
                return 'bg-amber-50 text-amber-700 border border-amber-100';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden">
            
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <main className="transition-all duration-300 md:ml-20 lg:ml-64 min-h-screen flex flex-col">

                {/* HEADER */}
                <header className="sticky top-0 z-30 h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200/70 px-6 md:px-10 flex items-center justify-between">
                    
                    <div className="flex items-center gap-4">

                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-2.5 rounded-xl hover:bg-slate-100 transition"
                        >
                            <Menu size={22} />
                        </button>

                        <div>
                            <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-950">
                                {isLaborer ? 'My Tasks Dashboard' : 'Operations Dashboard'}
                            </h1>

                            <p className="hidden sm:block text-[11px] uppercase tracking-[0.25em] font-bold text-slate-400 mt-1">
                                {isLaborer ? 'Your Personal Worklist' : 'Workforce Control Center'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">

                        {/* SEARCH */}
                        <div className="relative hidden md:block">
                            <Search
                                className="absolute left-4 top-3 text-slate-400"
                                size={16}
                            />

                            <input
                                type="search"
                                placeholder="Search tasks or workers..."
                                value={searchTerm}
                                onChange={(e) =>
                                    setSearchTerm(e.target.value)
                                }
                                className="w-64 lg:w-80 bg-white border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-sm font-medium outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all"
                            />
                        </div>

                        {/* NOTIFICATIONS */}
                        <div
                            className="relative"
                            ref={notificationRef}
                        >
                            <button
                                onClick={() => {
                                    setShowNotifications(
                                        !showNotifications
                                    );
                                    setUnreadCount(0);
                                }}
                                className={`relative p-3 rounded-2xl border transition-all ${
                                    showNotifications
                                        ? 'bg-slate-950 text-white border-slate-950'
                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                                }`}
                            >
                                <Bell size={18} />

                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-600 text-white text-[9px] font-black flex items-center justify-center border-2 border-white">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            {showNotifications && (
                                <div className="absolute right-0 mt-4 w-80 bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                    
                                    <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
                                        <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-500">
                                            Recent Notifications
                                        </h3>
                                    </div>

                                    <div className="max-h-72 overflow-y-auto">
                                        {recentTasks.slice(0, 5).map((task) => (
                                            <div
                                                key={task.id}
                                                className="px-5 py-4 border-b border-slate-100 hover:bg-slate-50 transition-colors"
                                            >
                                                <p className="text-sm font-bold text-slate-800 line-clamp-1">
                                                    {task.title}
                                                </p>

                                                <p className="text-[10px] uppercase tracking-wider font-black text-slate-400 mt-2">
                                                    {task.status}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    <Link
                                        to={isLaborer ? "/my-tasks" : "/tasks"}
                                        className="flex items-center justify-center gap-2 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-blue-700 hover:bg-blue-50 transition-all"
                                    >
                                        View All Updates
                                        <ArrowRight size={14} />
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* USER */}
                        <div className="pl-3 border-l border-slate-200 flex items-center gap-3">
                            <img
                                src={`https://ui-avatars.com/api/?name=${user?.fullName || 'User'}&background=0f172a&color=fff`}
                                alt="avatar"
                                className="w-10 h-10 rounded-2xl shadow-sm"
                            />

                            <div className="hidden md:block">
                                <p className="text-sm font-black text-slate-900">
                                    {user?.fullName || 'User'}
                                </p>

                                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                                    {isLaborer ? 'Laborer' : 'Operations User'}
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* BODY */}
                <div className="p-6 md:p-10 space-y-8">

                    {/* BULK ACTION BAR */}
                    {selectedTasks.length > 0 && !isLaborer && (
                        <div className="sticky top-24 z-20 bg-slate-950 text-white rounded-3xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl animate-in slide-in-from-top-4">
                            
                            <div className="flex items-center gap-3">
                                <span className="bg-blue-600 px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-widest">
                                    {selectedTasks.length} Selected
                                </span>

                                <button
                                    onClick={() =>
                                        setSelectedTasks([])
                                    }
                                    className="text-slate-400 hover:text-white transition"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="flex gap-3 w-full md:w-auto">

                                <button
                                    onClick={handleBulkComplete}
                                    disabled={actionLoading}
                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all"
                                >
                                    {actionLoading ? (
                                        <Loader2
                                            size={14}
                                            className="animate-spin"
                                        />
                                    ) : (
                                        <Check size={14} />
                                    )}

                                    Complete
                                </button>

                                {isPrivileged && (
                                    <button
                                        onClick={handleBulkDelete}
                                        disabled={actionLoading}
                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all"
                                    >
                                        <Trash2 size={14} />
                                        Delete
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* STATS - Hidden for laborers */}
                    {!isLaborer && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">

                            <StatCard
                                title="Workforce"
                                value={stats.totalLaborers || 0}
                                icon={Users}
                                accent="bg-slate-950"
                            />

                            <StatCard
                                title="Completed"
                                value={stats.completed || 0}
                                icon={CheckCircle2}
                                accent="bg-emerald-600"
                            />

                            <StatCard
                                title="Ongoing"
                                value={
                                    (Number(stats.pending) || 0) +
                                    (Number(stats.progress) || 0)
                                }
                                icon={Clock3}
                                accent="bg-blue-600"
                            />

                            <StatCard
                                title="Overdue"
                                value={stats.overdue || 0}
                                icon={AlertTriangle}
                                accent="bg-red-600"
                            />
                        </div>
                    )}

                    {/* MAIN GRID */}
                    <div className={isLaborer ? "" : "grid grid-cols-1 xl:grid-cols-3 gap-8"}>

                        {/* TASK TABLE */}
                        <div className={isLaborer ? "" : "xl:col-span-2"}>
                            <div className="bg-white border border-slate-200/70 rounded-3xl shadow-sm overflow-hidden">

                                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                                    <div>
                                        <h2 className="text-sm font-black uppercase tracking-[0.25em] text-slate-900">
                                            {isLaborer ? 'My Tasks' : 'Task Activity'}
                                        </h2>

                                        <p className="text-xs text-slate-400 mt-1 font-medium">
                                            {isLaborer ? 'Your assigned tasks' : 'Latest operational assignments'}
                                        </p>
                                    </div>

                                    {!isLaborer && (
                                        <Link
                                            to="/tasks"
                                            className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-blue-700 hover:gap-3 transition-all"
                                        >
                                            Open Board
                                            <ArrowRight size={14} />
                                        </Link>
                                    )}
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[650px] text-left">

                                        <thead className="bg-slate-50">
                                            <tr>
                                                {!isLaborer && (
                                                    <th className="px-8 py-5 w-10">
                                                        <input
                                                            type="checkbox"
                                                            checked={
                                                                processedTasks.length > 0 &&
                                                                selectedTasks.length ===
                                                                    processedTasks.length
                                                            }
                                                            onChange={handleSelectAll}
                                                            className="w-4 h-4 rounded border-slate-300 text-blue-600"
                                                        />
                                                    </th>
                                                )}

                                                <th
                                                    onClick={() =>
                                                        setSortConfig({
                                                            key: 'title',
                                                            direction:
                                                                sortConfig.direction ===
                                                                'asc'
                                                                    ? 'desc'
                                                                    : 'asc'
                                                        })
                                                    }
                                                    className="px-4 py-5 text-[11px] uppercase tracking-[0.2em] font-black text-slate-400 cursor-pointer"
                                                >
                                                    Task
                                                </th>

                                                {!isLaborer && (
                                                    <th className="px-4 py-5 text-[11px] uppercase tracking-[0.2em] font-black text-slate-400">
                                                        Assigned Worker
                                                    </th>
                                                )}

                                                <th className="px-4 py-5 text-[11px] uppercase tracking-[0.2em] font-black text-slate-400">
                                                    Status
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-slate-100">

                                            {loading ? (
                                                <tr>
                                                    <td
                                                        colSpan={isLaborer ? "3" : "4"}
                                                        className="py-20 text-center"
                                                    >
                                                        <Loader2
                                                            className="animate-spin mx-auto text-blue-600"
                                                            size={32}
                                                        />
                                                    </td>
                                                </tr>
                                            ) : processedTasks.length > 0 ? (
                                                processedTasks.map((task) => (
                                                    <tr
                                                        key={task.id}
                                                        className={`transition-colors hover:bg-slate-50 ${
                                                            !isLaborer && selectedTasks.includes(
                                                                task.id
                                                            )
                                                                ? 'bg-blue-50/50'
                                                                : ''
                                                        }`}
                                                    >
                                                        {!isLaborer && (
                                                            <td className="px-8 py-5">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedTasks.includes(
                                                                        task.id
                                                                    )}
                                                                    onChange={() =>
                                                                        setSelectedTasks(
                                                                            (prev) =>
                                                                                prev.includes(
                                                                                    task.id
                                                                                )
                                                                                    ? prev.filter(
                                                                                          (
                                                                                              i
                                                                                          ) =>
                                                                                              i !==
                                                                                              task.id
                                                                                      )
                                                                                    : [
                                                                                          ...prev,
                                                                                          task.id
                                                                                      ]
                                                                    }
                                                                    className="w-4 h-4 rounded border-slate-300 text-blue-600"
                                                                />
                                                            </td>
                                                        )}

                                                        <td className="px-4 py-5">
                                                            <div className="text-sm font-black text-slate-900">
                                                                {task.title}
                                                            </div>
                                                        </td>

                                                        {!isLaborer && (
                                                            <td className="px-4 py-5 text-sm font-medium text-slate-600">
                                                                {task.laborer?.name ||
                                                                    'Unassigned'}
                                                            </td>
                                                        )}

                                                        <td className="px-4 py-5">
                                                            <span
                                                                className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusStyle(
                                                                    task.status
                                                                )}`}
                                                            >
                                                                {task.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td
                                                        colSpan={isLaborer ? "3" : "4"}
                                                        className="py-20 text-center text-slate-400 font-medium"
                                                    >
                                                        No task records found.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* SIDEBAR PANEL - Hidden for laborers */}
                        {!isLaborer && (
                            <div className="space-y-6">

                                {/* SYSTEM STATUS */}
                                <div className="bg-white rounded-3xl border border-slate-200/70 p-8 shadow-sm">

                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="p-3 rounded-2xl bg-slate-950 text-white">
                                            <ShieldCheck size={20} />
                                        </div>

                                        <div>
                                            <h2 className="text-sm font-black uppercase tracking-[0.25em] text-slate-900">
                                                System Monitor
                                            </h2>

                                            <p className="text-xs text-slate-400 mt-1">
                                                Live infrastructure status
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>

                                                <span className="text-sm font-semibold text-slate-700">
                                                    API Gateway
                                                </span>
                                            </div>

                                            <span className="text-[11px] font-black uppercase tracking-widest text-emerald-600">
                                                Active
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 rounded-full bg-blue-500"></div>

                                                <span className="text-sm font-semibold text-slate-700">
                                                    Database Sync
                                                </span>
                                            </div>

                                            <span className="text-[11px] font-black uppercase tracking-widest text-blue-600">
                                                Stable
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 rounded-full bg-amber-500"></div>

                                                <span className="text-sm font-semibold text-slate-700">
                                                    Task Queue
                                                </span>
                                            </div>

                                            <span className="text-[11px] font-black uppercase tracking-widest text-amber-600">
                                                Processing
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* QUICK INSIGHTS */}
                                <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 rounded-3xl p-8 text-white shadow-2xl">

                                    <div className="flex items-center gap-3 mb-6">
                                        <Activity size={22} />
                                        <h2 className="text-sm font-black uppercase tracking-[0.25em]">
                                            Performance
                                        </h2>
                                    </div>

                                    <div className="space-y-6">

                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs uppercase tracking-widest text-slate-400 font-bold">
                                                    Completion Rate
                                                </span>

                                                <span className="text-sm font-black">
                                                    {stats.completed || 0}%
                                                </span>
                                            </div>

                                            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-emerald-500 rounded-full"
                                                    style={{
                                                        width: `${Math.min(
                                                            stats.completed || 0,
                                                            100
                                                        )}%`
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 bg-white/5 rounded-2xl p-4 border border-white/5">
                                            <div className="p-3 rounded-xl bg-blue-600">
                                                <TrendingUp size={18} />
                                            </div>

                                            <div>
                                                <p className="text-sm font-black">
                                                    Operations Stable
                                                </p>

                                                <p className="text-xs text-slate-400 mt-1">
                                                    Workforce productivity is healthy.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
