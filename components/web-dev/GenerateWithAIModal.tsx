

import React, { useState } from 'react';
import { Bot, X, Sparkles, Check } from 'lucide-react';
import type { WebViewCode } from '../../types';
import { SyntaxHighlighter } from '../common/SyntaxHighlighter';

interface GenerateWithAIModalProps {
    onClose: () => void;
    onGenerate: (prompt: string) => Promise<WebViewCode | null>;
    onApply: (code: WebViewCode) => void;
}

type PreviewTab = 'html' | 'css' | 'js';

export const GenerateWithAIModal: React.FC<GenerateWithAIModalProps> = ({ onClose, onGenerate, onApply }) => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [generatedCode, setGeneratedCode] = useState<WebViewCode | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<PreviewTab>('html');

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setIsLoading(true);
        setError(null);
        setGeneratedCode(null);

        const result = await onGenerate(prompt);
        if (result) {
            setGeneratedCode(result);
        } else {
            setError('Failed to generate code. Please try again.');
        }
        setIsLoading(false);
    };

    const handleApply = () => {
        if (generatedCode) {
            onApply(generatedCode);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-fade-in" onClick={onClose}>
            <div
                className="bg-bg-surface w-full max-w-4xl h-[90vh] rounded-xl border border-border-base shadow-2xl p-6 flex flex-col animate-scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-4 shrink-0">
                    <h2 className="text-2xl font-bold text-text-base flex items-center">
                        <Sparkles className="w-6 h-6 mr-3 text-accent" /> Generate with AI
                    </h2>
                    <button onClick={onClose} className="p-1 rounded-full text-text-muted hover:bg-bg-inset hover:text-text-base">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 flex flex-col min-h-0">
                    <div className="mb-4 shrink-0">
                        <label htmlFor="ai-prompt" className="block text-sm font-medium text-text-muted mb-1">Prompt</label>
                        <div className="flex space-x-2">
                            <textarea
                                id="ai-prompt"
                                rows={2}
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="e.g., A responsive card with an image, title, and a call-to-action button"
                                className="flex-1 w-full bg-bg-inset border border-border-base rounded-lg px-3 py-2 text-sm text-text-base placeholder-text-dim focus:ring-2 focus:ring-primary focus:outline-none resize-none"
                                disabled={isLoading}
                            />
                            <button
                                onClick={handleGenerate}
                                disabled={isLoading || !prompt.trim()}
                                className="px-4 py-2 bg-primary text-on-primary rounded-md hover:opacity-90 font-semibold transition-colors disabled:opacity-50 flex items-center justify-center"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <Bot className="w-5 h-5"/>
                                )}
                            </button>
                        </div>
                    </div>
                    
                    <div className="flex-1 bg-bg-inset rounded-lg overflow-hidden flex flex-col">
                        {isLoading && (
                             <div className="flex flex-col items-center justify-center h-full text-center text-text-muted">
                                <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                                <p className="mt-4 text-sm">Generating... this may take a moment.</p>
                            </div>
                        )}
                        {error && (
                             <div className="flex flex-col items-center justify-center h-full text-center text-red-400">
                                <p>{error}</p>
                            </div>
                        )}
                        {generatedCode && (
                            <>
                                <div className="flex border-b border-border-base px-2 shrink-0">
                                    {(['html', 'css', 'js'] as PreviewTab[]).map(tab => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`px-4 py-2.5 text-sm font-medium border-b-2 ${activeTab === tab ? 'text-primary border-primary' : 'text-text-muted border-transparent hover:text-text-base'}`}
                                        >
                                            {tab.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex-1 overflow-auto">
                                    <SyntaxHighlighter code={generatedCode[activeTab]} language={activeTab === 'js' ? 'javascript' : activeTab} />
                                </div>
                            </>
                        )}
                        {!isLoading && !error && !generatedCode && (
                            <div className="flex flex-col items-center justify-center h-full text-center text-text-dim">
                                <p>Enter a prompt and click Generate to see results.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-4 flex justify-end space-x-2 shrink-0">
                    <button onClick={onClose} className="px-4 py-2 bg-bg-inset text-text-base rounded-md hover:bg-border-base font-semibold">Cancel</button>
                    <button
                        onClick={handleApply}
                        disabled={!generatedCode}
                        className="px-4 py-2 bg-accent text-on-accent rounded-md hover:opacity-90 font-semibold transition-colors disabled:opacity-50 flex items-center space-x-2"
                    >
                        <Check className="w-5 h-5"/>
                        <span>Apply to Editor</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
