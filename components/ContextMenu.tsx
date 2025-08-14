import React, { useState, useEffect, useRef } from 'react';

interface ContextMenuProps {
    x: number;
    y: number;
    onClose: () => void;
    children: React.ReactNode;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onClose, children }) => {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);
    
    const menuStyle: React.CSSProperties = {
        top: y,
        left: x,
        position: 'fixed',
        zIndex: 1000,
    };

    return (
        <div ref={menuRef} style={menuStyle} className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] rounded-md shadow-2xl min-w-[180px] p-1">
            {children}
        </div>
    );
};

export const ContextMenuItem: React.FC<{ onClick: () => void; children: React.ReactNode }> = ({ onClick, children }) => {
    return (
        <div 
            onClick={onClick} 
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-[var(--color-text-base)] hover:bg-[var(--color-accent-subtle-bg)] hover:text-[var(--color-accent-text)] rounded-sm cursor-pointer"
        >
            {children}
        </div>
    );
}

export default ContextMenu;