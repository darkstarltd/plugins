
import React, { createContext, useContext, ReactNode, useState } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import type { AuthContextType, User, TierName } from '../types';
import { hashPassword, verifyPassword, generateUserCode } from '../utils/auth';
import { useSettings } from './SettingsContext';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useLocalStorage<User | null>('firefly_user', null);
    const [isAuthenticated, setIsAuthenticated] = useLocalStorage<boolean>('firefly_auth_status', false);
    const [isAppLocked, setIsAppLocked] = useLocalStorage<boolean>('firefly_app_lock_status', true);
    const [isFirstLogin, setIsFirstLogin] = useLocalStorage<boolean>('firefly_first_login', false);
    const [isAdmin, setIsAdmin] = useLocalStorage<boolean>('firefly_admin_status', false);
    
    const { settings } = useSettings();

    const signup = async (details: Omit<User, 'id' | 'hashedMasterPassword' | 'userCode' | 'tier'> & { masterPassword: string }) => {
        const { masterPassword, ...rest } = details;
        const hashedMasterPassword = await hashPassword(masterPassword);
        const newUser: User = {
            id: Date.now().toString(),
            ...rest,
            hashedMasterPassword,
            userCode: generateUserCode(),
            tier: 'Explorer',
        };
        setUser(newUser);
        setIsAuthenticated(true);
        setIsAppLocked(false); // No lock on first signup
        setIsFirstLogin(true);
    };

    const signin = async (email: string): Promise<boolean> => {
        // In a real app, this would fetch the user from a server.
        // For this demo, we check the locally stored user.
        const storedUser = JSON.parse(localStorage.getItem('firefly_user') || 'null') as User | null;
        if (storedUser && storedUser.email === email) {
            setUser(storedUser); // Ensure user state is up-to-date
            setIsAuthenticated(true);
            setIsAppLocked(settings.security.lockType !== 'none'); // Re-lock app on new session if enabled
            setIsAdmin(false);
            return true;
        }
        return false;
    };
    
    const loginAsAdmin = async (password: string): Promise<boolean> => {
        if (password === 'Gu3r1ll4') {
            setIsAdmin(true);
            setIsAuthenticated(true);
            setIsAppLocked(false); // Bypass locks for admin
            return true;
        }
        return false;
    };
    
    const unlockApp = async (password: string | number[]): Promise<boolean> => {
        const { lockType, pin, pattern } = settings.security;
        let isCorrect = false;

        if (lockType === 'pin' && typeof password === 'string') {
            isCorrect = password === pin;
        } else if (lockType === 'pattern' && Array.isArray(password)) {
            isCorrect = JSON.stringify(password) === JSON.stringify(pattern);
        }
        
        if(isCorrect) {
            setIsAppLocked(false);
        }
        return isCorrect;
    };

    const lock = () => {
        if (settings.security.lockType !== 'none') {
            setIsAppLocked(true);
        }
    };

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        setIsAppLocked(true);
        setIsFirstLogin(false);
        setIsAdmin(false);
    };
    
    const clearFirstLogin = () => {
        setIsFirstLogin(false);
    };

    const upgradeTier = (tierName: TierName) => {
        if (user) {
            setUser({ ...user, tier: tierName });
        }
    };

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            isAppLocked,
            isFirstLogin,
            user,
            isAdmin,
            signup,
            signin,
            unlockApp,
            lock,
            logout,
            clearFirstLogin,
            upgradeTier,
            loginAsAdmin,
            setUser
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
