import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import {
    Users,
    Shield,
    Vote,
    Activity,
    TrendingUp,
    ArrowUpRight,
    Clock,
    Play
} from 'lucide-react';

const SystemDashboard = () => {
    const [data, setData] = useState({
        stats: { totalElections: 0, totalAdmins: 0, totalUsers: 0, activeElections: 0 },
        recentActivities: [],
        systemStatus: 'Operational'
    });
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/superadmin/stats', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setData(res.data);
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const socket = io('http://localhost:5000');
        socket.on('electionUpdate', () => fetchData());
        socket.on('newLog', () => fetchData());
        return () => socket.disconnect();
    }, []);

    const stats = [
        { label: 'Live Elections', value: data.stats.activeElections, icon: Play, gradient: 'from-blue-500 to-indigo-500' },
        { label: 'Total Admins', value: data.stats.totalAdmins, icon: Shield, gradient: 'from-orange-500 to-amber-500' },
        { label: 'System Status', value: data.systemStatus, icon: Activity, gradient: 'from-emerald-500 to-teal-500', isStatus: true },
        { label: 'Total Events', value: data.stats.totalElections, icon: Vote, gradient: 'from-rose-500 to-pink-500' },
    ];

    if (loading) return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div></div>;

    return (
        <div className="space-y-10 animate-in fade-in duration-700 font-outfit pb-10">
            {/* Global System Banner */}
            <div className="bg-gradient-to-br from-rose-600 via-pink-600 to-orange-500 rounded-[2.5rem] p-12 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-rose-400/10 rounded-full -ml-32 -mb-32 blur-3xl animate-pulse delay-700"></div>

                <div className="relative z-10">
                    <div className="flex items-center space-x-2 text-rose-100 mb-6 bg-white/10 w-fit px-4 py-1.5 rounded-full backdrop-blur-md border border-white/20">
                        <Shield className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">System Master Control</span>
                    </div>
                    <h1 className="text-5xl font-black mb-4 tracking-tight">Root Administration</h1>
                    <p className="text-rose-50 text-xl font-medium opacity-90 leading-relaxed max-w-2xl">Global governance engine. Monitor network health, manage administrative identities, and audit system-wide activity logs.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all group overflow-hidden relative">
                        <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.gradient} opacity-5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150`}></div>
                        <div className="flex items-center space-x-4">
                            <div className={`p-4 bg-gradient-to-br ${stat.gradient} rounded-2xl text-white shadow-lg`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>


            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gradient-to-r from-rose-500 to-pink-500 text-white">
                    <h2 className="text-lg font-bold flex items-center"><Activity className="w-5 h-5 mr-2" /> Recent Activities</h2>
                </div>
                <div className="divide-y divide-gray-50">
                    {data.recentActivities.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">No recent activity detected</div>
                    ) : (
                        data.recentActivities.map((log, i) => (
                            <div key={i} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-bold text-xs">
                                        {log.user?.email?.[0].toUpperCase() || 'S'}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">{log.action}</p>
                                        <p className="text-xs text-gray-500">{log.user?.email || 'System'}</p>
                                    </div>
                                </div>
                                <span className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">{new Date(log.createdAt).toLocaleTimeString()}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default SystemDashboard;
