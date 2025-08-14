
import React, { useState, useEffect } from 'react';
import { TerminalSquare, UsersIcon, Eye } from 'lucide-react';
import { useCommand } from '../contexts/CommandContext';
import { AdminLoginModal } from './auth/AdminLoginModal';
import { useProject } from '../contexts/ProjectContext';
import ProjectSwitcher from './ProjectSwitcher';
import { View } from '../types';

const Logo: React.FC = () => (
    <svg width="40" height="40" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M24 8C15.1634 8 8 15.1634 8 24V40C8 48.8366 15.1634 56 24 56H32C45.2548 56 56 45.2548 56 32C56 18.7452 45.2548 8 32 8H24Z" fill="url(#logo_gradient)"/>
        <path d="M48 12L50 16L54 18L50 20L48 24L46 20L42 18L46 16L48 12Z" fill="white"/>
        <defs>
        <linearGradient id="logo_gradient" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
        <stop stopColor="#3b82f6"/>
        <stop offset="1" stopColor="#a855f7"/>
        </linearGradient>
        </defs>
    </svg>
);


export const Header: React.FC<{onNavigate: (view: View) => void; onLiveShareClick: () => void; onTogglePreview: () => void;}> = ({onNavigate, onLiveShareClick, onTogglePreview}) => {
    const { togglePalette } = useCommand();
    const [logoClicks, setLogoClicks] = useState(0);
    const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
    const { projects, activeProject, setActiveProject, createProject, deleteProject } = useProject();

    const handleLogoClick = () => {
        setLogoClicks(c => c + 1);
    };

    useEffect(() => {
        if (logoClicks === 0) return;

        if (logoClicks === 2) {
            setIsAdminModalOpen(true);
        }
        const timer = setTimeout(() => setLogoClicks(0), 500); // Reset clicks after 500ms
        return () => clearTimeout(timer);
    }, [logoClicks]);

    const handleCreateProject = (name: string) => {
        createProject(name);
        onNavigate('editor');
    };
    
    const handleDeleteProject = (id: string) => {
        deleteProject(id);
        if (projects.length <= 1) {
            onNavigate('dashboard');
        }
    }

    return (
        <>
            <header className="bg-bg-surface shadow-md border-b border-border-base z-10 shrink-0 h-16 flex items-center">
                <div className="px-6 w-full">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 cursor-pointer" onClick={handleLogoClick} title="App Logo">
                            <Logo />
                        </div>
                        
                        <div className="flex-grow flex items-center justify-center">
                             {activeProject && (
                                <ProjectSwitcher 
                                    projects={projects}
                                    activeProject={activeProject}
                                    onSwitchProject={setActiveProject}
                                    onCreateProject={handleCreateProject}
                                    onDeleteProject={handleDeleteProject}
                                />
                            )}
                        </div>

                        <div className="flex items-center space-x-2">
                             <button 
                                onClick={onLiveShareClick}
                                className="p-2 text-text-muted hover:text-text-base rounded-lg hover:bg-bg-inset transition-colors"
                                aria-label="Start Live Share session"
                            >
                                <UsersIcon className="w-5 h-5" />
                            </button>
                            <button 
                                onClick={onTogglePreview}
                                className="p-2 text-text-muted hover:text-text-base rounded-lg hover:bg-bg-inset transition-colors"
                                aria-label="Toggle Live Preview"
                            >
                                <Eye className="w-5 h-5" />
                            </button>
                            <button 
                                onClick={togglePalette}
                                className="p-2 text-text-muted hover:text-text-base rounded-lg hover:bg-bg-inset transition-colors"
                                aria-label="Open command palette"
                            >
                                <TerminalSquare className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>
            {isAdminModalOpen && <AdminLoginModal onClose={() => setIsAdminModalOpen(false)} />}
        </>
    );
};