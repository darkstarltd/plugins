
import React from 'react';
import Modal from './Modal';
import { BriefcaseIcon, UsersIcon, WandIcon } from './icons';

interface WhatsNewModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const Feature: React.FC<{ icon: React.FC<{className?:string}>, title: string, children: React.ReactNode }> = ({ icon: Icon, title, children }) => (
    <div className="flex items-start gap-4">
        <div className="flex-shrink-0 bg-[var(--color-accent-subtle-bg)] p-2 rounded-lg">
            <Icon className="w-6 h-6 text-[var(--color-accent-text)]" />
        </div>
        <div>
            <h4 className="font-bold text-lg text-[var(--color-text-bright)]">{title}</h4>
            <p className="text-[var(--color-text-dim)]">{children}</p>
        </div>
    </div>
);

const WhatsNewModal: React.FC<WhatsNewModalProps> = ({ isOpen, onClose }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="What's New in FirePlay IDE" size="2xl">
            <div className="space-y-6">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-primary-readable">The Phoenix Update is Here!</h2>
                    <p className="text-[var(--color-text-dim)]">This version brings true project management and deeper collaboration.</p>
                </div>
                <div className="space-y-6">
                    <Feature icon={BriefcaseIcon} title="Full Project Management">
                        Create, switch, and delete projects directly from the new project switcher in the header. Your workspace is more organized than ever.
                    </Feature>
                     <Feature icon={UsersIcon} title="Live Collaboration Cursors">
                        Feel the presence of your team! Start a Live Share session to see mock collaborator cursors and selections moving in real-time within the editor.
                    </Feature>
                    <Feature icon={WandIcon} title="AI Code Explanation">
                        Mona is now just a right-click away. Select any code snippet, right-click, and ask Mona to explain it. The answer will appear instantly in the AI Chat.
                    </Feature>
                </div>
                <div className="text-center pt-4">
                    <button onClick={onClose} className="px-6 py-2 bg-[var(--color-accent)] text-[var(--color-text-on-accent)] font-semibold rounded-md hover:bg-[var(--color-accent-hover)] transition-all shadow-md hover:shadow-lg">
                        Get Coding
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default WhatsNewModal;
