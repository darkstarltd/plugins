// src/components/Preview/ReactPreview.tsx - React-specific preview
import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Square, 
  RefreshCw, 
  Package,
  ExternalLink
} from 'lucide-react';
import { useToast } from '../Toast';

interface ReactPreviewProps {
  projectPath: string;
  onError?: (error: string) => void;
}

export const ReactPreview: React.FC<ReactPreviewProps> = ({ projectPath, onError }) => {
  const toast = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);
  const [devServerUrl, setDevServerUrl] = useState<string>('');
  
  const startReactServer = async () => {
    setIsBuilding(true);
    // MOCK
    setTimeout(() => {
        const url = 'http://localhost:3000';
        setDevServerUrl(url);
        setIsRunning(true);
        toast.showToast(`React Dev Server Started on ${url}`, 'success');
        setIsBuilding(false);
    }, 1500);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border-base bg-bg-surface">
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
            React Development Server
        </h3>
        <button
            onClick={startReactServer}
            disabled={isBuilding || isRunning}
            className="btn btn-primary bg-primary text-on-primary"
        >
            {isBuilding ? (
                <><RefreshCw className="w-4 h-4 animate-spin" /> Starting...</>
            ) : (
                <><Play className="w-4 h-4" /> Start</>
            )}
        </button>
      </div>

      {devServerUrl && (
        <div className="flex-1 bg-bg-inset p-4">
          <iframe
            src={devServerUrl}
            className="w-full h-full border-none rounded-lg shadow-sm bg-white"
            title="React Preview"
          />
        </div>
      )}
    </div>
  );
}