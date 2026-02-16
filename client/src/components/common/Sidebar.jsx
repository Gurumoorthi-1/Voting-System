import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { SettingsContext } from '../../context/SettingsContext';
import {
    LayoutDashboard,
    Users,
    FileText,
    Settings,
    LogOut,
    Shield,
    Vote,
    Award,
    ChevronRight,
    TrendingUp,
    VoteIcon,
    History,
    UserCircle,
    X
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
    const { user, logout } = useContext(AuthContext);
    const { settings } = useContext(SettingsContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleLinkClick = () => {
        if (onClose) onClose();
    };

    const adminLinks = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Elections', path: '/admin/elections', icon: Vote },
    ];

    const superAdminLinks = [
        { name: 'Dashboard', path: '/superadmin/dashboard', icon: LayoutDashboard },
        { name: 'Admins', path: '/superadmin/admins', icon: Users },
        { name: 'Audit Logs', path: '/superadmin/logs', icon: FileText },
        { name: 'Settings', path: '/superadmin/settings', icon: Settings },
    ];

    const voterLinks = [
        { name: 'Active Events', path: '/voter/dashboard', icon: VoteIcon },
        { name: 'My History', path: '/voter/my-votes', icon: History },
        { name: 'Results', path: '/voter/results', icon: Award },
    ];

    const links = user?.role === 'superadmin' ? superAdminLinks :
        user?.role === 'admin' ? adminLinks : voterLinks;

    // Premium gradient based on role
    const getGradient = () => {
        if (user?.role === 'superadmin') return 'from-rose-600 via-pink-600 to-orange-500';
        if (user?.role === 'admin') return 'from-blue-700 via-indigo-800 to-indigo-950';
        return 'from-emerald-500 via-teal-600 to-cyan-700';
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] lg:hidden"
                    onClick={onClose}
                ></div>
            )}

            {/* Sidebar */}
            <aside className={`w-72 h-screen bg-slate-900 text-white flex flex-col fixed left-0 top-0 shadow-2xl border-r border-white/5 z-[150] transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                }`}>
                {/* Mobile Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 lg:hidden p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Logo Section */}
                <div className={`p-8 bg-gradient-to-br ${getGradient()} relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                    <div className="relative z-10 flex items-center space-x-3">
                        <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl border border-white/30 shrink-0">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                        <div className="min-w-0">
                            <span className="block text-lg font-bold text-white tracking-wide truncate">{settings.appName || 'Voting System'}</span>
                            <span className="block text-[10px] text-white/80 font-bold uppercase tracking-widest">{user?.role} Portal</span>
                        </div>
                    </div>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar">
                    <div className="px-4 mb-4">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Main Menu</p>
                    </div>
                    {links.map((link) => (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            onClick={handleLinkClick}
                            className={({ isActive }) =>
                                `flex items-center px-4 py-4 rounded-2xl transition-all duration-300 group ${isActive
                                    ? `bg-gradient-to-r ${getGradient()} shadow-lg shadow-rose-900/20 text-white`
                                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                }`
                            }
                        >
                            <link.icon className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                            <span className="font-bold text-sm flex-1">{link.name}</span>
                            <ChevronRight className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1`} />
                        </NavLink>
                    ))}

                    <div className="px-4 mt-8 mb-4">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Account Settings</p>
                    </div>
                    <NavLink
                        to="/profile"
                        onClick={handleLinkClick}
                        className={({ isActive }) =>
                            `flex items-center px-4 py-4 rounded-2xl transition-all duration-300 group ${isActive
                                ? `bg-gradient-to-r ${getGradient()} shadow-lg shadow-rose-900/20 text-white`
                                : 'text-slate-400 hover:bg-white/5 hover:text-white'
                            }`
                        }
                    >
                        <UserCircle className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                        <span className="font-bold text-sm flex-1">My Profile</span>
                        <ChevronRight className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1`} />
                    </NavLink>
                </nav>

                {/* User Profile & Logout */}
                <div className="p-6 bg-slate-800/50 border-t border-white/5">
                    <div className="bg-slate-900 rounded-[1.5rem] p-4 border border-white/5 flex items-center justify-between group">
                        <div className="flex items-center space-x-3 overflow-hidden">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getGradient()} flex items-center justify-center font-black text-white shadow-lg shrink-0`}>
                                {user?.email?.[0].toUpperCase()}
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-black text-white truncate">{user?.email}</p>
                                <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Session Active</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                            title="Logout"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
