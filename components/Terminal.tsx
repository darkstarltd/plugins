
import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { FileSystemNode } from '../types';
import { FolderIcon, FileCodeIcon } from './icons';
import { produce } from 'immer';
import { useSettings } from '../contexts/SettingsContext';

interface TerminalProps {
    fileSystem: FileSystemNode[];
    onUpdateFileSystem: (updater: (draft: FileSystemNode[]) => void) => void;
}


const Terminal = forwardRef<HTMLInputElement, TerminalProps>(({ fileSystem, onUpdateFileSystem }, ref) => {
    const { settings } = useSettings();
    const [input, setInput] = useState('');
    const [history, setHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [output, setOutput] = useState<React.ReactNode[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => inputRef.current!);

    useEffect(() => {
        containerRef.current?.scrollTo(0, containerRef.current.scrollHeight);
    }, [output]);
    
    useEffect(() => {
        setOutput([<div key="welcome">Welcome to FirePlay Terminal. Type `help` for a list of commands.</div>])
    }, []);

    const addCommandToOutput = (command: string, response: React.ReactNode) => {
      setOutput(prev => [...prev, <div key={prev.length}><span className="text-[var(--color-accent)] mr-2">$</span>{command}</div>, <div key={prev.length+1}>{response}</div>]);
    };

    const resolvePath = (path: string, root: FileSystemNode[]): { parent: FileSystemNode | null; node: FileSystemNode; name: string } | { parent: FileSystemNode | null, remaining: string[] } | { error: string } => {
        const parts = path.split('/').filter(p => p && p !== '.');
        if (parts.length === 0) return { parent: null, node: { id: 'root', name: '/', type: 'folder', children: root }, name: '/' };

        let current: FileSystemNode[] | undefined = root;
        let parent: FileSystemNode | null = null;
        let foundNode: FileSystemNode | null = null;
        
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            foundNode = current?.find(n => n.name === part) || null;
            if (foundNode) {
                 if (i === parts.length - 1) { // Last part
                    return { parent, node: foundNode, name: part };
                }
                if (foundNode.type === 'folder') {
                    parent = foundNode;
                    current = foundNode.children;
                } else {
                    return { error: `${part}: Not a directory` };
                }
            } else {
                 return { parent: parent, remaining: parts.slice(i) };
            }
        }
        // Should not be reached if parts has items
        return { error: `Cannot resolve path: ${path}` };
    };


    const processCommand = (commandStr: string) => {
        const [cmd, ...args] = commandStr.trim().split(' ');
        
        const executeFileSystemCommand = (pathArg: string | undefined, action: (result: any) => React.ReactNode | void) => {
             const path = pathArg || '.';
             onUpdateFileSystem(draft => {
                const result = resolvePath(path, draft);
                const response = action(result);
                if (response) {
                    addCommandToOutput(commandStr, response);
                }
             });
        }
        
        switch (cmd) {
            case 'ls':
                executeFileSystemCommand(args[0], (result) => {
                    if ('error' in result) return <div className="text-red-400">ls: {result.error}</div>;
                    if ('remaining' in result) return <div className="text-red-400">ls: {args[0]}: No such file or directory</div>;

                    const nodeToList = result.node.type === 'folder' ? result.node.children : [result.node];
                    if (!nodeToList) return null;
                    
                    return (
                        <div>
                            {nodeToList.map((node: FileSystemNode) => (
                                 <div key={node.id} className="flex items-center gap-2">
                                    {node.type === 'folder' ? <FolderIcon className="w-4 h-4 text-[var(--color-accent-text)]" /> : <FileCodeIcon className="w-4 h-4 text-[var(--color-text-dim)]" />}
                                    <span className={`${node.type === 'folder' ? 'text-[var(--color-text-bright)]' : ''}`}>{node.name}{node.type === 'folder' ? '/' : ''}</span>
                                </div>
                            ))}
                        </div>
                    );
                });
                break;
            case 'cat':
                if (!args[0]) { addCommandToOutput(commandStr, <div className="text-red-400">Usage: cat [path/to/file]</div>); break; }
                executeFileSystemCommand(args[0], (result) => {
                    if ('error' in result) return <div className="text-red-400">cat: {result.error}</div>;
                    if ('remaining' in result) return <div className="text-red-400">cat: {args[0]}: No such file or directory</div>;
                    if (result.node.type === 'folder') return <div className="text-red-400">cat: {result.node.name}: Is a directory</div>;
                    return <pre className="whitespace-pre-wrap">{result.node.content}</pre>;
                });
                break;
            case 'rm':
                if (!args[0]) { addCommandToOutput(commandStr, <div className="text-red-400">Usage: rm [path]</div>); break; }
                executeFileSystemCommand(args[0], (result) => {
                    if ('error' in result) return <div className="text-red-400">rm: {result.error}</div>;
                    if ('remaining' in result) return <div className="text-red-400">rm: {args[0]}: No such file or directory</div>;

                    const collection = result.parent ? result.parent.children! : fileSystem;
                    const nodeIndex = collection.findIndex(n => n.id === result.node.id);
                    if (nodeIndex === -1) return <div className="text-red-400">rm: cannot find {result.name}</div>;
                    
                    if (result.node.type === 'folder' && result.node.children && result.node.children.length > 0) {
                        return <div className="text-red-400">rm: {result.node.name}: Directory not empty</div>;
                    }
                    
                    collection.splice(nodeIndex, 1);
                });
                break;
            case 'touch':
            case 'mkdir':
                if (!args[0]) { addCommandToOutput(commandStr, <div className="text-red-400">Usage: {cmd} [path]</div>); break; }
                executeFileSystemCommand(args[0], (result) => {
                    if ('error' in result) return <div className="text-red-400">{cmd}: {result.error}</div>;
                    if (!('remaining' in result)) {
                         if (cmd === 'mkdir') return <div className="text-yellow-400">mkdir: {args[0]}: File exists</div>;
                         return; // touch on existing file does nothing
                    }
                    
                    let current = result.parent ? result.parent.children! : fileSystem;
                    for (let i = 0; i < result.remaining.length; i++) {
                        const name = result.remaining[i];
                        const isLast = i === result.remaining.length - 1;

                        if (isLast) {
                            current.push(cmd === 'touch'
                                ? { id: `file-${Date.now()}`, name, type: 'file', content: '' }
                                : { id: `folder-${Date.now()}`, name, type: 'folder', children: [] }
                            );
                        } else {
                            const newDir: FileSystemNode = { id: `folder-${Date.now()}`, name, type: 'folder', children: [] };
                            current.push(newDir);
                            current = newDir.children!;
                        }
                    }
                });
                break;
            case 'help':
                addCommandToOutput(commandStr,
                    <ul className="list-disc list-inside">
                        <li><span className="font-semibold">help</span>: Show this help message.</li>
                        <li><span className="font-semibold">ls [path]</span>: List files and directories.</li>
                        <li><span className="font-semibold">cat [path/to/file]</span>: Display file content.</li>
                        <li><span className="font-semibold">touch [path/to/file]</span>: Create a new empty file.</li>
                        <li><span className="font-semibold">mkdir [path/to/dir]</span>: Create a new directory.</li>
                        <li><span className="font-semibold">rm [path/to/item]</span>: Remove a file or empty directory.</li>
                        <li><span className="font-semibold">clear</span>: Clear the terminal screen.</li>
                    </ul>
                );
                break;
            case 'clear':
                setOutput([]);
                break;
            case '':
                 addCommandToOutput(commandStr, null);
                 break;
            default:
                addCommandToOutput(commandStr, <div className="text-red-400">{`Command not found: ${cmd}. Type 'help' for available commands.`}</div>);
        }
    };

    const handleTabCompletion = () => {
        const parts = input.split(' ');
        const toComplete = parts.pop() || '';
        const command = parts.join(' ');

        const pathParts = toComplete.split('/').filter(p => p.length > 0);
        const partialName = toComplete.endsWith('/') ? '' : pathParts.pop() || '';
        
        let currentLevel = fileSystem;
        for (const part of pathParts) {
            const nextNode = currentLevel.find(n => n.name === part && n.type === 'folder');
            if(nextNode && nextNode.children) {
                currentLevel = nextNode.children;
            } else {
                return; // Invalid path part
            }
        }

        const matches = currentLevel.filter(n => n.name.startsWith(partialName));

        if (matches.length === 1) {
            const match = matches[0];
            const newPath = `${pathParts.join('/')}${pathParts.length > 0 ? '/' : ''}${match.name}${match.type === 'folder' ? '/' : ' '}`;
            setInput(`${command} ${newPath}`);
        } else if (matches.length > 1) {
             const completions = matches.map(m => `${m.name}${m.type === 'folder' ? '/' : ''}`).join('   ');
             addCommandToOutput(input, 
                <div className="flex flex-wrap gap-x-4">{completions}</div>
            );
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (input.trim() !== '') {
                setHistory(prev => [input, ...prev]);
            }
            setHistoryIndex(-1);
            processCommand(input);
            setInput('');
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (historyIndex < history.length - 1) {
                const newIndex = historyIndex + 1;
                setHistoryIndex(newIndex);
                setInput(history[newIndex]);
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex > 0) {
                const newIndex = historyIndex - 1;
                setHistoryIndex(newIndex);
                setInput(history[newIndex]);
            } else {
                setHistoryIndex(-1);
                setInput('');
            }
        } else if (e.key === 'Tab') {
            e.preventDefault();
            handleTabCompletion();
        }
    };

    return (
        <div className="h-full bg-[var(--color-bg-inset)] p-2 font-mono flex flex-col" onClick={() => inputRef.current?.focus()} style={{fontSize: `${settings.terminal.fontSize}px`}}>
            <div ref={containerRef} className="flex-grow overflow-y-auto pr-2 text-[var(--color-text-base)]">
                {output.map((line, index) => <div key={index} className="mb-1 leading-normal">{line}</div>)}
            </div>
            <div className="flex items-center gap-2 mt-1">
                <span className="text-[var(--color-accent)]">$</span>
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full bg-transparent outline-none text-[var(--color-text-bright)]"
                    autoFocus
                />
            </div>
        </div>
    );
});

export default Terminal;