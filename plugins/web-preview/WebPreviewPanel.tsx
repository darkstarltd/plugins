
import React, { useState, useMemo, useEffect } from 'react';
import { useProject } from '../../contexts/ProjectContext';
import { FileSystemNode, WebViewCode } from '../../types';
import { Sparkles, X } from 'lucide-react';
import { generateWebCode } from '../../services/geminiService';
import { useToast } from '../../components/Toast';

const findFileByName = (nodes: FileSystemNode[], name: string): FileSystemNode | null => {
    for (const node of nodes) {
        if (node.type === 'file' && node.name === name) {
            return node;
        }
        if (node.type === 'folder' && node.children) {
            const found = findFileByName(node.children, name);
            if (found) return found;
        }
    }
    return null;
};

const AIGenerateModal: React.FC<{
    onClose: () => void;
    onApply: (code: WebViewCode) => void;
}> = ({ onClose, onApply }) => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setIsLoading(true);
        const result = await generateWebCode(prompt);
        if (result) {
            onApply(result);
        } else {
            toast.showToast('Failed to generate web component.', 'error');
        }
        setIsLoading(false);
    };

    return (
         <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60" onClick={onClose}>
            <div
                className="bg-bg-surface w-full max-w-lg rounded-xl border border-border-base shadow-2xl p-6 flex flex-col animate-scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold">Generate Web Component</h2>
                    <button onClick={onClose}><X className="w-5 h-5"/></button>
                </div>
                 <textarea
                    rows={3}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., A login form with email, password, and a submit button"
                    className="w-full bg-bg-inset border border-border-base rounded-lg p-2 text-sm"
                    disabled={isLoading}
                />
                <button
                    onClick={handleGenerate}
                    disabled={isLoading || !prompt.trim()}
                    className="mt-4 w-full px-4 py-2 bg-primary text-on-primary rounded-md font-semibold disabled:opacity-50"
                >
                    {isLoading ? 'Generating...' : 'Generate'}
                </button>
            </div>
        </div>
    )
};

const WebPreviewPanel: React.FC = () => {
    const { activeProject, setProjectFileSystem } = useProject();
    const [srcDoc, setSrcDoc] = useState('');
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);
    const toast = useToast();

    const fileSystem = useMemo(() => activeProject?.branches?.[activeProject.currentBranch || ''] || [], [activeProject]);
    
    useEffect(() => {
        const htmlFile = findFileByName(fileSystem, 'index.html');
        const cssFile = findFileByName(fileSystem, 'style.css');
        const jsFile = findFileByName(fileSystem, 'script.js');
        
        const html = htmlFile?.content || '';
        const css = cssFile?.content || '';
        const js = jsFile?.content || '';

        const timeout = setTimeout(() => {
            setSrcDoc(`
                <html>
                    <head>
                        <style>${css}</style>
                    </head>
                    <body>
                        ${html}
                        <script>${js}</script>
                    </body>
                </html>
            `);
        }, 300);

        return () => clearTimeout(timeout);
    }, [fileSystem]);
    
    const handleApplyAIGeneration = (code: WebViewCode) => {
        setProjectFileSystem(draft => {
            const htmlFile = findFileByName(draft, 'index.html');
            if (htmlFile) htmlFile.content = code.html;

            const cssFile = findFileByName(draft, 'style.css');
            if (cssFile) cssFile.content = code.css;
            
            const jsFile = findFileByName(draft, 'script.js');
            if (jsFile) jsFile.content = code.js;
        });
        setIsAIModalOpen(false);
        toast.showToast("AI-generated code applied to files!", "success");
    };

    if (!activeProject) {
        return <div className="p-4 text-sm text-text-dim">Open a project to use the web preview.</div>;
    }

    return (
        <div className="h-full flex flex-col relative">
            <div className="p-2 border-b border-border-base flex-shrink-0 flex items-center justify-between">
                <h3 className="text-sm font-semibold">Live Preview</h3>
                <button 
                    onClick={() => setIsAIModalOpen(true)}
                    className="flex items-center gap-1.5 text-sm px-2 py-1 bg-accent/20 text-accent rounded-md hover:bg-accent/30"
                >
                    <Sparkles className="w-4 h-4" />
                    AI Generate
                </button>
            </div>
            <iframe
                srcDoc={srcDoc}
                title="web-preview"
                className="w-full h-full flex-grow bg-white"
                sandbox="allow-scripts allow-same-origin"
            />
            {isAIModalOpen && (
                <AIGenerateModal
                    onClose={() => setIsAIModalOpen(false)}
                    onApply={handleApplyAIGeneration}
                />
            )}
        </div>
    );
};

export default WebPreviewPanel;