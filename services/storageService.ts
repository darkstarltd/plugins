
import { Settings, Project } from '../types';
import { MOCK_PROJECTS } from '../constants';

const PROJECTS_KEY = 'fireplay_projects';
const ACTIVE_PROJECT_ID_KEY = 'fireplay_active_project_id';
const SETTINGS_KEY = 'fireplay_settings';
const FIREPASS_VAULT_KEY = 'firepass_vault_encrypted';
const VERSION_KEY = 'firefly_version';

// --- Projects ---
export const saveProjects = (projects: Project[]): void => {
    try {
        const data = JSON.stringify(projects);
        localStorage.setItem(PROJECTS_KEY, data);
    } catch (error) {
        console.error("Failed to save projects to local storage", error);
    }
};

export const loadProjects = (): Project[] => {
    try {
        const data = localStorage.getItem(PROJECTS_KEY);
        if (data) {
            return JSON.parse(data);
        }
    } catch (error) {
        console.error("Failed to load projects from local storage", error);
    }
    return MOCK_PROJECTS;
};

export const saveActiveProjectId = (projectId: string): void => {
    localStorage.setItem(ACTIVE_PROJECT_ID_KEY, projectId);
};

export const loadActiveProjectId = (): string | null => {
    return localStorage.getItem(ACTIVE_PROJECT_ID_KEY);
};


// --- Settings ---
export const getDefaultSettings = (): Settings => ({
    layout: {
        sidebarWidth: 288,
        bottomPanelHeight: 256,
    },
    editor: {
        fontSize: 16,
        fontFamily: 'mono',
        lineHeight: 1.625,
        showMinimap: true,
        enableBracketMatching: true,
        wordWrap: false,
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
        }
    },
    plugins: {
        prettier: true,
        gitlens: true,
        liveServer: false,
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
});

export const saveSettings = (settings: Settings): void => {
    try {
        const data = JSON.stringify(settings);
        localStorage.setItem(SETTINGS_KEY, data);
    } catch (error) {
        console.error("Failed to save settings to local storage", error);
    }
}

export const loadSettings = (): Settings => {
    const defaultSettings = getDefaultSettings();
    try {
        const data = localStorage.getItem(SETTINGS_KEY);
        if (data) {
            const parsed = JSON.parse(data);
            const vaultSettings = parsed.vault || parsed.firepass;
            // Deep merge to ensure nested objects get default values for new properties
            return {
                ...defaultSettings,
                ...parsed,
                layout: { ...defaultSettings.layout, ...parsed.layout },
                editor: { ...defaultSettings.editor, ...parsed.editor },
                terminal: { ...defaultSettings.terminal, ...parsed.terminal },
                ai: { ...defaultSettings.ai, ...parsed.ai },
                firepass: { ...defaultSettings.firepass, ...vaultSettings, passwordGenerator: {...defaultSettings.firepass.passwordGenerator, ...vaultSettings?.passwordGenerator } },
                plugins: { ...defaultSettings.plugins, ...parsed.plugins },
                appearance: { ...defaultSettings.appearance, ...parsed.appearance },
                accessibility: { ...defaultSettings.accessibility, ...parsed.accessibility },
                security: { ...defaultSettings.security, ...parsed.security },
                webDev: { ...defaultSettings.webDev, ...parsed.webDev },
                system: { ...defaultSettings.system, ...parsed.system },
                advanced: { ...defaultSettings.advanced, ...parsed.advanced },
            };
        }
    } catch (error) {
        console.error("Failed to load settings from local storage", error);
    }
    return defaultSettings;
}

// --- Vault ---
export const saveEncryptedVault = (encryptedData: string): void => {
    try {
        localStorage.setItem(FIREPASS_VAULT_KEY, encryptedData);
    } catch (error) {
        console.error("Failed to save vault to local storage", error);
    }
};

export const loadEncryptedVault = (): string | null => {
    try {
        const oldVault = localStorage.getItem('fireplay_vault_encrypted');
        if (oldVault) {
            localStorage.setItem(FIREPASS_VAULT_KEY, oldVault);
            localStorage.removeItem('fireplay_vault_encrypted');
        }
        return localStorage.getItem(FIREPASS_VAULT_KEY);
    } catch (error) {
        console.error("Failed to load vault from local storage", error);
        return null;
    }
};

export const clearVault = (): void => {
    localStorage.removeItem(FIREPASS_VAULT_KEY);
    localStorage.removeItem('fireplay_vault_encrypted');
}

// --- Version ---
export const loadLastSeenVersion = (): string | null => {
    return localStorage.getItem(VERSION_KEY);
};

export const saveLastSeenVersion = (version: string): void => {
    localStorage.setItem(VERSION_KEY, version);
};