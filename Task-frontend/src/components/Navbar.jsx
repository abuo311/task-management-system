import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LogOut, User, Menu, Bell, Mail, Clock, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';

const Navbar = ({ toggleSidebar }) => {
    const { user, logout } = useAuth();
    const { themeConfig } = useTheme();
    
    const [showMenu, setShowMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showMessages, setShowMessages] = useState(false); // New state
    const [activities, setActivities] = useState([]);
    const [messages, setMessages] = useState([]); // New state
    
    const menuRef = useRef(null);
    const notifRef = useRef(null);
    const mailRef = useRef(null);

    const fetchData = useCallback(async () => {
        try {
            const [actRes, msgRes] = await Promise.all([
                api.get('/activities'),
                api.get('/messages') // Placeholder for future implementation
            ]);
            setActivities(actRes.data);
            setMessages(msgRes.data || []);
        } catch (error) {
            console.error("Error fetching data", error);
        }
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
            if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
            if (mailRef.current && !mailRef.current.contains(e.target)) setShowMessages(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!themeConfig) return null;

    return (
        <header className={`h-12 ${themeConfig.bg} backdrop-blur-md border-b border-white/10 flex items-center justify-between px-4 sticky top-0 z-40 text-white`}>
            <button onClick={toggleSidebar} className="lg:hidden p-1.5 hover:bg-white/10 rounded-lg">
                <Menu size={22} />
            </button>
            
            <div className="flex items-center gap-3 ml-auto">
                {/* Messages Dropdown */}
                <div className="relative" ref={mailRef}>
                    <button onClick={() => { setShowMessages(!showMessages); if(!showMessages) fetchData(); }} className="text-white/70 hover:text-white relative">
                        <Mail size={20} />
                        {messages.length > 0 && <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></span>}
                    </button>
                    {showMessages && (
                        <div className="absolute right-0 top-10 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50">
                            <h3 className="text-slate-900 font-bold px-3 py-2 text-xs uppercase">Recent Messages</h3>
                            <div className="max-h-64 overflow-y-auto">
                                {messages.length > 0 ? messages.map((msg) => (
                                    <div key={msg.id} className="px-3 py-2 hover:bg-slate-50 rounded-lg text-slate-700">
                                        <p className="text-xs font-semibold">{msg.sender}</p>
                                        <p className="text-[10px] text-slate-500 truncate">{msg.content}</p>
                                    </div>
                                )) : <p className="px-3 py-4 text-xs text-slate-400">No new messages</p>}
                            </div>
                        </div>
                    )}
                </div>

                {/* Notification Bell */}
                <div className="relative" ref={notifRef}>
                    <button onClick={() => { setShowNotifications(!showNotifications); if(!showNotifications) fetchData(); }} className="text-white/70 hover:text-white relative">
                        <Bell size={20} />
                        {activities.length > 0 && <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full"></span>}
                    </button>
                    {showNotifications && (
                        <div className="absolute right-0 top-10 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50">
                            <h3 className="text-slate-900 font-bold px-3 py-2 text-xs uppercase">Recent Activity</h3>
                            <div className="max-h-64 overflow-y-auto">
                                {activities.length > 0 ? activities.map((act) => (
                                    <div key={act.id} className="px-3 py-2 hover:bg-slate-50 rounded-lg text-slate-700">
                                        <p className="text-xs font-semibold">{act.message}</p>
                                        <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-1"><Clock size={10} /> {new Date(act.createdAt).toLocaleTimeString()}</p>
                                    </div>
                                )) : <p className="px-3 py-4 text-xs text-slate-400">No recent activity</p>}
                            </div>
                        </div>
                    )}
                </div>

                {/* Profile Menu */}
                <div className="relative" ref={menuRef}>
                    <button onClick={() => setShowMenu(!showMenu)} className="flex items-center gap-2 pl-3 border-l border-white/10">
                        <div className={`w-7 h-7 rounded-full ${themeConfig.active} flex items-center justify-center text-white font-black text-[10px]`}>
                            {user?.fullName?.charAt(0) || 'U'}
                        </div>
                    </button>
                    {showMenu && (
                        <div className="absolute right-0 top-10 w-40 bg-white rounded-2xl shadow-xl border border-slate-100 p-1.5 z-50">
                            <Link to="/profile" className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 rounded-lg text-xs font-bold text-slate-900">
                                <User size={16} /> Profile
                            </Link>
                            <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 rounded-lg text-xs font-bold text-rose-600">
                                <LogOut size={16} /> Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;