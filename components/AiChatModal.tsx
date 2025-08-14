
import React, { useState, useEffect, useRef } from 'react';
import Modal from './Modal';
import * as geminiService from '../services/geminiService';
import type { Chat } from '@google/genai';
import { ChatMessage } from '../types';
import { MonaIcon, SendIcon, FileCodeIcon } from './icons';
import { marked } from 'marked';

interface AiChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatSession: Chat | null;
  activeFileContent: string;
  activeFileName: string;
  initialPrompt?: string;
}

const AiChatModal: React.FC<AiChatModalProps> = ({ isOpen, onClose, chatSession, activeFileContent, activeFileName, initialPrompt }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [includeContext, setIncludeContext] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialPrompt) {
        setMessages([]);
        setInput(initialPrompt);
      } else if (messages.length === 0) {
        setMessages([{ role: 'model', text: "Hi! I'm Mona. How can I help you with your code today?" }]);
      }
    } else {
      setInput('');
      setIncludeContext(false);
    }
  }, [isOpen, initialPrompt]);


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (messageToSend?: string) => {
    const currentInput = messageToSend || input;
    if (!currentInput.trim() || !chatSession) return;
    
    let finalMessage = currentInput;
    if (includeContext) {
        finalMessage = `Here is the content of the file \`${activeFileName}\` for context:\n\n\`\`\`\n${activeFileContent}\n\`\`\`\n\nMy question is: ${currentInput}`;
        setIncludeContext(false);
    }

    const userMessage: ChatMessage = { role: 'user', text: currentInput };
    setMessages(prev => [...prev, userMessage, { role: 'model', text: '' }]);
    setInput('');
    setIsLoading(true);

    try {
      const stream = await geminiService.sendMessageStream(chatSession, finalMessage);
      for await (const chunk of stream) {
        const chunkText = chunk.text;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].text += chunkText;
          return newMessages;
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1].text = `Sorry, I encountered an error: ${errorMessage}`;
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const Message: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const isModel = message.role === 'model';
    const rawMarkup = marked.parse(message.text, { breaks: true, gfm: true });
    
    return (
      <div className={`flex items-start gap-3 my-4 ${isModel ? '' : 'flex-row-reverse'}`}>
        {isModel && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center"><MonaIcon className="w-5 h-5 text-white" /></div>}
        <div className={`p-3 rounded-lg max-w-[80%] ${isModel ? 'bg-gray-700' : 'bg-orange-600'}`}>
          <div className="prose prose-sm prose-invert" dangerouslySetInnerHTML={{ __html: rawMarkup as string}}></div>
        </div>
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Mona: AI Chat" size="3xl">
      <div className="flex flex-col h-full">
        <div className="flex-grow overflow-y-auto pr-4 -mr-4">
          {messages.map((msg, index) => <Message key={index} message={msg} />)}
          {isLoading && messages[messages.length-1]?.text === '' && (
            <div className="flex items-start gap-3 my-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center"><MonaIcon className="w-5 h-5 text-white" /></div>
              <div className="p-3 rounded-lg bg-gray-700">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse delay-0"></span>
                    <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse delay-200"></span>
                    <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse delay-400"></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="mt-4 border-t border-gray-700 pt-4">
             <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                <input
                    type="checkbox"
                    id="include-context"
                    checked={includeContext}
                    onChange={(e) => setIncludeContext(e.target.checked)}
                    className="w-4 h-4 rounded text-orange-600 bg-gray-800 border-gray-600 focus:ring-orange-500 cursor-pointer"
                />
                <label htmlFor="include-context" className="cursor-pointer">
                    Include context from <span className="font-semibold text-orange-400">{activeFileName}</span> for next message
                </label>
            </div>
            <div className="flex items-center gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
                    placeholder="Ask Mona to refactor, explain, or generate code..."
                    className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    disabled={isLoading}
                />
                <button onClick={() => handleSendMessage()} disabled={isLoading} className="p-2 bg-orange-600 rounded-lg hover:bg-orange-500 disabled:bg-gray-600 disabled:cursor-not-allowed">
                    <SendIcon className="w-5 h-5 text-white" />
                </button>
            </div>
        </div>
      </div>
    </Modal>
  );
};

export default AiChatModal;
