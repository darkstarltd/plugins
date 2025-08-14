
import React, { useState } from 'react';
import { useGitHub } from '../../contexts/GitHubContext';
import { GitPullRequestIcon } from '../../components/icons';

export const ConnectGitHubView: React.FC = () => {
    const { connect, isLoading, error } = useGitHub();
    const [token, setToken] = useState('');
    const [repoUrl, setRepoUrl] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (token.trim() && repoUrl.trim()) {
            connect(token, repoUrl);
        }
    };

    return (
        <div className="p-4 h-full flex flex-col items-center justify-center text-center">
            <GitPullRequestIcon className="w-12 h-12 text-text-dim mb-4" />
            <h3 className="font-bold text-text-base">Connect to GitHub</h3>
            <p className="text-sm text-text-muted mb-4">
                Enter a Personal Access Token and repository URL to view pull requests.
            </p>
            <form onSubmit={handleSubmit} className="w-full space-y-3">
                <input
                    type="password"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="ghp_..."
                    className="w-full bg-bg-inset border border-border-base rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                />
                <input
                    type="text"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="owner/repo"
                    className="w-full bg-bg-inset border border-border-base rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                />
                <button
                    type="submit"
                    disabled={isLoading || !token.trim() || !repoUrl.trim()}
                    className="w-full px-4 py-2 bg-accent text-on-accent font-semibold rounded-md hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {isLoading ? 'Connecting...' : 'Connect'}
                </button>
                {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
            </form>
             <a href="https://github.com/settings/tokens/new?scopes=repo" target="_blank" rel="noopener noreferrer" className="text-xs text-text-dim hover:text-primary mt-4 underline">
                Create a new PAT
            </a>
        </div>
    );
};
