// src/components/Preview/PreviewManager.tsx - Main Preview Manager
import React, { useState, useEffect } from 'react';
import { useProject } from '../../contexts/ProjectContext';
import { 
  Smartphone, 
  Code, 
  Coffee,
} from 'lucide-react';
import { FlutterPreview } from './FlutterPreview';
import { ReactPreview } from './ReactPreview';
import { JavaPreview } from './JavaPreview';
import { JavaScriptPreview } from './JavaScriptPreview';
import { PreviewPanel } from './PreviewPanel';

export const PreviewManager: React.FC = () => {
  const { activeProject } = useProject();
  const fileTree = activeProject?.branches?.[activeProject.currentBranch || ''] || [];
  const [framework, setFramework] = useState<string>('');

  useEffect(() => {
    if (activeProject) {
      const detectedFramework = detectProjectFramework();
      setFramework(detectedFramework);
    }
  }, [activeProject, fileTree]);

  const detectProjectFramework = (): string => {
    if (!fileTree.length) return '';
    if (fileTree.some(f => f.name === 'pubspec.yaml')) return 'flutter';
    if (fileTree.some(f => f.name === 'package.json')) return 'react';
    if (fileTree.some(f => f.name === 'pom.xml' || f.name === 'build.gradle')) return 'java';
    if (fileTree.some(f => f.name === 'index.html')) return 'javascript';
    return '';
  };

  const renderPreview = () => {
    if (!activeProject) return <p className="p-4">No active project.</p>;

    switch (framework) {
        case 'flutter': return <FlutterPreview projectPath={activeProject.id} />;
        case 'react': return <ReactPreview projectPath={activeProject.id} />;
        case 'java': return <JavaPreview projectPath={activeProject.id} />;
        case 'javascript': return <JavaScriptPreview projectPath={activeProject.id} />;
        default: return <PreviewPanel />;
    }
  }

  return (
    <div className="h-full flex flex-col bg-bg-surface">
      {renderPreview()}
    </div>
  );
}