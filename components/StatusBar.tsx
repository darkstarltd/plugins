
import React from 'react';
import { MonaIcon, CommandIcon } from './icons';
import { useEditor } from '../contexts/EditorContext';
import { useCommand } from '../contexts/CommandContext';
import { useChat } from '../contexts/ChatContext';


const StatusBar: React.FC = () => {
    const { cursorPosition } = useEditor();
    const { togglePalette } = useCommand();
    const { openChat } = useChat();

    return (
        <footer className="bg-gray-900 border-t border-white/10 px-4 py-1 flex items-center justify-between text-sm text-gray-400 h-6 shrink-0">
            <div className="flex items-center gap-4">
                <button onClick={openChat} title="Mona AI Assistant" className="flex items-center gap-1 hover:text-white">
                    <MonaIcon className="w-4 h-4" />
                    <span>Mona</span>
                </button>
            </div>
            <div className="flex items-center gap-4">
                <span>Ln {cursorPosition.line}, Col {cursorPosition.col}</span>
                <span>Spaces: 2</span>
                <span>UTF-8</span>
                 <button title="Command Palette (Ctrl+K)" onClick={togglePalette} className="flex items-center gap-1 hover:text-white">
                     <CommandIcon className="w-4 h-4" />
                     <span>Commands</span>
                 </button>
            </div>
        </footer>
    );
};

export default StatusBar;
