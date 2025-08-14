
import React, { useState, useMemo, useEffect } from 'react';
import { FileSystemNode, SearchResult } from '../types';
import { SearchIcon, FileCodeIcon } from './icons';

// Debounce hook to delay processing of the input
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

interface GlobalSearchPanelProps {
    allFiles: FileSystemNode[];
    onSelectFile: (fileId: string) => void;
}

const getAllFilesRecursive = (nodes: FileSystemNode[]): FileSystemNode[] => {
    let files: FileSystemNode[] = [];
    for (const node of nodes) {
        if (node.type === 'file') {
            files.push(node);
        } else if (node.children) {
            files = files.concat(getAllFilesRecursive(node.children));
        }
    }
    return files;
};

const GlobalSearchPanel: React.FC<GlobalSearchPanelProps> = ({ allFiles, onSelectFile }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const debouncedQuery = useDebounce(query, 300);
    
    const flatFileList = useMemo(() => getAllFilesRecursive(allFiles), [allFiles]);

    useEffect(() => {
        if (!debouncedQuery) {
            setResults([]);
            return;
        }

        const newResults: SearchResult[] = [];
        // Make the regex from the debounced query to avoid running on every keystroke
        const regex = new RegExp(debouncedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');

        flatFileList.forEach(file => {
            if (file.content) {
                const lines = file.content.split('\n');
                lines.forEach((line, lineIndex) => {
                    let match;
                    // Reset regex from previous file search
                    regex.lastIndex = 0;
                    while ((match = regex.exec(line)) !== null) {
                         newResults.push({
                            fileId: file.id,
                            line: lineIndex + 1,
                            start: match.index,
                            end: match.index + match[0].length,
                            preview: line.trim()
                        });
                    }
                });
            }
        });
        setResults(newResults);
    }, [debouncedQuery, flatFileList]);
    
    const resultsByFile = useMemo(() => {
        return results.reduce((acc, result) => {
            const file = flatFileList.find(f => f.id === result.fileId);
            if (file) {
                if (!acc[file.id]) {
                    acc[file.id] = {
                        fileName: file.name,
                        results: []
                    };
                }
                acc[file.id].results.push(result);
            }
            return acc;
        }, {} as Record<string, { fileName: string; results: SearchResult[] }>);
    }, [results, flatFileList]);

    const highlightMatch = (text: string, start: number, end: number) => {
        return (
            <>
                {text.substring(0, start)}
                <span className="bg-[var(--color-accent-subtle-bg)] text-[var(--color-accent-text)] rounded-sm px-0.5">
                    {text.substring(start, end)}
                </span>
                {text.substring(end)}
            </>
        )
    }

    return (
        <div className="flex flex-col h-full">
            <div className="p-2 font-bold text-md border-b border-t border-[var(--color-border-primary)] flex items-center gap-2 text-[var(--color-text-bright)] text-primary-readable flex-shrink-0">
                <SearchIcon className="w-5 h-5"/> Search
            </div>
            <div className="p-2 flex-shrink-0">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search across all files..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] rounded-md pl-4 pr-10 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-accent-ring)]"
                    />
                    <div className="absolute top-1/2 right-2 -translate-y-1/2 p-1 text-[var(--color-text-dim)]">
                        <SearchIcon className="w-5 h-5" />
                    </div>
                </div>
            </div>
            <div className="flex-grow overflow-y-auto text-sm">
                {query && (
                    <div className="px-2 pb-2 text-xs text-[var(--color-text-dim)]">
                        {results.length} results found for "{query}"
                    </div>
                )}
                {Object.keys(resultsByFile).map((fileId) => {
                    const data = resultsByFile[fileId];
                    return (
                    <div key={fileId} className="mb-2">
                        <div className="font-semibold flex items-center gap-2 px-2 py-1 bg-[var(--color-bg-tertiary)]">
                            <FileCodeIcon className="w-4 h-4 text-[var(--color-accent-text)]" />
                            {data.fileName}
                        </div>
                        {data.results.map((result, i) => (
                             <div key={i} onClick={() => onSelectFile(result.fileId)} className="px-4 py-1 hover:bg-[var(--color-accent-subtle-bg)] cursor-pointer">
                                <pre className="text-xs text-[var(--color-text-dim)] whitespace-pre-wrap">
                                    <span className="mr-2">{result.line}:</span>
                                    {highlightMatch(result.preview, result.start, result.end)}
                                </pre>
                            </div>
                        ))}
                    </div>
                )})}
            </div>
        </div>
    );
};

export default GlobalSearchPanel;
