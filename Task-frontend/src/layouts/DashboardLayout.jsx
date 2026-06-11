import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const DashboardLayout = () => {
    return (
        // Enforce white background and slate text regardless of theme
        <div className="min-h-screen bg-white text-slate-900">
            <Sidebar />
            <div className="md:pl-64 flex flex-col min-h-screen">
                <Navbar />
                <main className="p-6">
                    <Outlet /> {/* This renders your pages */}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;