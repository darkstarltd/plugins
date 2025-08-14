
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import { PasswordInput } from '../common/PasswordInput';
import { AuroraBackground } from '../common/AuroraBackground';
import { LockIcon } from '../icons';

export const AppLockScreen: React.FC = () => {
    const { unlockApp } = useAuth();
    const { settings } = useSettings();
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleUnlock = async () => {
        const success = await unlockApp(password);
        if (!success) {
            setError('Incorrect PIN or password.');
        }
    }

    return (
        <div className="w-screen h-screen flex items-center justify-center bg-bg-base relative overflow-hidden">
            <AuroraBackground />
            <div className="w-full max-w-sm text-center p-8 bg-glass rounded-xl shadow-2xl z-10">
                <LockIcon className="w-12 h-12 text-accent mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-text-base">Application Locked</h1>
                <p className="text-text-muted mb-6">Enter your PIN to unlock.</p>
                <PasswordInput
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleUnlock()}
                    placeholder="Enter PIN"
                    autoFocus
                    className="w-full bg-bg-inset border border-border-base rounded-lg p-2 font-mono text-center text-2xl tracking-[.5em]"
                />
                {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                <button onClick={handleUnlock} className="w-full mt-4 px-4 py-2 bg-primary text-on-primary font-semibold rounded-md hover:opacity-90">
                    Unlock
                </button>
            </div>
        </div>
    )
}
