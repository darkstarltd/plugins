import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Collaborator, Diagnostic } from '../types';
import Minimap from './Minimap';
import ContextMenu, { ContextMenuItem } from './ContextMenu';
import { MonaIcon, LightbulbIcon } from './icons';
import { useSettings } from '../contexts/SettingsContext';
import * as geminiService from '../services/geminiService';
import { useDebugger } from '../contexts/DebuggerContext';
import { useEditor } from '../contexts/EditorContext';

const findMatchingBracket = (code: string, position: number, openChar: string, closeChar: string): number | null => {
    const text = code;
    let stack = 0;
    
    // Forward search
    if (text[position] === openChar) {
        for (let i = position; i < text.length; i++) {
            if (text[i] === openChar) stack++;
            else if (text[i] === closeChar) {
                stack--;
                if (stack === 0) return i;
            }
        }
    }
    // Backward search
    else if (text[position] === closeChar) {
        for (let i = position; i >= 0; i--) {
            if (text[i] === closeChar) stack++;
            else if (text[i] === openChar) {
                stack--;
                if (stack === 0) return i;
            }
        }
    }

    return null;
}

const highlightSyntax = (code: string, searchResults: { start: number, end: number }[], activeSearchIndex: number, bracketPair: [number, number] | null, enabledBracketMatching: boolean) => {
    const replacements: [RegExp, string][] = [
        [/(^\/\/.*$)/gm, '<span class="token-comment">$1</span>'],
        [/(\/\*[\s\S]*?\*\/)/gm, '<span class="token-comment">$1</span>'],
        [/(".*?"|'.*?'|`.*?`)/g, '<span class="token-string">$1</span>'],
        [/\b(function|return|if|else|const|let|var|import|export|from|class|new|async|await|for|while|do|switch|case|break|continue|of|in|typeof|void|delete|try|catch|finally)\b/g, '<span class="token-keyword">$1</span>'],
        [/\b([A-Z][A-Za-z0-9_]*)(?=\s*\()/g, '<span class="token-function">$1</span>'],
        [/\b(true|false|null|undefined)\b/g, '<span class="token-constant">$1</span>'],
        [/\b(\d+\.?\d*)\b/g, '<span class="token-number">$1</span>'],
        [/([{}()\[\]])/g, '<span class="token-punctuation">$1</span>'],
        [/([+\-/*%=&|<>!~^])/g, '<span class="token-operator">$1</span>'],
    ];

    let highlighted = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    
    // Apply syntax highlighting first
    for (const [regex, replacement] of replacements) {
        highlighted = highlighted.replace(regex, replacement);
    }

    // Add search result and bracket highlights on top
    const additions: { index: number, content: string }[] = [];

    searchResults.forEach((result, index) => {
        const className = `search-highlight ${index === activeSearchIndex ? 'active' : ''}`;
        additions.push({ index: result.start, content: `<span class="${className}">`});
        additions.push({ index: result.end, content: '</span>'});
    });

    if (enabledBracketMatching && bracketPair) {
        additions.push({ index: bracketPair[0], content: '<span class="bracket-match">' });
        additions.push({ index: bracketPair[0] + 1, content: '</span>' });
        additions.push({ index: bracketPair[1], content: '<span class="bracket-match">' });
        additions.push({ index: bracketPair[1] + 1, content: '</span>' });
    }

    // Sort additions by index descending to avoid messing up indices
    additions.sort((a, b) => b.index - a.index);
    
    let finalHtml = highlighted;
    for (const addition of additions) {
        finalHtml = finalHtml.slice(0, addition.index) + addition.content + finalHtml.slice(addition.index);
    }
    
    return finalHtml;
};

const getCursorPosition = (el: HTMLTextAreaElement) => {
    const pos = el.selectionStart;
    const text = el.value.substring(0, pos);
    const lines = text.split('\n');
    const line = lines.length;
    const col = lines[lines.length - 1].length + 1;
    return { pos, line, col };
};

const getCoordsFromPos = (code: string, pos: number, lineHeight: number, charWidth: number) => {
    const textToPos = code.substring(0, pos);
    const lines = textToPos.split('\n');
    const line = lines.length;
    const col = lines[lines.length - 1].length;
    return {
        top: (line - 1) * lineHeight,
        left: col * charWidth,
    };
};

interface CodeEditorProps {
    code: string;
    onCodeChange: (code: string) => void;
    onCursorChange: (pos: { line: number; col: number }) => void;
    searchResults: { start: number; end: number; }[];
    activeSearchIndex: number;
    collaborators: Collaborator[];
    diagnostics: Diagnostic[];
    onExplainCode: (code: string) => void;
    onApplyFix: (diagnostic: Diagnostic) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, onCodeChange, onCursorChange, searchResults, activeSearchIndex, collaborators, diagnostics, onExplainCode, onApplyFix }) => {
    const { settings } = useSettings();
    const { editor: editorSettings } = settings;
    const { activeFileId } = useEditor();
    const { session: debuggerSession, breakpoints, toggleBreakpoint } = useDebugger();
    const [scrollTop, setScrollTop] = useState(0);
    const [bracketPair, setBracketPair] = useState<[number, number] | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, items: React.ReactNode } | null>(null);
    const [ghostText, setGhostText] = useState('');
    const [currentLine, setCurrentLine] = useState(1);

    const lineCount = useMemo(() => code.split('\n').length, [code]);
    const highlightedCode = useMemo(() => highlightSyntax(code, searchResults, activeSearchIndex, bracketPair, editorSettings.enableBracketMatching), [code, searchResults, activeSearchIndex, bracketPair, editorSettings.enableBracketMatching]);

    const completionTimeout = useRef<number | null>(null);

    useEffect(() => {
        if (completionTimeout.current) {
            clearTimeout(completionTimeout.current);
        }
        setGhostText('');
        completionTimeout.current = window.setTimeout(() => {
            if (textareaRef.current) {
                const { pos } = getCursorPosition(textareaRef.current);
                const codeUntilCursor = code.substring(0, pos);
                if (codeUntilCursor.trim().length > 10) { // Only fetch if there's enough context
                    geminiService.getCompletion(codeUntilCursor).then(completion => {
                        setGhostText(completion);
                    });
                }
            }
        }, 1000); // 1-second debounce

        return () => {
            if (completionTimeout.current) {
                clearTimeout(completionTimeout.current);
            }
        };
    }, [code]);

    useEffect(() => {
        if (textareaRef.current && searchResults.length > 0 && activeSearchIndex !== -1) {
            const result = searchResults[activeSearchIndex];
            const textToResult = code.substring(0, result.start);
            const lines = textToResult.split('\n').length;
            const lineHeight = editorSettings.lineHeight * editorSettings.fontSize;
            textareaRef.current.scrollTop = (lines - 5) * lineHeight; // Scroll to a bit before the line
        }
    }, [activeSearchIndex, searchResults, code, editorSettings.lineHeight, editorSettings.fontSize]);
    
    const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
        setScrollTop(e.currentTarget.scrollTop);
        if (contextMenu) setContextMenu(null);
    };
    
    const handleMinimapScroll = (newScrollTop: number) => {
        if(textareaRef.current) textareaRef.current.scrollTop = newScrollTop;
    };

    const handleCursorActivity = () => {
        if (!textareaRef.current) return;
        const {pos, line, col} = getCursorPosition(textareaRef.current);
        onCursorChange({ line, col });
        setCurrentLine(line);

        if (!editorSettings.enableBracketMatching) {
            setBracketPair(null);
            return;
        }

        let matchPos: number | null = null;
        let startPos = -1;
        const bracketPairs: Record<string, string> = { '(': ')', '{': '}', '[': ']', ')': '(', '}': '{', ']': '[' };
        
        const charBefore = code[pos - 1];
        if ("({[".includes(charBefore)) {
            startPos = pos - 1;
            matchPos = findMatchingBracket(code, startPos, charBefore, bracketPairs[charBefore]);
        }
        
        if (matchPos === null) {
            const charAt = code[pos];
            if (")]}".includes(charAt)) {
                startPos = pos;
                matchPos = findMatchingBracket(code, startPos, bracketPairs[charAt], charAt);
            }
        }
       
        if (matchPos !== null && startPos !== -1) {
            setBracketPair([Math.min(startPos, matchPos), Math.max(startPos, matchPos)]);
        } else {
            setBracketPair(null);
        }
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Tab' && ghostText) {
            e.preventDefault();
            const { pos } = getCursorPosition(e.currentTarget);
            const newCode = code.substring(0, pos) + ghostText + code.substring(pos);
            onCodeChange(newCode);
            setGhostText('');
        }
        
        if (e.key === 'Enter') {
            e.preventDefault();
            const { pos, line } = getCursorPosition(e.currentTarget);
            const currentLineText = code.split('\n')[line - 1];
            const indentation = currentLineText.match(/^\s*/)?.[0] || '';
            const newCode = code.substring(0, pos) + '\n' + indentation + code.substring(pos);
            onCodeChange(newCode);
            
            // Set cursor position manually after state update
            setTimeout(() => {
                if(textareaRef.current) {
                     textareaRef.current.selectionStart = textareaRef.current.selectionEnd = pos + 1 + indentation.length;
                }
            }, 0);
        }
    }
    
    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        const hasSelection = textareaRef.current && textareaRef.current.selectionStart !== textareaRef.current.selectionEnd;
        if (hasSelection) {
            setContextMenu({ 
                x: e.clientX, 
                y: e.clientY,
                items: (
                    <ContextMenuItem onClick={handleExplainRequest}>
                        <MonaIcon className="w-4 h-4"/> Mona: Explain this code
                    </ContextMenuItem>
                )
            });
        }
    }

    const handleExplainRequest = () => {
        if(textareaRef.current) {
            const { selectionStart, selectionEnd } = textareaRef.current;
            if (selectionStart !== selectionEnd) {
                const selectedCode = code.substring(selectionStart, selectionEnd);
                onExplainCode(selectedCode);
            }
        }
        setContextMenu(null);
    }
    
    useEffect(handleCursorActivity, [code, onCursorChange, editorSettings.enableBracketMatching]);


    const editorStyle: React.CSSProperties = {
        fontSize: `${editorSettings.fontSize}px`,
        fontFamily: editorSettings.fontFamily === 'mono' ? 'var(--font-mono)' : 'var(--font-sans)',
        lineHeight: editorSettings.lineHeight,
    };

    const charWidth = editorSettings.fontSize * 0.6; // Approximation for monospaced font
    const lineHeightPx = editorSettings.fontSize * editorSettings.lineHeight;
    
    const diagnosticsByLine = useMemo(() => {
        const map = new Map<number, Diagnostic[]>();
        const lines = code.split('\n');
        diagnostics.forEach(d => {
            let lineNum = 0;
            let charCount = 0;
            for(let i = 0; i < lines.length; i++) {
                if(d.start >= charCount && d.start <= charCount + lines[i].length) {
                    lineNum = i + 1;
                    break;
                }
                charCount += lines[i].length + 1;
            }

            if (lineNum > 0) {
                if (!map.has(lineNum)) map.set(lineNum, []);
                map.get(lineNum)?.push(d);
            }
        });
        return map;
    }, [diagnostics, code]);

    const showQuickFixMenu = (e: React.MouseEvent, diagnostic: Diagnostic) => {
        e.stopPropagation();
        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            items: (
                <ContextMenuItem onClick={() => { onApplyFix(diagnostic); setContextMenu(null); }}>
                    <LightbulbIcon className="w-4 h-4" /> {diagnostic.quickFixTitle}
                </ContextMenuItem>
            )
        })
    };
    
    const activeBreakpoints = useMemo(() => {
        const fileBreakpointsLines = breakpoints
            .filter(bp => bp.fileId === activeFileId)
            .map(bp => bp.line);
        return new Set(fileBreakpointsLines);
    }, [breakpoints, activeFileId]);

    const isExecutionLine = debuggerSession.status === 'paused' && debuggerSession.currentFrame?.fileId === activeFileId;
    const executionLineNumber = debuggerSession.currentFrame?.line;

    return (
        <div className="editor-container text-base h-full" ref={containerRef}>
            <div className="line-numbers" style={{ lineHeight: editorStyle.lineHeight, fontSize: editorStyle.fontSize }}>
                <div style={{ transform: `translateY(-${scrollTop}px)` }}>
                {Array.from({ length: lineCount }, (_, i) => {
                    const lineNum = i + 1;
                    const diagsOnLine = diagnosticsByLine.get(lineNum);
                    const quickFixDiag = diagsOnLine?.find(d => d.quickFixTitle && d.replacementCode);
                    const hasBreakpoint = activeBreakpoints.has(lineNum);

                    return (
                        <div key={i} className={`relative px-4 text-right cursor-pointer group ${lineNum === currentLine ? 'text-[var(--color-text-bright)]' : ''}`} onClick={() => toggleBreakpoint(activeFileId || '', lineNum)}>
                            <div className={`absolute left-1.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full transition-colors ${hasBreakpoint ? 'bg-red-500' : 'bg-transparent group-hover:bg-red-500/30'}`} />
                            {quickFixDiag ? (
                                <button onClick={(e) => showQuickFixMenu(e, quickFixDiag)} className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-400 hover:text-yellow-300">
                                    <LightbulbIcon className="w-4 h-4" />
                                </button>
                            ) : null}
                            {lineNum}
                        </div>
                    )
                })}
                </div>
            </div>
            <div className="relative h-full flex-grow" onContextMenu={handleContextMenu}>
                <textarea
                    ref={textareaRef}
                    value={code}
                    onChange={(e) => onCodeChange(e.target.value)}
                    onScroll={handleScroll}
                    onKeyUp={handleCursorActivity}
                    onClick={() => { handleCursorActivity(); setContextMenu(null); }}
                    onKeyDown={handleKeyDown}
                    onFocus={handleCursorActivity}
                    spellCheck="false"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    className="absolute inset-0 w-full h-full p-4 bg-transparent outline-none resize-none z-10 text-transparent"
                    style={{...editorStyle, caretColor: 'var(--color-text-bright)'}}
                />
                 <pre className="absolute inset-0 p-4 whitespace-pre-wrap overflow-hidden pointer-events-none z-0" aria-hidden="true" style={editorStyle}>
                    <div 
                        className={`absolute left-0 w-full bg-[var(--color-bg-tertiary)] opacity-50 transition-transform duration-75 ${isExecutionLine && executionLineNumber === currentLine ? '!bg-yellow-500/20' : ''}`}
                        style={{ height: `${lineHeightPx}px`, transform: `translateY(${(currentLine - 1) * lineHeightPx}px)` }}
                    ></div>
                    {isExecutionLine && (
                        <div 
                            className="absolute left-0 w-full bg-yellow-500/20"
                            style={{ height: `${lineHeightPx}px`, transform: `translateY(${(executionLineNumber - 1) * lineHeightPx}px)` }}
                        ></div>
                    )}
                    <code dangerouslySetInnerHTML={{ __html: highlightedCode }} />
                    {ghostText && textareaRef.current && (
                        <span className="absolute opacity-40 italic" style={{
                            top: `${getCoordsFromPos(code, textareaRef.current.selectionStart, lineHeightPx, charWidth).top + 16}px`,
                            left: `${getCoordsFromPos(code, textareaRef.current.selectionStart, lineHeightPx, charWidth).left + 16}px`,
                        }}>
                           {ghostText.split('\n')[0]}
                        </span>
                    )}
                    <div className="absolute inset-0 pointer-events-none">
                        {collaborators.map(c => {
                            const selectionRects = [];
                            // Efficiently render selection by line
                            if (c.selection && c.selection.start < c.selection.end) {
                                const selectionText = code.substring(c.selection.start, c.selection.end);
                                const selectionLines = selectionText.split('\n');
                                let currentPos = c.selection.start;

                                selectionLines.forEach((lineText, index) => {
                                    if (lineText.length > 0 || (selectionLines.length > 1 && index < selectionLines.length -1)) {
                                        const startOfLinePos = currentPos;
                                        const endOfLinePos = currentPos + lineText.length;
                                        const { top, left } = getCoordsFromPos(code, startOfLinePos, editorSettings.lineHeight * editorSettings.fontSize, charWidth);
                                        const width = (endOfLinePos - startOfLinePos) * charWidth;
                                        
                                        selectionRects.push(
                                            <div
                                                key={`${c.id}-sel-${index}`}
                                                className="collaborator-selection"
                                                style={{
                                                    top: top + 4,
                                                    left: left + 16,
                                                    width: width,
                                                    height: editorSettings.lineHeight * editorSettings.fontSize,
                                                    backgroundColor: c.color,
                                                }}
                                            ></div>
                                        );
                                    }
                                    // Move currentPos to the start of the next line (past the '\n')
                                    currentPos += lineText.length + 1;
                                });
                            }
                            
                            const cursorCoords = c.cursorPos ? getCoordsFromPos(code, code.split('\n').slice(0, c.cursorPos.line - 1).join('\n').length + (c.cursorPos.line > 1 ? 1 : 0) + c.cursorPos.col - 1, editorSettings.lineHeight * editorSettings.fontSize, charWidth) : null;
                           
                            return (
                                <React.Fragment key={c.id}>
                                    {selectionRects}
                                    {cursorCoords && <div className="collaborator-cursor" data-name={c.name} style={{ top: cursorCoords.top + 4, left: cursorCoords.left + 16, backgroundColor: c.color, height: `${editorSettings.lineHeight * editorSettings.fontSize}px`}} ></div>}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </pre>
            </div>
            {contextMenu && (
                <ContextMenu x={contextMenu.x} y={contextMenu.y} onClose={() => setContextMenu(null)}>
                    {contextMenu.items}
                </ContextMenu>
            )}
             {editorSettings.showMinimap && containerRef.current && (
                <Minimap 
                    code={code} 
                    scrollTop={scrollTop} 
                    editorHeight={containerRef.current.clientHeight}
                    onScroll={handleMinimapScroll}
                />
             )}
        </div>
    );
};

export default CodeEditor;