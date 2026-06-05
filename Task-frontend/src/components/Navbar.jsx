// src/components/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = ({ toggleSidebar }) => {
    const { user, logout } = useAuth();
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="h-20 bg-white border-b border-rose-100 flex items-center justify-between px-8 sticky top-0 z-40">
            {/* Hamburger button for mobile */}
            <button onClick={toggleSidebar} className="lg:hidden p-2 text-rose-900">
                <Menu size={24} />
            </button>
            
            <div className="flex items-center ml-auto relative" ref={menuRef}>
                <button onClick={() => setShowMenu(!showMenu)} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold">
                        {user?.fullName?.charAt(0) || 'U'}
                    </div>
                </button>

                {showMenu && (
                    <div className="absolute right-0 top-14 w-48 bg-white rounded-2xl shadow-xl border border-rose-100 p-2 z-50">
                        <Link to="/profile" className="flex items-center gap-2 px-4 py-2 hover:bg-rose-50 rounded-lg text-sm font-bold text-rose-900">
                            <User size={16} /> My Profile
                        </Link>
                        <button onClick={logout} className="w-full flex items-center gap-2 px-4 py-2 hover:bg-rose-50 rounded-lg text-sm font-bold text-rose-600">
                            <LogOut size={16} /> Sign Out
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Navbar;