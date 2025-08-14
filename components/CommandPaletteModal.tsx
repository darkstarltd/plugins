
import React, { useState, useEffect, useCallback } from 'react';
import { Command } from '../types';
import { SearchIcon } from './icons';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  commands: Command[];
}

const CommandPaletteModal: React.FC<CommandPaletteProps> = ({ isOpen, onClose, commands }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCommands, setFilteredCommands] = useState<Command[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      // Defer updating state to allow for modal open animation
      setTimeout(() => {
          setSearchTerm('');
          setSelectedIndex(0);
      }, 50);
    }
  }, [isOpen]);

  useEffect(() => {
      setFilteredCommands(commands);
  }, [commands]);

  useEffect(() => {
    const lowerCaseSearch = searchTerm.toLowerCase();
    setFilteredCommands(
      commands.filter(command => 
        command.label.toLowerCase().includes(lowerCaseSearch) || 
        command.section?.toLowerCase().includes(lowerCaseSearch)
      )
    );
    setSelectedIndex(0);
  }, [searchTerm, commands]);

  const handleCommandExecution = useCallback((command: Command) => {
    command.action();
    onClose();
  }, [onClose]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % (filteredCommands.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + (filteredCommands.length || 1)) % (filteredCommands.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        handleCommandExecution(filteredCommands[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  }, [isOpen, selectedIndex, filteredCommands, onClose, handleCommandExecution]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
  
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-start pt-[20vh] animate-fade-in" onClick={onClose}>
        <div 
            className="w-full max-w-2xl bg-bg-surface rounded-lg shadow-2xl border border-border-base animate-slide-up-fade"
            onClick={(e) => e.stopPropagation()}
        >
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-dim" />
            <input
              type="text"
              placeholder="Type a command or search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
              className="w-full bg-transparent text-lg pl-12 pr-4 py-4 focus:outline-none border-b border-border-base text-text-base"
            />
          </div>
          <div className="overflow-y-auto max-h-[40vh] p-2">
            {filteredCommands.length > 0 ? (
              <ul>
                {filteredCommands.map((command, index) => (
                  <li key={command.id}>
                    <button
                      id={`command-item-${index}`}
                      onClick={() => handleCommandExecution(command)}
                      onMouseMove={() => setSelectedIndex(index)}
                      className={`w-full text-left flex items-center justify-between space-x-3 p-3 rounded-md transition-colors ${
                        index === selectedIndex ? 'bg-primary/20 text-primary' : 'hover:bg-bg-inset text-text-muted'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <command.icon className="w-5 h-5" />
                        <span>{command.label}</span>
                      </div>
                      {command.section && <span className="text-xs bg-bg-inset px-2 py-0.5 rounded-full">{command.section}</span>}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-text-dim py-4">No commands found.</p>
            )}
          </div>
      </div>
    </div>
  );
};

export default CommandPaletteModal;
