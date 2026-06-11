// src/pages/ThemeSettings.jsx
import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Palette, Check } from 'lucide-react';

const ThemeSettings = () => {
    const { theme, setTheme } = useTheme();

    const colorOptions = [
        { id: 'rose', name: 'Rose & Emerald', color: 'bg-rose-950' },
        { id: 'blue', name: 'Deep Blue', color: 'bg-blue-950' },
        { id: 'slate', name: 'Slate Modern', color: 'bg-slate-900' }
    ];

    return (
        <div className="p-8 max-w-2xl">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-emerald-600/20 rounded-xl">
                    <Palette className="text-emerald-500" size={24} />
                </div>
                <h1 className="text-2xl font-black text-slate-800">Theme Customization</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {colorOptions.map((option) => (
                    <button
                        key={option.id}
                        onClick={() => setTheme(option.id)}
                        className={`relative p-6 rounded-2xl border-2 transition-all ${
                            theme === option.id 
                            ? 'border-emerald-500 ring-2 ring-emerald-500/20' 
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                    >
                        <div className={`w-full h-16 rounded-lg mb-4 ${option.color}`} />
                        <span className="font-bold text-slate-700">{option.name}</span>
                        {theme === option.id && (
                            <div className="absolute top-2 right-2 bg-emerald-500 text-white rounded-full p-1">
                                <Check size={12} />
                            </div>
                        )}
                    </button>
                ))}
            </div>

            <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-sm text-slate-500">
                    Your theme selection is saved automatically to your browser and will persist across sessions.
                </p>
            </div>
        </div>
    );
};

export default ThemeSettings;