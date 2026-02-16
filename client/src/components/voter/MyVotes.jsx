import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    History,
    Search,
    Clock,
    ExternalLink,
    CheckCircle2,
    Copy,
    Layout
} from 'lucide-react';
import Loader from '../common/Loader';

const MyVotes = () => {
    const [votes, setVotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(null);

    useEffect(() => {
        const fetchVotes = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/voter/my-votes', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setVotes(res.data.votes);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchVotes();
    }, []);

    const copyToClipboard = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    if (loading) return <Loader />;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-[2rem] p-8 text-white shadow-xl">
                <h1 className="text-3xl font-black mb-2 flex items-center tracking-tight">
                    <History className="w-8 h-8 mr-3" /> Participation History
                </h1>
                <p className="text-emerald-50 font-medium opacity-90">Securely track your verified voting receipts</p>
            </div>

            <div className="grid gap-6">
                {votes.length === 0 ? (
                    <div className="bg-white rounded-[2rem] p-20 border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <History className="w-10 h-10 text-gray-200" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">No Votes Cast Yet</h3>
                        <p className="text-gray-500 max-w-xs mt-2">Active elections will appear in your dashboard when available.</p>
                    </div>
                ) : (
                    votes.map((vote) => (
                        <div key={vote._id} className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all group border-l-8 border-l-emerald-500">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="space-y-4 flex-1">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                            <CheckCircle2 className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-gray-900">{vote.event?.title || 'Unknown Election'}</h3>
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest flex items-center">
                                                <Clock className="w-3 h-3 mr-1" /> Voted on: {new Date(vote.votedAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 relative group/hash">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Blockchain Reference Number</p>
                                        <div className="flex items-center justify-between">
                                            <code className="text-xs font-mono text-emerald-700 break-all pr-12">{vote.referenceNumber}</code>
                                            <button
                                                onClick={() => copyToClipboard(vote.referenceNumber, vote._id)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white text-gray-400 hover:text-emerald-600 rounded-xl shadow-sm border border-gray-100 transition-all opacity-0 group-hover/hash:opacity-100"
                                            >
                                                {copied === vote._id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center md:flex-col gap-3">
                                    <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border border-emerald-100 shrink-0">
                                        Verified Receipt
                                    </div>
                                    <div className="flex-1 md:w-full">
                                        <button className="w-full p-2 text-gray-400 hover:text-indigo-600 transition-colors flex items-center justify-center text-xs font-bold group/link">
                                            Explorer Tx <ExternalLink className="w-3 h-3 ml-1 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

import { Check } from 'lucide-react';
export default MyVotes;
