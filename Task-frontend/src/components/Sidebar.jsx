// src/components/Sidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    LayoutDashboard, Users, ClipboardList, User, HardHat, 
    X, Shield, Hammer, UserPlus, LogOut, CheckSquare, ClipboardCheck 
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
    const { logout, hasRole, user } = useAuth();
    const location = useLocation();

    const isAdmin = hasRole('ROLE_SYSTEM_ADMIN') || hasRole('ROLE_ADMIN');
    const isStandardUser = hasRole('ROLE_USER');
    const isManager = hasRole('ROLE_MANAGER');

    const menuItems = [
        { name: 'Overview', icon: LayoutDashboard, path: '/dashboard' },
        ...(isAdmin || isManager ? [
            { name: 'My Laborers', icon: Users, path: '/laborers' },
            { name: 'Task Board', icon: ClipboardList, path: '/tasks' },
            { name: 'Attendance', icon: ClipboardCheck, path: '/attendance' },
        ] : []),
        ...(isStandardUser ? [
            { name: 'My Tasks', icon: CheckSquare, path: '/my-tasks' },
        ] : []),
        { name: 'My Profile', icon: User, path: '/profile' },
    ];

    const activeColor = "bg-emerald-600 text-white shadow-lg shadow-emerald-900/20";
    const hoverColor = "hover:bg-rose-900/50 hover:text-white";

    return (
        <aside className={`fixed inset-y-0 left-0 z-50 bg-rose-950 text-white flex flex-col shadow-2xl transition-all duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 h-screen border-r border-white/10 md:w-20 lg:w-64`}>
            <style>{`
                .custom-thin-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-thin-scrollbar::-webkit-scrollbar-thumb { background: #881337; border-radius: 10px; }
            `}</style>

            <div className="h-20 flex items-center justify-between px-6 border-b border-rose-900">
                <div className="flex items-center gap-3.5 mx-auto lg:mx-0">
                    <div className="bg-emerald-600/20 p-2 rounded-xl border border-emerald-500/30">
                        <HardHat className="text-emerald-400" size={22} />
                    </div>
                    <span className="font-bold text-xl text-white hidden lg:block">
                        Labor<span className='text-yellow-400'>Flow</span>
                    </span>
                </div>
                <button onClick={onClose} className="md:hidden p-2 text-rose-300 hover:text-white"><X size={20} /></button>
            </div>

            <nav className="flex-1 mt-6 px-3 lg:px-4 space-y-1.5 overflow-y-auto custom-thin-scrollbar">
                {menuItems.map((item) => (
                    <Link key={item.name} to={item.path} onClick={() => window.innerWidth < 1024 && onClose()}
                        className={`flex items-center justify-center lg:justify-start gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all ${location.pathname === item.path ? activeColor : `text-rose-200 ${hoverColor}`}`}>
                        <item.icon size={20} />
                        <span className="hidden lg:block">{item.name}</span>
                    </Link>
                ))}

                {(isAdmin || isManager) && (
                    <div className="mt-6 pt-6 border-t border-rose-900">
                        <h3 className="hidden lg:flex px-4 text-[10px] font-black text-yellow-400 uppercase tracking-[0.2em] mb-3 items-center gap-2">
                            <Shield size={12} /> Management
                        </h3>
                        {isAdmin && (
                            <Link to="/users" className={`flex items-center justify-center lg:justify-start gap-3.5 px-4 py-3 rounded-xl text-sm transition-all ${location.pathname === '/users' ? activeColor : 'text-rose-200 hover:bg-rose-900/50'}`}>
                                <UserPlus size={20} /> <span className="hidden lg:block">Add New Users</span>
                            </Link>
                        )}
                        <Link to="/settings" className={`flex items-center justify-center lg:justify-start gap-3.5 px-4 py-3 rounded-xl text-sm transition-all ${location.pathname === '/settings' ? activeColor : 'text-rose-200 hover:bg-rose-900/50'}`}>
                            <Hammer size={20} /> <span className="hidden lg:block">Project Trades</span>
                        </Link>
                    </div>
                )}
            </nav>

            <div className="mt-auto p-4 bg-rose-900/30 border-t border-rose-900">
                <div className="hidden lg:flex items-center gap-3 px-2 py-3 mb-2">
                    <div className="h-9 w-9 rounded-2xl bg-emerald-600 flex items-center justify-center font-bold text-sm text-white">
                        {user?.fullName?.charAt(0) || 'U'}
                    </div>
                    <div>
                        <p className="text-sm font-bold text-white truncate">{user?.fullName}</p>
                        <p className="text-[9px] text-yellow-400 font-black uppercase tracking-tighter">
                            {(user?.role || '').replace('ROLE_', '')}
                        </p>
                    </div>
                </div>
                <button onClick={logout} className="flex items-center justify-center lg:justify-start gap-3.5 w-full px-4 py-3 text-sm font-bold text-rose-300 hover:text-white hover:bg-red-900/50 rounded-xl transition-all">
                    <LogOut size={20} /> <span className="hidden lg:block">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;