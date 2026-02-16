import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

export const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState({
        appName: 'Voting System',
        logoUrl: '',
        isSystemPaused: false
    });
    const [loading, setLoading] = useState(true);

    const fetchSettings = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/auth/settings');
            if (res.data.settings) {
                setSettings(res.data.settings);
                document.title = res.data.settings.appName || 'Voting System';
            }
        } catch (err) {
            console.error('Failed to fetch public settings:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
        const socket = io('http://localhost:5000');
        socket.on('settingsUpdate', (updatedSettings) => {
            setSettings(updatedSettings);
            if (updatedSettings.appName) {
                document.title = updatedSettings.appName;
            }
        });
        return () => socket.disconnect();
    }, []);

    const refreshSettings = () => fetchSettings();

    return (
        <SettingsContext.Provider value={{ settings, loading, refreshSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};
