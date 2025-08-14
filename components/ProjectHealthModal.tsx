import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { Project, ProjectHealthAnalysis, HealthIssue } from '../types';
import { analyzeProjectHealth } from '../services/geminiService';
import { CheckCircleIcon, AlertTriangleIcon, InfoIcon, XCircleIcon, WandIcon } from './icons';

const SeverityIcon: React.FC<{ severity: HealthIssue['severity'] }> = ({ severity }) => {
    switch (severity) {
        case 'critical': return <XCircleIcon className="w-5 h-5 text-red-500" />;
        case 'high': return <AlertTriangleIcon className="w-5 h-5 text-orange-500" />;
        case 'medium': return <InfoIcon className="w-5 h-5 text-yellow-500" />;
        case 'low': return <CheckCircleIcon className="w-5 h-5 text-blue-500" />;
        default: return null;
    }
};

const CategoryPill: React.FC<{ category: HealthIssue['category'] }> = ({ category }) => {
    const styles: Record<HealthIssue['category'], string> = {
        'performance': 'bg-purple-500/20 text-purple-300',
        'security': 'bg-red-500/20 text-red-300',
        'best-practice': 'bg-blue-500/20 text-blue-300',
        'bug-risk': 'bg-orange-500/20 text-orange-300',
    };
    return (
        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${styles[category]}`}>
            {category.replace('-', ' ')}
        </span>
    );
};

const ScoreDonut: React.FC<{ score: number }> = ({ score }) => {
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (score / 100) * circumference;
    const color = score > 85 ? 'text-green-400' : score > 60 ? 'text-yellow-400' : 'text-red-400';

    return (
        <div className="relative w-32 h-32">
            <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" className="text-bg-inset" strokeWidth="10" fill="transparent" stroke="currentColor" />
                <circle
                    cx="50"
                    cy="50"
                    r="45"
                    className={`transform -rotate-90 origin-center ${color}`}
                    strokeWidth="10"
                    fill="transparent"
                    stroke="currentColor"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                />
            </svg>
            <div className={`absolute inset-0 flex items-center justify-center font-bold text-3xl ${color}`}>
                {score}
            </div>
        </div>
    );
};

const ProjectHealthModal: React.FC<{ project: Project; onClose: () => void }> = ({ project, onClose }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [analysis, setAnalysis] = useState<ProjectHealthAnalysis | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const performAnalysis = async () => {
            setIsLoading(true);
            setError(null);
            const result = await analyzeProjectHealth(project);
            if (result) {
                setAnalysis(result);
            } else {
                setError('Failed to analyze project. Please try again.');
            }
            setIsLoading(false);
        };
        performAnalysis();
    }, [project]);

    return (
        <Modal isOpen={true} onClose={onClose} title={`Health Analysis for "${project.name}"`} size="3xl">
            <div className="min-h-[60vh]">
                {isLoading && (
                    <div className="flex flex-col items-center justify-center h-full text-center text-text-muted">
                        <WandIcon className="w-12 h-12 text-accent animate-pulse mb-4" />
                        <h3 className="text-xl font-semibold text-text-base">Mona is analyzing your project...</h3>
                        <p>This may take a moment for larger projects.</p>
                    </div>
                )}
                {error && (
                    <div className="flex flex-col items-center justify-center h-full text-center text-red-400">
                        <XCircleIcon className="w-12 h-12 mb-4" />
                        <h3 className="text-xl font-semibold">Analysis Failed</h3>
                        <p>{error}</p>
                    </div>
                )}
                {analysis && (
                    <div className="space-y-6">
                        <div className="flex flex-col md:flex-row items-center gap-6 p-4 bg-bg-surface rounded-lg">
                            <ScoreDonut score={analysis.overallScore} />
                            <div className="text-center md:text-left">
                                <h3 className="text-2xl font-bold text-text-base">Overall Health Score</h3>
                                <p className="text-text-muted mt-1">{analysis.summary}</p>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-lg font-semibold text-text-base mb-2">Identified Issues ({analysis.issues.length})</h4>
                            <div className="max-h-[30vh] overflow-y-auto space-y-2 bg-bg-inset p-2 rounded-md">
                                {analysis.issues.map((issue, index) => (
                                    <div key={index} className="flex items-start gap-3 p-3 bg-bg-surface rounded-md">
                                        <div className="mt-1">
                                            <SeverityIcon severity={issue.severity} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-text-base">{issue.description}</p>
                                            <div className="flex items-center gap-4 text-xs text-text-dim mt-1">
                                                <CategoryPill category={issue.category} />
                                                <span>{issue.file}:{issue.line}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default ProjectHealthModal;
