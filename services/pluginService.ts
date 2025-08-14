
import type { Plugin, ExtensionContext, Command, SidebarViewContribution, DiagnosticProvider, Disposable, BottomPanelViewContribution } from '../types';
import { initializeApi } from '../plugin-api';

class PluginService {
    private plugins: Map<string, Plugin> = new Map();
    private activeContexts: Map<string, ExtensionContext> = new Map();

    // --- Contribution Registries ---
    private commands: Map<string, Command> = new Map();
    private sidebarViews: Map<string, SidebarViewContribution> = new Map();
    private diagnosticProviders: Set<DiagnosticProvider> = new Set();
    private bottomPanelViews: Map<string, BottomPanelViewContribution> = new Map();
    
    constructor() {
        this.initializeApiBridge();
    }

    private createDisposable(action: () => void): Disposable {
        return { dispose: action };
    }

    private initializeApiBridge() {
        initializeApi({
            registerCommand: (command: Omit<Command, 'section'>) => {
                const fullCommand: Command = { ...command, section: 'Plugin Commands' };
                this.commands.set(fullCommand.id, fullCommand);
                console.log(`[PluginService] Command registered: ${fullCommand.id}`);
                return this.createDisposable(() => {
                    this.commands.delete(fullCommand.id);
                    console.log(`[PluginService] Command unregistered: ${fullCommand.id}`);
                });
            },
            registerSidebarView: (view: SidebarViewContribution) => {
                this.sidebarViews.set(view.id, view);
                 console.log(`[PluginService] Sidebar View registered: ${view.id}`);
                return this.createDisposable(() => {
                    this.sidebarViews.delete(view.id);
                    console.log(`[PluginService] Sidebar View unregistered: ${view.id}`);
                });
            },
            registerDiagnosticProvider: (provider: DiagnosticProvider) => {
                this.diagnosticProviders.add(provider);
                console.log(`[PluginService] Diagnostic Provider registered.`);
                return this.createDisposable(() => {
                    this.diagnosticProviders.delete(provider);
                    console.log(`[PluginService] Diagnostic Provider unregistered.`);
                });
            },
            registerBottomPanelView: (view: BottomPanelViewContribution) => {
                this.bottomPanelViews.set(view.id, view);
                console.log(`[PluginService] Bottom Panel View registered: ${view.id}`);
                return this.createDisposable(() => {
                    this.bottomPanelViews.delete(view.id);
                    console.log(`[PluginService] Bottom Panel View unregistered: ${view.id}`);
                });
            }
        });
    }

    public registerPlugin(plugin: Plugin) {
        if (this.plugins.has(plugin.id)) {
            console.warn(`Plugin with ID "${plugin.id}" is already registered.`);
            return;
        }
        this.plugins.set(plugin.id, plugin);
        this.activatePlugin(plugin);
    }

    public activatePlugin(plugin: Plugin) {
        if (this.activeContexts.has(plugin.id)) {
            return; // Already active
        }
        try {
            const context: ExtensionContext = {
                subscriptions: [],
            };
            plugin.activate(context);
            this.activeContexts.set(plugin.id, context);
            console.log(`[PluginService] Plugin activated: ${plugin.name}`);
        } catch (error) {
            console.error(`[PluginService] Failed to activate plugin "${plugin.name}":`, error);
        }
    }

    public deactivateAll() {
        for (const [id, context] of this.activeContexts.entries()) {
            const plugin = this.plugins.get(id);
            try {
                // Dispose all subscriptions
                context.subscriptions.forEach(sub => sub.dispose());
                
                // Call deactivate function if it exists
                plugin?.deactivate?.();
                console.log(`[PluginService] Plugin deactivated: ${plugin?.name}`);
            } catch (error) {
                console.error(`[PluginService] Failed to deactivate plugin "${plugin?.name}":`, error);
            }
        }
        this.activeContexts.clear();
    }

    // --- Accessors for Contributions ---

    public getCommands(): Command[] {
        return Array.from(this.commands.values());
    }
    
    public getSidebarViews(): SidebarViewContribution[] {
        return Array.from(this.sidebarViews.values());
    }

    public getDiagnosticProviders(): DiagnosticProvider[] {
        return Array.from(this.diagnosticProviders);
    }

    public getBottomPanelViews(): BottomPanelViewContribution[] {
        return Array.from(this.bottomPanelViews.values());
    }

    public getPlugins(): Plugin[] {
        return Array.from(this.plugins.values());
    }
}

// Export a singleton instance
export const pluginService = new PluginService();