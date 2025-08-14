
import React, { useState } from 'react';
import Modal from './Modal';
import { useToast } from './Toast';
import { PasswordInput } from './common/PasswordInput';
import { KeyRound } from 'lucide-react';

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onChangePassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose, onChangePassword }) => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();

    const handleChange = async () => {
        if (!oldPassword || !newPassword || !confirmPassword) {
            toast.showToast('All fields are required.', 'error');
            return;
        }
        if (newPassword.length < 8) {
            toast.showToast('New password must be at least 8 characters long.', 'error');
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.showToast('New passwords do not match.', 'error');
            return;
        }

        setIsLoading(true);
        const success = await onChangePassword(oldPassword, newPassword);
        if (success) {
            toast.showToast('Master password changed successfully.', 'success');
            onClose();
        } else {
            // Error toast is shown in context
        }
        setIsLoading(false);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Change Master Password" size="md">
            <div className="space-y-4">
                <p className="text-sm text-text-muted">
                    Changing your master password will re-encrypt your entire vault. This is a secure process but may take a moment.
                </p>
                <div className="space-y-3">
                     <PasswordInput
                        id="old-password"
                        placeholder="Current Master Password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className="w-full bg-bg-inset border border-border-base rounded-lg pl-3 pr-10 py-2.5 text-sm"
                        autoFocus
                    />
                     <PasswordInput
                        id="new-password"
                        placeholder="New Master Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                         className="w-full bg-bg-inset border border-border-base rounded-lg pl-3 pr-10 py-2.5 text-sm"
                    />
                     <PasswordInput
                        id="confirm-password"
                        placeholder="Confirm New Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                         className="w-full bg-bg-inset border border-border-base rounded-lg pl-3 pr-10 py-2.5 text-sm"
                    />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                     <button onClick={onClose} className="px-4 py-2 bg-bg-inset text-text-base rounded-md hover:bg-border-base font-semibold">Cancel</button>
                    <button
                        onClick={handleChange}
                        disabled={isLoading}
                        className="px-4 py-2 bg-primary text-on-primary rounded-md hover:opacity-90 font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        <KeyRound className="w-4 h-4" />
                        {isLoading ? 'Updating...' : 'Update Password'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ChangePasswordModal;
