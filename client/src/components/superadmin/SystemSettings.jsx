import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { SettingsContext } from '../../context/SettingsContext';
import { Settings, Save, RefreshCw, AlertCircle } from 'lucide-react';

const SystemSettings = () => {
    const { settings: globalSettings, refreshSettings } = useContext(SettingsContext);
    const [settings, setSettings] = useState({ appName: '', isSystemPaused: false });
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (globalSettings) {
            setSettings({ appName: globalSettings.appName, isSystemPaused: globalSettings.isSystemPaused });
            setLoading(false);
        }
    }, [globalSettings]);

    const handleUpdate = async (e) => {
        if (e) e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.put('http://localhost:5000/api/superadmin/settings', settings, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage('Settings updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            console.error(err);
        }
    };

    const toggleSystemPause = async () => {
        const newStatus = !settings.isSystemPaused;
        // Optimistic update
        setSettings({ ...settings, isSystemPaused: newStatus });

        try {
            const token = localStorage.getItem('token');
            await axios.put('http://localhost:5000/api/superadmin/settings',
                { ...settings, isSystemPaused: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
        } catch (err) {
            console.error(err);
            // Revert on error
            setSettings({ ...settings, isSystemPaused: settings.isSystemPaused });
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-10 animate-in fade-in duration-700 font-outfit pb-10">
            {/* Premium Header */}
            <div className="bg-gradient-to-br from-rose-600 via-pink-600 to-orange-500 rounded-[2.5rem] p-12 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-400/10 rounded-full -ml-32 -mb-32 blur-3xl"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="max-w-xl">
                        <div className="flex items-center space-x-2 text-rose-100 mb-4 bg-white/10 w-fit px-4 py-1.5 rounded-full backdrop-blur-md border border-white/20">
                            <Settings className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Global Configuration</span>
                        </div>
                        <h1 className="text-5xl font-black mb-4 tracking-tight leading-tight">System Global <br />Environments</h1>
                        <p className="text-rose-50 text-xl font-medium opacity-90 leading-relaxed">Modify application-wide parameters, manage branding, and control emergency system status.</p>
                    </div>
                </div>
            </div>
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                <form onSubmit={handleUpdate} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Application Name</label>
                        <input type="text" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-rose-500 outline-none transition-all font-medium" value={settings.appName} onChange={e => setSettings({ ...settings, appName: e.target.value })} />
                    </div>
                    <div className="flex items-center justify-between p-6 bg-rose-50 rounded-2xl border border-rose-100">
                        <div>
                            <p className="font-bold text-gray-900">Emergency System Pause</p>
                            <p className="text-sm text-gray-500">Temporarily suspend all voting activities</p>
                        </div>
                        <button type="button" onClick={toggleSystemPause} className={`w-14 h-8 rounded-full transition-all relative ${settings.isSystemPaused ? 'bg-rose-500' : 'bg-gray-200'}`}>
                            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${settings.isSystemPaused ? 'left-7' : 'left-1'}`}></div>
                        </button>
                    </div>
                    <button type="submit" className="w-full py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-2xl font-bold flex items-center justify-center space-x-2 shadow-lg shadow-rose-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                        <Save className="w-5 h-5" />
                        <span>Save Configuration</span>
                    </button>
                    {message && <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl text-center font-bold animate-in slide-in-from-top-2">{message}</div>}
                </form>
            </div>
        </div>
    );
};

export default SystemSettings;
