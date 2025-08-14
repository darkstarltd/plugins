
import React from 'react';
import { FilesIcon, SearchIcon, LockIcon, SettingsIcon, ExtensionIcon } from './icons';
import Tooltip from './Tooltip';
import { SidebarView } from '../types';
import { usePlugin } from '../contexts/PluginContext';

interface ActivityBarProps {
  activeView: SidebarView;
  onViewChange: (view: SidebarView) => void;
  onFirePassClick: () => void;
  onSettingsClick: () => void;
  onPluginsClick: () => void;
}

const ActivityBarButton: React.FC<{
  label: string;
  icon: React.ElementType;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon: Icon, isActive, onClick }) => (
  <Tooltip text={label}>
    <button
      onClick={onClick}
      className={`relative flex items-center justify-center w-full p-3 transition-colors ${
        isActive ? 'text-[var(--color-text-bright)]' : 'text-[var(--color-text-dim)] hover:text-[var(--color-text-bright)]'
      }`}
      aria-label={label}
    >
      <Icon className="w-6 h-6" />
      {isActive && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--color-accent)] rounded-r-full"></div>
      )}
    </button>
  </Tooltip>
);

const ActivityBar: React.FC<ActivityBarProps> = ({ activeView, onViewChange, onFirePassClick, onSettingsClick, onPluginsClick }) => {
  const { getSidebarViews } = usePlugin();
  const pluginViews = getSidebarViews();

  // Define core views separately or check if they are registered by a core plugin
  const coreViews = [
    { id: 'explorer', label: 'Explorer', icon: FilesIcon },
    { id: 'search', label: 'Search', icon: SearchIcon },
  ];

  const allViews = [...coreViews, ...pluginViews.map(v => ({id: v.id, label: v.title, icon: v.icon}))];


  return (
    <div className="w-[52px] h-full bg-[var(--color-bg-secondary)] border-r border-[var(--color-border-primary)] flex flex-col justify-between items-center py-2 flex-shrink-0">
      <div className="w-full">
        {allViews.map(view => (
           <ActivityBarButton
              key={view.id}
              label={view.label}
              icon={view.icon}
              isActive={activeView === view.id}
              onClick={() => onViewChange(view.id)}
            />
        ))}
        <ActivityBarButton
          label="Plugins"
          icon={ExtensionIcon}
          isActive={false}
          onClick={onPluginsClick}
        />
      </div>
      <div className="w-full">
        <ActivityBarButton
          label="FirePass Vault"
          icon={LockIcon}
          isActive={false}
          onClick={onFirePassClick}
        />
        <ActivityBarButton
          label="Settings"
          icon={SettingsIcon}
          isActive={false}
          onClick={onSettingsClick}
        />
      </div>
    </div>
  );
};

export default ActivityBar;