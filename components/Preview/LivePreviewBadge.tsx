// src/components/Preview/LivePreviewBadge.tsx - Live preview indicator
import React from 'react';
import { usePreviewStore } from '../../store/previewStore';
import { ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEditor } from '../../contexts/EditorContext';

export const LivePreviewBadge: React.FC = () => {
  const { sessions, activeSessionId } = usePreviewStore();
  const { activeFileId } = useEditor();
  
  const activeSession = sessions.find(s => s.id === activeSessionId);
  const isRunning = activeSession?.status === 'running';

  if (!isRunning || !activeFileId) {
    return null;
  }

  const openPreview = () => {
    if (activeSession?.url) {
      window.open(activeSession.url, '_blank');
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <div className="bg-primary text-on-primary px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">Live Preview</span>
          <button
            onClick={openPreview}
            className="hover:bg-white/20 p-1 rounded transition-colors"
            title="Open in new tab"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}