import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Plus,
    Trash2,
    Edit,
    User,
    Camera,
    ArrowLeft,
    Award,
    Info,
    X,
    Check,
    ChevronLeft
} from 'lucide-react';
import toast from 'react-hot-toast';
import Loader from '../common/Loader';

const ManageCandidates = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCandidate, setEditingCandidate] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [formData, setFormData] = useState({ name: '', party: '', photo: '', bio: '' });

    const fetchCandidates = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/admin/events/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setCandidates(res.data.event.candidates);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCandidates();
    }, [id]);

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (editingCandidate) {
                await axios.put(`http://localhost:5000/api/admin/candidates/${editingCandidate._id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post(`http://localhost:5000/api/admin/events/${id}/candidates`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            setShowModal(false);
            toast.success(editingCandidate ? 'Candidate updated!' : 'Candidate added!');
            fetchCandidates();
        } catch (err) {
            console.error(err);
            toast.error('Operation failed');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (candidateId) => {
        setDeleteConfirm(candidateId);
    };

    const confirmDelete = async () => {
        const candidateId = deleteConfirm;
        setDeleteConfirm(null);
        setLoading(true);
        try {
            await axios.delete(`http://localhost:5000/api/admin/events/${id}/candidates/${candidateId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            toast.success('Candidate removed from ballot');
            fetchCandidates();
        } catch (err) {
            console.error(err);
            toast.error('Deletion failed');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            <div className="flex items-center space-x-4 mb-4">
                <button onClick={() => navigate('/admin/elections')} className="p-3 bg-white shadow-md rounded-2xl text-gray-400 hover:text-indigo-600 transition-all border border-gray-100"><ChevronLeft className="w-6 h-6" /></button>
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Candidate Profiles</h1>
                    <p className="text-gray-500 text-sm font-medium">Managing nominees for the current election cycle</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <button
                    onClick={() => { setEditingCandidate(null); setFormData({ name: '', party: '', photo: '', bio: '' }); setShowModal(true); }}
                    className="bg-white rounded-[2.5rem] p-8 border-2 border-dashed border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/10 transition-all group flex flex-col items-center justify-center space-y-4 min-h-[350px]"
                >
                    <div className="p-5 bg-indigo-50 text-indigo-600 rounded-3xl group-hover:scale-110 transition-transform"><Plus className="w-10 h-10" /></div>
                    <div className="text-center">
                        <p className="text-lg font-bold text-gray-900">Add Nominee</p>
                        <p className="text-sm text-gray-500">Add a new candidate to the ballot</p>
                    </div>
                </button>

                {candidates.map((candidate) => (
                    <div key={candidate._id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl border border-gray-100 hover:shadow-2xl transition-all group">
                        <div className="h-44 bg-gradient-to-br from-indigo-500 to-purple-600 relative overflow-hidden p-6 flex items-end">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-xl group-hover:scale-150 transition-transform duration-700"></div>
                            <div className="flex items-center space-x-4 relative z-10 w-full">
                                <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center overflow-hidden shrink-0 shadow-lg">
                                    {candidate.photo ? <img src={candidate.photo} className="w-full h-full object-cover" alt="" /> : <User className="w-10 h-10 text-white" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-xl font-bold text-white truncate drop-shadow-md">{candidate.name}</h3>
                                    <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest">{candidate.party || 'Independent'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="mb-8 h-20">
                                <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 italic">"{candidate.bio || 'Representing the future with integrity and vision for all citizens.'}"</p>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => { setEditingCandidate(candidate); setFormData({ name: candidate.name, party: candidate.party, photo: candidate.photo || '', bio: candidate.bio || '' }); setShowModal(true); }}
                                    className="flex-1 py-3 bg-gray-50 text-gray-700 rounded-xl font-bold flex items-center justify-center space-x-2 border border-gray-100 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all"
                                >
                                    <Edit className="w-4 h-4" />
                                    <span>Edit Profile</span>
                                </button>
                                <button
                                    onClick={() => handleDelete(candidate._id)}
                                    className="p-3 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
                    <div className="relative bg-white rounded-[2.5rem] w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-10">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">{editingCandidate ? 'Refine Profile' : 'Nominate Candidate'}</h3>
                                    <p className="text-sm text-gray-500 mt-1">Configure candidate credentials and platform</p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="p-3 hover:bg-gray-100 rounded-full transition-colors"><X className="w-6 h-6 text-gray-400" /></button>
                            </div>

                            <form onSubmit={handleSave} className="space-y-6">
                                <div className="grid grid-cols-1 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                                        <input type="text" required className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Candidate full legal name" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Party Affiliation</label>
                                        <input type="text" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium" value={formData.party} onChange={(e) => setFormData({ ...formData, party: e.target.value })} placeholder="Political party or Independent" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Party Flag / Photo URL</label>
                                        <div className="flex gap-4">
                                            <input
                                                type="url"
                                                className="flex-1 p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                                                value={formData.photo}
                                                onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                                                placeholder="https://example.com/flag.png"
                                            />
                                            {formData.photo && (
                                                <div className="w-16 h-16 rounded-xl bg-gray-100 border-2 border-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                                                    <img
                                                        src={formData.photo}
                                                        alt="Preview"
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<span class="text-xs text-gray-400">Invalid</span>'; }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-400 mt-2 ml-1">Provide a URL to the party flag or candidate photo</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Candidate Bio / Manifesto</label>
                                        <textarea rows="3" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium resize-none" value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} placeholder="Brief objective or platform summary..." />
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all shadow-sm">Cancel</button>
                                    <button type="submit" className="flex-1 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-900/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center space-x-2">
                                        <Check className="w-5 h-5" />
                                        <span>{editingCandidate ? 'Update Profile' : 'Register Nominee'}</span>
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
                        <div className="bg-indigo-500/10 p-12 text-center flex flex-col items-center">
                            <div className="w-24 h-24 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-indigo-600/40 mb-8 animate-bounce">
                                <Trash2 className="w-10 h-10" />
                            </div>
                            <h3 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Remove Nominee</h3>
                            <p className="text-slate-500 font-medium leading-relaxed">This candidate will be permanently removed from the ballot and all associated data will be purged.</p>
                        </div>
                        <div className="p-10 bg-white flex flex-col space-y-4">
                            <button
                                onClick={confirmDelete}
                                className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-lg shadow-xl shadow-indigo-900/20 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center space-x-3"
                            >
                                <Check className="w-5 h-5" />
                                <span>Confirm Removal</span>
                            </button>
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="w-full py-5 bg-slate-50 text-slate-400 rounded-[1.5rem] font-black text-lg hover:bg-slate-100 hover:text-slate-600 transition-all flex items-center justify-center space-x-3 border border-slate-100"
                            >
                                <X className="w-5 h-5" />
                                <span>Keep Candidate</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageCandidates;
