import React, {createContext, ReactNode, useEffect, useState} from 'react';

export type UserTheme = 'light' | 'dark' | 'system';
export type Theme = 'light' | 'dark';

interface UserSettings {
    userTheme: UserTheme;
    theme: Theme;
    model: string | null;
    instructions: string;
    speechModel: string | null;
    speechVoice: string | null;
    speechSpeed: number | null;
}

const defaultUserSettings: UserSettings = {
    userTheme: 'system',
    theme: 'light',
    model: null,
    instructions: '',
    speechModel: 'tts-1',
    speechVoice: 'echo',
    speechSpeed: 1.0
};

const determineEffectiveTheme = (userTheme: UserTheme): Theme => {
    if (userTheme === 'system' || !userTheme) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return userTheme;
};

export const UserContext = createContext<{
    userSettings: UserSettings;
    setUserSettings: React.Dispatch<React.SetStateAction<UserSettings>>;
}>({
    userSettings: defaultUserSettings,
    setUserSettings: () => {
    },
});

interface UserProviderProps {
    children: ReactNode;
}

export const UserProvider = ({children}: UserProviderProps) => {
    const [userSettings, setUserSettings] = useState<UserSettings>(() => {
        const storedUserTheme: Theme | null = localStorage.getItem('theme') as Theme | null;
        const model = localStorage.getItem('defaultModel');
        const instructions = localStorage.getItem('defaultInstructions') || '';
        const speechModel = localStorage.getItem('defaultSpeechModel');
        const speechVoice = localStorage.getItem('defaultSpeechVoice');
        const speechSpeed = Number(localStorage.getItem('defaultSpeechSpeed'));

        const effectiveTheme = determineEffectiveTheme(storedUserTheme || 'system');

        return {
            userTheme: storedUserTheme || 'system',
            theme: effectiveTheme,
            model: model || null,
            instructions: instructions,
            speechModel: speechModel,
            speechVoice: speechVoice,
            speechSpeed: speechSpeed
        };
    });

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        mediaQuery.addEventListener('change', mediaQueryChangeHandler);
        updateTheme();

        return () => {
            mediaQuery.removeEventListener('change', mediaQueryChangeHandler);
        };
    }, []);

    useEffect(() => {
        localStorage.setItem('theme', userSettings.userTheme);
    }, [userSettings.userTheme]);

    useEffect(() => {
        if (userSettings.model === null || userSettings.model === '') {
            localStorage.removeItem('defaultModel');
        } else {
            localStorage.setItem('defaultModel', userSettings.model);
        }
    }, [userSettings.model]);

    useEffect(() => {
        if (userSettings.instructions === '') {
            localStorage.removeItem('defaultInstructions');
        } else {
            localStorage.setItem('defaultInstructions', userSettings.instructions);
        }
    }, [userSettings.instructions]);

    useEffect(() => {
        const newEffectiveTheme = determineEffectiveTheme(userSettings.userTheme);
        setUserSettings(prevSettings => ({...prevSettings, theme: newEffectiveTheme}));

        if (newEffectiveTheme === 'dark') {
            document.body.classList.add('dark');
        } else {
            document.body.classList.remove('dark');
        }
    }, [userSettings.userTheme]);

    const mediaQueryChangeHandler = (e: MediaQueryListEvent) => {
        const newSystemTheme: Theme = e.matches ? 'dark' : 'light';
        if (userSettings.userTheme === 'system') {
            setUserSettings((prevSettings) => ({
                ...prevSettings,
                theme: newSystemTheme,
            }));
        }
    };

    const updateTheme = () => {
        const newEffectiveTheme = determineEffectiveTheme(userSettings.userTheme || 'system');
        if (newEffectiveTheme !== userSettings.theme) {
            setUserSettings((prevSettings) => ({...prevSettings, theme: newEffectiveTheme}));
        }
        if (newEffectiveTheme === 'dark') {
            document.body.classList.add('dark');
        } else {
            document.body.classList.remove('dark');
        }
    };

    useEffect(() => {
        if (userSettings.speechModel === null || userSettings.speechModel === '') {
            localStorage.removeItem('defaultSpeechModel');
        } else {
            localStorage.setItem('defaultSpeechModel', userSettings.speechModel);
        }
    }, [userSettings.speechModel]);

    useEffect(() => {
        if (userSettings.speechVoice === null || userSettings.speechVoice === '') {
            localStorage.removeItem('defaultSpeechVoice');
        } else {
            localStorage.setItem('defaultSpeechVoice', userSettings.speechVoice);
        }
    }, [userSettings.speechVoice]);

    useEffect(() => {
        if (userSettings.speechSpeed === null || userSettings.speechSpeed === undefined || userSettings.speechSpeed < 0.25 || userSettings.speechSpeed > 4.0) {
            localStorage.removeItem('defaultSpeechSpeed');
        } else {
            localStorage.setItem('defaultSpeechSpeed', String(userSettings.speechSpeed));
        }
    }, [userSettings.speechSpeed]);

    return (
        <UserContext.Provider value={{userSettings, setUserSettings}}>
            {children}
        </UserContext.Provider>
    );
};

// Usage hint
// const { userSettings, setUserSettings } = useContext(UserContext);
