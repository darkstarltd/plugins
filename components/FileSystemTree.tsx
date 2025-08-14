import React, { useState, useRef, useEffect } from 'react';
import { FileSystemNode } from '../types';
import { FolderIcon, ChevronRightIcon, PlusIcon, TrashIcon, PencilIcon } from './icons';
import ContextMenu, { ContextMenuItem } from './ContextMenu';
import { produce } from 'immer';
import FileIcon from './FileIcon';

interface FileSystemTreeProps {
    nodes: FileSystemNode[];
    onSelectFile: (id: string) => void;
    activeFileId: string | null;
    setFileSystem: (updater: (draft: FileSystemNode[]) => void) => void;
}

const FileSystemTree: React.FC<FileSystemTreeProps> = ({ nodes, onSelectFile, activeFileId, setFileSystem }) => {
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(nodes.filter(n => n.type === 'folder').map(n => n.id)));
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; nodeId: string | null } | null>(null);
    const [renamingNodeId, setRenamingNodeId] = useState<string | null>(null);
    const renameInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (renamingNodeId && renameInputRef.current) {
            renameInputRef.current.focus();
            renameInputRef.current.select();
        }
    }, [renamingNodeId]);

    const handleContextMenu = (e: React.MouseEvent, nodeId: string | null = null) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({ x: e.clientX, y: e.clientY, nodeId });
    };

    const closeContextMenu = () => setContextMenu(null);

    const findNodeAndParent = (nodes: FileSystemNode[], nodeId: string): { parent: FileSystemNode | null; node: FileSystemNode; index: number } | null => {
        for (const node of nodes) {
            if (node.id === nodeId) return { parent: null, node, index: nodes.indexOf(node) };
            if (node.type === 'folder' && node.children) {
                const childIndex = node.children.findIndex(c => c.id === nodeId);
                if (childIndex !== -1) {
                    return { parent: node, node: node.children[childIndex], index: childIndex };
                }
                const found = findNodeAndParent(node.children, nodeId);
                if (found) return found;
            }
        }
        return null;
    }

    const handleCreate = (type: 'file' | 'folder') => {
        const parentId = contextMenu?.nodeId;
        closeContextMenu();
        const newNode: FileSystemNode = {
            id: `${type}-${Date.now()}`,
            name: type === 'file' ? 'new-file.ts' : 'new-folder',
            type: type,
            content: type === 'file' ? '' : undefined,
            children: type === 'folder' ? [] : undefined
        };

        setFileSystem(draft => {
            if (parentId) {
                const result = findNodeAndParent(draft, parentId);
                if (result && result.node.type === 'folder') {
                    result.node.children?.push(newNode);
                }
            } else {
                draft.push(newNode);
            }
        });
        setRenamingNodeId(newNode.id);
    };
    
    const handleDelete = () => {
        const nodeId = contextMenu?.nodeId;
        if (!nodeId) return;
        closeContextMenu();
        
        setFileSystem(draft => {
            const result = findNodeAndParent(draft, nodeId);
            if (!result) return;
            const collection = result.parent ? result.parent.children! : draft;
            collection.splice(result.index, 1);
        });
    };

    const handleRename = () => {
        if (contextMenu?.nodeId) {
            setRenamingNodeId(contextMenu.nodeId);
        }
        closeContextMenu();
    };
    
    const finishRename = (e: React.FocusEvent<HTMLInputElement> | React.KeyboardEvent<HTMLInputElement>) => {
        const newName = (e.target as HTMLInputElement).value.trim();
        if (!newName || !renamingNodeId) {
            setRenamingNodeId(null);
            return;
        }

        setFileSystem(draft => {
             const result = findNodeAndParent(draft, renamingNodeId);
             if(result) result.node.name = newName;
        });
        setRenamingNodeId(null);
    };

    const toggleFolder = (id: string) => {
        setExpandedFolders(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return newSet;
        });
    };

    const renderNode = (node: FileSystemNode, depth: number) => {
        const isExpanded = expandedFolders.has(node.id);
        const isActive = activeFileId === node.id;

        const isRenaming = renamingNodeId === node.id;

        if (node.type === 'folder') {
            return (
                <div key={node.id} onContextMenu={(e) => handleContextMenu(e, node.id)}>
                    <div onClick={() => toggleFolder(node.id)} className="flex items-center gap-1 px-2 py-1.5 text-[var(--color-text-base)] cursor-pointer hover:bg-[var(--color-bg-tertiary)] rounded-md" style={{ paddingLeft: `${0.5 + depth * 1}rem` }}>
                        <ChevronRightIcon className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                        <FolderIcon className="w-5 h-5 text-[var(--color-accent-text)]" />
                        {isRenaming ? (
                            <input
                                ref={renameInputRef}
                                type="text"
                                defaultValue={node.name}
                                className="bg-transparent border border-[var(--color-accent)] rounded px-1 -my-0.5"
                                onBlur={finishRename}
                                onKeyDown={e => e.key === 'Enter' && finishRename(e)}
                                onClick={e => e.stopPropagation()}
                            />
                        ) : <span className="font-medium">{node.name}</span>}
                    </div>
                    {isExpanded && node.children?.map(child => renderNode(child, depth + 1))}
                </div>
            );
        }

        return (
            <div key={node.id} onClick={() => onSelectFile(node.id)} onContextMenu={(e) => handleContextMenu(e, node.id)} className={`flex items-center gap-2 px-2 py-1.5 cursor-pointer rounded-md transition-colors ml-2 ${isActive ? 'bg-[var(--color-accent-subtle-bg)] text-[var(--color-accent-text)]' : 'text-[var(--color-text-dim)] hover:bg-[var(--color-bg-tertiary)]'}`} style={{ paddingLeft: `${0.5 + depth * 1}rem` }}>
                <FileIcon filename={node.name} />
                {isRenaming ? (
                     <input
                        ref={renameInputRef}
                        type="text"
                        defaultValue={node.name}
                        className="bg-transparent border border-[var(--color-accent)] rounded px-1 -my-0.5"
                        onBlur={finishRename}
                        onKeyDown={e => e.key === 'Enter' && finishRename(e)}
                        onClick={e => e.stopPropagation()}
                    />
                ) : <span>{node.name}</span>}
            </div>
        );
    };

    return (
        <div className="flex-grow overflow-y-auto p-2 space-y-0.5" onContextMenu={(e) => handleContextMenu(e)}>
            {nodes.map(node => renderNode(node, 0))}
            {contextMenu && (
                <ContextMenu x={contextMenu.x} y={contextMenu.y} onClose={closeContextMenu}>
                    {contextMenu.nodeId && findNodeAndParent(nodes, contextMenu.nodeId)?.node.type === 'folder' && (
                        <>
                            <ContextMenuItem onClick={() => handleCreate('file')}><PlusIcon className="w-4 h-4"/> New File</ContextMenuItem>
                            <ContextMenuItem onClick={() => handleCreate('folder')}><PlusIcon className="w-4 h-4"/> New Folder</ContextMenuItem>
                            <hr className="border-[var(--color-border-primary)] my-1"/>
                        </>
                    )}
                    {contextMenu.nodeId === null && (
                        <>
                            <ContextMenuItem onClick={() => handleCreate('file')}><PlusIcon className="w-4 h-4"/> New File</ContextMenuItem>
                            <ContextMenuItem onClick={() => handleCreate('folder')}><PlusIcon className="w-4 h-4"/> New Folder</ContextMenuItem>
                        </>
                    )}
                    {contextMenu.nodeId && (
                        <>
                             <ContextMenuItem onClick={handleRename}><PencilIcon className="w-4 h-4"/> Rename</ContextMenuItem>
                            <ContextMenuItem onClick={handleDelete}><TrashIcon className="w-4 h-4 text-red-500"/> Delete</ContextMenuItem>
                        </>
                    )}
                </ContextMenu>
            )}
        </div>
    );
};

export default FileSystemTree;