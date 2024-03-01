// UserContext.tsx
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface UserSettings {
    theme: 'light' | 'dark' | 'system';
    model: string | null;
    instructions: string;
}

const defaultUserSettings: UserSettings = {
    theme: 'system',
    model: null, // Default model setting
    instructions: '', // Default instructions
}

// Helper functions to get/set User Settings in Local Storage
const getUserSettingsFromLocalStorage = (): UserSettings => {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
        try {
            const parsedSettings = JSON.parse(savedSettings);
            return { ...defaultUserSettings, ...parsedSettings };
        } catch (error) {
            console.error("Error parsing user settings from localStorage", error);
        }
    }
    return defaultUserSettings;
};

const saveUserSettingsToLocalStorage = (settings: UserSettings) => {
    localStorage.setItem('userSettings', JSON.stringify(settings));
};

// Updated context
export const UserContext = createContext<{
    userSettings: UserSettings;
    setUserSettings: React.Dispatch<React.SetStateAction<UserSettings>>;
}>({
    userSettings: defaultUserSettings,
    setUserSettings: () => {},
});

interface UserProviderProps {
    children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
    const [userSettings, setUserSettings] = useState<UserSettings>(getUserSettingsFromLocalStorage());

    useEffect(() => {
        saveUserSettingsToLocalStorage(userSettings);
    }, [userSettings]);

    return (
      <UserContext.Provider value={{ userSettings, setUserSettings }}>
          {children}
      </UserContext.Provider>
    );
};

// Usage hint
// const { userSettings, setUserSettings } = useContext(UserContext);
