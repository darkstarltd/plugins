import { ReactNode } from "react";

export type Platform = 'web' | 'android' | 'flutter';

export type ErrorSeverity = 'error' | 'warning' | 'info';

export type ErrorType = 'runtime' | 'syntax' | 'logical' | 'design' | 'null-safety' | 'deprecation' | 'performance';

export interface CodeError {
  id: number;
  line: number;
  column: number;
  message: string;
  severity: ErrorSeverity;
  type: ErrorType;
  code: string;
}

export interface Solution {
  title: string;
  description: string;
  fixedCode: string;
  confidence: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export type View = 'dashboard' | 'editor' | 'firepass' | 'plugins' | 'billing' | 'admin' | 'projects';

export type BottomPanelType = 'terminal' | 'output' | 'problems' | 'debug' | 'emulator' | 'ai-assistant';

export interface Toast {
  key: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface DiffLine {
  type: 'added' | 'removed' | 'common';
  content: string;
}

export interface Command {
  id: string;
  label: string;
  section: string;
  icon: React.ElementType;
  action: (...args: any[]) => void;
}

export interface FirePassEntry {
    id: string;
    key: string;
    value: string;
    category: 'api' | 'database' | 'ssh' | 'token' | 'other';
    metadata: {
        username?: string;
        description?: string;
    };
    group?: string;
    lastUpdated?: string;
}

export type TokenType = 'keyword' | 'string' | 'comment' | 'number' | 'operator' | 'punctuation' | 'function' | 'tag' | 'attribute' | 'value' | 'default';

export interface SyntaxToken {
    type: TokenType;
    content: string;
}

export interface Theme {
    name: string;
    colors: {
        '--color-primary': string;
        '--color-secondary': string;
        '--color-accent': string;
        '--color-bg-base': string;
        '--color-bg-surface': string;
        '--color-bg-inset': string;
        '--color-text-base': string;
        '--color-text-muted': string;
        '--color-text-dim': string;
        '--color-border-base': string;
        '--color-text-on-primary': string;
        '--color-text-on-secondary': string;
        '--color-text-on-accent': string;
        // Syntax Highlighting Tokens
        '--color-token-keyword': string;
        '--color-token-string': string;
        '--color-token-comment': string;
        '--color-token-number': string;
        '--color-token-operator': string;
        '--color-token-punctuation': string;
        '--color-token-function': string;
        '--color-token-tag': string;
        '--color-token-attribute': string;
        '--color-token-value': string;
    }
}

export type EditorFont = 'mono' | 'sans';

export interface AccessibilitySettings {
    globalFontSize: number;
    reduceMotion: boolean;
    highContrast: boolean;
}

export interface SecuritySettings {
    lockType: 'none' | 'pin' | 'pattern';
    pin: string | null;
    pattern: number[] | null;
}

export interface ExternalLibrary {
    id: string;
    url: string;
    type: 'js' | 'css';
}

export interface WebDevSettings {
    autoRefresh: boolean;
    libraries: ExternalLibrary[];
}

export interface SystemSettings {
    maintenanceMode: boolean;
}

export interface AdvancedSettings {
    enableFileApi: boolean;
    systemPrompt: string;
}

export interface PasswordGeneratorSettings {
    length: number;
    useUppercase: boolean;
    useLowercase: boolean;
    useNumbers: boolean;
    useSymbols: boolean;
}

export interface Settings {
    layout: {
        sidebarWidth: number;
        bottomPanelHeight: number;
    };
    editor: {
        fontFamily: EditorFont;
        fontSize: number;
        lineHeight: number;
        wordWrap: boolean;
        showMinimap: boolean;
        enableBracketMatching: boolean;
    };
    terminal: {
        fontSize: number;
    };
    ai: {
        apiKey: string | null;
        model: string;
        personality: 'concise' | 'detailed' | 'playful';
    };
    firepass: {
        autoLockMinutes: number;
        passwordGenerator: PasswordGeneratorSettings;
    };
    appearance: {
        theme: string;
        accentColor: string;
        animatedBackground: boolean;
    };
    plugins: {
        [key: string]: boolean; // Plugin ID and its enabled status
    };
    accessibility: AccessibilitySettings;
    security: SecuritySettings;
    webDev: WebDevSettings;
    system: SystemSettings;
    advanced: AdvancedSettings;
}

export interface DashboardWidget {
    i: 'stats' | 'health' | 'activity' | 'terminal' | 'projects';
    x: number;
    y: number;
    w: number;
    h: number;
    isResizable?: boolean;
}

export interface WebViewCode {
    html: string;
    css: string;
    js: string;
}

export interface FileSystemNode {
    id: string;
    name: string;
    type: 'file' | 'folder';
    content?: string;
    children?: FileSystemNode[];
}

export interface Project {
    id:string;
    name: string;
    createdAt: string;
    code: Record<Platform, string>;
    health: number;
    currentBranch?: string;
    branches?: Record<string, FileSystemNode[]>;
}

export interface ProjectContextType {
    projects: Project[];
    activeProjectId: string | null;
    activeProject: Project | null;
    createProject: (name: string) => void;
    deleteProject: (id: string) => void;
    renameProject: (id: string, newName: string) => void;
    setActiveProject: (id: string | null) => void;
    updateProjectCode: (platform: Platform, newCode: string) => void;
    setProjectFileSystem: (updater: (draft: FileSystemNode[]) => void) => void;
    commitChanges: (commitMessage: string, stagedFiles: Set<string>) => void;
    switchBranch: (branchName: string) => void;
    createBranch: (branchName: string) => void;
}

export interface ChatContextType {
    messages: ChatMessage[];
    isChatOpen: boolean;
    isChatClosing: boolean;
    isLoading: boolean;
    openChat: () => void;
    closeChat: () => void;
    sendMessage: (message: string) => Promise<void>;
    clearChat: () => void;
    startConversationWith: (prompt: string) => void;
}


// --- New Auth & User Types ---

export type TierName = 'Explorer' | 'Architect' | 'Forge Master';

export interface Tier {
    name: TierName;
    price: number;
    features: string[];
}

export interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    hashedMasterPassword: string;
    userCode: string; // Unique code for verification
    tier: TierName;
    avatar?: string;
}

export interface AuthContextType {
    isAuthenticated: boolean;
    isAppLocked: boolean;
    isFirstLogin: boolean;
    user: User | null;
    isAdmin: boolean;
    signup: (details: Omit<User, 'id' | 'hashedMasterPassword' | 'userCode' | 'tier'> & { masterPassword: string }) => Promise<void>;
    signin: (email: string) => Promise<boolean>;
    unlockApp: (password: string | number[]) => Promise<boolean>;
    lock: () => void;
    logout: () => void;
    clearFirstLogin: () => void;
    upgradeTier: (tierName: TierName) => void;
    loginAsAdmin: (password: string) => Promise<boolean>;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

export interface FirePassContextType {
    entries: FirePassEntry[];
    isLocked: boolean;
    needsSetup: boolean;
    setup: (password: string) => Promise<void>;
    unlock: (password: string) => Promise<boolean>;
    lock: () => void;
    updateEntries: (newEntries: FirePassEntry[]) => void;
    clearVault: () => void;
    isUnlockModalOpen: boolean;
    setIsUnlockModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    changeMasterPassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
    exportVault: () => void;
    importVault: (entries: FirePassEntry[]) => Promise<void>;
}

// --- New Feature Types ---

export interface HealthIssue {
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'performance' | 'security' | 'best-practice' | 'bug-risk';
  description: string;
  file: string;
  line: number;
}

export interface ProjectHealthAnalysis {
  overallScore: number;
  summary: string;
  issues: HealthIssue[];
}

export interface Collaborator {
    id: string;
    name: string;
    avatarUrl: string;
    color: string;
    cursorPos?: { line: number; col: number; pos: number };
    selection?: { start: number; end: number };
}

export interface CollaborationContextType {
    collaborators: Collaborator[];
    startSession: () => void;
    endSession: () => void;
}


export enum DiagnosticSeverity {
    error = 'error',
    warning = 'warning',
    info = 'info',
}

export interface Diagnostic {
    id: string;
    start: number;
    end: number;
    message: string;
    severity: DiagnosticSeverity;
    quickFixTitle?: string;
    replacementCode?: string;
    source: string;
}

export interface SearchResult {
    fileId: string;
    line: number;
    start: number;
    end: number;
    preview: string;
}

export type SidebarView = 'explorer' | 'search' | 'source-control' | 'pull-requests' | 'debugger' | string;

// --- Plugin System Types ---

export interface Disposable {
    dispose(): any;
}

export interface ExtensionContext {
    subscriptions: Disposable[];
}

export interface Plugin {
    id: string;
    name: string;
    description: string;
    author: string;
    version: string;
    activate: (context: ExtensionContext) => void;
    deactivate?: () => void;
}

export interface SidebarViewContribution {
    id: string;
    title: string;
    icon: React.ElementType;
    component: React.ComponentType;
}

export interface BottomPanelViewContribution {
    id: string;
    title: string;
    icon: React.ElementType;
    component: React.ComponentType;
}

export interface TextDocument {
    uri: string; // fileId
    languageId: string; // e.g., 'typescript', 'markdown'
    getText: () => string;
}

export interface DiagnosticProvider {
    provideDiagnostics(document: TextDocument): Promise<Diagnostic[] | undefined>;
}

// --- GitHub Integration Types ---
export interface PullRequest {
  id: number;
  number: number;
  title: string;
  body: string | null;
  user: {
    login: string;
    avatar_url: string;
  };
  state: 'open' | 'closed';
  created_at: string;
  updated_at: string;
  html_url: string;
}

export interface PullRequestFile {
  sha: string;
  filename: string;
  status: 'added' | 'removed' | 'modified' | 'renamed' | 'copied' | 'changed' | 'unchanged';
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
}

export interface GitHubContextType {
    isConnected: boolean;
    token: string | null;
    owner: string | null;
    repo: string | null;
    pullRequests: PullRequest[];
    isLoading: boolean;
    error: string | null;
    connect: (token: string, repoUrl: string) => Promise<void>;
    disconnect: () => void;
    fetchPullRequestDiff: (prNumber: number) => Promise<string | null>;
}