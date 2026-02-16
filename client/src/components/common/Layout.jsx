import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

const Layout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex bg-slate-50 min-h-screen">
            {/* Mobile Menu Button */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="fixed top-4 left-4 z-[200] lg:hidden p-3 bg-white rounded-2xl shadow-xl border border-slate-200 hover:bg-slate-50 transition-all"
            >
                <Menu className="w-6 h-6 text-slate-700" />
            </button>

            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main Content */}
            <main className="flex-1 w-full lg:ml-72 p-4 pt-20 lg:pt-8 lg:p-12">
                <div className="max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
