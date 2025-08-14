
import React, { useState } from 'react';
import Modal from './Modal';
import { LockIcon } from './icons';

interface UnlockVaultModalProps {
  isOpen: boolean;
  onUnlock: (password: string) => Promise<boolean>;
  onClose: () => void;
}

const UnlockVaultModal: React.FC<UnlockVaultModalProps> = ({ isOpen, onUnlock, onClose }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleUnlock = async () => {
        if (!password) {
            setError('Password is required.');
            return;
        }
        setIsLoading(true);
        setError('');
        const success = await onUnlock(password);
        if (!success) {
            setError('Incorrect password. Please try again.');
            setIsLoading(false);
        }
    }
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Unlock FirePass Vault" size="sm">
            <div className="flex flex-col items-center text-center p-4">
                <LockIcon className="w-12 h-12 text-[var(--color-accent)] mb-4"/>
                <h3 className="text-xl font-bold text-[var(--color-text-bright)] mb-2">Vault Locked</h3>
                <p className="text-[var(--color-text-dim)] mb-4">Enter your master password to unlock your FirePass vault.</p>

                <input 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                    placeholder="Master Password"
                    autoFocus
                    className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] rounded-lg p-2 font-mono text-center focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-ring)]"
                />
                
                {error && <p className="text-red-400 text-sm mt-2">{error}</p>}

                <button 
                    onClick={handleUnlock}
                    disabled={isLoading}
                    className="w-full mt-4 px-4 py-2 bg-[var(--color-accent)] text-[var(--color-text-on-accent)] font-semibold rounded-md hover:bg-[var(--color-accent-hover)] disabled:opacity-50 transition-all shadow-md hover:shadow-lg"
                >
                    {isLoading ? 'Unlocking...' : 'Unlock'}
                </button>
            </div>
        </Modal>
    );
};

export default UnlockVaultModal;