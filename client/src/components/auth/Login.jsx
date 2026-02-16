import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { SettingsContext } from '../../context/SettingsContext';
import { Mail, Lock, LogIn, Shield, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Loader from '../common/Loader';

const Login = () => {
    const { login } = useContext(AuthContext);
    const { settings } = useContext(SettingsContext);
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
            login(res.data.token);
            toast.success('Successfully Authenticated!');

            const role = res.data.user.role;
            if (role === 'superadmin') navigate('/superadmin/dashboard');
            else if (role === 'admin') navigate('/admin/dashboard');
            else navigate('/voter/dashboard');
        } catch (err) {
            const msg = err.response?.data?.error || 'Authentication failed';
            setError(msg);
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 relative overflow-hidden font-outfit">
            {/* Background Gradients */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full"></div>

            <div className="w-full max-w-[450px] relative z-10 animate-in fade-in duration-700">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[2rem] shadow-2xl mb-6 p-4">
                        <Shield className="w-full h-full text-white" />
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tight mb-2">
                        {settings.appName || 'DecentraVote'}
                    </h1>
                    <p className="text-slate-400 font-medium">Secure Blockchain Identity Gateway</p>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 p-10 shadow-3xl shadow-black/50">
                    <h2 className="text-2xl font-bold text-white mb-8">Sign In</h2>

                    {error && (
                        <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-sm font-bold flex items-center">
                            <Shield className="w-4 h-4 mr-2" /> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Account Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="email" required
                                    className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-600 focus:border-blue-500 outline-none transition-all font-medium"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Security Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="password" required
                                    className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-600 focus:border-blue-500 outline-none transition-all font-medium"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl py-4 font-black text-lg shadow-xl shadow-blue-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                        >
                            {isLoading ? <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div> : (
                                <>
                                    <span>Authenticate</span>
                                    <LogIn className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <Link to="/register" className="text-slate-400 text-sm font-bold hover:text-white transition-colors">
                            Need an account? <span className="text-blue-500">Register Now</span>
                        </Link>
                    </div>
                </div>

                <div className="mt-8 flex justify-center">
                    <div className="bg-slate-900/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/5 flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[10px] font-bold text-slate-400 mr-2">BLOCKCHAIN NODE STATUS: ACTIVE</span>
                        <CheckCircle className="w-3 h-3 text-emerald-500" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
