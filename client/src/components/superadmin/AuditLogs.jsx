import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { FileText, Search, Clock, User, Shield } from 'lucide-react';

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    const fetchLogs = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/superadmin/logs', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLogs(res.data.logs);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
        const socket = io('http://localhost:5000');
        socket.on('newLog', () => fetchLogs());
        return () => socket.disconnect();
    }, []);

    const filteredLogs = logs.filter(log => {
        const userEmail = log.user?.email || '';
        const action = log.action || '';
        const targetType = log.targetType || '';
        const details = JSON.stringify(log.details || '').toLowerCase();
        const searchTerm = filter.toLowerCase();

        return userEmail.toLowerCase().includes(searchTerm) ||
            action.toLowerCase().includes(searchTerm) ||
            targetType.toLowerCase().includes(searchTerm) ||
            details.includes(searchTerm);
    });

    if (loading) return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div></div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-orange-500 rounded-2xl p-8 text-white shadow-xl">
                <h1 className="text-3xl font-bold mb-2">Audit Logs</h1>
                <p className="text-rose-50">System-wide activity ledger</p>
            </div>
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-8 bg-gradient-to-r from-rose-500 to-orange-500 text-white flex justify-between items-center">
                    <h2 className="text-xl font-bold">Activity History</h2>
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-white/60" />
                        <input type="text" placeholder="Search logs..." className="w-full pl-10 pr-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-white/30 outline-none" value={filter} onChange={e => setFilter(e.target.value)} />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Action</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4 text-right">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredLogs.map(log => (
                                <tr key={log._id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 font-black text-xs border border-rose-100 group-hover:bg-rose-600 group-hover:text-white transition-all duration-300">
                                                {log.user?.email ? log.user.email[0].toUpperCase() : 'S'}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 group-hover:text-rose-600 transition-colors">{log.user?.email || 'System Operation'}</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{log.user?.role || 'Internal Service'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="font-bold text-gray-700">{log.action ? log.action.replace(/_/g, ' ') : 'Unknown Action'}</span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="bg-rose-50 text-rose-600 px-3 py-1.5 rounded-lg text-[10px] font-black border border-rose-100 uppercase tracking-widest group-hover:bg-rose-100 transition-colors">
                                            {log.targetType || 'System'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex flex-col items-end">
                                            <p className="text-sm font-bold text-gray-900">{new Date(log.createdAt).toLocaleDateString()}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">{new Date(log.createdAt).toLocaleTimeString()}</p>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AuditLogs;
