// src/components/Preview/QuickPreview.tsx - Quick preview for file changes
import React, { useEffect, useState } from 'react';
import { useEditor } from '../../contexts/EditorContext';
import { Eye, EyeOff, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { marked } from 'marked';

export const QuickPreview: React.FC = () => {
  const { activeFileId, getFileNode } = useEditor();
  const [showPreview, setShowPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState('');

  const activeFile = getFileNode(activeFileId || '');
  const language = activeFile?.name.split('.').pop()?.toLowerCase() || '';

  useEffect(() => {
    if (activeFile && showPreview) {
      generatePreview();
    }
  }, [activeFile?.content, showPreview]);

  const generatePreview = () => {
    if (!activeFile || typeof activeFile.content === 'undefined') return;

    switch (language) {
      case 'html':
        setPreviewContent(activeFile.content);
        break;
      case 'md':
        setPreviewContent(marked.parse(activeFile.content) as string);
        break;
      case 'css':
        setPreviewContent(`
          <html><head><style>${activeFile.content}</style></head>
          <body><h1>CSS Preview</h1><p>This is a preview of your styles.</p><button>Button</button></body></html>`);
        break;
      default:
        setPreviewContent('');
    }
  };

  if (!activeFile || !['html', 'md', 'css'].includes(language)) {
    return null;
  }

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 border-t border-border-base bg-bg-surface">
      <button
        onClick={() => setShowPreview(!showPreview)}
        className="w-full flex items-center justify-between p-3 hover:bg-bg-inset transition-colors"
      >
        <div className="flex items-center gap-2">
          {showPreview ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          <span className="text-sm font-medium">Quick Preview</span>
        </div>
        <span className="text-xs text-gray-500 capitalize">
          {language}
        </span>
      </button>

      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 300, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border-base overflow-hidden"
          >
            <div className="h-full bg-white">
              <iframe
                srcDoc={previewContent}
                className="w-full h-full border-none"
                title="Quick Preview"
                sandbox="allow-scripts"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}