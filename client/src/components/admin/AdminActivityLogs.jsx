import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { FileText, Search, Clock, Activity, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Loader from '../common/Loader';

const AdminActivityLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const navigate = useNavigate();

    const fetchLogs = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/admin/logs', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLogs(res.data.logs || []);
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
        const action = log.action || '';
        const targetType = log.targetType || '';
        return action.toLowerCase().includes(filter.toLowerCase()) ||
            targetType.toLowerCase().includes(filter.toLowerCase());
    });

    if (loading) return <Loader />;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            <div className="flex items-center space-x-4 mb-4">
                <button onClick={() => navigate('/admin/dashboard')} className="p-3 bg-white shadow-md rounded-2xl text-gray-400 hover:text-indigo-600 transition-all border border-gray-100">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Activity Logs</h1>
                    <p className="text-gray-500 text-sm font-medium">Complete history of your administrative actions</p>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-6 bg-gradient-to-r from-blue-700 to-indigo-800 text-white flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <h2 className="text-xl font-bold flex items-center">
                        <FileText className="w-6 h-6 mr-3" />
                        Activity History
                    </h2>
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-3 w-5 h-5 text-white/60" />
                        <input
                            type="text"
                            placeholder="Search logs..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-white/30 outline-none"
                            value={filter}
                            onChange={e => setFilter(e.target.value)}
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                <th className="px-8 py-5">Action</th>
                                <th className="px-8 py-5">Type</th>
                                <th className="px-8 py-5 text-right">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="px-8 py-16 text-center text-gray-400 font-medium">
                                        No activity logs found
                                    </td>
                                </tr>
                            ) : (
                                filteredLogs.map(log => (
                                    <tr key={log._id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                    <Activity className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{log.action.replace(/_/g, ' ')}</p>
                                                    <p className="text-xs text-gray-500">{new Date(log.createdAt).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border border-indigo-200">
                                                {log.targetType}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end space-x-2 text-gray-500">
                                                <Clock className="w-4 h-4" />
                                                <span className="text-sm font-medium">{new Date(log.createdAt).toLocaleTimeString()}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminActivityLogs;
