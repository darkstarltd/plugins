import React from 'react';
import { BugIcon, PlayIcon, RefreshCwIcon, SquareIcon, StepIntoIcon, StepOutIcon, StepOverIcon, ChevronDownIcon, FileCodeIcon, CheckCircleIcon } from './icons';
import { useDebugger } from '../contexts/DebuggerContext';
import { useEditor } from '../contexts/EditorContext';

const Section: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = true }) => {
    const [isOpen, setIsOpen] = React.useState(defaultOpen);

    return (
        <div>
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between px-2 py-1 text-xs font-bold uppercase text-[var(--color-text-dim)] hover:bg-[var(--color-bg-tertiary)]">
                <span>{title}</span>
                <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-0' : '-rotate-90'}`} />
            </button>
            {isOpen && <div className="py-1">{children}</div>}
        </div>
    );
};

const DebuggerPanel: React.FC = () => {
    const { session, breakpoints, toggleBreakpoint, continueDebug, stepOver, stopDebugging } = useDebugger();
    const { getFileNode, setActiveFileId } = useEditor();

    const isDebugging = session.status !== 'inactive';
    const isPaused = session.status === 'paused';

    const handleBreakpointToggle = (fileId: string, line: number) => {
        toggleBreakpoint(fileId, line);
    };
    
    const handleFrameClick = (fileId: string) => {
        setActiveFileId(fileId);
    };

    return (
        <div className="flex flex-col h-full text-sm">
            <div className="p-2 font-bold text-md border-b border-t border-[var(--color-border-primary)] flex items-center gap-2 text-[var(--color-text-bright)] text-primary-readable flex-shrink-0">
                <BugIcon className="w-5 h-5"/> Run and Debug
            </div>
            
            <div className="p-2 flex items-center justify-center gap-2 bg-[var(--color-bg-secondary)] border-b border-[var(--color-border-primary)]">
                <button title="Continue (F5)" disabled={!isPaused} onClick={continueDebug} className="p-1 rounded text-green-400 disabled:text-[var(--color-text-dim)] hover:bg-[var(--color-bg-tertiary)]"><PlayIcon className="w-5 h-5"/></button>
                <button title="Step Over (F10)" disabled={!isPaused} onClick={stepOver} className="p-1 rounded text-[var(--color-text-dim)] hover:text-[var(--color-text-bright)] hover:bg-[var(--color-bg-tertiary)] disabled:opacity-50"><StepOverIcon className="w-5 h-5"/></button>
                <button title="Step Into (F11)" disabled={!isPaused} className="p-1 rounded text-[var(--color-text-dim)] hover:text-[var(--color-text-bright)] hover:bg-[var(--color-bg-tertiary)] disabled:opacity-50"><StepIntoIcon className="w-5 h-5"/></button>
                <button title="Step Out (Shift+F11)" disabled={!isPaused} className="p-1 rounded text-[var(--color-text-dim)] hover:text-[var(--color-text-bright)] hover:bg-[var(--color-bg-tertiary)] disabled:opacity-50"><StepOutIcon className="w-5 h-5"/></button>
                <button title="Restart" disabled={!isDebugging} className="p-1 rounded text-[var(--color-text-dim)] hover:text-[var(--color-text-bright)] hover:bg-[var(--color-bg-tertiary)] disabled:opacity-50"><RefreshCwIcon className="w-5 h-5"/></button>
                <button title="Stop (Shift+F5)" disabled={!isDebugging} onClick={stopDebugging} className="p-1 rounded text-red-500 hover:bg-red-500/20 disabled:opacity-50"><SquareIcon className="w-5 h-5"/></button>
            </div>

            <div className="flex-grow overflow-y-auto p-2 space-y-2">
                {!isDebugging ? <div className="text-center text-text-dim p-4">Start a debugging session to see variables and call stack.</div> : (
                    <>
                        <Section title="Variables">
                            {session.scopes.map((scope) => (
                                <div key={scope.name} className="pl-2">
                                    <h4 className="font-semibold text-[var(--color-text-base)]">{scope.name}</h4>
                                    <div className="pl-2 border-l border-[var(--color-border-secondary)]">
                                        {scope.variables.map(v => (
                                            <div key={v.name} className="flex items-baseline gap-2 font-mono">
                                                <span className="text-[var(--color-text-dim)]">{v.name}:</span>
                                                <span className={v.type === 'string' ? "text-green-400" : "text-orange-400"}>
                                                    {v.type === 'string' ? `"${v.value}"` : v.value}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </Section>
                         <Section title="Call Stack">
                            {session.callStack.map((frame) => (
                                <div key={frame.id} onClick={() => handleFrameClick(frame.fileId)} className={`px-2 py-0.5 rounded cursor-pointer ${frame.id === session.currentFrame?.id ? 'bg-yellow-500/20' : 'hover:bg-[var(--color-bg-tertiary)]'}`}>
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold">{frame.functionName}</span>
                                    </div>
                                    <div className="text-xs text-[var(--color-text-dim)] pl-1">
                                        {frame.fileName}:{frame.line}
                                    </div>
                                </div>
                            ))}
                        </Section>
                         <Section title="Breakpoints">
                            {breakpoints.map((bp, i) => (
                                <div key={`${bp.fileId}-${bp.line}`} className="flex items-center gap-2 px-2 py-0.5 hover:bg-[var(--color-bg-tertiary)]">
                                    <input type="checkbox" defaultChecked onChange={() => handleBreakpointToggle(bp.fileId, bp.line)} className="w-4 h-4 rounded-sm bg-[var(--color-bg-tertiary)] border-[var(--color-border-primary)] text-red-500 focus:ring-red-500/50" />
                                     <FileCodeIcon className="w-4 h-4"/>
                                    <span>{getFileNode(bp.fileId)?.name || bp.fileId}:{bp.line}</span>
                                </div>
                            ))}
                        </Section>
                    </>
                )}
            </div>
        </div>
    );
};

export default DebuggerPanel;