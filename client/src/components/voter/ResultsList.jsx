import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Award, ChevronRight, BarChart, Calendar } from 'lucide-react';
import Loader from '../common/Loader';
import { io } from 'socket.io-client';


const ResultsList = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchEvents = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/voter/events', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            // Filter only events that have results published
            const publishedEvents = res.data.events.filter(event => event.resultsPublished);
            setEvents(publishedEvents);
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
        <div className="space-y-10 animate-in fade-in duration-700 pb-10">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-[2.5rem] p-12 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full -ml-32 -mb-32 blur-3xl"></div>

                <div className="relative z-10">
                    <div className="flex items-center space-x-2 text-indigo-100 mb-4 bg-white/10 w-fit px-4 py-1.5 rounded-full backdrop-blur-md border border-white/20">
                        <Award className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Official Outcomes</span>
                    </div>
                    <h1 className="text-5xl font-black mb-4 tracking-tight">Election Results</h1>
                    <p className="text-indigo-100 text-xl font-medium opacity-90 leading-relaxed max-w-2xl">Access verified results and statistical breakdowns of concluded elections.</p>
                </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {events.length === 0 ? (
                    <div className="col-span-full py-32 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
                        <BarChart className="w-20 h-20 mb-6 opacity-20" />
                        <h3 className="text-2xl font-bold">No Results Published</h3>
                        <p className="font-medium mt-2">Check back once elections are concluded and verified.</p>
                    </div>
                ) : (
                    events.map(event => (
                        <div key={event._id} className="bg-white rounded-[3rem] p-8 shadow-xl shadow-indigo-100/50 border border-slate-100 hover:border-indigo-200 transition-all hover:-translate-y-2 group flex flex-col h-full relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150"></div>

                            <div className="mb-8 relative z-10">
                                <span className="inline-block px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100 mb-4">
                                    Concluded
                                </span>
                                <h3 className="text-2xl font-black text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">{event.title}</h3>
                                <p className="text-slate-500 font-medium line-clamp-2">{event.description}</p>
                            </div>

                            <div className="mt-auto space-y-6 pt-6 border-t border-slate-50 relative z-10">
                                <div className="flex items-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                                    <Calendar className="w-4 h-4 mr-2 text-indigo-500" />
                                    <span>Concluded: {new Date(event.endTime).toLocaleDateString()}</span>
                                </div>
                                <Link
                                    to={`/voter/results/${event._id}`}
                                    className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-[1.5rem] font-black text-lg flex items-center justify-center space-x-3 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-1 transition-all active:scale-95"
                                >
                                    <BarChart className="w-5 h-5" />
                                    <span>View Analytics</span>
                                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ResultsList;
