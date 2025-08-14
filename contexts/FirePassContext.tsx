
import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import type { FirePassEntry, FirePassContextType } from '../types';
import * as cryptoService from '../services/cryptoService';
import * as storageService from '../services/storageService';
import { useAuth } from './AuthContext';
import { useToast } from '../components/Toast';
import { verifyPassword, hashPassword } from '../utils/auth';

const FirePassContext = createContext<FirePassContextType | undefined>(undefined);

export const FirePassProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user, setUser } = useAuth();
    const toast = useToast();
    const [entries, setEntries] = useState<FirePassEntry[]>([]);
    const [sessionKey, setSessionKey] = useState<CryptoKey | null>(null);
    const [isLocked, setIsLocked] = useState(true);
    const [needsSetup, setNeedsSetup] = useState(false);
    
    const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);

    useEffect(() => {
        const encryptedVault = storageService.loadEncryptedVault();
        if (!user || !user.hashedMasterPassword) {
            setNeedsSetup(false);
            setIsLocked(true);
        } else if (!encryptedVault) {
            setNeedsSetup(true);
            setIsLocked(true);
        } else {
            setNeedsSetup(false);
            setIsLocked(true);
        }
    }, [user]);

    const lock = useCallback(() => {
        setSessionKey(null);
        setEntries([]);
        setIsLocked(true);
        toast.showToast('FirePass vault has been locked.', 'info');
    }, [toast]);
    
    const unlock = useCallback(async (password: string): Promise<boolean> => {
        if (!user || !user.hashedMasterPassword) return false;
        
        const isPasswordCorrect = await verifyPassword(password, user.hashedMasterPassword);
        if (!isPasswordCorrect) {
            toast.showToast("Incorrect master password.", "error");
            return false;
        }

        try {
            const encryptedVault = storageService.loadEncryptedVault();
            if (!encryptedVault) {
                toast.showToast("Vault not set up.", "error");
                return false;
            }

            const salt = new Uint8Array(user.hashedMasterPassword.split(':')[0].match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
            const key = await cryptoService.deriveKey(password, salt);
            const decryptedData = await cryptoService.decrypt(encryptedVault, key) as { entries: FirePassEntry[] };

            setEntries(decryptedData.entries || []);
            setSessionKey(key);
            setIsLocked(false);
            setNeedsSetup(false);
            toast.showToast("Vault Unlocked", "success");
            return true;
        } catch (e) {
            console.error("Failed to unlock vault:", e);
            toast.showToast("Failed to decrypt vault. The vault might be corrupted or password incorrect.", "error");
            return false;
        }
    }, [user, toast]);

    const setup = useCallback(async (password: string): Promise<void> => {
        if (!user || !user.hashedMasterPassword) {
            toast.showToast("An authenticated user is required to set up a vault.", "error");
            return;
        }

        const isPasswordCorrect = await verifyPassword(password, user.hashedMasterPassword);
        if (!isPasswordCorrect) {
            toast.showToast("The password does not match your account's master password.", "error");
            return;
        }
        
        try {
            const salt = new Uint8Array(user.hashedMasterPassword.split(':')[0].match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
            const key = await cryptoService.deriveKey(password, salt);
            const initialVault = { entries: [] };
            const encryptedVault = await cryptoService.encrypt(initialVault, key);
            
            storageService.saveEncryptedVault(encryptedVault);
            
            setEntries([]);
            setSessionKey(key);
            setIsLocked(false);
            setNeedsSetup(false);
            toast.showToast("FirePass vault created successfully!", "success");
        } catch (e) {
            console.error("Failed to setup vault:", e);
            toast.showToast("Could not set up vault.", "error");
        }
    }, [user, toast]);
    
    const updateEntries = useCallback(async (newEntries: FirePassEntry[]) => {
        if (!sessionKey) {
            toast.showToast("Vault is locked. Cannot update entries.", "error");
            return;
        }
        try {
            setEntries(newEntries);
            const vaultData = { entries: newEntries };
            const encryptedVault = await cryptoService.encrypt(vaultData, sessionKey);
            storageService.saveEncryptedVault(encryptedVault);
        } catch (e) {
            console.error("Failed to update entries:", e);
            toast.showToast("Failed to save secrets.", "error");
        }
    }, [sessionKey, toast]);
    
    const clearVault = useCallback(() => {
        if (window.confirm("Are you sure you want to delete your entire vault? This is irreversible.")) {
            storageService.clearVault();
            setEntries([]);
            setSessionKey(null);
            setIsLocked(true);
            setNeedsSetup(true);
            toast.showToast("Vault has been cleared.", "info");
        }
    }, [toast]);

    const changeMasterPassword = async (oldPassword: string, newPassword: string): Promise<boolean> => {
        if (!sessionKey || !user) {
            toast.showToast("Vault must be unlocked to change the password.", "error");
            return false;
        }
        const isOldPasswordCorrect = await verifyPassword(oldPassword, user.hashedMasterPassword);
        if (!isOldPasswordCorrect) {
            toast.showToast("The 'Current Master Password' is incorrect.", "error");
            return false;
        }
        try {
            const newSalt = cryptoService.generateSalt();
            const newKey = await cryptoService.deriveKey(newPassword, newSalt);
            const newHashedPassword = await hashPassword(newPassword);

            const vaultData = { entries };
            const newEncryptedVault = await cryptoService.encrypt(vaultData, newKey);
            
            storageService.saveEncryptedVault(newEncryptedVault);
            
            setUser(currentUser => currentUser ? { ...currentUser, hashedMasterPassword: newHashedPassword } : null);
            setSessionKey(newKey); // Keep the vault unlocked with the new key

            return true;
        } catch (e) {
            console.error("Failed to change master password:", e);
            toast.showToast("An error occurred while changing the password.", "error");
            return false;
        }
    };

    const exportVault = () => {
        if (isLocked) {
            toast.showToast("Unlock the vault before exporting.", "error");
            return;
        }
        const dataStr = JSON.stringify(entries, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const exportFileDefaultName = 'firepass_vault_export.json';
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        toast.showToast("Vault exported successfully.", "success");
    };

    const importVault = async (importedEntries: FirePassEntry[]) => {
        if (isLocked || !sessionKey) {
            toast.showToast("Unlock the vault before importing.", "error");
            return;
        }
        if (window.confirm("This will overwrite your current vault entries. Are you sure you want to continue?")) {
            await updateEntries(importedEntries);
            toast.showToast("Vault imported successfully!", "success");
        }
    };

    const value: FirePassContextType = {
        entries,
        isLocked,
        needsSetup,
        setup,
        unlock,
        lock,
        updateEntries,
        clearVault,
        isUnlockModalOpen,
        setIsUnlockModalOpen,
        changeMasterPassword,
        exportVault,
        importVault
    };

    return (
        <FirePassContext.Provider value={value}>
            {children}
        </FirePassContext.Provider>
    );
};

export const useFirePass = (): FirePassContextType => {
    const context = useContext(FirePassContext);
    if (context === undefined) {
        throw new Error('useFirePass must be used within a FirePassProvider');
    }
    return context;
};
