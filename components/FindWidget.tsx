

import React, { useState, useEffect, useRef } from 'react';
import { ChevronUpIcon, ChevronDownIcon, XIcon } from './icons';
import { SearchResult } from '../types';

interface FindWidgetProps {
    code: string;
    onFind: (results: Omit<SearchResult, 'fileId'>[]) => void;
    onClose: () => void;
    activeResultIndex: number;
    onNavigate: (index: number) => void;
}

const FindWidget: React.FC<FindWidgetProps> = ({ code, onFind, onClose, activeResultIndex, onNavigate }) => {
    const [query, setQuery] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const [results, setResults] = useState<Omit<SearchResult, 'fileId'>[]>([]);

    useEffect(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
    }, []);

    useEffect(() => {
        if (!query) {
            setResults([]);
            onFind([]);
            return;
        }

        const newResults: Omit<SearchResult, 'fileId'>[] = [];
        const regex = new RegExp(query, 'gi');
        const lines = code.split('\n');
        let match;
        
        while ((match = regex.exec(code)) !== null) {
            const start = match.index;
            const end = match.index + match[0].length;

            let charCount = 0;
            let lineIndex = 0;
            for(let i=0; i < lines.length; i++) {
                const lineLength = lines[i].length + 1; // +1 for the newline char
                if (start < charCount + lineLength) {
                    lineIndex = i;
                    break;
                }
                charCount += lineLength;
            }
            
            newResults.push({
                start,
                end,
                line: lineIndex + 1,
                preview: lines[lineIndex],
            });
        }

        setResults(newResults);
        onFind(newResults);

        if (newResults.length > 0) {
            onNavigate(0);
        } else {
            onNavigate(-1);
        }
    }, [query, code, onFind, onNavigate]);

    const navigateNext = () => {
        if (results.length === 0) return;
        onNavigate((activeResultIndex + 1) % results.length);
    }

    const navigatePrev = () => {
        if (results.length === 0) return;
        onNavigate((activeResultIndex - 1 + results.length) % results.length);
    }
    
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (e.shiftKey) {
                navigatePrev();
            } else {
                 navigateNext();
            }
        }
    };

    const totalResults = results.length;

    return (
        <div className="absolute top-4 right-4 bg-[var(--color-bg-secondary)] text-[var(--color-text-base)] rounded-lg shadow-2xl z-30 p-2 border border-[var(--color-border-primary)] w-80 animate-find-widget-enter">
            <div className="flex items-center gap-2">
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Find"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-grow bg-[var(--color-bg-primary)] border border-[var(--color-border-secondary)] rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-ring)]"
                />
                 <span className="text-sm text-[var(--color-text-dim)] px-2 whitespace-nowrap">
                    {totalResults > 0 ? `${activeResultIndex + 1} of ${totalResults}` : 'No results'}
                </span>
                <button onClick={navigatePrev} disabled={totalResults === 0} className="p-1 rounded-md hover:bg-[var(--color-bg-tertiary)] disabled:opacity-50"><ChevronUpIcon className="w-4 h-4"/></button>
                <button onClick={navigateNext} disabled={totalResults === 0} className="p-1 rounded-md hover:bg-[var(--color-bg-tertiary)] disabled:opacity-50"><ChevronDownIcon className="w-4 h-4"/></button>
                <button onClick={onClose} className="p-1 rounded-md hover:bg-[var(--color-bg-tertiary)]">
                    <XIcon className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default FindWidget;