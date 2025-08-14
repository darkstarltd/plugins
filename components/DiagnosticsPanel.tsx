import React from 'react';
import { Diagnostic, DiagnosticSeverity } from '../types';
import { ErrorIcon, WarningIcon, InfoIcon } from './icons';

interface DiagnosticsPanelProps {
    diagnostics: Diagnostic[];
    onClear: () => void;
}

const DiagnosticsPanel: React.FC<DiagnosticsPanelProps> = ({ diagnostics, onClear }) => (
    <div className="h-full bg-gray-900/50 p-2 flex flex-col">
        <div className="flex justify-between items-center mb-2 px-2 flex-shrink-0">
            <h3 className="font-bold">Issues ({diagnostics.length})</h3>
            <button onClick={onClear} className="text-sm text-gray-400 hover:text-white">Clear All</button>
        </div>
        <div className="flex-grow overflow-y-auto pr-2">
            {diagnostics.length === 0 && <p className="text-center text-gray-500 py-4">No issues found.</p>}
            {diagnostics.map((d) => (
                <div key={d.id} className="flex items-start gap-2 p-1 text-sm rounded-md hover:bg-white/5">
                    {d.severity === DiagnosticSeverity.error && <ErrorIcon className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />}
                    {d.severity === DiagnosticSeverity.warning && <WarningIcon className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />}
                    {d.severity === DiagnosticSeverity.info && <InfoIcon className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />}
                    <span className="text-gray-500">L{d.start}:</span>
                    <span>{d.message}</span>
                </div>
            ))}
        </div>
    </div>
);

export default DiagnosticsPanel;