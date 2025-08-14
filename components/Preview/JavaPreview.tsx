// src/components/Preview/JavaPreview.tsx - Java application preview
import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Square, 
  RefreshCw, 
  Coffee,
  Settings
} from 'lucide-react';
import { useToast } from '../Toast';

interface JavaPreviewProps {
  projectPath: string;
  onConsoleOutput?: (output: string) => void;
}

export const JavaPreview: React.FC<JavaPreviewProps> = ({ projectPath, onConsoleOutput }) => {
  const toast = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [mainClass, setMainClass] = useState<string>('com.example.Main');

  const compileJava = async () => {
    setIsCompiling(true);
    setConsoleOutput(['Compiling Java sources...']);
    // MOCK
    setTimeout(() => {
        setConsoleOutput(prev => [...prev, 'Compilation successful!']);
        toast.showToast('Java sources compiled successfully', 'success');
        setIsCompiling(false);
    }, 1500);
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border-base bg-bg-surface">
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <Coffee className="w-6 h-6 text-orange-600" />
            Java Application
        </h3>
        <div className="flex gap-2">
            <button onClick={compileJava} disabled={isCompiling} className="btn btn-secondary">
                 <Settings className="w-4 h-4" /> Compile
            </button>
             <button disabled={isCompiling} className="btn btn-primary bg-primary text-on-primary">
                 <Play className="w-4 h-4" /> Run
            </button>
        </div>
      </div>
      <div className="flex-1 flex flex-col bg-bg-inset">
        <div className="p-4 font-mono text-sm bg-black text-green-400 flex-1 overflow-auto">
            {consoleOutput.map((line, index) => (
              <div key={index} className="whitespace-pre-wrap">{line}</div>
            ))}
        </div>
      </div>
    </div>
  );
}