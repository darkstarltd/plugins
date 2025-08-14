
import React, { useState, useEffect } from 'react';
import { PullRequest } from '../../types';
import { GitPullRequestIcon, WandIcon, XCircleIcon } from '../../components/icons';
import DiffViewer from '../../components/DiffViewer';
import { useToast } from '../../components/Toast';
import { useGitHub } from '../../contexts/GitHubContext';
import { ConnectGitHubView } from './ConnectGitHubView';
import { useChat } from '../../contexts/ChatContext';
import * as geminiService from '../../services/geminiService';

export const PullRequestsView: React.FC = () => {
    const { isConnected, pullRequests, isLoading, error, disconnect, fetchPullRequestDiff } = useGitHub();
    const { startConversationWith } = useChat();
    const [selectedPr, setSelectedPr] = useState<PullRequest | null>(null);
    const [prDiff, setPrDiff] = useState<string | null>(null);
    const toast = useToast();

    useEffect(() => {
        if (pullRequests.length > 0 && !selectedPr) {
            setSelectedPr(pullRequests[0]);
        } else if (selectedPr && !pullRequests.some(pr => pr.id === selectedPr.id)) {
            // If the selected PR is no longer in the list (e.g., after a refresh), deselect it
            setSelectedPr(pullRequests.length > 0 ? pullRequests[0] : null);
        }
    }, [pullRequests, selectedPr]);

    useEffect(() => {
        const loadDiff = async () => {
            if (selectedPr) {
                setPrDiff(null); // Clear old diff
                const diff = await fetchPullRequestDiff(selectedPr.number);
                setPrDiff(diff);
            }
        };
        loadDiff();
    }, [selectedPr, fetchPullRequestDiff]);

    const handleSummarizeClick = async () => {
        if (!selectedPr || !prDiff) return;
        toast.showToast(`Mona is summarizing PR #${selectedPr.number}...`, 'info');
        try {
            const summary = await geminiService.summarizePullRequest(selectedPr, prDiff);
            const prompt = `Here's a summary for PR #${selectedPr.number} - "${selectedPr.title}":\n\n${summary}`;
            startConversationWith(prompt);
        } catch (e) {
            toast.showToast('Failed to generate summary.', 'error');
        }
    };

    if (!isConnected) {
        return <ConnectGitHubView />;
    }

    return (
        <div className="flex flex-col h-full">
            <div className="p-2 font-bold text-md border-b border-t border-[var(--color-border-primary)] flex items-center justify-between text-[var(--color-text-bright)] text-primary-readable flex-shrink-0">
                <div className="flex items-center gap-2">
                    <GitPullRequestIcon className="w-5 h-5"/> Pull Requests
                </div>
                 <button onClick={disconnect} className="text-xs flex items-center gap-1 text-text-dim hover:text-red-400" title="Disconnect from GitHub">
                     <XCircleIcon className="w-4 h-4" /> Disconnect
                 </button>
            </div>
            {isLoading && pullRequests.length === 0 && <div className="p-4 text-center text-text-dim">Loading...</div>}
            {error && <div className="p-4 text-center text-red-400">{error}</div>}
            <div className="flex flex-grow overflow-hidden">
                <div className="w-1/3 border-r border-[var(--color-border-primary)] overflow-y-auto">
                    {pullRequests.map(pr => (
                        <div
                            key={pr.id}
                            onClick={() => setSelectedPr(pr)}
                            className={`p-3 cursor-pointer border-b border-[var(--color-border-secondary)] ${selectedPr?.id === pr.id ? 'bg-[var(--color-accent-subtle-bg)]' : 'hover:bg-[var(--color-bg-tertiary)]'}`}
                        >
                            <div className={`font-semibold text-sm truncate ${selectedPr?.id === pr.id ? 'text-[var(--color-accent-text)]' : 'text-[var(--color-text-bright)]'}`}>{pr.title}</div>
                            <div className="text-xs text-[var(--color-text-dim)]">#{pr.number} by {pr.user.login}</div>
                        </div>
                    ))}
                </div>
                <div className="w-2/3 flex flex-col overflow-y-auto">
                    {selectedPr ? (
                        <div className="flex-grow flex flex-col">
                           <div className="p-4 border-b border-[var(--color-border-primary)] flex-shrink-0">
                                <h2 className="text-lg font-bold text-[var(--color-text-bright)]">{selectedPr.title}</h2>
                                <p className="text-sm text-[var(--color-text-dim)] max-h-24 overflow-y-auto mt-1">{selectedPr.body || 'No description provided.'}</p>
                                <button onClick={handleSummarizeClick} disabled={!prDiff} className="mt-2 flex items-center gap-2 text-sm px-3 py-1 rounded-md bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-border-primary)] disabled:opacity-50">
                                    <WandIcon className="w-4 h-4 text-[var(--color-accent-text)]" />
                                    Summarize with Mona
                                </button>
                            </div>
                            <div className="flex-grow flex flex-col overflow-hidden">
                                <div className="p-2 border-b border-[var(--color-border-primary)] flex-shrink-0">
                                    <h3 className="font-semibold text-sm">Changes</h3>
                                </div>
                                <div className="flex-grow overflow-y-auto">
                                    {prDiff ? <DiffViewer patch={prDiff} /> : <div className="p-4 text-center text-text-dim">Loading diff...</div>}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-[var(--color-text-dim)]">
                            {pullRequests.length > 0 ? "Select a pull request to view details." : "No open pull requests found."}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
