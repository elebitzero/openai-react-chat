// ThemeContext.tsx
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface ThemeContextType {
    theme: 'light' | 'dark'; // Actual theme
    themePreference: 'light' | 'dark' | 'system'; // User's preference
    setThemePreference: (themePreference: 'light' | 'dark' | 'system') => void;
}

const getSystemTheme = () => window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

// Dynamically setting initial theme
const getInitialThemePreference = (): 'light' | 'dark' | 'system' => {
    const savedThemePreference = localStorage.getItem('theme');
    if (savedThemePreference === 'light' || savedThemePreference === 'dark' || savedThemePreference === 'system') {
        return savedThemePreference;
    }
    return 'system'; // Default to use system settings
};

const getInitialTheme = (themePreference: 'light' | 'dark' | 'system') => {
    return themePreference === 'system' ? getSystemTheme() : themePreference;
};

export const ThemeContext = createContext<ThemeContextType>({
    theme: getInitialTheme(getInitialThemePreference()), // Actual theme based on initial setting
    themePreference: getInitialThemePreference(), // The initial setting
    setThemePreference: () => {},
});

interface ThemeProviderProps {
    children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
    const [themePreference, setThemePreferenceState] = useState<'light' | 'dark' | 'system'>(getInitialThemePreference());
    const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme(themePreference));

    useEffect(() => {
        const newTheme = themePreference === 'system' ? getSystemTheme() : themePreference;
        setTheme(newTheme);

        // Reflect the actual theme in UI class and localStorage
        const root = document.documentElement;
        root.classList.remove('light', 'dark'); // Remove existing class to avoid conflicts
        root.classList.add(newTheme);
        root.style.setProperty('color-scheme', newTheme);

        if (themePreference !== 'system') {
            localStorage.setItem('theme', themePreference);
        } else {
            localStorage.removeItem('theme');
        }
    }, [themePreference]);

    const setThemePreference = (newThemePreference: 'light' | 'dark' | 'system') => {
        setThemePreferenceState(newThemePreference);
    };

    return (
      <ThemeContext.Provider value={{ theme, themePreference, setThemePreference }}>
          {children}
      </ThemeContext.Provider>
    );
};

// Usage of the context (for example, in a SettingsModal)
// const { themePreference, setThemePreference } = useContext(ThemeContext);
// setThemePreference('light'); // Or 'dark', 'system'
