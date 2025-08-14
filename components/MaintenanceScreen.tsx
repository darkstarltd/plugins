

import React from 'react';
import { Code, Wrench } from 'lucide-react';

export const MaintenanceScreen: React.FC = () => {
    return (
        <div className="min-h-screen w-full bg-bg-base flex flex-col items-center justify-center p-4 text-center">
            <div className="flex flex-col items-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg mb-4">
                    <Code className="w-8 h-8 text-on-primary" />
                </div>
                <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-gray-200 to-gray-500 drop-shadow-md font-display">FireFly</h1>
            </div>

            <div className="bg-bg-surface p-8 rounded-xl border border-border-base max-w-lg">
                <Wrench className="w-12 h-12 text-yellow-400 mx-auto mb-4 animate-subtle-pulse" />
                <h2 className="text-2xl font-bold text-text-base">Under Maintenance</h2>
                <p className="text-text-muted mt-2">
                    We're currently performing some scheduled maintenance to improve your experience.
                    The application will be back online shortly.
                </p>
                <p className="text-text-dim mt-4">
                    We appreciate your patience!
                </p>
            </div>
        </div>
    );
};
