
import React, { useState, useCallback } from 'react';
import ActivityBar from './ActivityBar';
import { useLayout } from '../contexts/LayoutContext';
import FileSystemTree from './FileSystemTree';
import { useProject } from '../contexts/ProjectContext';
import { useEditor } from '../contexts/EditorContext';
import GlobalSearchPanel from './GlobalSearchPanel';
import { useToast } from './Toast';

// Modals
import VaultManagementModal from './VaultManagementModal';
import { useFirePass } from '../contexts/FirePassContext';
import SetupVaultModal from './SetupVaultModal';
import UnlockVaultModal from './UnlockVaultModal';
import PluginMarketplaceModal from './PluginMarketplaceModal';
import { useSettings } from '../contexts/SettingsContext';
import { usePlugin } from '../contexts/PluginContext';


const Sidebar: React.FC<{onAboutClick: () => void}> = ({onAboutClick}) => {
    const { isSidebarCollapsed, sidebarWidth, setSidebarWidth, sidebarView, setSidebarView } = useLayout();
    const { activeProject, setProjectFileSystem } = useProject();
    const { activeFileId, setActiveFileId } = useEditor();
    const { getSidebarViews } = usePlugin();

    const { entries, updateEntries, needsSetup, isLocked, setup, unlock, setIsUnlockModalOpen } = useFirePass();
    const { toggleSettings } = useSettings();

    const [isResizing, setIsResizing] = useState(false);
    
    // Modal states
    const [isVaultManagementModalOpen, setIsVaultManagementModalOpen] = useState(false);
    const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
    const [isPluginModalOpen, setIsPluginModalOpen] = useState(false);
    
    const handleResizeStart = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
    };

    const handleResize = useCallback((e: MouseEvent) => {
        if (isResizing) {
            const newWidth = e.clientX;
            if (newWidth > 200 && newWidth < 600) {
                setSidebarWidth(newWidth);
            }
        }
    }, [isResizing, setSidebarWidth]);

    const handleResizeEnd = useCallback(() => {
        setIsResizing(false);
    }, []);

    React.useEffect(() => {
        if (isResizing) {
            window.addEventListener('mousemove', handleResize);
            window.addEventListener('mouseup', handleResizeEnd);
        }
        return () => {
            window.removeEventListener('mousemove', handleResize);
            window.removeEventListener('mouseup', handleResizeEnd);
        };
    }, [isResizing, handleResize, handleResizeEnd]);
    
    const handleFirePassClick = () => {
        if (needsSetup) {
            setIsSetupModalOpen(true);
        } else if (isLocked) {
            setIsUnlockModalOpen(true);
        } else {
            setIsVaultManagementModalOpen(true);
        }
    };
    
    const handleSetup = (password: string) => {
        setup(password).then(() => {
            setIsSetupModalOpen(false);
            setIsVaultManagementModalOpen(true);
        });
    };

    const handleUnlock = async (password: string) => {
        const success = await unlock(password);
        if (success) {
            setIsUnlockModalOpen(false);
            setIsVaultManagementModalOpen(true);
        }
        return success;
    };
    
    const renderSidebarView = () => {
        const fileSystem = activeProject?.branches?.[activeProject.currentBranch || ''] || [];

        // Core views
        if (sidebarView === 'explorer') {
            return (
                <FileSystemTree 
                    nodes={fileSystem}
                    activeFileId={activeFileId}
                    onSelectFile={setActiveFileId}
                    setFileSystem={setProjectFileSystem}
                />
            );
        }
        if (sidebarView === 'search') {
            return <GlobalSearchPanel allFiles={fileSystem} onSelectFile={setActiveFileId} />;
        }

        // Plugin-contributed views
        const pluginView = getSidebarViews().find(v => v.id === sidebarView);
        if (pluginView) {
            const ViewComponent = pluginView.component;
            return <ViewComponent />;
        }

        return null;
    };

    return (
        <>
            <div 
                className={`bg-bg-surface flex shrink-0 ${isSidebarCollapsed ? '' : 'border-r border-border-base'}`}
                style={{ width: isSidebarCollapsed ? '52px' : `${sidebarWidth}px`}}
            >
                <ActivityBar 
                    activeView={sidebarView}
                    onViewChange={setSidebarView}
                    onFirePassClick={handleFirePassClick}
                    onSettingsClick={toggleSettings}
                    onPluginsClick={() => setIsPluginModalOpen(true)}
                />
                {!isSidebarCollapsed && (
                    <div className="flex-1 flex flex-col overflow-hidden">
                        {renderSidebarView()}
                    </div>
                )}
            </div>
            {!isSidebarCollapsed && (
                 <div
                    onMouseDown={handleResizeStart}
                    className="w-1.5 cursor-col-resize flex-shrink-0 hover:bg-primary/20 transition-colors"
                />
            )}
            
            {/* Modals triggered from ActivityBar */}
            {isVaultManagementModalOpen && <VaultManagementModal isOpen={isVaultManagementModalOpen} onClose={() => setIsVaultManagementModalOpen(false)} entries={entries} onUpdateEntries={updateEntries} />}
            {isSetupModalOpen && <SetupVaultModal isOpen={isSetupModalOpen} onClose={() => setIsSetupModalOpen(false)} onSetup={handleSetup} />}
            {/* The global unlock modal is handled by App.tsx, this one is for contextual unlocking from the sidebar */}
            <UnlockVaultModal isOpen={false} onClose={() => {}} onUnlock={handleUnlock} />
             {isPluginModalOpen && <PluginMarketplaceModal isOpen={isPluginModalOpen} onClose={() => setIsPluginModalOpen(false)} />}

        </>
    );
};

export default Sidebar;