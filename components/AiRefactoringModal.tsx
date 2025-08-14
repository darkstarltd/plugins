import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import DiffViewer from './DiffViewer';
import { useEditor } from '../contexts/EditorContext';
import { useToast } from './Toast';
import * as geminiService from '../services/geminiService';
import { WandIcon, XCircleIcon } from './icons';

interface AiRefactoringModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AiRefactoringModal: React.FC<AiRefactoringModalProps> = ({ isOpen, onClose }) => {
    const { activeFileId, getFileNode, updateFileContent } = useEditor();
    const toast = useToast();

    const [isLoading, setIsLoading] = useState(true);
    const [refactoredCode, setRefactoredCode] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const originalFile = getFileNode(activeFileId || '');

    useEffect(() => {
        if (isOpen && originalFile && originalFile.content) {
            setIsLoading(true);
            setError(null);
            setRefactoredCode(null);
            
            const language = originalFile.name.split('.').pop() || 'typescript';

            geminiService.refactorCode(originalFile.content, language)
                .then(result => {
                    setRefactoredCode(result);
                })
                .catch(err => {
                    setError("Failed to get refactoring suggestions. Please try again.");
                    console.error(err);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [isOpen, originalFile]);

    const handleApply = () => {
        if (refactoredCode && activeFileId) {
            updateFileContent(activeFileId, refactoredCode);
            toast.showToast('Refactoring applied successfully!', 'success');
            onClose();
        }
    };
    
    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-center text-text-muted">
                    <WandIcon className="w-12 h-12 text-accent animate-pulse mb-4" />
                    <h3 className="text-xl font-semibold text-text-base">Mona is refactoring your code...</h3>
                    <p>This may take a moment.</p>
                </div>
            );
        }
        if (error) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-center text-red-400">
                    <XCircleIcon className="w-12 h-12 mb-4" />
                    <h3 className="text-xl font-semibold">Refactoring Failed</h3>
                    <p>{error}</p>
                </div>
            );
        }
        if (refactoredCode && originalFile?.content) {
            return (
                <div className="flex flex-col h-full">
                    <div className="grid grid-cols-2 gap-4 px-4 pb-2 text-center font-semibold">
                        <h3>Original Code</h3>
                        <h3>Refactored by AI</h3>
                    </div>
                    <div className="flex-grow">
                         <DiffViewer oldCode={originalFile.content} newCode={refactoredCode} />
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="AI Refactoring Suggestions" size="5xl">
            <div className="h-[75vh] flex flex-col">
                <div className="flex-grow min-h-0">
                    {renderContent()}
                </div>
                <div className="flex justify-end gap-2 pt-4 mt-auto">
                    <button onClick={onClose} className="px-4 py-2 bg-bg-inset text-text-base rounded-md hover:bg-border-base font-semibold">Cancel</button>
                    <button onClick={handleApply} disabled={isLoading || !!error || !refactoredCode} className="px-4 py-2 bg-primary text-on-primary rounded-md hover:opacity-90 font-semibold transition-colors disabled:opacity-50">
                        Apply Refactoring
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default AiRefactoringModal;