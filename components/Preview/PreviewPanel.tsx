// src/components/Preview/PreviewPanel.tsx - Main Preview Panel
import React, { useState, useEffect } from 'react';
import { usePreviewStore } from '../../store/previewStore';
import { useProject } from '../../contexts/ProjectContext';
import { PreviewConfig } from '../../types/preview';
import { 
  Play, 
  Square, 
  Settings, 
  Code, 
  Smartphone,
  Monitor,
} from 'lucide-react';
import { DeviceEmulator } from './DeviceEmulator';
import { DeviceSelector } from './DeviceSelector';
import { BuildOutput } from './BuildOutput';
import { motion, AnimatePresence } from 'framer-motion';

export const PreviewPanel: React.FC = () => {
  const { 
    sessions, 
    activeSessionId, 
    devices, 
    isBuilding, 
    createSession, 
    startSession, 
    stopSession,
    setActiveSession 
  } = usePreviewStore();
  
  const { activeProject } = useProject();
  const fileTree = activeProject?.branches?.[activeProject.currentBranch || ''] || [];
  const [selectedDevice, setSelectedDevice] = useState(devices[0]);
  const [showDeviceSelector, setShowDeviceSelector] = useState(false);

  const activeSession = sessions.find(s => s.id === activeSessionId);

  useEffect(() => {
    if (activeProject && sessions.length === 0) {
      handleCreatePreview();
    }
  }, [activeProject, sessions.length]);

  const detectProjectFramework = (): string => {
    if (fileTree.some(f => f.name === 'pubspec.yaml')) return 'flutter';
    if (fileTree.some(f => f.name === 'package.json')) return 'react';
    if (fileTree.some(f => f.name === 'pom.xml' || f.name === 'build.gradle')) return 'java';
    return 'javascript';
  };

  const handleCreatePreview = async () => {
    if (!activeProject) return;

    const framework = detectProjectFramework();
    const config: PreviewConfig = {
      id: `preview-${Date.now()}`,
      type: framework === 'flutter' ? 'mobile' : 'web',
      framework: framework as any,
      device: selectedDevice,
      hotReload: true,
      autoRefresh: true,
    };

    const sessionId = await createSession(config);
    await startSession(sessionId);
  };

  const handleStartSession = async () => {
    if (activeSession) {
      await startSession(activeSession.id);
    } else {
      await handleCreatePreview();
    }
  };

  return (
    <div className="h-full flex flex-col bg-bg-surface">
      <div className="flex items-center justify-between p-4 border-b border-border-base">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Preview</h3>
          {activeSession && (
            <div className={`w-2 h-2 rounded-full ${activeSession.status === 'running' ? 'bg-green-500' : 'bg-yellow-500'}`} />
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleStartSession}
            className="px-3 py-1.5 bg-primary text-on-primary text-sm rounded-md flex items-center gap-1"
            disabled={isBuilding || !activeProject}
          >
            <Play className="w-4 h-4" />
            Start
          </button>
          <button
            onClick={() => setShowDeviceSelector(!showDeviceSelector)}
            className="p-2 hover:bg-bg-inset rounded-md"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex">
        <div className="flex-1 flex flex-col">
          {activeSession ? (
            <>
              <DeviceEmulator 
                session={activeSession}
                onClose={() => setActiveSession(null)}
              />
              <BuildOutput session={activeSession} />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
                <p>Click start to launch preview.</p>
            </div>
          )}
        </div>
        <AnimatePresence>
          {showDeviceSelector && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-l border-border-base bg-bg-surface overflow-hidden"
            >
              <div className="p-4 h-full overflow-auto">
                <DeviceSelector
                  selectedDevice={selectedDevice}
                  onDeviceSelect={setSelectedDevice}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}