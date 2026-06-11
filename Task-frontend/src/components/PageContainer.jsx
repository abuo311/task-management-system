// src/components/PageContainer.jsx
import React from 'react';
import { useTheme } from '../context/ThemeContext';

const PageContainer = ({ children }) => {
    const { themeConfig } = useTheme();
    
    // Apply the theme background and text color globally to all pages
    return (
        <div className={`min-h-screen ${themeConfig.bg} ${themeConfig.text} transition-colors duration-300`}>
            {children}
        </div>
    );
};

export default PageContainer;