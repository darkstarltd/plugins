
import React, { useState } from 'react';
import Modal from './Modal';
import { UsersIcon, CopyIcon, CheckCircleIcon } from './icons';
import { useToast } from './Toast';

interface LiveShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartSession: () => void;
}

const LiveShareModal: React.FC<LiveShareModalProps> = ({ isOpen, onClose, onStartSession }) => {
    const [linkCopied, setLinkCopied] = useState(false);
    const toast = useToast();
    const shareLink = `${window.location.href}?share=${Date.now()}`;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(shareLink).then(() => {
            setLinkCopied(true);
            toast.showToast("Share link copied to clipboard!", "success");
            setTimeout(() => setLinkCopied(false), 2000);
        });
    }

    const handleStart = () => {
        onStartSession();
        onClose();
        toast.showToast("Live Share session started (simulation)!", "info");
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Live Share" size="lg">
            <div className="flex flex-col items-center text-center p-4">
                <UsersIcon className="w-12 h-12 text-[var(--color-accent)] mb-4"/>
                <h3 className="text-xl font-bold text-[var(--color-text-bright)] mb-2">Start a Collaboration Session</h3>
                <p className="text-[var(--color-text-dim)] mb-6">Share the link below with your team to start coding together. (This is a simulation)</p>
                
                <div className="w-full flex items-center gap-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] rounded-lg p-2 font-mono text-sm">
                    <input type="text" readOnly value={shareLink} className="bg-transparent w-full outline-none" />
                    <button onClick={handleCopyLink} className={`px-3 py-1 text-sm rounded-md transition-all ${linkCopied ? 'bg-green-600 text-white' : 'bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-border-primary)]'}`}>
                       {linkCopied ? <CheckCircleIcon className="w-5 h-5"/> : <CopyIcon className="w-5 h-5"/>}
                    </button>
                </div>
                
                <button 
                    onClick={handleStart}
                    className="w-full mt-6 px-4 py-2 bg-[var(--color-accent)] text-[var(--color-text-on-accent)] font-semibold rounded-md hover:bg-[var(--color-accent-hover)] transition-all shadow-md hover:shadow-lg"
                >
                    Start Session
                </button>
            </div>
        </Modal>
    );
};

export default LiveShareModal;
