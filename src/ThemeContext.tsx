// ThemeContext.tsx
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface ThemeContextType {
    theme: 'light' | 'dark' | 'system'; // Updated to reflect the new possible values
    setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

// Dynamically setting initial theme
const getInitialTheme = (): 'light' | 'dark' | 'system' => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
        return savedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; // Default to system preference
};

export const ThemeContext = createContext<ThemeContextType>({
    theme: getInitialTheme(), // Now the theme is directly set based on preference
    setTheme: () => {},
});

interface ThemeProviderProps {
    children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
    const [theme, setThemeState] = useState<'light' | 'dark' | 'system'>(getInitialTheme());

    useEffect(() => {
        // Adjust this logic to properly add and remove class based on current theme
        const root = document.documentElement;
        root.classList.remove('light', 'dark'); // Remove existing class to avoid conflicts
        let themeClass = theme === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : theme;
        root.classList.add(themeClass);
        root.style.setProperty('color-scheme', themeClass);
        if (theme !== 'system') {
            localStorage.setItem('theme', theme);
        } else {
            localStorage.removeItem('theme');
        }
    }, [theme]);

    const setTheme = (theme: 'light' | 'dark' | 'system') => {
        setThemeState(theme); // Directly set the theme, no conversion to boolean
    };

    return (
      <ThemeContext.Provider value={{ theme, setTheme }}>
          {children}
      </ThemeContext.Provider>
    );
};
