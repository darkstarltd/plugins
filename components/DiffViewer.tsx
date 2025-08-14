import React from 'react';

// A simple diffing algorithm (LCS-based) to align lines for side-by-side view
const diffLines = (oldStr: string, newStr: string) => {
    const oldLines = oldStr.split('\n');
    const newLines = newStr.split('\n');
    const matrix = Array(oldLines.length + 1).fill(0).map(() => Array(newLines.length + 1).fill(0));

    for (let i = 1; i <= oldLines.length; i++) {
        for (let j = 1; j <= newLines.length; j++) {
            if (oldLines[i - 1] === newLines[j - 1]) {
                matrix[i][j] = matrix[i - 1][j - 1] + 1;
            } else {
                matrix[i][j] = Math.max(matrix[i - 1][j], matrix[i][j - 1]);
            }
        }
    }

    let i = oldLines.length;
    let j = newLines.length;
    const result: { left?: string, right?: string, type: 'common' | 'added' | 'removed' }[] = [];

    while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
            result.unshift({ left: oldLines[i - 1], right: newLines[j - 1], type: 'common' });
            i--; j--;
        } else if (j > 0 && (i === 0 || matrix[i][j - 1] >= matrix[i - 1][j])) {
            result.unshift({ right: newLines[j - 1], type: 'added' });
            j--;
        } else if (i > 0 && (j === 0 || matrix[i][j - 1] < matrix[i - 1][j])) {
            result.unshift({ left: oldLines[i - 1], type: 'removed' });
            i--;
        } else {
            break; // Should not happen
        }
    }
    return result;
};


type DiffViewerProps = { patch: string } | { oldCode: string; newCode: string };

const DiffViewer: React.FC<DiffViewerProps> = (props) => {
    if ('patch' in props) {
        // Original patch rendering logic
        const renderLine = (line: string, index: number) => {
            let lineClass = 'px-4';
            if (line.startsWith('+')) lineClass = 'bg-green-800/30 text-green-300 px-4';
            else if (line.startsWith('-')) lineClass = 'bg-red-800/30 text-red-300 px-4';
            else if (line.startsWith('@@')) lineClass = 'text-cyan-400 bg-gray-700/50 px-4';
            return (
                <tr key={index} className={lineClass}>
                    <td className="w-8 text-center select-none text-gray-500">{line.startsWith('+') ? '+' : line.startsWith('-') ? '-' : ' '}</td>
                    <td><pre className="whitespace-pre-wrap break-all">{line.substring(1)}</pre></td>
                </tr>
            );
        };
        return (
            <div className="bg-bg-inset rounded-lg overflow-hidden font-mono text-sm border border-border-base h-full">
                <div className="h-full overflow-y-auto"><table className="w-full"><tbody>{props.patch.split('\n').map(renderLine)}</tbody></table></div>
            </div>
        );
    }

    // New side-by-side rendering logic
    const { oldCode, newCode } = props;
    const diffResult = diffLines(oldCode, newCode);

    return (
        <div className="bg-bg-inset rounded-lg overflow-hidden font-mono text-sm border border-border-base h-full">
            <div className="h-full overflow-y-auto">
                <table className="w-full">
                    <tbody>
                        {diffResult.map((line, index) => (
                            <tr key={index}>
                                <td className={`w-1/2 p-1 pl-4 ${line.type === 'removed' ? 'bg-red-500/10' : ''}`}>
                                    {line.type === 'removed' && <span className="text-red-400 mr-2 select-none">-</span>}
                                    <pre className="whitespace-pre-wrap break-all inline">{line.left}</pre>
                                </td>
                                <td className={`w-1/2 p-1 pl-4 ${line.type === 'added' ? 'bg-green-500/10' : ''}`}>
                                    {line.type === 'added' && <span className="text-green-400 mr-2 select-none">+</span>}
                                    <pre className="whitespace-pre-wrap break-all inline">{line.right}</pre>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DiffViewer;