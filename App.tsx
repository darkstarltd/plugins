import React, { useState, useEffect, useMemo, Suspense, useCallback } from 'react';
import {
    Bot, Code, LayoutDashboard, Settings as SettingsIcon, ShieldCheck, Puzzle, UserCog, FolderKanban, CreditCard, HardHat, Eye, WandIcon
} from 'lucide-react';
import { Header } from './components/Header';
import { ChatAssistant } from './components/ChatAssistant';
import CommandPaletteModal from './components/CommandPaletteModal';
import type { View, Command, FirePassEntry } from './types';
import { useChat } from './contexts/ChatContext';
import { useCommand } from './contexts/CommandContext';
import Sidebar from './components/Sidebar';
import { useAuth } from './contexts/AuthContext';
import { AuthScreen } from './components/auth/AuthScreen';
import { FirstLoginModal } from './components/FirstLoginModal';
import { AboutModal } from './components/AboutModal';
import SettingsModal from './components/SettingsModal';
import { AppLockScreen } from './components/auth/AppLockScreen';
import { useProject } from './contexts/ProjectContext';
import { useSettings } from './contexts/SettingsContext';
import { MaintenanceScreen } from './components/MaintenanceScreen';
import { AppLoadingScreen } from './components/AppLoadingScreen';
import StatusBar from './components/StatusBar';
import BottomPanel from './components/Layout/BottomPanel';
import { useLayout } from './contexts/LayoutContext';
import { useFirePass } from './contexts/FirePassContext';
import UnlockVaultModal from './components/UnlockVaultModal';
import SetupVaultModal from './components/SetupVaultModal';
import ChangePasswordModal from './components/ChangePasswordModal';
import WhatsNewModal from './components/WhatsNewModal';
import * as storageService from './services/storageService';
import LiveShareModal from './components/LiveShareModal';
import { useCollaboration } from './contexts/CollaborationContext';
import DeployToolchainModal from './components/DeployToolchainModal';
import { PreviewManager } from './components/Preview/PreviewManager';
import { LivePreviewBadge } from './components/Preview/LivePreviewBadge';
import { usePreviewSync } from './hooks/usePreviewSync';
import { motion, AnimatePresence } from 'framer-motion';
import AiRefactoringModal from './components/AiRefactoringModal';
import { useEditor } from './contexts/EditorContext';
import { useToast } from './components/Toast';


// Lazy load views for better performance
const InteractiveDashboard = React.lazy(() => import('./components/Dashboard').then(module => ({ default: module.InteractiveDashboard })));
const AdminDashboard = React.lazy(() => import('./components/admin/AdminDashboard'));
const EditorView = React.lazy(() => import('./components/EditorView'));
const FirePass = React.lazy(() => import('./components/FirePass'));
const Plugins = React.lazy(() => import('./components/Plugins'));
const ProjectsView = React.lazy(() => import('./components/ProjectsView'));
const Billing = React.lazy(() => import('./components/Billing'));


