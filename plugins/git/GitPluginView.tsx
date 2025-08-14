
import React, { useState, useMemo } from 'react';
import { FileSystemNode, Project } from '../../types';
import { SourceControlIcon, PlusIcon, MinusIcon, WandIcon, GitBranchIcon, ChevronDownIcon } from '../../components/icons';
import * as geminiService from '../../services/geminiService';
import { useToast } from '../../components/Toast';
import FileIcon from '../../components/FileIcon';
import { useProject } from '../../contexts/ProjectContext';

const findNodeById = (nodes: FileSystemNode[], id: string): FileSystemNode | null => {
    for (const node of nodes) {
        if (node.id === id) return node;
        if (node.type === 'folder' && node.children) {
            const found = findNodeById(node.children, id);
            if (found) return found;
        }
    }
    return null;
};

const getAllFiles = (nodes: FileSystemNode[]): FileSystemNode[] => {
    let files: FileSystemNode[] = [];
    for (const node of nodes) {
        if (node.type === 'file') {
            files.push(node);
        } else if (node.children) {
            files = files.concat(getAllFiles(node.children));
        }
    }
    return files;
};

const generateDiff = (oldFile: FileSystemNode | null, newFile: FileSystemNode | null): string => {
    if (!newFile) return ''; // Should not happen for changed files
    const oldContent = oldFile?.content || '';
    const newContent = newFile.content || '';

    // This is a very basic diff, a real implementation would use a proper diff library
    return `--- a/${newFile.name}
+++ b/${newFile.name}
@@ -1 +1 @@
- ${oldContent.split('\n').join('\n- ')}
+ ${newContent.split('\n').join('\n+ ')}
`;
};

