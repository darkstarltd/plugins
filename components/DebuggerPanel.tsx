
import React from 'react';
import { BugIcon, PlayIcon, RefreshCwIcon, SquareIcon, StepIntoIcon, StepOutIcon, StepOverIcon, ChevronDownIcon, FileCodeIcon, CheckCircleIcon } from './icons';

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
    const variables = {
        'Local': [
            { name: 'n', value: '5', type: 'number' },
            { name: 'this', value: 'Window', type: 'object' },
        ],
        'Global': [
            { name: 'window', value: '{...}', type: 'object' },
            { name: 'document', value: '{...}', type: 'object' },
        ],
    };

    const callStack = [
        { func: 'factorial', file: 'main.ts', line: 2 },
        { func: '(anonymous)', file: 'main.ts', line: 11 },
    ];
    
    const breakpoints = [
        { file: 'main.ts', line: 3 },
        { file: 'utils/math.ts', line: 1 },
    ];

    return (
        <div className="flex flex-col h-full text-sm">
            <div className="p-2 font-bold text-md border-b border-t border-[var(--color-border-primary)] flex items-center gap-2 text-[var(--color-text-bright)] text-primary-readable flex-shrink-0">
                <BugIcon className="w-5 h-5"/> Run and Debug
            </div>
            
            <div className="p-2 flex items-center justify-center gap-2 bg-[var(--color-bg-secondary)] border-b border-[var(--color-border-primary)]">
                <button title="Continue" className="p-1 rounded text-[var(--color-text-dim)] hover:text-[var(--color-text-bright)] hover:bg-[var(--color-bg-tertiary)]"><PlayIcon className="w-5 h-5"/></button>
                <button title="Step Over" className="p-1 rounded text-[var(--color-text-dim)] hover:text-[var(--color-text-bright)] hover:bg-[var(--color-bg-tertiary)]"><StepOverIcon className="w-5 h-5"/></button>
                <button title="Step Into" className="p-1 rounded text-[var(--color-text-dim)] hover:text-[var(--color-text-bright)] hover:bg-[var(--color-bg-tertiary)]"><StepIntoIcon className="w-5 h-5"/></button>
                <button title="Step Out" className="p-1 rounded text-[var(--color-text-dim)] hover:text-[var(--color-text-bright)] hover:bg-[var(--color-bg-tertiary)]"><StepOutIcon className="w-5 h-5"/></button>
                <button title="Restart" className="p-1 rounded text-[var(--color-text-dim)] hover:text-[var(--color-text-bright)] hover:bg-[var(--color-bg-tertiary)]"><RefreshCwIcon className="w-5 h-5"/></button>
                <button title="Stop" className="p-1 rounded text-red-500 hover:bg-red-500/20"><SquareIcon className="w-5 h-5"/></button>
            </div>

            <div className="flex-grow overflow-y-auto p-2 space-y-2">
                <Section title="Variables">
                    {Object.entries(variables).map(([scope, vars]) => (
                        <div key={scope} className="pl-2">
                            <h4 className="font-semibold text-[var(--color-text-base)]">{scope}</h4>
                            <div className="pl-2 border-l border-[var(--color-border-secondary)]">
                                {vars.map(v => (
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
                    {callStack.map((frame, i) => (
                        <div key={i} className="px-2 py-0.5 rounded hover:bg-[var(--color-bg-tertiary)] cursor-pointer">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold">{frame.func}</span>
                            </div>
                            <div className="text-xs text-[var(--color-text-dim)] pl-1">
                                {frame.file}:{frame.line}
                            </div>
                        </div>
                    ))}
                </Section>
                 <Section title="Breakpoints">
                    {breakpoints.map((bp, i) => (
                        <div key={i} className="flex items-center gap-2 px-2 py-0.5 hover:bg-[var(--color-bg-tertiary)]">
                            <input type="checkbox" defaultChecked className="w-4 h-4 rounded-sm bg-[var(--color-bg-tertiary)] border-[var(--color-border-primary)] text-[var(--color-accent)] focus:ring-[var(--color-accent-ring)]" />
                             <FileCodeIcon className="w-4 h-4"/>
                            <span>{bp.file}:{bp.line}</span>
                        </div>
                    ))}
                </Section>
            </div>
        </div>
    );
};

export default DebuggerPanel;