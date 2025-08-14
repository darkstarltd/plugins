
import React, { createContext, useContext, useEffect, ReactNode, useState } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import type { Settings, Theme } from '../types';

const THEMES: Theme[] = [
    {
        name: 'Monico Dark',
        colors: {
            '--color-primary': '#3b82f6', // blue-500
            '--color-secondary': '#14b8a6', // teal-500
            '--color-accent': '#a855f7', // purple-500
            '--color-bg-base': '#0C111A', // gray-950
            '--color-bg-surface': '#111827', // gray-900
            '--color-bg-inset': '#1f2937', // gray-800
            '--color-text-base': '#e5e7eb', // gray-200
            '--color-text-muted': '#9ca3af', // gray-400
            '--color-text-dim': '#6b7280', // gray-500
            '--color-border-base': '#374151', // gray-700
            '--color-text-on-primary': '#ffffff',
            '--color-text-on-secondary': '#ffffff',
            '--color-text-on-accent': '#ffffff',
            // Syntax Highlighting
            '--color-token-keyword': '#c792ea',
            '--color-token-string': '#c3e88d',
            '--color-token-comment': '#546e7a',
            '--color-token-number': '#f78c6c',
            '--color-token-operator': '#89ddff',
            '--color-token-punctuation': '#89ddff',
            '--color-token-function': '#82aaff',
            '--color-token-tag': '#f07178',
            '--color-token-attribute': '#ffcb6b',
            '--color-token-value': '#c3e88d',
        }
    },
    {
        name: 'Nord',
        colors: {
            '--color-primary': '#88C0D0',
            '--color-secondary': '#A3BE8C',
            '--color-accent': '#B48EAD',
            '--color-bg-base': '#2E3440',
            '--color-bg-surface': '#3B4252',
            '--color-bg-inset': '#434C5E',
            '--color-text-base': '#ECEFF4',
            '--color-text-muted': '#D8DEE9',
            '--color-text-dim': '#E5E9F0',
            '--color-border-base': '#4C566A',
            '--color-text-on-primary': '#2E3440',
            '--color-text-on-secondary': '#2E3440',
            '--color-text-on-accent': '#ECEFF4',
             // Syntax Highlighting
            '--color-token-keyword': '#81A1C1',
            '--color-token-string': '#A3BE8C',
            '--color-token-comment': '#616E88',
            '--color-token-number': '#D08770',
            '--color-token-operator': '#81A1C1',
            '--color-token-punctuation': '#ECEFF4',
            '--color-token-function': '#88C0D0',
            '--color-token-tag': '#BF616A',
            '--color-token-attribute': '#EBCB8B',
            '--color-token-value': '#A3BE8C',
        }
    },
    {
        name: 'Solarized Light',
        colors: {
            '--color-primary': '#268bd2',
            '--color-secondary': '#859900',
            '--color-accent': '#6c71c4',
            '--color-bg-base': '#fdf6e3',
            '--color-bg-surface': '#eee8d5',
            '--color-bg-inset': '#d5ccb8',
            '--color-text-base': '#586e75',
            '--color-text-muted': '#657b83',
            '--color-text-dim': '#93a1a1',
            '--color-border-base': '#93a1a1',
            '--color-text-on-primary': '#ffffff',
            '--color-text-on-secondary': '#ffffff',
            '--color-text-on-accent': '#ffffff',
             // Syntax Highlighting
            '--color-token-keyword': '#859900',
            '--color-token-string': '#2aa198',
            '--color-token-comment': '#93a1a1',
            '--color-token-number': '#d33682',
            '--color-token-operator': '#6c71c4',
            '--color-token-punctuation': '#586e75',
            '--color-token-function': '#268bd2',
            '--color-token-tag': '#cb4b16',
            '--color-token-attribute': '#b58900',
            '--color-token-value': '#2aa198',
        }
    },
     {
        name: 'High Contrast',
        colors: {
            '--color-primary': '#ffff00', // yellow
            '--color-secondary': '#00ffff', // cyan
            '--color-accent': '#ff00ff', // magenta
            '--color-bg-base': '#000000',
            '--color-bg-surface': '#1a1a1a',
            '--color-bg-inset': '#333333',
            '--color-text-base': '#ffffff',
            '--color-text-muted': '#f0f0f0',
            '--color-text-dim': '#cccccc',
            '--color-border-base': '#888888',
            '--color-text-on-primary': '#000000',
            '--color-text-on-secondary': '#000000',
            '--color-text-on-accent': '#000000',
             // Syntax Highlighting
            '--color-token-keyword': '#ff00ff',
            '--color-token-string': '#00ffff',
            '--color-token-comment': '#808080',
            '--color-token-number': '#ffff00',
            '--color-token-operator': '#ffffff',
            '--color-token-punctuation': '#ffffff',
            '--color-token-function': '#ffffff',
            '--color-token-tag': '#ff00ff',
            '--color-token-attribute': '#ffff00',
            '--color-token-value': '#00ffff',
        }
    }
];