const AppContent: React.FC = () => {
    const { isAdmin } = useAuth();
    const [currentView, setCurrentView] = useState<View>(isAdmin ? 'admin' : 'dashboard');
    const { isChatOpen, openChat } = useChat();
    const { registerCommands, unregisterCommands, isPaletteOpen, togglePalette, commands } = useCommand();
    const { isFirstLogin, clearFirstLogin } = useAuth();
    const { setActiveProject } = useProject();
    const { activeFileId } = useEditor();
    const toast = useToast();
    
    const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
    const [isFirstLoginModalOpen, setIsFirstLoginModalOpen] = useState(false);
    const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
    const [isRefactoringModalOpen, setIsRefactoringModalOpen] = useState(false);
    
    const { bottomPanel, bottomPanelHeight, setBottomPanelHeight } = useLayout();
    const [isResizing, setIsResizing] = useState(false);
    
    const [isLiveShareModalOpen, setIsLiveShareModalOpen] = useState(false);
    const { startSession } = useCollaboration();
    const { entries: firePassEntries, isLocked: isVaultLocked, setIsUnlockModalOpen } = useFirePass();

    // New Preview Panel State
    const [previewPanelOpen, setPreviewPanelOpen] = useState(false);
    const [previewPanelWidth, setPreviewPanelWidth] = useState(500);
    const [isResizingPreview, setIsResizingPreview] = useState(false);

    // Sync file changes to preview
    usePreviewSync();

    const handleResizeStart = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
    };

    const handleResize = useCallback((e: MouseEvent) => {
        if (isResizing) {
            const newHeight = window.innerHeight - e.clientY;
            if (newHeight >= 100 && newHeight <= window.innerHeight * 0.8) {
                setBottomPanelHeight(newHeight);
            }
        }
    }, [isResizing, setBottomPanelHeight]);

    const handleResizeEnd = useCallback(() => {
        setIsResizing(false);
    }, []);

     const handlePreviewResizeStart = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizingPreview(true);
    };

    const handlePreviewResize = useCallback((e: MouseEvent) => {
        if (isResizingPreview) {
            const newWidth = window.innerWidth - e.clientX;
             if (newWidth >= 300 && newWidth <= window.innerWidth * 0.7) {
                setPreviewPanelWidth(newWidth);
            }
        }
    }, [isResizingPreview]);

    const handlePreviewResizeEnd = useCallback(() => {
        setIsResizingPreview(false);
    }, []);


    useEffect(() => {
        if (isResizing) {
            window.addEventListener('mousemove', handleResize);
            window.addEventListener('mouseup', handleResizeEnd);
        }
         if (isResizingPreview) {
            window.addEventListener('mousemove', handlePreviewResize);
            window.addEventListener('mouseup', handlePreviewResizeEnd);
        }
        return () => {
            window.removeEventListener('mousemove', handleResize);
            window.removeEventListener('mouseup', handleResizeEnd);
            window.removeEventListener('mousemove', handlePreviewResize);
            window.removeEventListener('mouseup', handlePreviewResizeEnd);
        }
    }, [isResizing, handleResize, handleResizeEnd, isResizingPreview, handlePreviewResize, handlePreviewResizeEnd]);
    
    const navItems = useMemo(() => {
        const baseNav = [
            { id: 'projects', label: 'Projects', icon: FolderKanban },
            { id: 'editor', label: 'Code Editor', icon: Code },
            { id: 'firepass', label: 'FirePass', icon: ShieldCheck },
            { id: 'plugins', label: 'Plugins', icon: Puzzle },
            { id: 'billing', label: 'Billing', icon: CreditCard },
        ];
        if (isAdmin) {
            return [{ id: 'admin', label: 'Admin Panel', icon: UserCog }, ...baseNav];
        }
        return [{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }, ...baseNav];
    }, [isAdmin]);

    useEffect(() => {
        setIsFirstLoginModalOpen(isFirstLogin);
    }, [isFirstLogin]);
    
    const closeFirstLoginModal = () => {
        setIsFirstLoginModalOpen(false);
        clearFirstLogin();
    }

     useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                togglePalette();
            }
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'e') {
                e.preventDefault();
                setPreviewPanelOpen(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [togglePalette]);


    useEffect(() => {
        const allCommands: Command[] = [
            ...navItems.map(item => ({
                id: `nav-${item.id}`,
                label: `Go to ${item.label}`,
                section: 'Navigation',
                icon: item.icon,
                action: () => setCurrentView(item.id as View)
            })),
            {
                id: 'deploy-toolchain',
                label: 'Open Deploy Toolchain',
                section: 'Project',
                icon: HardHat,
                action: () => setIsDeployModalOpen(true)
            },
            {
                id: 'toggle-preview',
                label: 'Toggle Live Preview',
                section: 'View',
                icon: Eye,
                action: () => setPreviewPanelOpen(prev => !prev)
            },
            {
                id: 'mona-refactor',
                label: 'Mona: Refactor Current File',
                section: 'AI',
                icon: WandIcon,
                action: () => {
                    if (activeFileId) {
                        setIsRefactoringModalOpen(true);
                    } else {
                        toast.showToast("Open a file to use AI Refactoring.", "info");
                    }
                }
            }
        ];
        registerCommands(allCommands);

        return () => unregisterCommands(allCommands.map(c => c.id));
    }, [registerCommands, unregisterCommands, navItems, activeFileId, toast]);

    const navigateToProject = (projectId: string) => {
        setActiveProject(projectId);
        setCurrentView('editor');
    };

    const viewMap: Record<string, React.ReactNode> = useMemo(() => ({
        dashboard: <InteractiveDashboard onNavigateToProject={navigateToProject} />,
        admin: <AdminDashboard />,
        projects: <ProjectsView />,
        editor: <EditorView onNavigateToProjects={() => setCurrentView('projects')} />,
        firepass: <FirePass />,
        plugins: <Plugins />,
        billing: <Billing />,
    }), [navigateToProject]);

    const renderView = () => {
        return viewMap[currentView] || (isAdmin ? viewMap.admin : viewMap.dashboard);
    };

    return (
        <>
            <div className="h-full bg-bg-base text-text-base font-sans flex">
                <Sidebar onAboutClick={() => setIsAboutModalOpen(true)} />

                <div className="flex-1 flex flex-col overflow-hidden">
                    <Header onNavigate={setCurrentView} onLiveShareClick={() => setIsLiveShareModalOpen(true)} onTogglePreview={() => setPreviewPanelOpen(p => !p)} />
                    <div className="flex-1 flex overflow-hidden">
                        <main className="flex-1 flex flex-col overflow-hidden" style={{ height: '100%' }}>
                            <div style={{ height: bottomPanel ? `calc(100% - ${bottomPanelHeight}px)`: '100%' }} className="relative">
                                <Suspense fallback={<AppLoadingScreen />}>
                                    {renderView()}
                                </Suspense>
                            </div>
                            {bottomPanel && (
                                <>
                                    <div
                                        onMouseDown={handleResizeStart}
                                        className="w-full h-2 bg-bg-surface hover:bg-primary/20 cursor-row-resize transition-colors"
                                    />
                                    <div style={{ height: `${bottomPanelHeight}px` }} className="bg-bg-surface border-t border-border-base">
                                        <BottomPanel />
                                    </div>
                                </>
                            )}
                        </main>
                        <AnimatePresence>
                        {previewPanelOpen && (
                             <motion.div
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: previewPanelWidth, opacity: 1 }}
                                exit={{ width: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                className="flex-shrink-0 relative"
                                style={{ width: previewPanelWidth }}
                             >
                                <div onMouseDown={handlePreviewResizeStart} className="absolute left-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-primary/20 transition-colors z-10" />
                                <PreviewManager />
                             </motion.div>
                        )}
                        </AnimatePresence>
                    </div>
                    <StatusBar />
                </div>

                {!isChatOpen && (
                    <div className="fixed bottom-16 right-6 z-20">
                        <button
                            onClick={openChat}
                            className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-on-primary shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
                            aria-label="Open AI Assistant"
                            title="Open AI Assistant"
                        >
                            <Bot className="w-8 h-8" />
                        </button>
                    </div>
                )}

                {isChatOpen && <ChatAssistant />}
            </div>
            {isFirstLoginModalOpen && <FirstLoginModal onClose={closeFirstLoginModal} />}
            {isAboutModalOpen && <AboutModal onClose={() => setIsAboutModalOpen(false)} />}
            <CommandPaletteModal isOpen={isPaletteOpen} onClose={togglePalette} commands={commands || []} />
            <LiveShareModal 
                isOpen={isLiveShareModalOpen} 
                onClose={() => setIsLiveShareModalOpen(false)} 
                onStartSession={startSession}
            />
             <DeployToolchainModal
                isOpen={isDeployModalOpen}
                onClose={() => setIsDeployModalOpen(false)}
                firePassEntries={firePassEntries}
                isVaultLocked={isVaultLocked}
                onUnlock={() => setIsUnlockModalOpen(true)}
            />
             <AiRefactoringModal
                isOpen={isRefactoringModalOpen}
                onClose={() => setIsRefactoringModalOpen(false)}
            />
            <LivePreviewBadge />
        </>
    );
};


