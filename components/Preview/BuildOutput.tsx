// src/components/Preview/BuildOutput.tsx - Build output and logs
import React, { useState, useRef, useEffect } from 'react';
import { PreviewSession } from '../../types/preview';
import { 
  ChevronDown, 
  ChevronUp, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BuildOutputProps {
  session: PreviewSession;
  maxHeight?: number;
}

export const BuildOutput: React.FC<BuildOutputProps> = ({ session, maxHeight = 200 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const buildOutput = session.buildOutput?.output || '';
  const errors = session.errors || [];

  const getStatusIcon = () => {
    if (session.status === 'building') return <RefreshCw className="w-4 h-4 animate-spin text-yellow-500" />;
    if (errors.length > 0 || session.status === 'error') return <AlertCircle className="w-4 h-4 text-red-500" />;
    if (session.status === 'running') return <CheckCircle className="w-4 h-4 text-green-500" />;
    return <Clock className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className="border-t border-border-base bg-bg-surface">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-bg-inset transition-colors"
      >
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <span className="text-sm font-medium capitalize">{session.status}</span>
        </div>
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="bg-black text-green-400 p-3 font-mono text-xs overflow-auto" style={{ maxHeight: `${maxHeight}px` }}>
              <pre className="whitespace-pre-wrap">{buildOutput || "No build output."}</pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}