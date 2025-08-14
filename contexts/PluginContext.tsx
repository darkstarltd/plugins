import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { pluginService } from '../services/pluginService';
import type { Plugin, BottomPanelViewContribution } from '../types';

interface PluginContextType {
    getCommands: () => ReturnType<typeof pluginService.getCommands>;
    getSidebarViews: () => ReturnType<typeof pluginService.getSidebarViews>;
    getDiagnosticProviders: () => ReturnType<typeof pluginService.getDiagnosticProviders>;
    getPlugins: () => ReturnType<typeof pluginService.getPlugins>;
    getBottomPanelViews: () => BottomPanelViewContribution[];
}

const PluginContext = createContext<PluginContextType | undefined>(undefined);

export const PluginProvider: React.FC<{ children: ReactNode, plugins: Plugin[] }> = ({ children, plugins }) => {
    
    useEffect(() => {
        // Register all plugins on mount
        plugins.forEach(plugin => pluginService.registerPlugin(plugin));
        
        // Deactivate all plugins on unmount
        return () => {
            pluginService.deactivateAll();
        };
    }, [plugins]);

    const value = {
        getCommands: pluginService.getCommands.bind(pluginService),
        getSidebarViews: pluginService.getSidebarViews.bind(pluginService),
        getDiagnosticProviders: pluginService.getDiagnosticProviders.bind(pluginService),
        getPlugins: pluginService.getPlugins.bind(pluginService),
        getBottomPanelViews: pluginService.getBottomPanelViews.bind(pluginService),
    };

    return (
        <PluginContext.Provider value={value}>
            {children}
        </PluginContext.Provider>
    );
};

export const usePlugin = (): PluginContextType => {
    const context = useContext(PluginContext);
    if (context === undefined) {
        throw new Error('usePlugin must be used within a PluginProvider');
    }
    return context;
};