const App: React.FC = () => {
    const { isAuthenticated, isAppLocked, isAdmin } = useAuth();
    const { settings, isSettingsOpen, toggleSettings } = useSettings();
    const { isLocked, needsSetup, setup, unlock, clearVault, changeMasterPassword, importVault, exportVault } = useFirePass();
    const [isAppHydrated, setIsAppHydrated] = useState(false);
    const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
    const [isWhatsNewOpen, setIsWhatsNewOpen] = useState(false);

    useEffect(() => {
        setIsAppHydrated(true);
        fetch('/metadata.json')
            .then(res => res.json())
            .then(meta => {
                 const lastVersion = storageService.loadLastSeenVersion();
                 const currentVersion = meta.version;
                 if (lastVersion !== currentVersion) {
                    setIsWhatsNewOpen(true);
                    storageService.saveLastSeenVersion(currentVersion);
                 }
            });
    }, []);

    if (!isAppHydrated) {
        return null;
    }
    
    if (settings.system.maintenanceMode && !isAdmin) {
        return <MaintenanceScreen />;
    }

    if (!isAuthenticated) {
        return <AuthScreen />;
    }

    if (isAppLocked) {
        return <AppLockScreen />;
    }

    if (needsSetup && isAuthenticated) {
        return (
            <div className="w-screen h-screen bg-bg-base">
                 <SetupVaultModal isOpen={true} onSetup={setup} onClose={() => { /* Cannot close */}} />
            </div>
        );
    }

    if (isLocked && isAuthenticated) {
        return (
            <div className="w-screen h-screen bg-bg-base">
                <UnlockVaultModal isOpen={true} onUnlock={unlock} onClose={() => { /* Cannot close */ }} />
            </div>
        );
    }
    
    return (
        <>
            <AppContent />
             <SettingsModal 
                isOpen={isSettingsOpen}
                onClose={toggleSettings}
                onClearVault={clearVault}
                onMasterPasswordChange={() => setIsChangePasswordModalOpen(true)}
                onVaultImport={(entries: FirePassEntry[]) => importVault(entries)}
                onVaultExport={exportVault}
            />
            <ChangePasswordModal
                isOpen={isChangePasswordModalOpen}
                onClose={() => setIsChangePasswordModalOpen(false)}
                onChangePassword={changeMasterPassword}
            />
            <WhatsNewModal 
                isOpen={isWhatsNewOpen} 
                onClose={() => setIsWhatsNewOpen(false)} 
            />
        </>
    );
};


export default App;