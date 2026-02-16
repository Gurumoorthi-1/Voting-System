import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Vote, Clock, Calendar, ChevronRight, LayoutGrid, CheckCircle2, AlertCircle, BarChart } from 'lucide-react';
import { Link } from 'react-router-dom';
import Loader from '../common/Loader';

const VotingEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchEvents = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/voter/events', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
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

    if (loading) return <Loader />;

    return (
        <div className="space-y-10 animate-in fade-in duration-700 font-outfit pb-10">
            {/* Premium Header */}
            <div className="bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-700 rounded-[2.5rem] p-12 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400/10 rounded-full -ml-32 -mb-32 blur-3xl"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="max-w-xl">
                        <div className="flex items-center space-x-2 text-emerald-100 mb-4 bg-white/10 w-fit px-4 py-1.5 rounded-full backdrop-blur-md border border-white/20">
                            <LayoutGrid className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Election Dashboard</span>
                        </div>
                        <h1 className="text-5xl font-black mb-4 tracking-tight">Participate & Decide</h1>
                        <p className="text-emerald-50 text-xl font-medium opacity-90 leading-relaxed">Choose an active election to cast your secure, blockchain-verified vote.</p>
                    </div>
                </div>
            </div>

            {/* Grid Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {events.length === 0 ? (
                    <div className="col-span-full py-32 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
                        <Vote className="w-20 h-20 mb-6 opacity-20" />
                        <h3 className="text-2xl font-bold">No Active Polls</h3>
                        <p className="font-medium">Check back soon for upcoming institutional elections.</p>
                    </div>
                ) : (
                    events.map(event => (
                        <div key={event._id} className="bg-white rounded-[3rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 hover:border-emerald-200 transition-all hover:-translate-y-2 group flex flex-col h-full relative overflow-hidden">
                            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 opacity-5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150`}></div>

                            <div className="flex justify-between items-start mb-8 relative">
                                <div className="p-4 bg-emerald-50 text-emerald-600 rounded-3xl group-hover:bg-emerald-500 group-hover:text-white transition-all transform group-hover:rotate-6 shadow-sm">
                                    <Vote className="w-8 h-8" />
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${event.status === 'active'
                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:bg-emerald-100'
                                        : 'bg-slate-50 text-slate-400 border-slate-100'
                                        }`}>
                                        {event.status}
                                    </span>
                                    {event.hasVoted && (
                                        <span className="flex items-center text-[10px] font-black uppercase text-emerald-600 mt-2 tracking-widest bg-emerald-50 px-2 py-0.5 rounded-md">
                                            <CheckCircle2 className="w-3 h-3 mr-1" /> Voted
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex-1">
                                <h3 className="text-2xl font-black text-slate-900 mb-3 group-hover:text-emerald-600 transition-colors">{event.title}</h3>
                                <p className="text-slate-500 font-medium mb-8 line-clamp-3 leading-relaxed">"{event.description}"</p>
                            </div>

                            <div className="space-y-4 pt-6 border-t border-slate-50">
                                <div className="flex items-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                                    <Calendar className="w-4 h-4 mr-2 text-emerald-500" />
                                    <span>Until: {new Date(event.endTime).toLocaleDateString()}</span>
                                </div>
                                <Link
                                    to={event.resultsPublished ? `/voter/results/${event._id}` : `/voter/event/${event._id}`}
                                    className={`w-full py-5 rounded-[1.5rem] font-black text-lg flex items-center justify-center space-x-3 transition-all active:scale-95 shadow-lg ${event.resultsPublished
                                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-1'
                                        : event.hasVoted
                                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100'
                                            : event.status === 'active'
                                                ? 'bg-slate-900 text-white shadow-slate-900/20 hover:bg-emerald-600 hover:shadow-emerald-500/30'
                                                : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                                        }`}
                                >
                                    {event.resultsPublished ? <BarChart className="w-5 h-5 mr-2" /> : null}
                                    <span>{event.resultsPublished ? 'View Official Results' : event.hasVoted ? 'Vote Recorded' : 'Cast Your Vote'}</span>
                                    {!event.resultsPublished && <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                                </Link>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default VotingEvents;
