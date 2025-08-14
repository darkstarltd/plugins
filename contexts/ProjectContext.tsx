
import React, { createContext, useContext, ReactNode, useMemo, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import type { Project, ProjectContextType, Platform, WebViewCode, FileSystemNode } from '../types';
import { CODE_TEMPLATES } from '../constants';
import * as storageService from '../services/storageService';
import { produce } from 'immer';
import { useToast } from '../components/Toast';

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const DEFAULT_WEB_FILES: FileSystemNode[] = [
     {
        id: `file-html-${Date.now()}`, name: 'index.html', type: 'file', content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Project</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <h1>Welcome to your new project!</h1>
    <p>Edit this file to get started.</p>
    <script src="script.js"></script>
</body>
</html>`
    },
    { id: `file-css-${Date.now()}`, name: 'style.css', type: 'file', content: `body {\n  font-family: sans-serif;\n  background-color: #232323;\n  color: #eee;\n  text-align: center;\n  margin-top: 50px;\n}` },
    { id: `file-js-${Date.now()}`, name: 'script.js', type: 'file', content: `console.log("Project script loaded!");` }
];

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


export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [projects, setProjects] = useLocalStorage<Project[]>('firefly_projects', storageService.loadProjects());
    const [activeProjectId, setActiveProjectId] = useLocalStorage<string | null>('firefly_activeProjectId', null);
    const toast = useToast();

    const activeProject = useMemo(() => {
        return projects.find(p => p.id === activeProjectId) || null;
    }, [projects, activeProjectId]);

    useEffect(() => {
        // If there are projects but none is active, activate the first one.
        if (!activeProjectId && projects.length > 0) {
            setActiveProjectId(projects[0].id);
        }
        // If there's an active project ID but it doesn't correspond to a project, clear it.
        else if (activeProjectId && !projects.some(p => p.id === activeProjectId)) {
            setActiveProjectId(projects.length > 0 ? projects[0].id : null);
        }
    }, [projects, activeProjectId, setActiveProjectId]);

    const createProject = (name: string) => {
        const newProject: Project = {
            id: `proj_${Date.now()}`,
            name,
            createdAt: new Date().toISOString(),
            code: { ...CODE_TEMPLATES },
            health: Math.floor(Math.random() * 41) + 60, // Assign a random health score from 60 to 100
            currentBranch: 'main',
            branches: {
                'main': DEFAULT_WEB_FILES,
            }
        };
        setProjects(prev => [...prev, newProject]);
        setActiveProjectId(newProject.id);
    };

    const deleteProject = (id: string) => {
        setProjects((prevProjects: Project[]) => {
            const updatedProjects = prevProjects.filter(p => p.id !== id);
            if (activeProjectId === id) {
                // Logic to set new active project after deletion
                const newActiveId = updatedProjects.length > 0 ? updatedProjects[0].id : null;
                setActiveProjectId(newActiveId);
            }
            return updatedProjects;
        });
    };

    const renameProject = (id: string, newName: string) => {
        setProjects(prev => prev.map(p => p.id === id ? { ...p, name: newName } : p));
    };

    const setActiveProject = (id: string | null) => {
        setActiveProjectId(id);
    };

    const updateProjectCode = (platform: Platform, newCode: string) => {
        if (!activeProjectId) return;
        setProjects(prev => prev.map(p => {
            if (p.id === activeProjectId) {
                return { ...p, code: { ...p.code, [platform]: newCode } };
            }
            return p;
        }));
    };
    
    const setProjectFileSystem = (updater: (draft: FileSystemNode[]) => void) => {
        if (!activeProject || !activeProject.currentBranch) return;

        setProjects(produce((draft: Project[]) => {
            const projectToUpdate = draft.find(p => p.id === activeProject.id);
            if (projectToUpdate && projectToUpdate.currentBranch && projectToUpdate.branches) {
                const fileSystemDraft = projectToUpdate.branches[projectToUpdate.currentBranch];
                if (fileSystemDraft) {
                    updater(fileSystemDraft);
                }
            }
        }));
    };

    const commitChanges = (commitMessage: string, stagedFiles: Set<string>) => {
        if (!activeProject || !activeProject.currentBranch) return;
        
        setProjects(produce(draft => {
            const project = draft.find(p => p.id === activeProject.id);
            if (project && project.currentBranch && project.branches) {
                const headBranchFS = project.branches[project.currentBranch];
                const workingTreeFS = activeProject.branches?.[activeProject.currentBranch] || []; // Use non-draft version for reading
                
                stagedFiles.forEach(fileId => {
                    const workingNode = findNodeById(workingTreeFS, fileId);
                    
                    // This logic is tricky with immer. We need to find the node in the draft.
                    const updateNodeInDraft = (nodes: FileSystemNode[], id: string, newContent?: string) => {
                       for(const node of nodes) {
                            if(node.id === id) {
                                node.content = newContent;
                                return true;
                            }
                            if(node.children) {
                                if(updateNodeInDraft(node.children, id, newContent)) return true;
                            }
                       }
                       return false;
                    }
                    
                    if (workingNode) {
                       updateNodeInDraft(headBranchFS, fileId, workingNode.content);
                    }
                });
            }
        }));
        toast.showToast(`Committed ${stagedFiles.size} file(s): "${commitMessage}"`, 'success');
    };

    const switchBranch = (branchName: string) => {
         setProjects(produce(draft => {
            const project = draft.find(p => p.id === activeProject.id);
            if (project) {
                project.currentBranch = branchName;
            }
        }));
        toast.showToast(`Switched to branch '${branchName}'`, 'info');
    };
    
    const createBranch = (branchName: string) => {
        if (!activeProject || !activeProject.currentBranch) return;
        if (activeProject.branches && activeProject.branches[branchName]) {
            toast.showToast(`Branch '${branchName}' already exists.`, 'error');
            return;
        }

        setProjects(produce(draft => {
            const project = draft.find(p => p.id === activeProject.id);
            if (project && project.currentBranch && project.branches) {
                // Deep copy the current branch's file system
                const currentFileSystem = JSON.parse(JSON.stringify(project.branches[project.currentBranch]));
                project.branches[branchName] = currentFileSystem;
                project.currentBranch = branchName;
            }
        }));
        toast.showToast(`Branch '${branchName}' created and switched.`, 'success');
    };

    const value = {
        projects,
        activeProjectId,
        activeProject,
        createProject,
        deleteProject,
        renameProject,
        setActiveProject,
        updateProjectCode,
        setProjectFileSystem,
        commitChanges,
        switchBranch,
        createBranch,
    };

    return (
        <ProjectContext.Provider value={value}>
            {children}
        </ProjectContext.Provider>
    );
};

export const useProject = (): ProjectContextType => {
    const context = useContext(ProjectContext);
    if (context === undefined) {
        throw new Error('useProject must be used within a ProjectProvider');
    }
    return context;
};