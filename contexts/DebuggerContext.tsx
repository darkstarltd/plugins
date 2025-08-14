import React, { createContext, useContext, ReactNode, useState, useCallback } from 'react';
import type { DebuggerContextType, DebuggerSession, Breakpoint, StackFrame, Scope } from '../types';
import { useToast } from '../components/Toast';
import { useLayout } from './LayoutContext';

const DebuggerContext = createContext<DebuggerContextType | undefined>(undefined);

const MOCK_EXECUTION_TRACE: Omit<StackFrame, 'id' | 'fileName'>[] = [
    { functionName: 'updateProfile', fileId: 'file-main-ts', line: 15 },
    { functionName: 'saveUserData', fileId: 'file-main-ts', line: 8 },
    { functionName: 'onClick', fileId: 'file-main-ts', line: 22 },
    { functionName: 'eventHandler', fileId: 'file-html', line: 10 },
];

const MOCK_SCOPES: Scope[] = [
    { name: 'Local', variables: [{ name: 'userId', type: 'string', value: 'user-123' }, { name: 'newUsername', type: 'string', value: 'Alice' }] },
    { name: 'Global', variables: [{ name: 'window', type: 'object', value: '{...}' }] },
];

export const DebuggerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<DebuggerSession>({
        status: 'inactive',
        currentFrame: null,
        callStack: [],
        scopes: [],
    });
    const [breakpoints, setBreakpoints] = useState<Breakpoint[]>([]);
    const toast = useToast();
    const { setBottomPanel } = useLayout();

    const toggleBreakpoint = useCallback((fileId: string, line: number) => {
        setBreakpoints(prev => {
            const existingIndex = prev.findIndex(bp => bp.fileId === fileId && bp.line === line);
            if (existingIndex > -1) {
                return prev.filter((_, i) => i !== existingIndex);
            }
            return [...prev, { fileId, line }];
        });
    }, []);

    const startDebugging = useCallback((fileId: string, code: string) => {
        setBottomPanel('debug');
        toast.showToast('Starting debugging session...', 'info');

        // Find the first breakpoint to pause at
        const lines = code.split('\n');
        let firstPauseLine = -1;
        const fileBreakpoints = breakpoints.filter(bp => bp.fileId === fileId).map(bp => bp.line);
        
        for(let i=0; i < lines.length; i++) {
            if (fileBreakpoints.includes(i + 1)) {
                firstPauseLine = i + 1;
                break;
            }
        }
        
        if (firstPauseLine === -1) {
             toast.showToast('No breakpoints set. Run to completion.', 'info');
             setSession({ status: 'inactive', callStack: [], currentFrame: null, scopes: [] });
             return;
        }

        const callStack: StackFrame[] = MOCK_EXECUTION_TRACE.map((trace, i) => ({
            ...trace,
            id: `frame-${i}`,
            fileName: `${trace.fileId.split('-')[1]}.ts`,
        }));
        
        const currentFrame = callStack.find(frame => frame.line >= firstPauseLine && frame.fileId === fileId) || callStack[0];

        setSession({
            status: 'paused',
            callStack: callStack,
            currentFrame,
            scopes: MOCK_SCOPES,
        });

    }, [breakpoints, toast, setBottomPanel]);
    
    const stopDebugging = useCallback(() => {
        setSession({ status: 'inactive', callStack: [], currentFrame: null, scopes: [] });
        toast.showToast('Debugging session stopped.', 'info');
    }, [toast]);
    
    const continueDebug = useCallback(() => {
        if (session.status !== 'paused' || !session.currentFrame) return;

        const fileBreakpoints = breakpoints.filter(bp => bp.fileId === session.currentFrame!.fileId).map(bp => bp.line);
        const nextBreakpointLine = fileBreakpoints.find(line => line > session.currentFrame!.line);

        if (nextBreakpointLine) {
            const nextFrame = { ...session.currentFrame, line: nextBreakpointLine };
            setSession(prev => ({ ...prev, status: 'paused', currentFrame: nextFrame }));
        } else {
            stopDebugging();
        }
    }, [session, breakpoints, stopDebugging]);

    const stepOver = useCallback(() => {
        if (session.status !== 'paused' || !session.currentFrame) return;

        const currentFrameIndex = session.callStack.findIndex(f => f.id === session.currentFrame!.id);
        if (currentFrameIndex > -1 && currentFrameIndex < session.callStack.length - 1) {
            const nextFrame = session.callStack[currentFrameIndex + 1];
            setSession(prev => ({ ...prev, currentFrame: nextFrame }));
        } else {
            // If at the end, just move to the next line as a simulation
            setSession(prev => ({ ...prev, currentFrame: { ...prev.currentFrame!, line: prev.currentFrame!.line + 1 } }));
        }
    }, [session]);


    const value = {
        session,
        breakpoints,
        toggleBreakpoint,
        startDebugging,
        stopDebugging,
        continueDebug: continueDebug,
        stepOver,
    };

    return (
        <DebuggerContext.Provider value={value}>
            {children}
        </DebuggerContext.Provider>
    );
};

export const useDebugger = (): DebuggerContextType => {
    const context = useContext(DebuggerContext);
    if (context === undefined) {
        throw new Error('useDebugger must be used within a DebuggerProvider');
    }
    return context;
};