// src/components/Preview/JavaScriptPreview.tsx - Vanilla JavaScript preview
import React, { useState, useEffect } from 'react';
import { Play, Square } from 'lucide-react';
import { useToast } from '../Toast';
import { CheckCircle } from 'lucide-react';


interface JavaScriptPreviewProps {
  projectPath: string;
  entryFileProp?: string;
}

export const JavaScriptPreview: React.FC<JavaScriptPreviewProps> = ({ projectPath, entryFileProp = 'index.html' }) => {
  const toast = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [serverUrl, setServerUrl] = useState<string>('');
  const [projectFiles, setProjectFiles] = useState<string[]>([]);
  const [entryFile, setEntryFile] = useState(entryFileProp);


  const startStaticServer = async () => {
    // MOCK
    const url = `http://localhost:8080/${entryFile}`;
    setServerUrl(url);
    setIsRunning(true);
    toast.showToast(`Serving files from ${url}`, 'success');
  };
  
  const stopStaticServer = async () => {
    setIsRunning(false);
    setServerUrl('');
  };


  return (
    <div className="h-full flex flex-col">
      {/* JavaScript Controls */}
      <div className="p-4 border-b border-border-base bg-bg-surface">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <div className="w-6 h-6 bg-yellow-500 rounded flex items-center justify-center">
              <span className="text-black text-xs font-bold">JS</span>
            </div>
            JavaScript Preview
          </h3>

          <div className="flex items-center gap-2">
            {isRunning ? (
              <button
                onClick={stopStaticServer}
                className="btn btn-secondary"
              >
                <Square className="w-4 h-4" />
                Stop
              </button>
            ) : (
              <button
                onClick={startStaticServer}
                className="btn btn-primary bg-primary text-on-primary"
              >
                <Play className="w-4 h-4" />
                Start Server
              </button>
            )}
          </div>
        </div>

        {/* Server Info */}
        {serverUrl && (
          <div className="p-3 bg-yellow-500/10 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium">Static Server Running</span>
              <a 
                href={serverUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline text-sm ml-2"
              >
                {serverUrl}
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Preview */}
      {serverUrl && (
        <div className="flex-1 bg-bg-inset p-4">
          <iframe
            src={serverUrl}
            className="w-full h-full border-none rounded-lg shadow-sm bg-white"
            title="JavaScript Preview"
          />
        </div>
      )}
    </div>
  );
}