const GitPluginView: React.FC = () => {
    const { activeProject, commitChanges, switchBranch, createBranch } = useProject();
    const [commitMessage, setCommitMessage] = useState('');
    const [stagedFiles, setStagedFiles] = useState<Set<string>>(new Set());
    const [isGeneratingMessage, setIsGeneratingMessage] = useState(false);
    const toast = useToast();

    if (!activeProject) {
        return <div className="p-4 text-sm text-[var(--color-text-dim)]">Open a project to use Source Control.</div>;
    }
    
    const { branches, currentBranch } = activeProject;
    const fileSystem = activeProject.branches?.[activeProject.currentBranch || ''] || [];
    const gitHead = (branches && currentBranch && branches[currentBranch]) ? branches[currentBranch] : [];

    const changedFiles = useMemo(() => {
        const currentFiles = getAllFiles(fileSystem);
        const headFiles = getAllFiles(gitHead || []);
        
        const headFileMap = new Map(headFiles.map(f => [f.id, f]));
        
        return currentFiles
            .filter(currentFile => {
                const headFile = headFileMap.get(currentFile.id);
                return !headFile || headFile.content !== currentFile.content;
            })
            .map(f => ({ id: f.id, name: f.name }));

    }, [fileSystem, gitHead]);

    const handleStage = (fileId: string) => {
        setStagedFiles(prev => new Set(prev).add(fileId));
    };

    const handleUnstage = (fileId: string) => {
        setStagedFiles(prev => {
            const newSet = new Set(prev);
            newSet.delete(fileId);
            return newSet;
        });
    };

    const handleCommitClick = () => {
        if (commitMessage.trim() && stagedFiles.size > 0) {
            commitChanges(commitMessage, stagedFiles);
            setCommitMessage('');
            setStagedFiles(new Set());
        }
    };
    
    const handleGenerateCommitMessage = async () => {
        if (stagedFiles.size === 0) {
            toast.showToast("Stage files to generate a commit message.", "info");
            return;
        }
        setIsGeneratingMessage(true);
        toast.showToast("Mona is thinking of a commit message...", "info");
        
        const diffs = Array.from(stagedFiles).map(fileId => {
            const currentFile = findNodeById(fileSystem, fileId);
            const headFile = findNodeById(gitHead, fileId);
            return generateDiff(headFile, currentFile);
        }).join('\n');
        
        try {
            const message = await geminiService.suggestCommitMessage(diffs);
            setCommitMessage(message);
        } catch (e) {
            toast.showToast("Failed to generate commit message.", "error");
        } finally {
            setIsGeneratingMessage(false);
        }
    };
    
    const handleCreateBranch = () => {
        const newBranchName = prompt("Enter new branch name:");
        if (newBranchName) {
            createBranch(newBranchName);
        }
    };

    const unstaged = changedFiles.filter(f => !stagedFiles.has(f.id));
    const staged = changedFiles.filter(f => stagedFiles.has(f.id));

    return (
        <div className="flex flex-col h-full">
            <div className="p-2 font-bold text-md border-b border-t border-[var(--color-border-primary)] flex items-center gap-2 text-[var(--color-text-bright)] text-primary-readable flex-shrink-0">
                <SourceControlIcon className="w-5 h-5"/> Source Control
            </div>
            <div className="flex-grow overflow-y-auto text-sm">
                 <div className="p-2 border-b border-[var(--color-border-primary)]">
                    <div className="dropdown w-full">
                        <button className="w-full flex items-center justify-between p-2 bg-[var(--color-bg-secondary)] rounded-md hover:bg-[var(--color-bg-tertiary)]">
                            <div className="flex items-center gap-2">
                                <GitBranchIcon className="w-4 h-4"/>
                                <span className="font-semibold">{currentBranch}</span>
                            </div>
                            <ChevronDownIcon className="w-4 h-4"/>
                        </button>
                        <div className="dropdown-content w-full">
                            {branches && Object.keys(branches).map(branch => (
                                <a key={branch} href="#" onClick={(e) => { e.preventDefault(); switchBranch(branch); }} className={`block px-3 py-1.5 text-sm rounded-md ${branch === currentBranch ? 'bg-[var(--color-accent-subtle-bg)] text-[var(--color-accent-text)]' : 'text-[var(--color-text-base)] hover:bg-[var(--color-bg-tertiary)]'}`}>{branch}</a>
                            ))}
                            <hr className="my-1 border-[var(--color-border-primary)]" />
                            <a href="#" onClick={(e) => {e.preventDefault(); handleCreateBranch();}} className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md text-[var(--color-text-base)] hover:bg-[var(--color-bg-tertiary)]"><PlusIcon className="w-4 h-4"/> Create new branch...</a>
                        </div>
                    </div>
                </div>
                <div className="p-2">
                    <div className="relative">
                        <textarea
                            placeholder="Commit message"
                            value={commitMessage}
                            onChange={(e) => setCommitMessage(e.target.value)}
                            className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-accent-ring)] resize-none"
                            rows={3}
                        />
                        <button 
                            onClick={handleGenerateCommitMessage}
                            disabled={isGeneratingMessage}
                            className="absolute top-2 right-2 p-1 rounded-md text-[var(--color-text-dim)] hover:text-[var(--color-accent-text)] hover:bg-[var(--color-accent-subtle-bg)] disabled:opacity-50" 
                            title="Generate commit message with Mona"
                        >
                            <WandIcon className={`w-4 h-4 ${isGeneratingMessage ? 'animate-pulse' : ''}`}/>
                        </button>
                    </div>
                    <button onClick={handleCommitClick} disabled={!commitMessage.trim() || stagedFiles.size === 0} className="w-full mt-2 px-4 py-2 bg-[var(--color-accent)] text-[var(--color-text-on-accent)] font-semibold rounded-md hover:bg-[var(--color-accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                        Commit {stagedFiles.size} file(s)
                    </button>
                </div>
                 {staged.length > 0 && <Section title="Staged Changes" files={staged} actionIcon={MinusIcon} onAction={handleUnstage} />}
                 {unstaged.length > 0 && <Section title="Changes" files={unstaged} actionIcon={PlusIcon} onAction={handleStage} />}
            </div>
        </div>
    );
};

const Section: React.FC<{title: string, files: {id: string, name: string}[], actionIcon: React.FC<{className?:string}>, onAction: (id: string) => void}> = ({title, files, actionIcon: ActionIcon, onAction}) => (
    <div>
        <h3 className="font-bold text-xs uppercase text-[var(--color-text-dim)] px-2 py-1">{title} ({files.length})</h3>
        {files.map(file => (
            <div key={file.id} className="flex items-center justify-between px-2 py-1 hover:bg-[var(--color-bg-tertiary)] group">
                <div className="flex items-center gap-2">
                    <FileIcon filename={file.name} className="w-4 h-4"/>
                    <span>{file.name}</span>
                </div>
                <button onClick={() => onAction(file.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-[var(--color-border-primary)]">
                    <ActionIcon className="w-4 h-4" />
                </button>
            </div>
        ))}
    </div>
);


export default GitPluginView;
