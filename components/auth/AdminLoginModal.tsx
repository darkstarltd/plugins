
import React, { useState } from 'react';
import Modal from '../Modal';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../Toast';
import { PasswordInput } from '../common/PasswordInput';

interface AdminLoginModalProps {
    onClose: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ onClose }) => {
    const { loginAsAdmin } = useAuth();
    const [password, setPassword] = useState('');
    const toast = useToast();
    
    const handleLogin = async () => {
        const success = await loginAsAdmin(password);
        if (success) {
            toast.showToast('Admin login successful!', 'success');
            onClose();
        } else {
            toast.showToast('Incorrect admin password.', 'error');
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose} title="Admin Login">
            <div className="space-y-4">
                <PasswordInput
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter Admin Password"
                    autoFocus
                    className="w-full bg-bg-inset border border-border-base rounded-lg px-3 py-2 text-sm"
                />
                <button
                    onClick={handleLogin}
                    className="w-full px-4 py-2 bg-primary text-on-primary rounded-md hover:opacity-90 font-semibold"
                >
                    Login
                </button>
            </div>
        </Modal>
    )
};