const defaultSettings: Settings = {
    layout: {
        sidebarWidth: 288,
        bottomPanelHeight: 256,
    },
    editor: {
        fontFamily: 'mono',
        fontSize: 14,
        lineHeight: 1.6,
        wordWrap: false,
        showMinimap: true,
        enableBracketMatching: true,
    },
    terminal: {
        fontSize: 14,
    },
    ai: {
        apiKey: null,
        model: 'gemini-2.5-flash',
        personality: 'concise',
    },
    firepass: {
        autoLockMinutes: 15,
        passwordGenerator: {
            length: 16,
            useUppercase: true,
            useLowercase: true,
            useNumbers: true,
            useSymbols: true,
        },
    },
    plugins: {
        'prettier': true,
        'gitlens': true,
        'liveServer': false,
    },
    appearance: {
        theme: 'Monico Dark',
        accentColor: 'orange',
        animatedBackground: true,
    },
    accessibility: {
        globalFontSize: 16,
        reduceMotion: false,
        highContrast: false,
    },
    security: {
        lockType: 'none',
        pin: null,
        pattern: null,
    },
    webDev: {
        autoRefresh: true,
        libraries: [],
    },
    system: {
        maintenanceMode: false,
    },
    advanced: {
        enableFileApi: false,
        systemPrompt: "You are an expert AI developer assistant.",
    }
};

interface SettingsContextType {
    settings: Settings;
    setSettings: (settings: Settings | ((val: Settings) => Settings)) => void;
    themes: Theme[];
    resetAllSettings: () => void;
    isSettingsOpen: boolean;
    toggleSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useLocalStorage<Settings>('firefly_settings', defaultSettings);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    useEffect(() => {
        // Apply theme colors
        const themeName = settings.accessibility.highContrast ? 'High Contrast' : settings.appearance.theme;
        const activeTheme = THEMES.find(t => t.name === themeName) || THEMES[0];
        const styleElement = document.getElementById('theme-variables');
        if (styleElement) {
            const css = `:root { ${Object.entries(activeTheme.colors).map(([key, value]) => `${key}: ${value};`).join(' ')} }`;
            styleElement.innerHTML = css;
        }

        // Apply accessibility settings
        const body = document.body;
        body.style.fontSize = `${settings.accessibility.globalFontSize}px`;
        body.dataset.reduceMotion = String(settings.accessibility.reduceMotion);
        body.dataset.themeContrast = String(settings.accessibility.highContrast);

    }, [settings.appearance.theme, settings.accessibility]);
    
    const resetAllSettings = () => {
        setSettings(defaultSettings);
    }

    const toggleSettings = () => setIsSettingsOpen(prev => !prev);

    return (
        <SettingsContext.Provider value={{ settings, setSettings, themes: THEMES, resetAllSettings, isSettingsOpen, toggleSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = (): SettingsContextType => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
