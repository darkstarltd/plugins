
import type { Plugin, ExtensionContext } from '../../types';
import { firefly } from '../../plugin-api';
import GitPluginView from './GitPluginView';
import { SourceControlIcon } from '../../components/icons';

const gitPlugin: Plugin = {
    id: 'firefly.git',
    name: 'Git Source Control',
    description: 'Provides Git source control integration for FireFly IDE.',
    author: 'FireFly Team',
    version: '1.0.0',

    activate(context: ExtensionContext) {
        console.log('Git plugin activated!');

        // Register the Sidebar View
        const sidebarViewDisposable = firefly.views.registerSidebarView({
            id: 'source-control',
            title: 'Source Control',
            icon: SourceControlIcon,
            component: GitPluginView,
        });
        context.subscriptions.push(sidebarViewDisposable);

        // Register Commands (Example)
        // In a real app, these commands would open specific UI or perform git actions
        const commitCommand = firefly.commands.registerCommand(
            'git.commit',
            'Git: Commit Staged Changes',
            SourceControlIcon,
            () => {
                // This would be wired to the commit function from the view
                console.log('Commit command triggered!');
            }
        );
        context.subscriptions.push(commitCommand);
    },

    deactivate() {
        console.log('Git plugin deactivated!');
    }
};

export default gitPlugin;
