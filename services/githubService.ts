
import { PullRequest, PullRequestFile } from '../types';

const GITHUB_API_BASE = 'https://api.github.com';

export class GitHubService {
    private token: string;

    constructor(token: string) {
        this.token = token;
    }

    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const url = `${GITHUB_API_BASE}${endpoint}`;
        const headers = new Headers({
            'Authorization': `Bearer ${this.token}`,
            'Accept': 'application/vnd.github.v3+json',
            'X-GitHub-Api-Version': '2022-11-28',
            ...options.headers,
        });

        const response = await fetch(url, { ...options, headers });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `GitHub API request failed with status ${response.status}`);
        }
        
        // Handle no content response
        if (response.status === 204) {
            return null as T;
        }

        return response.json();
    }

    public async getPullRequests(owner: string, repo: string): Promise<PullRequest[]> {
        return this.request(`/repos/${owner}/${repo}/pulls`);
    }

    public async getPullRequestFiles(owner: string, repo: string, prNumber: number): Promise<PullRequestFile[]> {
        return this.request(`/repos/${owner}/${repo}/pulls/${prNumber}/files`);
    }
    
    public async getPullRequestDiff(owner: string, repo: string, prNumber: number): Promise<string> {
        const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/pulls/${prNumber}`;
        const headers = new Headers({
            'Authorization': `Bearer ${this.token}`,
            'Accept': 'application/vnd.github.v3.diff', // Request the diff format
            'X-GitHub-Api-Version': '2022-11-28',
        });
        const response = await fetch(url, { headers });
         if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `GitHub API request failed with status ${response.status}`);
        }
        return response.text();
    }

    public async testConnection(owner: string, repo: string): Promise<boolean> {
        try {
            await this.request(`/repos/${owner}/${repo}`);
            return true;
        } catch (error) {
            console.error("GitHub connection test failed:", error);
            return false;
        }
    }
}
