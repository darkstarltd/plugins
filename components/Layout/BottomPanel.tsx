
import React from 'react';
import { useLayout } from '../../contexts/LayoutContext';
import { TerminalIcon, AlertTriangleIcon, BugIcon, List, X } from 'lucide-react';
import Terminal from '../Terminal';
import DiagnosticsPanel from '../DiagnosticsPanel';
import { useProject } from '../../contexts/ProjectContext';
import type { BottomPanelType } from '../../types';
import { useEditor } from '../../contexts/EditorContext';
import { usePlugin } from '../../contexts/PluginContext';

const OutputPanel = () => <div className="p-4 h-full bg-bg-inset text-text-dim font-mono text-sm">Output will be displayed here.</div>;
const DebugConsole = () => <div className="p-4 h-full bg-bg-inset text-text-dim font-mono text-sm">Debug console. Breakpoints and logs will appear here.</div>;

const CORE_TABS: { id: string; label: string; icon: React.ElementType }[] = [
    { id: 'terminal', label: 'Terminal', icon: TerminalIcon },
    { id: 'problems', label: 'Problems', icon: AlertTriangleIcon },
    { id: 'output', label: 'Output', icon: List },
    { id: 'debug', label: 'Debug Console', icon: BugIcon },
];

const BottomPanel: React.FC = () => {
    const { bottomPanel: activePanel, setBottomPanel } = useLayout();
    const { activeProject, setProjectFileSystem } = useProject();
    const { diagnostics, setDiagnostics } = useEditor();
    const { getBottomPanelViews } = usePlugin();

    const fileSystem = activeProject?.branches?.[activeProject.currentBranch || ''] || [];
    
    const pluginTabs = getBottomPanelViews().map(v => ({ id: v.id, label: v.title, icon: v.icon }));
    const allTabs = [...CORE_TABS, ...pluginTabs];

    const renderContent = () => {
        switch (activePanel) {
            case 'terminal':
                return <Terminal fileSystem={fileSystem} onUpdateFileSystem={setProjectFileSystem} />;
            case 'problems':
                return <DiagnosticsPanel diagnostics={diagnostics} onClear={() => setDiagnostics([])} />;
            case 'output':
                return <OutputPanel />;
            case 'debug':
                return <DebugConsole />;
            default:
                const pluginView = getBottomPanelViews().find(v => v.id === activePanel);
                if (pluginView) {
                    const ViewComponent = pluginView.component;
                    return <ViewComponent />;
                }
                return null;
        }
    };

    return (
        <div className="h-full flex flex-col bg-bg-surface">
            <div className="flex items-center justify-between border-b border-border-base flex-shrink-0">
                <div className="flex items-center">
                    {allTabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setBottomPanel(tab.id as BottomPanelType)}
                            className={`flex items-center gap-2 px-4 py-2 text-sm border-b-2 transition-colors ${
                                activePanel === tab.id
                                    ? 'text-text-base border-primary'
                                    : 'text-text-muted border-transparent hover:bg-bg-inset'
                            }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                             {tab.id === 'problems' && diagnostics.length > 0 && (
                                <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-bg-inset">{diagnostics.length}</span>
                            )}
                        </button>
                    ))}
                </div>
                <div className="px-2">
                     <button
                        onClick={() => setBottomPanel(null)}
                        className="p-1 rounded-md text-text-muted hover:bg-bg-inset hover:text-text-base"
                        title="Close Panel"
                     >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>
            <div className="flex-grow overflow-hidden">
                {renderContent()}
            </div>
        </div>
    );
};

export default BottomPanel;