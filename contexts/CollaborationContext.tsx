
import React, { createContext, useContext, ReactNode, useState, useRef, useCallback } from 'react';
import { Collaborator, CollaborationContextType } from '../types';
import { useToast } from '../components/Toast';

const CollaborationContext = createContext<CollaborationContextType | undefined>(undefined);

const MOCK_COLLABORATORS: Omit<Collaborator, 'cursorPos' | 'selection'>[] = [
    { id: 'c1', name: 'Alice', avatarUrl: '', color: 'rgba(250, 100, 100, 0.3)' },
    { id: 'c2', name: 'Bob', avatarUrl: '', color: 'rgba(100, 250, 100, 0.3)' },
    { id: 'c3', name: 'Charlie', avatarUrl: '', color: 'rgba(100, 100, 250, 0.3)' },
];

export const CollaborationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
    const intervalRef = useRef<number | null>(null);
    const toast = useToast();

    const endSession = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setCollaborators([]);
        toast.showToast('Live Share session ended.', 'info');
    }, [toast]);

    const startSession = useCallback(() => {
        if (intervalRef.current) {
            endSession();
        }
        
        toast.showToast('Live Share session started (simulation)!', 'success');

        const initialCollaborators = MOCK_COLLABORATORS.map(c => ({
            ...c,
            cursorPos: { line: Math.floor(Math.random() * 10) + 1, col: Math.floor(Math.random() * 20), pos: 0 },
            selection: { start: 0, end: 0 },
        }));
        setCollaborators(initialCollaborators);

        intervalRef.current = window.setInterval(() => {
            setCollaborators(prev => prev.map(c => {
                const move = Math.random();
                const newPos = { ...c.cursorPos! };
                if (move > 0.7) newPos.line = Math.max(1, newPos.line + (Math.random() > 0.5 ? 1 : -1));
                if (move < 0.8) newPos.col = Math.max(1, newPos.col + (Math.random() > 0.2 ? 1 : -1));
                
                const newSelection = (Math.random() > 0.95) 
                    ? { start: newPos.col, end: newPos.col + Math.floor(Math.random() * 10) } 
                    : c.selection;

                return { ...c, cursorPos: newPos, selection: newSelection };
            }));
        }, 1500);

    }, [endSession, toast]);

    return (
        <CollaborationContext.Provider value={{ collaborators, startSession, endSession }}>
            {children}
        </CollaborationContext.Provider>
    );
};

export const useCollaboration = (): CollaborationContextType => {
    const context = useContext(CollaborationContext);
    if (context === undefined) {
        throw new Error('useCollaboration must be used within a CollaborationProvider');
    }
    return context;
};