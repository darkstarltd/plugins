
import React, { useState, useMemo, useEffect } from 'react';
import { useProject } from '../contexts/ProjectContext';
import { useEditor } from '../contexts/EditorContext';
import CodeEditor from './CodeEditor';
import { FolderKanban, Plus, File, X } from 'lucide-react';
import { FileSystemNode, Collaborator, Diagnostic } from '../types';
import FindWidget from './FindWidget';
import FileIcon from './FileIcon';
import { produce } from 'immer';
import { useChat } from '../contexts/ChatContext';
import { useCollaboration } from '../contexts/CollaborationContext';

const NoProjectView: React.FC<{ onNavigateToProjects: () => void }> = ({ onNavigateToProjects }) => (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-bg-inset h-full">
        <FolderKanban className="w-16 h-16 text-text-dim mb-4" />
        <h2 className="text-xl font-semibold text-text-base">No Active Project</h2>
        <p className="text-text-muted mt-2 mb-4">Create or select a project from the project switcher to begin.</p>
        <button
            onClick={onNavigateToProjects}
            className="flex items-center space-x-2 px-4 py-2 bg-primary text-on-primary rounded-md hover:opacity-90 font-semibold transition-colors"
        >
            <Plus className="w-5 h-5" />
            <span>Go to Projects</span>
        </button>
    </div>
);

const EditorView: React.FC<{ onNavigateToProjects: () => void }> = ({ onNavigateToProjects }) => {
    const { activeProject } = useProject();
    const { 
        activeFileId, 
        setActiveFileId, 
        openFileIds, 
        setOpenFileIds, 
        setCursorPosition, 
        getFileNode, 
        updateFileContent,
        diagnostics,
        applyFix
    } = useEditor();
    const { startConversationWith } = useChat();
    const { collaborators } = useCollaboration();
    
    const [isFindWidgetVisible, setIsFindWidgetVisible] = useState(false);
    const [searchResults, setSearchResults] = useState<{ start: number; end: number }[]>([]);
    const [activeSearchResultIndex, setActiveSearchResultIndex] = useState(-1);
    
    const activeFile = useMemo(() => getFileNode(activeFileId || ''), [activeFileId, getFileNode]);

    const openFiles = useMemo(() => {
        return openFileIds.map(id => getFileNode(id)).filter(Boolean) as FileSystemNode[];
    }, [openFileIds, getFileNode]);

    const handleCodeChange = (newCode: string) => {
        if (!activeFileId) return;
        updateFileContent(activeFileId, newCode);
    };
    
    const handleCloseTab = (e: React.MouseEvent, fileIdToClose: string) => {
        e.stopPropagation();
        const newOpenFileIds = openFileIds.filter(id => id !== fileIdToClose);
        setOpenFileIds(newOpenFileIds);
        if (activeFileId === fileIdToClose) {
            setActiveFileId(newOpenFileIds[newOpenFileIds.length - 1] || null);
        }
    };
    
     const handleExplainCode = (selectedCode: string) => {
        const prompt = `Please explain the following code snippet:\n\n\`\`\`\n${selectedCode}\n\`\`\``;
        startConversationWith(prompt);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                setIsFindWidgetVisible(true);
            }
            if (e.key === 'Escape') {
                setIsFindWidgetVisible(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    if (!activeProject) {
        return <NoProjectView onNavigateToProjects={onNavigateToProjects} />;
    }

    return (
        <div className="flex flex-col h-full bg-bg-inset">
             <div className="flex bg-bg-surface border-b border-border-base shrink-0">
                {openFiles.map(file => (
                    <button 
                        key={file.id} 
                        onClick={() => setActiveFileId(file.id)}
                        className={`flex items-center gap-2 pl-3 pr-2 py-2 text-sm border-r border-border-base ${activeFileId === file.id ? 'bg-bg-inset text-text-base' : 'text-text-muted hover:bg-bg-inset'}`}
                    >
                        <FileIcon filename={file.name} className="w-4 h-4"/>
                        <span>{file.name}</span>
                        <X onClick={(e) => handleCloseTab(e, file.id)} className="w-4 h-4 rounded-full hover:bg-white/10 p-0.5"/>
                    </button>
                ))}
            </div>
            <div className="relative flex-grow">
                {activeFile ? (
                    <>
                        <CodeEditor 
                            code={activeFile.content || ''}
                            onCodeChange={handleCodeChange}
                            onCursorChange={setCursorPosition}
                            searchResults={searchResults}
                            activeSearchIndex={activeSearchResultIndex}
                            collaborators={collaborators}
                            diagnostics={diagnostics}
                            onApplyFix={applyFix}
                            onExplainCode={handleExplainCode}
                        />
                        {isFindWidgetVisible && (
                            <FindWidget 
                                code={activeFile.content || ''}
                                onFind={(results) => setSearchResults(results)}
                                onClose={() => setIsFindWidgetVisible(false)}
                                activeResultIndex={activeSearchResultIndex}
                                onNavigate={setActiveSearchResultIndex}
                            />
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-text-dim">
                        <File className="w-12 h-12 mb-4" />
                        <h3 className="text-lg">No file selected</h3>
                        <p>Select a file from the explorer to begin editing.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EditorView;