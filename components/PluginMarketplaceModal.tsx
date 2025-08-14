import React from 'react';
import Modal from './Modal';
import { useSettings } from '../contexts/SettingsContext';
import { GitPullRequestIcon, SparklesIcon, TerminalIcon } from './icons';

interface PluginMarketplaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const mockPlugins = [
  {
    id: 'prettier',
    name: 'Prettier - Code formatter',
    description: 'An opinionated code formatter. It enforces a consistent style by parsing your code and re-printing it.',
    icon: SparklesIcon,
  },
  {
    id: 'gitlens',
    name: 'GitLens — Git supercharged',
    description: 'Supercharge the Git capabilities built into FirePlay. Visualize code authorship at a glance via Git blame annotations.',
    icon: GitPullRequestIcon,
  },
  {
    id: 'liveServer',
    name: 'Live Server',
    description: 'Launch a development local Server with live reload feature for static & dynamic pages.',
    icon: TerminalIcon,
  },
];

const ToggleSwitch: React.FC<{ checked: boolean; onChange: (checked: boolean) => void; }> = ({ checked, onChange }) => (
    <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" />
        <div className="w-11 h-6 bg-[var(--color-bg-tertiary)] rounded-full peer peer-focus:ring-2 peer-focus:ring-[var(--color-accent-ring)] peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-accent)]"></div>
    </label>
);


const PluginMarketplaceModal: React.FC<PluginMarketplaceModalProps> = ({ isOpen, onClose }) => {
    const { settings, setSettings } = useSettings();

    const handleTogglePlugin = (pluginId: string, enabled: boolean) => {
        setSettings(prev => ({
            ...prev,
            plugins: {
                ...prev.plugins,
                [pluginId]: enabled,
            }
        }));
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Plugin Marketplace" size="3xl">
            <div className="space-y-4">
                {mockPlugins.map(plugin => {
                    const Icon = plugin.icon;
                    const isEnabled = settings.plugins[plugin.id] ?? false;
                    return (
                        <div key={plugin.id} className="flex items-center justify-between p-4 bg-[var(--color-bg-secondary)] rounded-lg border border-[var(--color-border-primary)]">
                            <div className="flex items-center gap-4">
                                <Icon className="w-8 h-8 text-[var(--color-accent)] flex-shrink-0" />
                                <div>
                                    <h4 className="font-semibold text-[var(--color-text-bright)]">{plugin.name}</h4>
                                    <p className="text-sm text-[var(--color-text-dim)]">{plugin.description}</p>
                                </div>
                            </div>
                            <ToggleSwitch checked={isEnabled} onChange={(checked) => handleTogglePlugin(plugin.id, checked)} />
                        </div>
                    );
                })}
            </div>
        </Modal>
    );
};

export default PluginMarketplaceModal;