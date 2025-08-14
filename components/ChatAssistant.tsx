
import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../contexts/ChatContext';
import { Bot, Send, X, ChevronsRight, Sparkles } from 'lucide-react';
import { marked } from 'marked';
import type { ChatMessage } from '../types';

export const ChatAssistant: React.FC = () => {
    const { messages, isChatClosing, isLoading, closeChat, sendMessage, clearChat } = useChat();
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    const handleSendMessage = () => {
        if (input.trim()) {
            sendMessage(input);
            setInput('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };
    
    return (
        <div 
            className={`fixed top-0 right-0 h-full w-full max-w-lg bg-bg-surface border-l border-border-base shadow-2xl flex flex-col z-40 ${isChatClosing ? 'animate-slide-out-bottom' : 'animate-slide-in-right'}`}
        >
            <header className="flex items-center justify-between p-4 border-b border-border-base flex-shrink-0">
                <h2 className="text-xl font-bold text-text-base flex items-center">
                    <Bot className="w-6 h-6 mr-3 text-accent" />
                    Mona AI Assistant
                </h2>
                <div className="flex items-center gap-2">
                    <button onClick={clearChat} className="p-2 text-text-muted hover:text-text-base transition-colors" title="Clear Chat">
                        <X className="w-5 h-5" />
                    </button>
                    <button onClick={closeChat} className="p-2 text-text-muted hover:text-text-base transition-colors" title="Close Chat">
                        <ChevronsRight className="w-5 h-5" />
                    </button>
                </div>
            </header>

            <div className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-6">
                    {messages.map((msg, index) => (
                        <ChatMessageComponent key={index} message={msg} />
                    ))}
                    {isLoading && <LoadingIndicator />}
                </div>
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-border-base flex-shrink-0">
                <div className="relative">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask Mona anything..."
                        className="w-full bg-bg-inset border border-border-base rounded-lg p-3 pr-12 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                        rows={2}
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={isLoading || !input.trim()}
                        className="absolute right-2 bottom-2 p-2 rounded-lg bg-primary text-on-primary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Send Message"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

const ChatMessageComponent: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const isModel = message.role === 'model';
    const rawMarkup = marked.parse(message.text, { breaks: true, gfm: true });
    
    return (
        <div className={`flex items-start gap-3 ${isModel ? '' : 'justify-end'}`}>
            {isModel && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                </div>
            )}
            <div
                className={`prose prose-sm prose-invert max-w-full rounded-lg px-4 py-2 ${isModel ? 'bg-bg-inset' : 'bg-primary/80'}`}
                dangerouslySetInnerHTML={{ __html: rawMarkup as string}}
            />
        </div>
    );
};

const LoadingIndicator: React.FC = () => (
    <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div className="rounded-lg px-4 py-3 bg-bg-inset">
            <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-text-dim rounded-full animate-pulse delay-0"></span>
                <span className="w-2 h-2 bg-text-dim rounded-full animate-pulse delay-200"></span>
                <span className="w-2 h-2 bg-text-dim rounded-full animate-pulse delay-400"></span>
            </div>
        </div>
    </div>
);
