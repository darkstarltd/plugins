
import React, { createContext, useContext, ReactNode, useState, useCallback, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { GitHubService } from '../services/githubService';
import type { PullRequest, GitHubContextType } from '../types';
import { useToast } from '../components/Toast';

const GitHubContext = createContext<GitHubContextType | undefined>(undefined);

export const GitHubProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [token, setToken] = useLocalStorage<string | null>('firefly_github_token', null);
    const [owner, setOwner] = useLocalStorage<string | null>('firefly_github_owner', null);
    const [repo, setRepo] = useLocalStorage<string | null>('firefly_github_repo', null);
    const [pullRequests, setPullRequests] = useState<PullRequest[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const toast = useToast();

    const isConnected = !!(token && owner && repo);

    const connect = async (newToken: string, repoUrl: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const urlParts = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
            if (!urlParts) {
                throw new Error("Invalid GitHub repository URL. Please use the format 'owner/repo' or a full URL.");
            }
            const newOwner = urlParts[1];
            const newRepo = urlParts[2].replace('.git', '');

            const service = new GitHubService(newToken);
            const connectionSuccessful = await service.testConnection(newOwner, newRepo);

            if (!connectionSuccessful) {
                throw new Error("Could not connect. Check token permissions and repository path.");
            }

            setToken(newToken);
            setOwner(newOwner);
            setRepo(newRepo);
            toast.showToast(`Connected to ${newOwner}/${newRepo}`, 'success');
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            setError(errorMessage);
            toast.showToast(errorMessage, 'error');
        } finally {
            setIsLoading(false);
        }
    };
    
    const disconnect = () => {
        setToken(null);
        setOwner(null);
        setRepo(null);
        setPullRequests([]);
        setError(null);
        toast.showToast('Disconnected from GitHub.', 'info');
    };

    const fetchPullRequests = useCallback(async () => {
        if (!isConnected) return;

        setIsLoading(true);
        setError(null);
        try {
            const service = new GitHubService(token!);
            const prs = await service.getPullRequests(owner!, repo!);
            setPullRequests(prs);
        } catch (e) {
             const errorMessage = e instanceof Error ? e.message : 'Could not fetch pull requests.';
            setError(errorMessage);
            toast.showToast(errorMessage, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [isConnected, token, owner, repo, toast]);
    
    const fetchPullRequestDiff = async (prNumber: number): Promise<string | null> => {
        if (!isConnected) return null;
        setIsLoading(true);
        setError(null);
         try {
            const service = new GitHubService(token!);
            const diff = await service.getPullRequestDiff(owner!, repo!, prNumber);
            return diff;
        } catch (e) {
             const errorMessage = e instanceof Error ? e.message : 'Could not fetch pull request diff.';
            setError(errorMessage);
            toast.showToast(errorMessage, 'error');
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isConnected) {
            fetchPullRequests();
        }
    }, [isConnected, fetchPullRequests]);

    const value = {
        isConnected,
        token,
        owner,
        repo,
        pullRequests,
        isLoading,
        error,
        connect,
        disconnect,
        fetchPullRequestDiff,
    };

    return (
        <GitHubContext.Provider value={value}>
            {children}
        </GitHubContext.Provider>
    );
};

export const useGitHub = (): GitHubContextType => {
    const context = useContext(GitHubContext);
    if (context === undefined) {
        throw new Error('useGitHub must be used within a GitHubProvider');
    }
    return context;
};
