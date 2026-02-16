import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import {
    Plus,
    Search,
    Trash2,
    Edit,
    Calendar,
    Clock,
    Users,
    Shield,
    ToggleLeft,
    X,
    Check,
    ChevronRight,
    Eye,
    EyeOff,
    Settings,
    TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Loader from '../common/Loader';

const ManageElections = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [formData, setFormData] = useState({ title: '', description: '', startTime: '', endTime: '' });

    const fetchEvents = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/admin/events', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEvents(res.data.events);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
        const socket = io('http://localhost:5000');
        socket.on('electionUpdate', () => fetchEvents());
        return () => socket.disconnect();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (editingEvent) {
                await axios.put(`http://localhost:5000/api/admin/events/${editingEvent._id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post('http://localhost:5000/api/admin/events', formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            setShowModal(false);
            toast.success(editingEvent ? 'Election updated!' : 'Election created!');
            fetchEvents();
        } catch (err) {
            console.error(err);
            toast.error('Operation failed');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id) => {
        setDeleteConfirm(id);
    };

    const confirmDelete = async () => {
        const id = deleteConfirm;
        setDeleteConfirm(null);
        setLoading(true);
        try {
            await axios.delete(`http://localhost:5000/api/admin/events/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            toast.success('Election deleted successfully');
            fetchEvents();
        } catch (err) {
            console.error(err);
            toast.error('Delete failed');
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (id, currentStatus) => {
        const nextStatus = currentStatus === 'active' ? 'finished' : 'active';
        setLoading(true);
        try {
            await axios.patch(`http://localhost:5000/api/admin/events/${id}/status`, { status: nextStatus }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            toast.success(`Election ${nextStatus === 'active' ? 'activated' : 'deactivated'}`);
            fetchEvents();
        } catch (err) {
            console.error(err);
            toast.error('Status update failed');
        } finally {
            setLoading(false);
        }
    };

    const toggleResults = async (id, current) => {
        setLoading(true);
        try {
            await axios.patch(`http://localhost:5000/api/admin/events/${id}/results-publishing`, { resultsPublished: !current }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            toast.success(`Results ${!current ? 'published' : 'hidden'}`);
            fetchEvents();
        } catch (err) {
            console.error(err);
            toast.error('Results update failed');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Premium Header */}
            <div className="bg-gradient-to-br from-blue-700 via-indigo-800 to-indigo-950 rounded-[2.5rem] p-12 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full -ml-32 -mb-32 blur-3xl"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="max-w-xl">
                        <div className="flex items-center space-x-2 text-blue-200 mb-4 bg-white/10 w-fit px-4 py-1.5 rounded-full backdrop-blur-md border border-white/20">
                            <Settings className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Configuration Console</span>
                        </div>
                        <h1 className="text-5xl font-black mb-4 tracking-tight leading-tight">Election Event <br />Management</h1>
                        <p className="text-blue-50 text-xl font-medium opacity-90 leading-relaxed">Design, deploy, and monitor the entire lifecycle of your decentralized elections.</p>
                    </div>
                    <button
                        onClick={() => { setEditingEvent(null); setFormData({ title: '', description: '', startTime: '', endTime: '' }); setShowModal(true); }}
                        className="group bg-white text-indigo-900 px-10 py-5 rounded-[2rem] font-black text-lg flex items-center justify-center space-x-3 shadow-2xl shadow-indigo-950/20 hover:scale-[1.05] transition-all active:scale-[0.97]"
                    >
                        <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                        <span>Create New Event</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {events.length === 0 ? (
                    <div className="col-span-full py-20 bg-white rounded-[2rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
                        <Clock className="w-16 h-16 mb-4 opacity-20" />
                        <p className="text-xl font-bold">No active election events found</p>
                        <p className="text-sm mt-1">Click "Create Event" to begin your first election.</p>
                    </div>
                ) : (
                    events.map((event) => (
                        <div key={event._id} className="bg-white rounded-[2rem] p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all group relative overflow-hidden">
                            <div className={`absolute top-0 right-0 w-32 h-32 opacity-5 rounded-full -mr-16 -mt-16 ${event.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>

                            <div className="flex justify-between items-start mb-6">
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{event.title}</h3>
                                    <div className="flex items-center space-x-4 text-xs font-bold uppercase tracking-wider">
                                        <span className={`flex items-center ${event.status === 'active' ? 'text-emerald-500' : 'text-gray-400'}`}>
                                            <Shield className="w-3 h-3 mr-1" /> {event.status}
                                        </span>
                                        <span className="text-indigo-400 flex items-center">
                                            <Users className="w-3 h-3 mr-1" /> {event.candidates?.length || 0} Candidates
                                        </span>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => { setEditingEvent(event); setFormData({ title: event.title, description: event.description, startTime: event.startTime.slice(0, 16), endTime: event.endTime.slice(0, 16) }); setShowModal(true); }}
                                        className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                    >
                                        <Edit className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(event._id)}
                                        className="p-2.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <p className="text-gray-500 text-sm mb-8 leading-relaxed line-clamp-2">{event.description}</p>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Start Timeline</p>
                                    <p className="text-xs font-bold text-gray-900">{new Date(event.startTime).toLocaleString()}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">End Timeline</p>
                                    <p className="text-xs font-bold text-gray-900">{new Date(event.endTime).toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-4">
                                <Link
                                    to={`/admin/candidates/${event._id}`}
                                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold flex-1 flex items-center justify-center space-x-2 shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
                                >
                                    <Settings className="w-4 h-4" />
                                    <span>Manage Candidates</span>
                                </Link>
                                <button
                                    onClick={() => toggleStatus(event._id, event.status)}
                                    className={`px-6 py-3 rounded-xl font-bold flex-1 flex items-center justify-center space-x-2 transition-all ${event.status === 'active'
                                        ? 'bg-rose-50 text-rose-600 border border-rose-100'
                                        : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                        }`}
                                >
                                    {event.status === 'active' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    <span>{event.status === 'active' ? 'Conclude' : 'Activate'}</span>
                                </button>
                                <button
                                    onClick={() => toggleResults(event._id, event.resultsPublished)}
                                    className={`p-3 rounded-xl transition-all border ${event.resultsPublished
                                        ? 'bg-amber-100 text-amber-600 border-amber-200'
                                        : 'bg-gray-50 text-gray-400 border-gray-200'
                                        }`}
                                    title={event.resultsPublished ? "Hiding Results" : "Publishing Results"}
                                >
                                    <TrendingUp className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
                    <div className="relative bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-10">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">{editingEvent ? 'Refactor Session' : 'Initiate New Cycle'}</h3>
                                    <p className="text-sm text-gray-500 mt-1">Configure the election parameters and timeline</p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="p-3 hover:bg-gray-100 rounded-full transition-colors"><X className="w-6 h-6 text-gray-400" /></button>
                            </div>

                            <form onSubmit={handleSave} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Session Title</label>
                                        <input
                                            type="text" required
                                            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            placeholder="e.g. Presidential Election 2024"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Description / Guidelines</label>
                                        <textarea
                                            rows="3" required
                                            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium resize-none"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Specify the purpose and rules of this election..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Start Date & Time</label>
                                        <input
                                            type="datetime-local" required
                                            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                                            value={formData.startTime}
                                            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">End Date & Time</label>
                                        <input
                                            type="datetime-local" required
                                            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                                            value={formData.endTime}
                                            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all shadow-sm"
                                    >
                                        Discard
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl font-bold shadow-xl shadow-indigo-900/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center space-x-2"
                                    >
                                        <Check className="w-5 h-5" />
                                        <span>{editingEvent ? 'Save Refactor' : 'Initialize Event'}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Premium Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setDeleteConfirm(null)}></div>
                    <div className="relative bg-white rounded-[3rem] w-full max-w-md shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100">
                        <div className="bg-rose-500/10 p-12 text-center flex flex-col items-center">
                            <div className="w-24 h-24 bg-rose-500 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-rose-500/40 mb-8 animate-bounce">
                                <Trash2 className="w-10 h-10" />
                            </div>
                            <h3 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Destructive Action</h3>
                            <p className="text-slate-500 font-medium leading-relaxed">This election and its associated blockchain telemetry will be permanently purged.</p>
                        </div>
                        <div className="p-10 bg-white flex flex-col space-y-4">
                            <button
                                onClick={confirmDelete}
                                className="w-full py-5 bg-rose-600 text-white rounded-[1.5rem] font-black text-lg shadow-xl shadow-rose-900/20 hover:bg-rose-700 transition-all active:scale-95 flex items-center justify-center space-x-3"
                            >
                                <Check className="w-5 h-5" />
                                <span>Proceed with Remove</span>
                            </button>
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="w-full py-5 bg-slate-50 text-slate-400 rounded-[1.5rem] font-black text-lg hover:bg-slate-100 hover:text-slate-600 transition-all flex items-center justify-center space-x-3 border border-slate-100"
                            >
                                <X className="w-5 h-5" />
                                <span>Safe Abort</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageElections;
