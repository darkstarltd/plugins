import React, { useRef, useEffect, useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';

interface MinimapProps {
    code: string;
    scrollTop: number;
    editorHeight: number;
    onScroll: (newScrollTop: number) => void;
}

const LINE_HEIGHT = 2; // Height of each line representation in pixels
const CHAR_WIDTH = 1; // Width of each char representation in pixels
const PADDING = 5;

const Minimap: React.FC<MinimapProps> = ({ code, scrollTop, editorHeight, onScroll }) => {
    const { settings: { editor: editorSettings } } = useSettings();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const lines = code.split('\n');
    const contentHeight = lines.length * LINE_HEIGHT;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        const theme = document.documentElement.dataset.theme || 'dark';
        const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--color-accent');
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw code lines
        ctx.fillStyle = theme === 'dark' ? 'rgba(200, 200, 220, 0.7)' : 'rgba(50, 50, 60, 0.7)';
        lines.forEach((line, i) => {
            const y = PADDING + i * LINE_HEIGHT;
            const x = PADDING;
            const lineWidth = line.length * CHAR_WIDTH;
            ctx.fillRect(x, y, Math.min(lineWidth, rect.width - PADDING * 2), LINE_HEIGHT);
        });
        
        const editorLineHeight = editorSettings.fontSize * editorSettings.lineHeight;
        const totalCodeHeight = lines.length * editorLineHeight;

        // Draw viewport
        if (totalCodeHeight > 0) {
            const viewportHeightRatio = editorHeight / totalCodeHeight;
            const viewportHeightOnMinimap = Math.max(20, viewportHeightRatio * (rect.height - PADDING * 2));
            
            const scrollRatio = scrollTop / (totalCodeHeight - editorHeight);
            const viewportY = PADDING + scrollRatio * (rect.height - PADDING * 2 - viewportHeightOnMinimap);
            
            ctx.fillStyle = accentColor;
            ctx.globalAlpha = 0.4;
            ctx.fillRect(0, viewportY, rect.width, viewportHeightOnMinimap);
            ctx.globalAlpha = 1.0;
        }

    }, [code, lines, editorHeight, scrollTop, editorSettings]);
    
    const handleScrollFromEvent = (e: React.MouseEvent<HTMLDivElement>) => {
        if(!canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const y = e.clientY - rect.top;

        const editorLineHeight = editorSettings.fontSize * editorSettings.lineHeight;
        const totalCodeHeight = lines.length * editorLineHeight;
        
        // Calculate where the user clicked as a ratio of the minimap height
        const clickRatio = (y - PADDING) / (rect.height - PADDING * 2);
        
        const newScrollTop = clickRatio * (totalCodeHeight - editorHeight);
        onScroll(Math.max(0, Math.min(newScrollTop, totalCodeHeight - editorHeight)));
    }
    
    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        setIsDragging(true);
        handleScrollFromEvent(e);
    }
    
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isDragging) {
            handleScrollFromEvent(e);
        }
    }
    
    const handleMouseUp = () => {
        setIsDragging(false);
    }
    
    const handleMouseLeave = () => {
        setIsDragging(false);
    }

    return (
      <div className="bg-[var(--color-bg-secondary)] border-l border-[var(--color-border-primary)] w-32 cursor-pointer" onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseLeave}>
          <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
      </div>
    );
};

export default Minimap;