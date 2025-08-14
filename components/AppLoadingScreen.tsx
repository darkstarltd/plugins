

import React from 'react';

const Logo: React.FC = () => (
    <svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M24 8C15.1634 8 8 15.1634 8 24V40C8 48.8366 15.1634 56 24 56H32C45.2548 56 56 45.2548 56 32C56 18.7452 45.2548 8 32 8H24Z" fill="url(#logo_gradient_loader)"/>
        <path d="M48 12L50 16L54 18L50 20L48 24L46 20L42 18L46 16L48 12Z" fill="white"/>
        <defs>
        <linearGradient id="logo_gradient_loader" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
        <stop stopColor="#3b82f6"/>
        <stop offset="1" stopColor="#a855f7"/>
        </linearGradient>
        </defs>
    </svg>
);


export const AppLoadingScreen: React.FC = () => {
    return (
        <div className="min-h-screen w-full bg-bg-base flex flex-col items-center justify-center p-4">
            <div className="relative flex flex-col items-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg mb-4 animate-subtle-pulse">
                    <Logo />
                </div>
                {/* Spinner aroud the logo */}
                <div className="w-24 h-24 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <h1 className="text-xl font-bold text-text-muted mt-12">Initializing FireFly...</h1>
            </div>
        </div>
    );
};
