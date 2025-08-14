
import React from 'react';

interface SyntaxHighlighterProps {
    code: string;
    language: string;
}

export const SyntaxHighlighter: React.FC<SyntaxHighlighterProps> = ({ code, language }) => {
    return (
        <pre className="p-4 bg-bg-inset text-text-base text-sm overflow-auto h-full">
            <code>
                {code}
            </code>
        </pre>
    );
};
