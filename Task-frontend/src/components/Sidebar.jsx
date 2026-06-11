// src/components/Sidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
    LayoutDashboard, Users, ClipboardList, User, HardHat, 
    X, Shield, Hammer, UserPlus, LogOut, CheckSquare, ClipboardCheck,
    Palette, Settings 
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
    const { logout, hasRole } = useAuth();
    const { themeConfig } = useTheme();
    const location = useLocation();

    // Define Role checks
    const isSystemAdmin = hasRole('ROLE_SYSTEM_ADMIN');
    const isAdmin = isSystemAdmin || hasRole('ROLE_ADMIN');
    const isManager = hasRole('ROLE_MANAGER');
    // Added check for the Laborer role
    const isLaborer = hasRole('ROLE_LABORER');

    const menuItems = [
        { name: 'Overview', icon: LayoutDashboard, path: '/dashboard' },
        ...(isAdmin || isManager ? [
            { name: 'My Laborers', icon: Users, path: '/laborers' },
            { name: 'Task Board', icon: ClipboardList, path: '/tasks' },
            { name: 'Attendance', icon: ClipboardCheck, path: '/attendance' },
        ] : []),
        // Show My Tasks for Laborers (and any other roles you deem necessary)
        ...(isLaborer ? [
            { name: 'My Tasks', icon: CheckSquare, path: '/my-tasks' },
        ] : []),
        { name: 'My Profile', icon: User, path: '/profile' },
    ];

    if (!themeConfig) return null; 

    return (
        <aside className={`fixed inset-y-0 left-0 z-50 ${themeConfig.bg} text-white flex flex-col transition-all duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 h-full border-r border-white/10 md:w-20 lg:w-64`}>
            {/* ... Header stays the same ... */}
            <div className="h-12 flex items-center justify-center lg:justify-start px-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className={`${themeConfig.active}/20 p-1.5 rounded-lg border border-white/20`}>
                        <HardHat className="text-white" size={18} />
                    </div>
                    <span className="font-black text-lg text-white hidden lg:block tracking-tight">LaborFlow</span>
                </div>
                <button onClick={onClose} className="md:hidden ml-auto text-white"><X size={20} /></button>
            </div>

            <nav className="flex-1 mt-4 px-3 space-y-1 overflow-y-auto">
                {menuItems.map((item) => (
                    <Link key={item.name} to={item.path} onClick={() => window.innerWidth < 1024 && onClose()}
                        className={`flex items-center justify-center lg:justify-start gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                            location.pathname === item.path ? `${themeConfig.active} text-white` : `${themeConfig.text} ${themeConfig.hover}`
                        }`}>
                        <item.icon size={18} />
                        <span className="hidden lg:block">{item.name}</span>
                    </Link>
                ))}

                {(isAdmin || isManager) && (
                    <div className="mt-6 pt-6 border-t border-white/10">
                        <h3 className="hidden lg:flex px-4 text-[10px] font-black text-yellow-400 uppercase tracking-[0.2em] mb-2 items-center gap-2">
                            <Shield size={12} /> Management
                        </h3>
                        {isSystemAdmin && (
                            <Link to="/users" className={`flex items-center justify-center lg:justify-start gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${location.pathname === '/users' ? themeConfig.active : `${themeConfig.text} ${themeConfig.hover}`}`}>
                                <UserPlus size={18} /> <span className="hidden lg:block">System Users</span>
                            </Link>
                        )}
                        <Link to="/settings" className={`flex items-center justify-center lg:justify-start gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${location.pathname === '/settings' ? themeConfig.active : `${themeConfig.text} ${themeConfig.hover}`}`}>
                            <Hammer size={18} /> <span className="hidden lg:block">Project Trades</span>
                        </Link>
                    </div>
                )}

                <div className="mt-6 pt-6 border-t border-white/10">
                    <h3 className="hidden lg:flex px-4 text-[10px] font-black text-white/50 uppercase tracking-[0.2em] mb-2 items-center gap-2">
                        <Settings size={12} /> Appearance
                    </h3>
                    <Link to="/theme-settings" onClick={() => window.innerWidth < 1024 && onClose()}
                        className={`flex items-center justify-center lg:justify-start gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                            location.pathname === '/theme-settings' ? themeConfig.active : `${themeConfig.text} ${themeConfig.hover}`
                        }`}>
                        <Palette size={18} /> <span className="hidden lg:block">Theme Settings</span>
                    </Link>
                </div>
            </nav>

            <button onClick={logout} className="m-4 flex items-center justify-center lg:justify-start gap-3 px-4 py-3 text-sm font-bold text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                <LogOut size={18} /> <span className="hidden lg:block">Sign Out</span>
            </button>
        </aside>
    );
};

export default Sidebar;