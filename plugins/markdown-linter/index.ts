


import type { Plugin, ExtensionContext, TextDocument, Diagnostic, DiagnosticSeverity } from '../../types';
import { firefly } from '../../plugin-api';
import * as geminiService from '../../services/geminiService';

const markdownLinterPlugin: Plugin = {
    id: 'firefly.markdown-linter',
    name: 'AI Markdown Linter',
    description: 'Provides AI-powered linting for Markdown files.',
    author: 'FireFly Team',
    version: '1.0.0',

    activate(context: ExtensionContext) {
        console.log('Markdown Linter plugin activated!');

        const diagnosticProvider = {
            async provideDiagnostics(document: TextDocument): Promise<Diagnostic[] | undefined> {
                if (document.languageId !== 'md') {
                    return; // Only lint markdown files
                }

                const code = document.getText();
                const issues = await geminiService.lintMarkdown(code);
                
                const lines = code.split('\n');
                
                return issues.map(issue => {
                    const lineIndex = issue.line - 1;
                    if (lineIndex < 0 || lineIndex >= lines.length) return null;
                    
                    const lineText = lines[lineIndex];
                    const startChar = code.indexOf(lineText);
                    
                    return {
                        id: `md-lint-${document.uri}-${issue.line}`,
                        start: startChar,
                        end: startChar + lineText.length,
                        message: issue.message,
                        severity: issue.severity as DiagnosticSeverity,
                        source: 'Mona Linter',
                        quickFixTitle: issue.quickFixTitle,
                        replacementCode: issue.replacementCode,
                    };
                }).filter(d => d !== null);
            }
        };

        const disposable = firefly.languages.registerDiagnosticProvider(diagnosticProvider);
        context.subscriptions.push(disposable);
    },

    deactivate() {
        console.log('Markdown Linter plugin deactivated!');
    }
};

export default markdownLinterPlugin;