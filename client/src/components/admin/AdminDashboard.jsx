import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import {
    Vote,
    Users,
    CheckCircle,
    Clock,
    Activity,
    TrendingUp,
    Plus,
    ChevronRight,
    TrendingDown,
    Shield
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Loader from '../common/Loader';

const AdminDashboard = () => {
    const [data, setData] = useState({
        stats: { totalElections: 0, totalVoters: 0, activeElections: 0, totalCandidates: 0, totalVotes: 0, voterTurnout: '0%' },
        recentActivity: []
    });
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/admin/stats', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setData(res.data);
        } catch (err) {
            console.error('Failed to fetch admin stats:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
        const socket = io('http://localhost:5000');
        socket.on('voteUpdate', () => fetchStats());
        socket.on('electionUpdate', () => fetchStats());
        socket.on('newLog', () => fetchStats());
        return () => socket.disconnect();
    }, []);

    if (loading) return <Loader />;

    const statCards = [
        { label: 'Elections Created', value: data.stats.totalElections, icon: Vote, gradient: 'from-blue-600 to-indigo-600' },
        { label: 'Total Candidates', value: data.stats.totalCandidates, icon: Users, gradient: 'from-emerald-500 to-teal-500' },
        { label: 'Total Votes Cast', value: data.stats.totalVotes, icon: CheckCircle, gradient: 'from-orange-500 to-amber-500' },
        { label: 'Voter Turnout', value: data.stats.voterTurnout, icon: TrendingUp, gradient: 'from-rose-500 to-pink-500' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-br from-blue-700 via-indigo-800 to-indigo-950 rounded-[2.5rem] p-12 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full -ml-32 -mb-32 blur-3xl animate-pulse delay-1000"></div>

                <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-10">
                    <div className="max-w-2xl text-center xl:text-left">
                        <div className="flex items-center justify-center xl:justify-start space-x-2 text-blue-200 mb-6 bg-white/10 w-fit px-4 py-1.5 rounded-full backdrop-blur-md border border-white/20">
                            <Shield className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-center">Administrative Control Hub</span>
                        </div>
                        <h1 className="text-5xl font-black mb-4 tracking-tight leading-[1.1]">Election Management & <br />Analysis Portal</h1>
                        <p className="text-blue-100 text-xl font-medium opacity-90 leading-relaxed">Oversee candidate verification, monitor participation telemetry, and manage institutional voting events.</p>
                    </div>
                    <Link
                        to="/admin/elections"
                        className="group bg-white text-indigo-900 px-10 py-5 rounded-3xl font-black text-lg flex items-center justify-center space-x-3 shadow-2xl shadow-indigo-950/20 hover:scale-[1.05] transition-all active:scale-[0.97]"
                    >
                        <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                        <span>Initiate New Election</span>
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, i) => (
                    <div key={i} className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 border border-gray-100 hover:border-blue-200 transition-all hover:-translate-y-1 group">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-white mb-6 shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform`}>
                            <stat.icon className="w-7 h-7" />
                        </div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                        <p className="text-3xl font-black text-gray-900">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                {/* Recent Activity List */}
                <div className="xl:col-span-3 bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden flex flex-col">
                    <div className="px-8 py-7 bg-gradient-to-r from-blue-700 via-indigo-800 to-indigo-950 text-white flex items-center justify-between">
                        <h2 className="text-xl font-bold flex items-center">
                            <Clock className="w-6 h-6 mr-3 text-blue-200" />
                            Your Recent Activity
                        </h2>
                        <Link to="/admin/logs" className="text-sm font-bold text-blue-100 hover:text-white flex items-center group transition-colors">
                            View All <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {data.recentActivity.length === 0 ? (
                            <div className="px-8 py-16 text-center text-gray-400 font-medium">No actions recorded in this session.</div>
                        ) : (
                            data.recentActivity.map((log, i) => (
                                <div key={i} className="px-8 py-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                                            <Activity className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-gray-900 group-hover:text-indigo-600 transition-colors">{log.action.replace(/_/g, ' ')}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{new Date(log.createdAt).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <span className="px-4 py-1.5 bg-gray-50 text-gray-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-gray-100 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-all">
                                        {log.targetType}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Quick Help Card */}
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-900 rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden xl:col-span-1 h-fit">
                    <div className="relative z-10 flex flex-col">
                        <h3 className="text-lg font-bold mb-4">Quick Overview</h3>
                        <div className="space-y-4 flex-1">
                            <div className="flex items-start space-x-3">
                                <div className="w-6 h-6 rounded-md bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="font-bold text-xs">1</span>
                                </div>
                                <p className="text-xs text-indigo-100 leading-relaxed font-medium">Create an <span className="text-white font-bold">Election Event</span> with specific start and end timings.</p>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="w-6 h-6 rounded-md bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="font-bold text-xs">2</span>
                                </div>
                                <p className="text-xs text-indigo-100 leading-relaxed font-medium">Add <span className="text-white font-bold">Candidates</span> and their profile details to the event.</p>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="w-6 h-6 rounded-md bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="font-bold text-xs">3</span>
                                </div>
                                <p className="text-xs text-indigo-100 leading-relaxed font-medium">Toggle the <span className="text-white font-bold">Active Status</span> once the timeline starts.</p>
                            </div>
                        </div>
                        <div className="mt-6 pt-6 border-t border-white/10 text-center">
                            <p className="text-[10px] text-white/60 font-medium">v2.0.4 - Premium Admin Panel</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
