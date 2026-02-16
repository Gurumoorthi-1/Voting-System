import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Shield,
    User,
    Award,
    ChevronLeft,
    CheckCircle,
    AlertTriangle,
    Send,
    Lock,
    Receipt,
    ExternalLink,
    Copy,
    ChevronRight
} from 'lucide-react';
import Loader from '../common/Loader';

const VotingEventDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [hasVoted, setHasVoted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState(null);
    const [receipt, setReceipt] = useState(null);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:5000/api/voter/events/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEvent(res.data.event);
            setCandidates(res.data.candidates);
            setHasVoted(res.data.hasVoted);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const socket = io('http://localhost:5000');
        socket.on('electionUpdate', data => {
            if (data.eventId === id) fetchData();
        });
        return () => socket.disconnect();
    }, [id]);

    const handleVote = async () => {
        if (!selectedCandidate) return;
        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`http://localhost:5000/api/voter/events/${id}/vote`,
                { candidateId: selectedCandidate },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setHasVoted(true);
            setReceipt(res.data);
            setMessage({ type: 'success', text: 'Vote cast successfully! Your voice has been heard.' });
            fetchData();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to submit vote' });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <Loader />;
    if (!event) return <div className="text-center py-20">Event not found</div>;

    const isInactive = event.status !== 'active';

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <button onClick={() => navigate('/voter/dashboard')} className="flex items-center text-gray-400 hover:text-emerald-600 transition-colors font-bold group">
                <ChevronLeft className="w-5 h-5 mr-1 group-hover:-translate-x-1 transition-transform" />
                Back to Elections
            </button>

            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <div className="relative z-10">
                    <div className="flex items-center space-x-3 mb-4">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/30 backdrop-blur-md ${isInactive ? 'bg-rose-500/20 text-rose-100' : 'bg-white/20 text-white'}`}>
                            {event.status}
                        </span>
                        {hasVoted && <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-400 text-emerald-900 shadow-lg flex items-center"><CheckCircle className="w-3 h-3 mr-1" /> Verified Participant</span>}
                    </div>
                    <h1 className="text-4xl font-black mb-4 tracking-tight">{event.title}</h1>
                    <p className="text-emerald-50 text-lg opacity-90 max-w-2xl leading-relaxed">{event.description}</p>
                </div>
            </div>

            {message && (
                <div className={`p-6 rounded-3xl border animate-in slide-in-from-top-4 flex items-center space-x-4 ${message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'}`}>
                    {message.type === 'success' ? <CheckCircle className="w-6 h-6 shrink-0" /> : <AlertTriangle className="w-6 h-6 shrink-0" />}
                    <p className="font-bold">{message.text}</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {candidates.map((candidate) => (
                    <div
                        key={candidate._id}
                        onClick={() => !hasVoted && !isInactive && setSelectedCandidate(candidate._id)}
                        className={`bg-white rounded-[2.5rem] p-8 border-2 transition-all cursor-pointer relative group overflow-hidden ${selectedCandidate === candidate._id
                            ? 'border-emerald-500 shadow-2xl shadow-emerald-100 -translate-y-2'
                            : 'border-gray-100 hover:border-emerald-200 hover:shadow-xl'
                            } ${(hasVoted || isInactive) ? 'cursor-default opacity-80' : ''}`}
                    >
                        {selectedCandidate === candidate._id && (
                            <div className="absolute top-6 right-6 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg animate-in zoom-in text-xs font-bold ring-4 ring-emerald-50">
                                <CheckCircle className="w-5 h-5" />
                            </div>
                        )}
                        <div className="w-20 h-20 rounded-2xl bg-gray-50 flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform overflow-hidden border border-gray-100">
                            {candidate.photo ? <img src={candidate.photo} className="w-full h-full object-cover" alt="" /> : <User className="w-10 h-10" />}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{candidate.name}</h3>
                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-4">{candidate.party || 'Independent Nominee'}</p>
                        <p className="text-gray-500 text-xs leading-relaxed italic line-clamp-3">"{candidate.bio || 'Representing public interest with transparency and dedication to growth.'}"</p>
                    </div>
                ))}
            </div>

            {!hasVoted && !isInactive && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-50 animate-in slide-in-from-bottom-10">
                    <button
                        onClick={handleVote}
                        disabled={!selectedCandidate || submitting}
                        className={`w-full py-5 rounded-3xl font-black text-lg flex items-center justify-center space-x-3 shadow-2xl transition-all active:scale-95 ${selectedCandidate && !submitting
                            ? 'bg-emerald-600 text-white shadow-emerald-500/40 hover:bg-emerald-700 hover:scale-[1.02]'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                            }`}
                    >
                        {submitting ? <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div> : (
                            <>
                                <Send className="w-6 h-6" />
                                <span>Cast Verified Vote</span>
                            </>
                        )}
                    </button>
                </div>
            )}

            {(hasVoted || isInactive) && !receipt && (
                <div className="bg-white rounded-3xl p-8 border border-gray-100 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <Lock className="w-8 h-8 text-gray-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg">Voting is {isInactive ? 'Closed' : 'Complete'}</h3>
                        <p className="text-gray-500 text-sm max-w-xs">{isInactive ? 'This election has ended or is not yet active.' : 'You have already submitted your candidate selection for this event.'}</p>
                    </div>
                </div>
            )}

            {receipt && (
                <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl animate-in zoom-in-95 duration-500 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>

                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center space-x-3">
                                <div className="p-3 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-500/20">
                                    <Receipt className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black">Vote Confirmation</h2>
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Blockchain Verified Receipt</p>
                                </div>
                            </div>
                            <div className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30 text-[10px] font-black uppercase tracking-widest">
                                Secured
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Reference Number</p>
                                <p className="text-xl font-mono font-bold text-emerald-400">{receipt.referenceNumber}</p>
                            </div>

                            <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Transaction Hash</p>
                                    <button className="text-slate-500 hover:text-white transition-colors">
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>
                                <p className="text-sm font-mono text-slate-300 break-all bg-black/30 p-4 rounded-xl border border-white/5">{receipt.txHash}</p>
                                <div className="mt-4 flex items-center space-x-4">
                                    <a
                                        href={`https://etherscan.io/tx/${receipt.txHash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center space-x-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        <span>View on Explorer</span>
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
                            <p className="text-slate-500 text-xs font-medium max-w-xs">This receipt is your cryptographically signed proof of voting. Keep this hash for your records.</p>
                            <button
                                onClick={() => navigate('/voter/dashboard')}
                                className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black text-sm hover:bg-emerald-400 transition-all active:scale-95 flex items-center"
                            >
                                Back to Dashboard
                                <ChevronRight className="w-4 h-4 ml-2" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


export default VotingEventDetail;
