import React from 'react';
import { Shield } from 'lucide-react';

const Loader = () => {
    return (
        <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[#0f172a]/80 backdrop-blur-md">
            <div className="relative flex items-center justify-center">
                {/* Outer Glow */}
                <div className="absolute w-32 h-32 bg-blue-600/30 blur-3xl animate-pulse"></div>

                {/* Spinning Rings */}
                <div className="w-24 h-24 border-4 border-slate-700/50 rounded-full"></div>
                <div className="absolute top-0 w-24 h-24 border-t-4 border-blue-500 rounded-full animate-spin"></div>
                <div className="absolute top-2 left-2 w-20 h-20 border-r-4 border-indigo-500 rounded-full animate-[spin_1.5s_linear_infinite]"></div>

                {/* Central Icon */}
                <div className="absolute flex items-center justify-center">
                    <Shield className="w-8 h-8 text-white animate-pulse" />
                </div>
            </div>

            <div className="mt-8 text-center shrink-0">
                <p className="text-white font-black text-xs uppercase tracking-[0.3em] animate-pulse">
                    Synchronizing Network
                </p>
                <div className="mt-2 flex space-x-1 justify-center">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                </div>
            </div>
        </div>
    );
};

export default Loader;
