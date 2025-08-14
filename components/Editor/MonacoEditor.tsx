
import React, { useRef, useEffect } from 'react';
import { useSettings } from '../../contexts/SettingsContext';

interface MonacoEditorProps {
    value: string;
    onChange: (value: string) => void;
    language: string;
}

// This is a simplified fallback for the Monaco Editor.
// A full integration would be much more complex.
export const MonacoEditor: React.FC<MonacoEditorProps> = ({ value, onChange, language }) => {
    const { settings } = useSettings();
    const { editor: editorSettings } = settings;
    const ref = useRef<HTMLTextAreaElement>(null);
    
    useEffect(() => {
        if(ref.current) {
            ref.current.value = value;
        }
    }, [value])

    const editorStyle: React.CSSProperties = {
        fontSize: `${editorSettings.fontSize}px`,
        fontFamily: editorSettings.fontFamily === 'mono' ? 'var(--font-mono)' : 'var(--font-sans)',
        lineHeight: editorSettings.lineHeight,
        backgroundColor: 'var(--color-bg-inset)',
        color: 'var(--color-text-base)',
        border: 'none',
        outline: 'none',
        padding: '1rem',
        whiteSpace: 'pre',
        overflowWrap: 'normal',
        overflow: 'auto',
    };

    return (
        <textarea
            ref={ref}
            defaultValue={value}
            onChange={(e) => onChange(e.target.value)}
            style={editorStyle}
            className="w-full h-full resize-none"
            data-gramm="false"
            data-gramm_editor="false"
            data-enable-grammarly="false"
            spellCheck="false"
        />
    );
};
