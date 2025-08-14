import React, { useState, useEffect } from 'react';
import { Info, X } from 'lucide-react';

interface AboutModalProps {
    onClose: () => void;
}

interface AppMetadata {
    name: string;
    version: string;
    description: string;
}

const Logo: React.FC = () => (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M24 8C15.1634 8 8 15.1634 8 24V40C8 48.8366 15.1634 56 24 56H32C45.2548 56 56 45.2548 56 32C56 18.7452 45.2548 8 32 8H24Z" fill="url(#logo_gradient_about)"/>
        <path d="M48 12L50 16L54 18L50 20L48 24L46 20L42 18L46 16L48 12Z" fill="white"/>
        <defs>
        <linearGradient id="logo_gradient_about" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
        <stop stopColor="#3b82f6"/>
        <stop offset="1" stopColor="#a855f7"/>
        </linearGradient>
        </defs>
    </svg>
);


export const AboutModal: React.FC<AboutModalProps> = ({ onClose }) => {
    const [metadata, setMetadata] = useState<AppMetadata | null>(null);

    useEffect(() => {
        fetch('./metadata.json')
            .then(response => response.json())
            .then((data: AppMetadata) => setMetadata(data))
            .catch(error => console.error("Error fetching metadata:", error));
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-fade-in" onClick={onClose}>
            <div
                className="bg-bg-surface w-full max-w-lg rounded-xl border border-border-base shadow-2xl p-8 animate-scale-in text-center"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-end">
                     <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full text-text-muted hover:bg-bg-inset hover:text-text-base">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="flex flex-col items-center mb-6">
                     <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg mb-4">
                        <Logo />
                    </div>
                    <h1 className="text-3xl font-bold text-text-base font-display">{metadata?.name || 'FireFly IDE'}</h1>
                    <p className="text-text-muted mt-1">Version {metadata?.version || '1.0.0'}</p>
                </div>

                <p className="text-text-base mb-6">
                    {metadata?.description || 'Loading app information...'}
                </p>

                <div className="text-xs text-text-dim border-t border-border-base pt-6">
                    <p>&copy; {new Date().getFullYear()} Darkstar Studio. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
};
