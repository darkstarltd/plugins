
import type { Plugin, ExtensionContext } from '../../types';
import { firefly } from '../../plugin-api';
import GitPluginView from './GitPluginView';
import { PullRequestsView } from './PullRequestsView';
import { SourceControlIcon, GitPullRequestIcon } from '../../components/icons';

const gitPlugin: Plugin = {
    id: 'firefly.git',
    name: 'Git Source Control',
    description: 'Provides Git source control and GitHub integration for FireFly IDE.',
    author: 'FireFly Team',
    version: '1.0.0',

    activate(context: ExtensionContext) {
        console.log('Git plugin activated!');

        // Register the Local Source Control View
        const sourceControlView = firefly.views.registerSidebarView({
            id: 'source-control',
            title: 'Source Control',
            icon: SourceControlIcon,
            component: GitPluginView,
        });
        context.subscriptions.push(sourceControlView);

        // Register the GitHub Pull Requests View
        const prView = firefly.views.registerSidebarView({
            id: 'pull-requests',
            title: 'Pull Requests',
            icon: GitPullRequestIcon,
            component: PullRequestsView
        });
        context.subscriptions.push(prView);

        // Register Commands (Example)
        const commitCommand = firefly.commands.registerCommand(
            'git.commit',
            'Git: Commit Staged Changes',
            SourceControlIcon,
            () => {
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