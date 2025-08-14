
import React, { useState } from 'react';
import Modal from './Modal';
import { LockIcon } from './icons';
import { useToast } from './Toast';

interface SetupVaultModalProps {
  isOpen: boolean;
  onSetup: (password: string) => void;
  onClose: () => void;
}

const SetupVaultModal: React.FC<SetupVaultModalProps> = ({ isOpen, onSetup, onClose }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const toast = useToast();

    const handleSetup = () => {
        if (password.length < 8) {
            toast.showToast('Password must be at least 8 characters long.', 'error');
            return;
        }
        if (password !== confirmPassword) {
            toast.showToast('Passwords do not match.', 'error');
            return;
        }
        onSetup(password);
    }
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Setup FirePass Vault" size="sm">
            <div className="flex flex-col items-center text-center p-4">
                <LockIcon className="w-12 h-12 text-[var(--color-accent)] mb-4"/>
                <h3 className="text-xl font-bold text-[var(--color-text-bright)] mb-2">Secure Your Secrets</h3>
                <p className="text-[var(--color-text-dim)] mb-4">Create or confirm your master password for the FirePass vault. This password cannot be recovered, so store it safely.</p>

                <div className="w-full space-y-3">
                    <input 
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="New Master Password"
                        autoFocus
                        className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] rounded-lg p-2 font-mono text-center focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-ring)]"
                    />
                    <input 
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSetup()}
                        placeholder="Confirm Master Password"
                        className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] rounded-lg p-2 font-mono text-center focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-ring)]"
                    />
                </div>
                
                <button 
                    onClick={handleSetup}
                    className="w-full mt-4 px-4 py-2 bg-[var(--color-accent)] text-[var(--color-text-on-accent)] font-semibold rounded-md hover:bg-[var(--color-accent-hover)] transition-all shadow-md hover:shadow-lg"
                >
                    Create Vault
                </button>
            </div>
        </Modal>
    );
};

export default SetupVaultModal;