// src/context/ThemeContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

// src/context/ThemeContext.jsx
export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(localStorage.getItem('app-theme') || 'rose');

    const themes = {
        rose: { bg: 'bg-rose-950', hover: 'hover:bg-rose-900', active: 'bg-emerald-600', text: 'text-rose-200' },
        blue: { bg: 'bg-blue-950', hover: 'hover:bg-blue-900', active: 'bg-blue-600', text: 'text-blue-200' },
        slate: { bg: 'bg-slate-900', hover: 'hover:bg-slate-800', active: 'bg-slate-600', text: 'text-slate-300' }
    };

    // Fallback to 'rose' if current theme is somehow invalid
    const activeThemeConfig = themes[theme] || themes.rose;

    useEffect(() => {
        localStorage.setItem('app-theme', theme);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, themeConfig: activeThemeConfig }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);