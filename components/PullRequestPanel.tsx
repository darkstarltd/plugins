import React, { useState } from 'react';
import { PrInfo, PrFile } from '../types';
import { GitPullRequestIcon, FileCodeIcon, WandIcon } from './icons';
import { MOCK_PRS } from '../constants';
import DiffViewer from './DiffViewer';
import { useToast } from './Toast';

interface PullRequestPanelProps {
    onReviewPr: (pr: PrInfo) => void;
}

const PullRequestPanel: React.FC<PullRequestPanelProps> = ({ onReviewPr }) => {
    const [selectedPr, setSelectedPr] = useState<PrInfo | null>(MOCK_PRS[0]);
    const [selectedFile, setSelectedFile] = useState<PrFile | null>(MOCK_PRS[0].files[0]);
    const toast = useToast();

    const handleSelectPr = (pr: PrInfo) => {
        setSelectedPr(pr);
        setSelectedFile(pr.files[0] || null);
    };
    
    const handleReviewClick = () => {
        if (selectedPr) {
            toast.showToast(`Mona is reviewing PR #${selectedPr.id}...`, 'info');
            onReviewPr(selectedPr);
        }
    }

    return (
        <div className="flex flex-col h-full">
            <div className="p-2 font-bold text-md border-b border-t border-[var(--color-border-primary)] flex items-center gap-2 text-[var(--color-text-bright)] text-primary-readable flex-shrink-0">
                <GitPullRequestIcon className="w-5 h-5"/> Pull Requests
            </div>
            <div className="flex flex-grow overflow-hidden">
                {/* PR List */}
                <div className="w-1/3 border-r border-[var(--color-border-primary)] overflow-y-auto">
                    {MOCK_PRS.map(pr => (
                        <div
                            key={pr.id}
                            onClick={() => handleSelectPr(pr)}
                            className={`p-3 cursor-pointer border-b border-[var(--color-border-secondary)] ${selectedPr?.id === pr.id ? 'bg-[var(--color-accent-subtle-bg)]' : 'hover:bg-[var(--color-bg-tertiary)]'}`}
                        >
                            <div className={`font-semibold ${selectedPr?.id === pr.id ? 'text-[var(--color-accent-text)]' : 'text-[var(--color-text-bright)]'}`}>{pr.title}</div>
                            <div className="text-sm text-[var(--color-text-dim)]">#{pr.id} opened by {pr.author}</div>
                        </div>
                    ))}
                </div>
                {/* PR Details */}
                <div className="w-2/3 flex flex-col overflow-y-auto">
                    {selectedPr ? (
                        <div className="flex-grow flex flex-col">
                           <div className="p-4 border-b border-[var(--color-border-primary)] flex-shrink-0">
                                <h2 className="text-xl font-bold text-[var(--color-text-bright)]">{selectedPr.title}</h2>
                                <p className="text-[var(--color-text-dim)]">{selectedPr.description}</p>
                                <button onClick={handleReviewClick} className="mt-2 flex items-center gap-2 text-sm px-3 py-1 rounded-md bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-border-primary)]">
                                    <WandIcon className="w-4 h-4 text-[var(--color-accent-text)]" />
                                    Summarize with Mona
                                </button>
                            </div>
                            <div className="flex-grow flex flex-col overflow-hidden">
                                <div className="p-2 border-b border-[var(--color-border-primary)] flex-shrink-0">
                                    <h3 className="font-semibold text-sm">Files Changed ({selectedPr.files.length})</h3>
                                </div>
                                 <div className="flex-grow flex overflow-hidden">
                                    <div className="w-1/3 border-r border-[var(--color-border-primary)] overflow-y-auto">
                                    {selectedPr.files.map(file => (
                                        <div
                                            key={file.path}
                                            onClick={() => setSelectedFile(file)}
                                            className={`flex items-center gap-2 p-2 cursor-pointer text-sm ${selectedFile?.path === file.path ? 'bg-[var(--color-accent-subtle-bg)]' : 'hover:bg-[var(--color-bg-tertiary)]'}`}
                                        >
                                            <FileCodeIcon className="w-4 h-4" />
                                            <span>{file.path}</span>
                                        </div>
                                    ))}
                                    </div>
                                    <div className="w-2/3 overflow-y-auto">
                                         {selectedFile && <DiffViewer patch={selectedFile.patch || ''} />}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-[var(--color-text-dim)]">Select a pull request to view details.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PullRequestPanel;