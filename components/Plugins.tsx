
import React from 'react';
import { usePlugin } from '../contexts/PluginContext';
import { SparklesIcon, GitPullRequestIcon, TerminalIcon } from './icons'; // Assuming you might want specific icons
import { Puzzle } from 'lucide-react';
import type { Plugin } from '../types';

const getPluginIcon = (pluginId: string): React.FC<{className?:string}> => {
    if(pluginId.includes('git')) return GitPullRequestIcon;
    if(pluginId.includes('markdown')) return SparklesIcon;
    return Puzzle;
};

const PluginCard: React.FC<{ plugin: Plugin }> = ({ plugin }) => {
    const Icon = getPluginIcon(plugin.id);
    const isEnabled = true; // In a real app, this would come from settings

    return (
        <div className="bg-bg-surface border border-border-base rounded-lg p-4 flex flex-col">
            <div className="flex items-start gap-4">
                <div className="p-2 bg-bg-inset rounded-md">
                    <Icon className="w-6 h-6 text-accent" />
                </div>
                <div>
                    <h3 className="font-bold text-text-base">{plugin.name}</h3>
                    <p className="text-xs text-text-dim">v{plugin.version} by {plugin.author}</p>
                </div>
            </div>
            <p className="text-sm text-text-muted my-3 flex-grow">{plugin.description}</p>
            <div className="flex items-center justify-between mt-2">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isEnabled ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'}`}>
                    {isEnabled ? 'Enabled' : 'Disabled'}
                </span>
                {/* Add enable/disable toggle here if needed */}
            </div>
        </div>
    );
};

const Plugins: React.FC = () => {
    const { getPlugins } = usePlugin();
    const allPlugins = getPlugins();

    return (
        <div className="flex-1 p-4 md:p-8 overflow-y-auto bg-bg-base">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-text-base mb-2">Plugins</h1>
                <p className="text-text-muted">Extend the functionality of FireFly with powerful plugins.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allPlugins.map(plugin => (
                    <PluginCard key={plugin.id} plugin={plugin} />
                ))}
            </div>
        </div>
    );
};

export default Plugins;
