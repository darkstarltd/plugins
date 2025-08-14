import React from 'react';

interface DiffViewerProps {
    patch: string;
}

const DiffViewer: React.FC<DiffViewerProps> = ({ patch }) => {
    const renderLine = (line: string, index: number) => {
        let lineClass = 'px-4';
        let linePrefix = ' ';

        if (line.startsWith('+')) {
            lineClass = 'bg-green-800/30 text-green-300 px-4';
            linePrefix = '+';
        } else if (line.startsWith('-')) {
            lineClass = 'bg-red-800/30 text-red-300 px-4';
            linePrefix = '-';
        } else if (line.startsWith('@@')) {
            lineClass = 'text-cyan-400 bg-gray-700/50 px-4';
        }

        return (
            <tr key={index} className={lineClass}>
                <td className="w-8 text-center select-none text-gray-500">{linePrefix}</td>
                <td>
                    <pre className="whitespace-pre-wrap break-all">{line.substring(1)}</pre>
                </td>
            </tr>
        );
    };

    return (
        <div className="bg-gray-900 rounded-lg overflow-hidden font-mono text-sm border border-gray-700 h-full">
            <div className="h-full overflow-y-auto">
                <table className="w-full">
                    <tbody>
                        {patch.split('\n').map(renderLine)}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DiffViewer;