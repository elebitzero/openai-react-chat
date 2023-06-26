import { createContext, useState, useEffect, ReactNode } from 'react';

interface ThemeContextType {
    darkTheme: boolean;
    toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType>({
    darkTheme: true,
    toggleTheme: () => {},
});

interface ThemeProviderProps {
    children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
    const [darkTheme, setDarkTheme] = useState(false);

    useEffect(() => {
        if (darkTheme) {
            console.log('dark theme enabled');
            document.documentElement.classList.add('dark');
            document.documentElement.style.setProperty('color-scheme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            document.documentElement.style.setProperty('color-scheme', 'light');
        }
    }, [darkTheme]);

    const toggleTheme = () => {
        setDarkTheme(!darkTheme);
    };

    return (
        <ThemeContext.Provider value={{ darkTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
