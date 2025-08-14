
// This file defines the public API that plugins can use.
// It acts as a facade, decoupling plugins from the internal implementation of the IDE.

import type { Command, Disposable, SidebarViewContribution, DiagnosticProvider, BottomPanelViewContribution } from './types';

// --- API Methods ---
let registerCommand: (command: Omit<Command, 'section'>) => Disposable;
let registerSidebarView: (view: SidebarViewContribution) => Disposable;
let registerDiagnosticProvider: (provider: DiagnosticProvider) => Disposable;
let registerBottomPanelView: (view: BottomPanelViewContribution) => Disposable;

// This function is called by the core application to wire up the API.
export function initializeApi(methods: {
    registerCommand: (command: Omit<Command, 'section'>) => Disposable,
    registerSidebarView: (view: SidebarViewContribution) => Disposable,
    registerDiagnosticProvider: (provider: DiagnosticProvider) => Disposable,
    registerBottomPanelView: (view: BottomPanelViewContribution) => Disposable,
}) {
    registerCommand = methods.registerCommand;
    registerSidebarView = methods.registerSidebarView;
    registerDiagnosticProvider = methods.registerDiagnosticProvider;
    registerBottomPanelView = methods.registerBottomPanelView;
}

// The actual `firefly` object that plugins will import/use.
export const firefly = {
    /**
     * Namespace for command-related APIs.
     */
    commands: {
        /**
         * Registers a command that can be invoked by the user.
         * @param id A unique identifier for the command.
         * @param action The function to execute when the command is run.
         * @returns A `Disposable` that will unregister the command upon disposal.
         */
        registerCommand(id: string, label: string, icon: React.ElementType, action: (...args: any[]) => void): Disposable {
            return registerCommand({ id, label, icon, action });
        },
    },

    /**
     * Namespace for UI-related APIs.
     */
    window: {
        // In a real app, you'd have showInformationMessage, createStatusBarItem, etc.
    },

    /**
     * Namespace for language feature-related APIs.
     */
    languages: {
        /**
         * Registers a diagnostics provider.
         * @param provider A diagnostics provider.
         * @returns A `Disposable` that will unregister the provider upon disposal.
         */
        registerDiagnosticProvider(provider: DiagnosticProvider): Disposable {
            return registerDiagnosticProvider(provider);
        },
    },

    /**
     * Namespace for view-related APIs.
     */
    views: {
        /**
         * Registers a custom view in the sidebar.
         * @param view The view contribution to register.
         * @returns A `Disposable` that will unregister the view upon disposal.
         */
        registerSidebarView(view: SidebarViewContribution): Disposable {
            return registerSidebarView(view);
        },
    },
    
    /**
     * Namespace for panel-related APIs.
     */
    panels: {
        /**
         * Registers a custom view in the bottom panel.
         * @param view The view contribution to register.
         * @returns A `Disposable` that will unregister the view upon disposal.
         */
        registerBottomPanelView(view: BottomPanelViewContribution): Disposable {
            return registerBottomPanelView(view);
        },
    }
};

// Freeze the object to prevent plugins from modifying the API surface.
Object.freeze(firefly);
Object.freeze(firefly.commands);
Object.freeze(firefly.window);
Object.freeze(firefly.languages);
Object.freeze(firefly.views);
Object.freeze(firefly.panels);