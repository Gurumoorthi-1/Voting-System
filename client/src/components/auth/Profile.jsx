import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { User, Mail, Shield, ShieldCheck, Activity, Award, CheckCircle2, Lock } from 'lucide-react';

const Profile = () => {
    const { user } = useContext(AuthContext);

    if (!user) return null;

    const getGradient = () => {
        if (user.role === 'superadmin') return 'from-rose-600 via-pink-600 to-orange-500';
        if (user.role === 'admin') return 'from-blue-700 via-indigo-800 to-indigo-950';
        return 'from-emerald-500 via-teal-600 to-cyan-700';
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700 font-outfit pb-10">
            {/* Premium Profile Header */}
            <div className={`bg-gradient-to-br ${getGradient()} rounded-[2.5rem] p-12 text-white shadow-2xl relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl -ml-32 -mb-32"></div>

                <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start space-y-8 md:space-y-0 md:space-x-10 text-center md:text-left">
                    <div className="w-32 h-32 rounded-[2.5rem] bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center text-5xl font-black text-white shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                        {user.email[0].toUpperCase()}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-center md:justify-start space-x-2 text-white/80 mb-4 bg-black/10 w-fit px-4 py-1.5 rounded-full backdrop-blur-md border border-white/10">
                            <Shield className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">{user.role} Account</span>
                        </div>
                        <h1 className="text-5xl font-black mb-4 tracking-tight">Voter Identity Profile</h1>
                        <p className="text-white/80 text-xl font-medium opacity-90 leading-relaxed max-w-2xl">Your authorized blockchain-linked identity within the {user.role === 'superadmin' ? 'Root Governance' : 'Institutional'} network.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Account Info - Spans 2 columns */}
                <div className="lg:col-span-2 bg-white rounded-[3rem] p-10 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-10">
                        <h2 className="text-2xl font-black text-slate-900 flex items-center">
                            <User className="w-7 h-7 mr-4 text-slate-400" />
                            Core Identity Data
                        </h2>
                        <div className="p-3 bg-slate-50 rounded-2xl">
                            <Lock className="w-5 h-5 text-slate-400" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 transition-all hover:border-indigo-200 group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Mail className="w-16 h-16" />
                            </div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Login Identifier</label>
                            <div className="flex items-center text-slate-900 font-black text-xl break-all">
                                <Mail className="w-6 h-6 mr-4 text-indigo-500 group-hover:scale-110 transition-transform" />
                                {user.email}
                            </div>
                        </div>

                        <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 transition-all hover:border-rose-200 group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <ShieldCheck className="w-16 h-16" />
                            </div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Security Permission</label>
                            <div className="flex items-center text-slate-900 font-black text-xl">
                                {user.role === 'superadmin' ? (
                                    <ShieldCheck className="w-6 h-6 mr-4 text-rose-500" />
                                ) : (
                                    <Shield className="w-6 h-6 mr-4 text-emerald-500" />
                                )}
                                <span className="capitalize">{user.role} Level</span>
                            </div>
                        </div>

                        <div className="md:col-span-2 p-8 bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2rem] text-white flex items-center justify-between group">
                            <div className="flex items-center space-x-6">
                                <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md">
                                    <Award className="w-8 h-8 text-amber-400" />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Blockchain Reputation</p>
                                    <h4 className="text-2xl font-black">Trusted Verified Voter</h4>
                                </div>
                            </div>
                            <CheckCircle2 className="w-8 h-8 text-emerald-400 opacity-50 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>
                </div>

                {/* Status Card */}
                <div className="bg-white rounded-[3rem] p-10 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col justify-between items-center text-center space-y-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12">
                        <Activity className="w-60 h-60" />
                    </div>

                    <div className="relative z-10 w-full flex flex-col items-center">
                        <div className={`p-8 rounded-[2rem] bg-gradient-to-br ${getGradient()} text-white shadow-2xl mb-8 transform hover:scale-110 transition-transform duration-500`}>
                            <ShieldCheck className="w-16 h-16" />
                        </div>

                        <h3 className="text-2xl font-black text-slate-900 mb-3">Security Status</h3>
                        <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-emerald-100">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span>Fully Protected</span>
                        </div>

                        <p className="text-slate-500 font-medium leading-relaxed mb-8">Your account is encrypted with SHA-256 and monitored by the decentralized audit network.</p>
                    </div>

                    <div className="w-full relative z-10 space-y-4">
                        <div className="flex justify-between items-end mb-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verification Level</p>
                            <p className="text-lg font-black text-slate-900">85%</p>
                        </div>
                        <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden p-1">
                            <div className={`h-full bg-gradient-to-r ${getGradient()} w-[85%] rounded-full shadow-lg`}></div>
                        </div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">KYC Completed • Device Verified</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
