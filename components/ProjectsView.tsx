import React, { useState } from 'react';
import { useProject } from '../contexts/ProjectContext';
import { useLayout } from '../contexts/LayoutContext';
import { Project } from '../types';
import { Plus, FolderKanban, Pencil, Trash, MoreVertical } from 'lucide-react';
import ContextMenu, { ContextMenuItem } from './ContextMenu';
import { useToast } from './Toast';

const ProjectCard: React.FC<{
  project: Project;
  onOpen: (id: string) => void;
  onRename: (id: string, newName: string) => void;
  onDelete: (id: string) => void;
}> = ({ project, onOpen, onRename, onDelete }) => {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  const handleRename = () => {
    const newName = prompt('Enter new project name:', project.name);
    if (newName) {
      onRename(project.id, newName);
    }
    setContextMenu(null);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${project.name}"? This cannot be undone.`)) {
      onDelete(project.id);
    }
    setContextMenu(null);
  };

  return (
    <div className="bg-bg-surface border border-border-base rounded-lg p-4 flex flex-col justify-between group">
      <div>
        <div className="flex justify-between items-start">
          <FolderKanban className="w-8 h-8 text-primary mb-2" />
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setContextMenu({ x: e.clientX, y: e.clientY });
              }}
              className="p-1 rounded-md text-text-dim hover:bg-bg-inset opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>
        <h3 className="font-bold text-text-base truncate">{project.name}</h3>
        <p className="text-xs text-text-dim">
          Created: {new Date(project.createdAt).toLocaleDateString()}
        </p>
      </div>
      <button
        onClick={() => onOpen(project.id)}
        className="mt-4 w-full text-center py-2 bg-bg-inset text-sm font-semibold rounded-md hover:bg-primary/20 hover:text-primary transition-colors"
      >
        Open Project
      </button>
      {contextMenu && (
        <ContextMenu x={contextMenu.x} y={contextMenu.y} onClose={() => setContextMenu(null)}>
          <ContextMenuItem onClick={handleRename}><Pencil className="w-4 h-4"/> Rename</ContextMenuItem>
          <ContextMenuItem onClick={handleDelete}><Trash className="w-4 h-4 text-red-500"/> Delete</ContextMenuItem>
        </ContextMenu>
      )}
    </div>
  );
};


export const ProjectsView: React.FC = () => {
    const { projects, createProject, deleteProject, renameProject, setActiveProject } = useProject();
    const { setSidebarView } = useLayout();
    const toast = useToast();

    const handleCreateProject = () => {
        const name = prompt("Enter new project name:");
        if (name) {
            createProject(name);
            toast.showToast(`Project "${name}" created!`, 'success');
        }
    };

    const handleOpenProject = (id: string) => {
        setActiveProject(id);
        setSidebarView('explorer'); // A good default when opening a project
        // The app will navigate to 'editor' view via the project switcher logic, or user can navigate manually
        toast.showToast(`Opened project: ${projects.find(p => p.id === id)?.name}`, 'info');
    };

    return (
        <div className="flex-1 p-4 md:p-8 overflow-y-auto bg-bg-base">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-text-base">Projects</h1>
                    <p className="text-text-muted">Manage your development workspaces.</p>
                </div>
                <button
                    onClick={handleCreateProject}
                    className="flex items-center space-x-2 px-4 py-2 bg-primary text-on-primary rounded-md hover:opacity-90 font-semibold transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    <span>New Project</span>
                </button>
            </div>

            {projects.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {projects.map(project => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            onOpen={handleOpenProject}
                            onRename={renameProject}
                            onDelete={deleteProject}
                        />
                    ))}
                </div>
            ) : (
                 <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-bg-surface h-full rounded-xl border-2 border-dashed border-border-base">
                    <FolderKanban className="w-16 h-16 text-text-dim mb-4" />
                    <h2 className="text-xl font-semibold text-text-base">No Projects Yet</h2>
                    <p className="text-text-muted mt-2 mb-4">Click "New Project" to get started.</p>
                </div>
            )}
        </div>
    );
};

export default ProjectsView;