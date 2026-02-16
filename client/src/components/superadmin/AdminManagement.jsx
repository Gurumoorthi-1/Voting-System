import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    UserPlus,
    Search,
    Trash2,
    Edit,
    ShieldCheck,
    Mail,
    Key,
    X,
    Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import Loader from '../common/Loader';

const AdminManagement = () => {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [formData, setFormData] = useState({ email: '', password: '' });

    const fetchAdmins = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/superadmin/admins', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAdmins(res.data.admins);
        } catch (err) {
            console.error('Failed to fetch admins:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdmins();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (editingAdmin) {
                await axios.put(`http://localhost:5000/api/superadmin/admins/${editingAdmin._id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post('http://localhost:5000/api/superadmin/admins', formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            setShowModal(false);
            setEditingAdmin(null);
            setFormData({ email: '', password: '' });
            toast.success(editingAdmin ? 'Admin updated!' : 'Admin created!');
            fetchAdmins();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Operation failed');
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
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/superadmin/admins/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Administrator purged from system');
            fetchAdmins();
        } catch (err) {
            console.error(err);
            toast.error('Deletion failed');
        } finally {
            setLoading(false);
        }
    };

    const filteredAdmins = admins.filter(admin =>
        admin.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-orange-500 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold mb-2 flex items-center">
                            <ShieldCheck className="w-8 h-8 mr-3" /> Admin Controllers
                        </h1>
                        <p className="text-rose-50 opacity-90">Manage institutional administrators and access levels</p>
                    </div>
                    <button
                        onClick={() => { setEditingAdmin(null); setFormData({ email: '', password: '' }); setShowModal(true); }}
                        className="bg-white text-rose-600 px-6 py-3 rounded-2xl font-bold flex items-center justify-center space-x-2 shadow-lg hover:scale-105 transition-all active:scale-95"
                    >
                        <UserPlus className="w-5 h-5" />
                        <span>Create New Admin</span>
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="p-6 bg-gray-50/50 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h2 className="font-bold text-gray-900">Registered Administrators ({filteredAdmins.length})</h2>
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by email..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                            <tr>
                                <th className="px-8 py-5">Admin Identity</th>
                                <th className="px-8 py-5">Role Type</th>
                                <th className="px-8 py-5">System Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredAdmins.length === 0 ? (
                                <tr><td colSpan="3" className="px-8 py-12 text-center text-gray-400 font-medium">No administrators found matching your search</td></tr>
                            ) : (
                                filteredAdmins.map((admin) => (
                                    <tr key={admin._id} className="hover:bg-rose-50/30 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 font-bold group-hover:scale-110 transition-transform shadow-sm">
                                                    {admin.email[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{admin.email}</p>
                                                    <p className="text-xs text-gray-400">UID: {admin._id.slice(-8)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="px-3 py-1.5 bg-rose-100 text-rose-600 rounded-lg text-xs font-bold uppercase tracking-wider border border-rose-200">
                                                {admin.role}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => { setEditingAdmin(admin); setFormData({ email: admin.email, password: '' }); setShowModal(true); }}
                                                    className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                                >
                                                    <Edit className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(admin._id)}
                                                    className="p-2.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
                    <div className="relative bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">{editingAdmin ? 'Refactor Admin' : 'New Administrator'}</h3>
                                    <p className="text-sm text-gray-500">Provide security credentials for the portal</p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-6 h-6" /></button>
                            </div>

                            <form onSubmit={handleSave} className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                                        <input
                                            type="email"
                                            required
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-rose-500 outline-none transition-all"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="admin@institution.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                                        {editingAdmin ? 'New Password (Optional)' : 'Security Password'}
                                    </label>
                                    <div className="relative">
                                        <Key className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                                        <input
                                            type="password"
                                            required={!editingAdmin}
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-rose-500 outline-none transition-all"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-4 bg-gradient-to-r from-rose-500 to-orange-500 text-white rounded-2xl font-bold shadow-lg shadow-rose-900/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center space-x-2"
                                    >
                                        <Check className="w-5 h-5" />
                                        <span>{editingAdmin ? 'Save Changes' : 'Create Admin'}</span>
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
                            <h3 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Security Protocol</h3>
                            <p className="text-slate-500 font-medium leading-relaxed">This administrator's access credentials and system authority will be revoked permanently.</p>
                        </div>
                        <div className="p-10 bg-white flex flex-col space-y-4">
                            <button
                                onClick={confirmDelete}
                                className="w-full py-5 bg-rose-600 text-white rounded-[1.5rem] font-black text-lg shadow-xl shadow-rose-900/20 hover:bg-rose-700 transition-all active:scale-95 flex items-center justify-center space-x-3"
                            >
                                <Check className="w-5 h-5" />
                                <span>Confirm Identity Remove</span>
                            </button>
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="w-full py-5 bg-slate-50 text-slate-400 rounded-[1.5rem] font-black text-lg hover:bg-slate-100 hover:text-slate-600 transition-all flex items-center justify-center space-x-3 border border-slate-100"
                            >
                                <X className="w-5 h-5" />
                                <span>Abort Action</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminManagement;
