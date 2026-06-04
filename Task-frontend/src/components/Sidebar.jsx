import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    LayoutDashboard, 
    Users, 
    ClipboardList, 
    User, 
    HardHat, 
    X, 
    Shield, 
    Hammer, 
    UserPlus,
    LogOut,
    CheckSquare,
    ClipboardCheck // Added for Attendance
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
    const { logout, hasRole, user } = useAuth();
    const location = useLocation();

    // Check permissions
    const isAdmin = hasRole('ROLE_SYSTEM_ADMIN') || hasRole('ROLE_ADMIN') || hasRole('ROLE_MANAGER');
    const isStandardUser = hasRole('ROLE_USER');

    // Dynamic menu items based on role
    const menuItems = [
        { name: 'Overview', icon: LayoutDashboard, path: '/dashboard' },
        // Only Admins/Managers see these modules
        ...(isAdmin ? [
            { name: 'My Laborers', icon: Users, path: '/laborers' },
            { name: 'Task Board', icon: ClipboardList, path: '/tasks' },
            { name: 'Attendance', icon: ClipboardCheck, path: '/attendance' },
        ] : []),
        // Standard Users see their personal tasks
        ...(isStandardUser ? [
            { name: 'My Tasks', icon: CheckSquare, path: '/my-tasks' },
        ] : []),
        { name: 'My Profile', icon: User, path: '/profile' },
    ];

    const handleNavigation = () => {
        if (window.innerWidth < 1024) onClose();
    };

    const displayRole = (user?.role || user?.roles?.[0] || 'Active').replace('ROLE_', '');

    return (
        <aside className={`
            fixed inset-y-0 left-0 z-50 
            bg-slate-950 text-white flex flex-col shadow-2xl transition-all duration-300 ease-in-out
            ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
            md:translate-x-0 h-screen border-r border-white/5
            md:w-20 lg:w-64
        `}>
            
            {/* Logo Section */}
            <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800/50">
                <div className="flex items-center gap-3.5 mx-auto lg:mx-0">
                    <div className="bg-blue-600/15 p-2 rounded-xl border border-blue-800/50">
                        <HardHat className="text-blue-500" size={22} />
                    </div>
                    <span className="font-bold text-xl tracking-tight text-white hidden lg:block">
                        Labor<span className='text-blue-500'>Flow</span>
                    </span>
                </div>
                
                <button onClick={onClose} className="md:hidden p-2 text-slate-400 hover:text-white transition-colors">
                    <X size={20} />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 mt-6 px-3 lg:px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
                <h3 className="hidden lg:block px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">
                    Main Menu
                </h3>
                
                {menuItems.map((item) => (
                    <Link
                        key={item.name}
                        to={item.path}
                        onClick={handleNavigation}
                        title={item.name}
                        className={`flex items-center justify-center lg:justify-start gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                            location.pathname === item.path
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                                : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                        }`}
                    >
                        <item.icon size={20} className={location.pathname === item.path ? "text-white" : "text-slate-400"} />
                        <span className="hidden lg:block">{item.name}</span>
                    </Link>
                ))}

                {/* Management Section: Visible only to Admins */}
                {isAdmin && (
                    <div className="mt-6 pt-6 border-t border-slate-900/50">
                        <h3 className="hidden lg:flex px-4 text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-3 items-center gap-2">
                            <Shield size={12} /> Management
                        </h3>
                        
                        <Link
                            to="/users"
                            onClick={handleNavigation}
                            className={`flex items-center justify-center lg:justify-start gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all mb-1 ${
                                location.pathname === '/users' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800/60'
                            }`}
                        >
                            <UserPlus size={20} />
                            <span className="hidden lg:block">Add New Users</span>
                        </Link>

                        <Link
                            to="/settings"
                            onClick={handleNavigation}
                            className={`flex items-center justify-center lg:justify-start gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                                location.pathname === '/settings' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800/60'
                            }`}
                        >
                            <Hammer size={20} />
                            <span className="hidden lg:block">Project Trades</span>
                        </Link>
                    </div>
                )}
            </nav>

            {/* Profile & Logout Section */}
            <div className="mt-auto p-4 bg-slate-900/40 border-t border-slate-800/50">
                <div className="hidden lg:flex items-center gap-3 px-2 py-3 mb-2">
                    <div className="h-9 w-9 rounded-2xl bg-blue-600 flex items-center justify-center font-black text-sm text-white shadow-lg border-2 border-slate-800">
                        {user?.fullName?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{user?.fullName || 'User'}</p>
                        <p className="text-[9px] text-blue-400 font-black uppercase tracking-tighter">
                            {displayRole}
                        </p>
                    </div>
                </div>
                
                <button onClick={logout} className="flex items-center justify-center lg:justify-start gap-3.5 w-full px-4 py-3 text-sm font-bold text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all group">
                    <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="hidden lg:block">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;