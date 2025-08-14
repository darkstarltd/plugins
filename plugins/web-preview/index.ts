
import type { Plugin, ExtensionContext } from '../../types';
import { firefly } from '../../plugin-api';
import WebPreviewPanel from './WebPreviewPanel';
import { Globe } from 'lucide-react';

const webPreviewPlugin: Plugin = {
    id: 'firefly.web-preview',
    name: 'Live Web Preview',
    description: 'Provides a live preview panel for HTML, CSS, and JS files.',
    author: 'FireFly Team',
    version: '1.0.0',

    activate(context: ExtensionContext) {
        console.log('Web Preview plugin activated!');

        const panelViewDisposable = firefly.panels.registerBottomPanelView({
            id: 'web-preview',
            title: 'Live Preview',
            icon: Globe,
            component: WebPreviewPanel,
        });
        context.subscriptions.push(panelViewDisposable);
    },

    deactivate() {
        console.log('Web Preview plugin deactivated!');
    }
};

export default webPreviewPlugin;