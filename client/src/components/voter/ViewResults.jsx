import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { Award, TrendingUp, Users, ArrowLeft, BarChart, CheckCircle } from 'lucide-react';
import Loader from '../common/Loader';
import toast from 'react-hot-toast';

const ViewResults = () => {
    const { id } = useParams();
    const [results, setResults] = useState([]);
    const [eventTitle, setEventTitle] = useState('');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalVotes: 0, leadingCandidate: null });

    const fetchResults = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/voter/events/${id}/results`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            // Transform data if necessary, ensuring we have percentages
            const resultData = res.data.results || [];
            const total = resultData.reduce((acc, curr) => acc + curr.votes, 0);

            // Find leader
            let leader = null;
            if (resultData.length > 0) {
                // Sort by votes descending
                resultData.sort((a, b) => b.votes - a.votes);
                leader = resultData[0];
            }

            setResults(resultData);
            setStats({
                totalVotes: total,
                leadingCandidate: leader
            });
        } catch (err) {
            console.error(err);
            toast.error('Failed to load results');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResults();

        const socket = io('http://localhost:5000');

        socket.on('electionUpdate', (data) => {
            if (data.eventId === id || !data.eventId) {
                fetchResults();
                toast.success('Results updated dynamically');
            }
        });

        socket.on('voteUpdate', () => {
            fetchResults();
        });

        return () => socket.disconnect();
    }, [id]);

    if (loading) return <Loader />;

    const maxVotes = Math.max(...results.map(r => r.votes), 1); // Avoid division by zero

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="flex items-center space-x-4">
                <Link to="/voter/dashboard" className="p-3 bg-white shadow-md rounded-2xl text-gray-400 hover:text-indigo-600 transition-all border border-gray-100">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Live Results</h1>
                    <p className="text-gray-500 text-sm font-medium">Real-time vote tabulation</p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                    <div className="relative z-10">
                        <div className="bg-white/20 w-fit p-3 rounded-2xl mb-4 backdrop-blur-md">
                            <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                        <p className="text-indigo-100 text-sm font-medium mb-1">Total Votes Cast</p>
                        <h3 className="text-4xl font-black tracking-tight">{stats.totalVotes.toLocaleString()}</h3>
                    </div>
                </div>

                <div className="md:col-span-2 bg-white rounded-[2rem] p-8 shadow-xl border border-gray-100 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Current Leader</p>
                            <h3 className="text-2xl font-black text-gray-900">{stats.leadingCandidate ? stats.leadingCandidate.candidate : 'No Votes Yet'}</h3>
                            {stats.leadingCandidate && <p className="text-indigo-600 font-medium text-sm">{stats.leadingCandidate.party}</p>}
                        </div>
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg text-white">
                            <Award className="w-8 h-8" />
                        </div>
                    </div>
                    {stats.leadingCandidate && (
                        <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden mt-4">
                            <div
                                className="bg-gradient-to-r from-amber-400 to-orange-500 h-full rounded-full transition-all duration-1000"
                                style={{ width: `${(stats.leadingCandidate.votes / stats.totalVotes) * 100}%` }}
                            ></div>
                        </div>
                    )}
                </div>
            </div>

            {/* Visual Bar Chart */}
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
                <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                    <h2 className="text-xl font-bold flex items-center gap-3">
                        <BarChart className="w-5 h-5 text-indigo-600" />
                        <span>Vote Distribution</span>
                    </h2>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-xs font-bold text-green-600 uppercase tracking-widest">Live Updates</span>
                    </div>
                </div>

                <div className="p-8 md:p-12 overflow-x-auto">
                    <div className="flex items-end justify-center space-x-8 md:space-x-12 h-64 md:h-80 min-w-[600px]">
                        {results.map((res, i) => {
                            const percentage = stats.totalVotes > 0 ? (res.votes / stats.totalVotes) * 100 : 0;
                            const heightPercentage = (res.votes / maxVotes) * 100;
                            const isLeader = stats.leadingCandidate && stats.leadingCandidate.candidate === res.candidate;

                            return (
                                <div key={i} className="flex flex-col items-center group w-24">
                                    <div className="text-center mb-3 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                                        <p className="font-black text-gray-900 text-lg">{res.votes}</p>
                                        <p className="text-xs text-gray-400 font-bold">{Math.round(percentage)}%</p>
                                    </div>
                                    <div className="w-full flex-1 flex items-end justify-center relative">
                                        <div
                                            className={`w-full md:w-16 rounded-t-2xl transition-all duration-1000 ease-out relative group-hover:scale-105 ${isLeader ? 'bg-gradient-to-t from-amber-400 to-orange-500 shadow-[0_0_20px_rgba(251,191,36,0.4)]' : 'bg-gradient-to-t from-indigo-400 to-purple-500 hover:from-indigo-500 hover:to-purple-600'}`}
                                            style={{ height: `${heightPercentage}%`, minHeight: '1rem' }}
                                        >
                                            {isLeader && (
                                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 animate-bounce">
                                                    <Award className="w-8 h-8 text-amber-500 drop-shadow-sm" fill="#f59e0b" />
                                                </div>
                                            )}
                                        </div>
                                        {/* Grid lines background effect could go here */}
                                    </div>
                                    <div className="mt-4 text-center">
                                        <p className={`font-bold text-sm truncate w-24 px-1 ${isLeader ? 'text-amber-600' : 'text-gray-600'}`} title={res.candidate}>{res.candidate}</p>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wider truncate w-24">{res.party || 'Ind.'}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Detailed List View */}
            <div className="grid gap-4">
                <h2 className="text-lg font-bold text-gray-900 ml-2">Detailed Breakdown</h2>
                {results.map((res, i) => (
                    <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-lg">
                                {i + 1}
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900">{res.candidate}</h4>
                                <p className="text-xs text-gray-500">{res.party || 'Independent'}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-gray-900">{res.votes} <span className="text-xs text-gray-400 font-normal">votes</span></p>
                            <div className="w-24 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${stats.totalVotes > 0 ? (res.votes / stats.totalVotes) * 100 : 0}%` }}></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ViewResults;
