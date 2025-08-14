
import React from 'react';
import Modal from './Modal';
import { useAuth } from '../contexts/AuthContext';
import { SparklesIcon } from './icons';

interface FirstLoginModalProps {
    onClose: () => void;
}

export const FirstLoginModal: React.FC<FirstLoginModalProps> = ({ onClose }) => {
    const { user } = useAuth();
    return (
        <Modal isOpen={true} onClose={onClose} title={`Welcome, ${user?.name}!`}>
            <div className="text-center p-4">
                <SparklesIcon className="w-12 h-12 text-accent mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-text-base">Welcome to FireFly!</h2>
                <p className="text-text-muted my-4">
                    Your account has been created. Here's your unique user code, please save it somewhere safe.
                </p>
                <div className="bg-bg-inset p-3 rounded-lg font-mono text-accent text-lg">
                    {user?.userCode}
                </div>
                <button
                    onClick={onClose}
                    className="mt-6 w-full px-4 py-2 bg-primary text-on-primary font-semibold rounded-md hover:opacity-90"
                >
                    Got it, let's start coding!
                </button>
            </div>
        </Modal>
    );
};
