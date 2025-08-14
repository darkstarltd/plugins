// src/hooks/usePreviewSync.ts - Hook for syncing file changes with preview
import { useEffect, useCallback } from 'react';
import { useEditor } from '../contexts/EditorContext';
import { usePreviewStore } from '../store/previewStore';

// Simple debounce function since lodash is not in dependencies
const debounce = <F extends (...args: any[]) => any>(func: F, waitFor: number) => {
  let timeout: number | null = null;

  const debounced = (...args: Parameters<F>) => {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
    timeout = window.setTimeout(() => func(...args), waitFor);
  };

  const debouncedAsFunc = debounced as ((...args: Parameters<F>) => void) & { cancel: () => void };
  debouncedAsFunc.cancel = () => {
      if (timeout) {
          clearTimeout(timeout);
      }
  };

  return debouncedAsFunc;
};


export function usePreviewSync() {
  const { activeFileId, getFileNode } = useEditor();
  const { sessions, activeSessionId } = usePreviewStore();

  const activeFile = getFileNode(activeFileId || '');
  const activeSession = sessions.find(s => s.id === activeSessionId);

  // Debounced function to trigger hot reload
  const triggerHotReload = useCallback(
    debounce(async () => {
      if (!activeSession || activeSession.status !== 'running') return;

      try {
        if (activeSession.config.framework === 'flutter') {
          await fetch('/api/preview/flutter/hot-reload', { // MOCK
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId: activeSession.id })
          });
          console.log("Flutter Hot Reload Triggered");
        } else if (activeSession.config.framework === 'react') {
          // React with Vite/Webpack typically handles HMR automatically via file watching.
          // In a real app with a virtual filesystem, we'd need to "save" the file.
          // For this simulation, we'll just log it.
          console.log("File changed, assuming HMR will pick it up for React.");
        }
      } catch (error) {
        console.error('Hot reload failed:', error);
      }
    }, 1000), // 1 second debounce
    [activeSession, activeFile]
  );

  // Watch for file content changes
  useEffect(() => {
    if (activeFile?.content && activeSession?.config.hotReload) {
      triggerHotReload();
    }
  }, [activeFile?.content, activeSession, triggerHotReload]);

  // Cleanup debounced function on unmount
  useEffect(() => {
    return () => {
      triggerHotReload.cancel();
    };
  }, [triggerHotReload]);
}