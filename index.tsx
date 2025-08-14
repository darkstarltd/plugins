
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ToastProvider } from './components/Toast';
import { SettingsProvider } from './contexts/SettingsContext';
import { AuthProvider } from './contexts/AuthContext';
import { ProjectProvider } from './contexts/ProjectContext';
import { LayoutProvider } from './contexts/LayoutContext';
import { EditorProvider } from './contexts/EditorContext';
import { CommandProvider } from './contexts/CommandContext';
import { ChatProvider } from './contexts/ChatContext';
import { FirePassProvider } from './contexts/FirePassContext';
import { CollaborationProvider } from './contexts/CollaborationContext';
import { PluginProvider } from './contexts/PluginContext';
import { GitHubProvider } from './contexts/GitHubContext';

// Import Plugins
import gitPlugin from './plugins/git';
import markdownLinterPlugin from './plugins/markdown-linter';


const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <SettingsProvider>
      <AuthProvider>
        <FirePassProvider>
          <ProjectProvider>
            <LayoutProvider>
              <EditorProvider>
                <CommandProvider>
                  <ChatProvider>
                    <CollaborationProvider>
                      <PluginProvider plugins={[gitPlugin, markdownLinterPlugin]}>
                        <GitHubProvider>
                          <ToastProvider>
                            <App />
                          </ToastProvider>
                        </GitHubProvider>
                      </PluginProvider>
                    </CollaborationProvider>
                  </ChatProvider>
                </CommandProvider>
              </EditorProvider>
            </LayoutProvider>
          </ProjectProvider>
        </FirePassProvider>
      </AuthProvider>
    </SettingsProvider>
  </React.StrictMode>
);