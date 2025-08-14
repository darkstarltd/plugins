
import React, { useState } from 'react';
import { Project } from '../types';
import { BriefcaseIcon, ChevronDownIcon, PlusIcon, TrashIcon } from './icons';

interface ProjectSwitcherProps {
  projects: Project[];
  activeProject: Project;
  onSwitchProject: (projectId: string) => void;
  onCreateProject: (name: string) => void;
  onDeleteProject: (projectId: string) => void;
}

const ProjectSwitcher: React.FC<ProjectSwitcherProps> = ({ projects, activeProject, onSwitchProject, onCreateProject, onDeleteProject }) => {

  const handleCreate = () => {
    const name = prompt("Enter new project name:");
    if (name) {
      onCreateProject(name);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (window.confirm(`Are you sure you want to delete "${activeProject.name}"? This cannot be undone.`)) {
          onDeleteProject(activeProject.id);
      }
  };

  return (
    <div className="dropdown">
      <button className="flex items-center gap-2 px-3 py-1.5 bg-[var(--color-bg-secondary)] rounded-lg hover:bg-[var(--color-bg-tertiary)] transition-colors border border-[var(--color-border-primary)]">
        <BriefcaseIcon className="w-5 h-5 text-[var(--color-accent-text)]" />
        <span className="font-semibold text-[var(--color-text-bright)]">{activeProject.name}</span>
        <ChevronDownIcon className="w-4 h-4 text-[var(--color-text-dim)]" />
      </button>
      <div className="dropdown-content">
        <div className="text-xs font-semibold text-[var(--color-text-dim)] px-2 py-1">SWITCH PROJECT</div>
        {projects.map(project => (
          <a
            key={project.id}
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onSwitchProject(project.id);
            }}
            className={`block px-3 py-1.5 text-sm rounded-md ${project.id === activeProject.id ? 'bg-[var(--color-accent-subtle-bg)] text-[var(--color-accent-text)]' : 'text-[var(--color-text-base)] hover:bg-[var(--color-bg-tertiary)]'}`}
          >
            {project.name}
          </a>
        ))}
        <hr className="my-1 border-[var(--color-border-primary)]" />
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); handleCreate(); }}
          className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md text-[var(--color-text-base)] hover:bg-[var(--color-bg-tertiary)]"
        >
            <PlusIcon className="w-4 h-4"/> New Project
        </a>
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); handleDelete(e); }}
          className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md text-red-400 hover:bg-red-500/20"
        >
            <TrashIcon className="w-4 h-4"/> Delete Current Project
        </a>
      </div>
    </div>
  );
};

export default ProjectSwitcher;
