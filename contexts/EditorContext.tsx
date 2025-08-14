import React, { createContext, useContext, ReactNode, useState, useMemo, useEffect, useCallback } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import type { FileSystemNode, Diagnostic } from '../types';
import { useProject } from './ProjectContext';
import { usePlugin } from './PluginContext';

interface EditorContextType {
    cursorPosition: { line: number; col: number };
    setCursorPosition: (pos: { line: number; col: number }) => void;
    activeFileId: string | null;
    setActiveFileId: (id: string | null) => void;
    openFileIds: string[];
    setOpenFileIds: React.Dispatch<React.SetStateAction<string[]>>;
    getFileNode: (id: string) => FileSystemNode | null;
    updateFileContent: (id: string, content: string) => void;
    diagnostics: Diagnostic[];
    setDiagnostics: React.Dispatch<React.SetStateAction<Diagnostic[]>>;
    applyFix: (diagnostic: Diagnostic) => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

const findNodeById = (nodes: FileSystemNode[], id: string): FileSystemNode | null => {
    for (const node of nodes) {
        if (node.id === id) return node;
        if (node.type === 'folder' && node.children) {
            const found = findNodeById(node.children, id);
            if (found) return found;
        }
    }
    return null;
};

export const EditorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { activeProject, setProjectFileSystem } = useProject();
    const { getDiagnosticProviders } = usePlugin();
    const [cursorPosition, setCursorPosition] = useState({ line: 1, col: 1 });
    const [activeFileId, setActiveFileId] = useLocalStorage<string | null>('firefly_activeFileId', null);
    const [openFileIds, setOpenFileIds] = useState<string[]>(activeFileId ? [activeFileId] : []);
    const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);
    
    const fileSystem = useMemo(() => activeProject?.branches?.[activeProject.currentBranch || ''] || [], [activeProject]);
    
    const getFileNode = useCallback((id: string): FileSystemNode | null => {
        if (!fileSystem || !id) return null;
        return findNodeById(fileSystem, id);
    }, [fileSystem]);
    
    const updateFileContent = (id: string, content: string) => {
        setProjectFileSystem(draft => {
            const file = findNodeById(draft, id);
            if (file && file.type === 'file') {
                file.content = content;
            }
        });
    };

    const applyFix = (diagnostic: Diagnostic) => {
        if (!activeFileId || typeof diagnostic.replacementCode === 'undefined') return;
        
        const file = getFileNode(activeFileId);
        if(!file || typeof file.content === 'undefined') return;

        const lines = file.content.split('\n');
        const lineIndex = lines.findIndex(line => {
            const lineStart = file!.content!.indexOf(line);
            const lineEnd = lineStart + line.length;
            return diagnostic.start >= lineStart && diagnostic.end <= lineEnd;
        });

        if (lineIndex !== -1) {
            lines[lineIndex] = diagnostic.replacementCode;
            updateFileContent(activeFileId, lines.join('\n'));
        }
    };

    // Run diagnostics when active file changes
    useEffect(() => {
        const runDiagnostics = async () => {
            if (!activeFileId) {
                setDiagnostics([]);
                return;
            }
            const file = getFileNode(activeFileId);
            if (!file || file.type !== 'file') {
                setDiagnostics([]);
                return;
            }
            
            const providers = getDiagnosticProviders();
            const allDiagnostics: Diagnostic[] = [];

            for (const provider of providers) {
                const doc = {
                    uri: file.id,
                    languageId: file.name.split('.').pop() || 'plaintext',
                    getText: () => file.content || ''
                };
                const providerDiagnostics = await provider.provideDiagnostics(doc);
                if (providerDiagnostics) {
                    allDiagnostics.push(...providerDiagnostics);
                }
            }
            setDiagnostics(allDiagnostics);
        };
        
        const debounce = setTimeout(runDiagnostics, 500);
        return () => clearTimeout(debounce);

    }, [activeFileId, fileSystem, getDiagnosticProviders, getFileNode]);

    const value: EditorContextType = {
        cursorPosition,
        setCursorPosition,
        activeFileId,
        setActiveFileId: (id) => {
            setActiveFileId(id);
            if(id && !openFileIds.includes(id)) {
                setOpenFileIds(prev => [...prev, id]);
            }
        },
        openFileIds,
        setOpenFileIds,
        getFileNode,
        updateFileContent,
        diagnostics,
        setDiagnostics,
        applyFix,
    };

    return (
        <EditorContext.Provider value={value}>
            {children}
        </EditorContext.Provider>
    );
};

export const useEditor = (): EditorContextType => {
    const context = useContext(EditorContext);
    if (context === undefined) {
        throw new Error('useEditor must be used within an EditorProvider');
    }
    return context;
};