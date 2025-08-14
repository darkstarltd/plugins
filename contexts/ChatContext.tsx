
import React, { createContext, useCallback, useContext, ReactNode, useRef } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { GoogleGenAI, Chat } from '@google/genai';
import type { ChatMessage, ChatContextType } from '../types';

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const initialMessages: ChatMessage[] = [
    { role: 'model', text: 'Hello! I am Mona, your AI assistant. How can I help you with your code today?' }
];

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [messages, setMessages] = useLocalStorage<ChatMessage[]>('firefly_chat_history', initialMessages);
    const [isChatOpen, setIsChatOpen] = React.useState(false);
    const [isChatClosing, setIsChatClosing] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const chatRef = useRef<Chat | null>(null);

    const initializeChat = useCallback(() => {
        if (chatRef.current) return chatRef.current;
       
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        chatRef.current = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: "You are Mona, a helpful and friendly AI coding assistant integrated into the FireFly IDE. You can help users understand code, debug issues, suggest improvements, and explain complex topics. Keep your answers concise and clear. Use markdown for code blocks and formatting.",
            }
        });
        return chatRef.current;
    }, []);

    const openChat = useCallback(() => {
        setIsChatClosing(false);
        setIsChatOpen(true);
    }, []);

    const closeChat = useCallback(() => {
        setIsChatClosing(true);
        setTimeout(() => {
            setIsChatOpen(false);
        }, 300); // Corresponds to slide-out animation
    }, []);

    const clearChat = useCallback(() => {
        setMessages(initialMessages);
        chatRef.current = null; // Reset chat session
    }, [setMessages]);

    const sendMessage = useCallback(async (message: string) => {
        if (!message.trim()) return;

        const userMessage: ChatMessage = { role: 'user', text: message };
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            const chatSession = initializeChat();
            const response = await chatSession.sendMessage({ message });
            const modelMessage: ChatMessage = { role: 'model', text: response.text };
            setMessages(prev => [...prev, modelMessage]);
        } catch (e) {
            console.error("Error generating chat response with Gemini:", e);
            const errorMessage: ChatMessage = { role: 'model', text: "Sorry, I encountered an error while trying to respond." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    }, [initializeChat, setMessages]);
    
    const startConversationWith = useCallback((prompt: string) => {
        openChat();
        clearChat();
        // Use a timeout to ensure the chat is open and cleared before sending the message
        setTimeout(() => {
            sendMessage(prompt);
        }, 100);
    }, [openChat, clearChat, sendMessage]);

    const value = {
        messages,
        isChatOpen,
        isChatClosing,
        isLoading,
        openChat,
        closeChat,
        sendMessage,
        clearChat,
        startConversationWith,
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = (): ChatContextType => {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
};