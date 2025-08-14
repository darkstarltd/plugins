// src/components/Preview/DeviceEmulator.tsx - Main Device Emulator
import React, { useState, useEffect, useRef } from 'react';
import { usePreviewStore } from '../../store/previewStore';
import { DeviceConfig, PreviewSession } from '../../types/preview';
import { 
  Smartphone, 
  Tablet, 
  Monitor, 
  RotateCcw, 
  RefreshCw, 
  Maximize2,
  Minimize2,
  Home,
  ArrowLeft,
  MoreVertical,
  Wifi,
  Battery,
  Signal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DeviceEmulatorProps {
  session: PreviewSession;
  onClose?: () => void;
}

export const DeviceEmulator: React.FC<DeviceEmulatorProps> = ({ session, onClose }) => {
  const { devices, updateSession } = usePreviewStore();
  const [selectedDevice, setSelectedDevice] = useState<DeviceConfig>(
    devices.find(d => d.id === session.config.device?.id) || devices[0]
  );
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [showDeviceChrome, setShowDeviceChrome] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const deviceWidth = orientation === 'portrait' ? selectedDevice.width : selectedDevice.height;
  const deviceHeight = orientation === 'portrait' ? selectedDevice.height : selectedDevice.width;

  useEffect(() => {
    if (session.url) {
      setIsLoading(true);
    }
  }, [session.url]);

  const handleDeviceChange = (device: DeviceConfig) => {
    setSelectedDevice(device);
    updateSession(session.id, {
      config: { ...session.config, device }
    });
  };

  const toggleOrientation = () => {
    setOrientation(prev => prev === 'portrait' ? 'landscape' : 'portrait');
  };

  const handleRefresh = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  const handleZoom = (newZoom: number) => {
    setZoom(Math.max(0.25, Math.min(2, newZoom)));
  };

  if (!session.url) {
    return (
      <div className="flex items-center justify-center h-full bg-bg-surface">
        <div className="text-center">
          <div className="w-16 h-16 bg-bg-inset rounded-lg flex items-center justify-center mb-4">
            <Smartphone className="w-8 h-8 text-text-dim" />
          </div>
          <h3 className="text-lg font-medium text-text-base mb-2">
            Preview Not Available
          </h3>
          <p className="text-text-muted text-sm">
            Start a development server to see your app preview
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-bg-base">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 bg-bg-surface border-b border-border-base">
        <div className="flex items-center gap-4">
          <select
            value={selectedDevice.id}
            onChange={(e) => {
              const device = devices.find(d => d.id === e.target.value);
              if (device) handleDeviceChange(device);
            }}
            className="px-3 py-1.5 border border-border-base rounded-md text-sm bg-bg-inset"
          >
            {devices.map(device => (
              <option key={device.id} value={device.id}>
                {device.name} ({device.width}×{device.height})
              </option>
            ))}
          </select>

          <button
            onClick={toggleOrientation}
            className="p-2 hover:bg-bg-inset rounded-md transition-colors"
            title="Rotate Device"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 hover:bg-bg-inset rounded-md transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Device Container */}
      <div 
        className={`flex-1 flex items-center justify-center p-4 overflow-auto ${
          isFullscreen ? 'fixed inset-0 z-50 bg-black' : ''
        }`}
      >
        <motion.div
          animate={{ scale: zoom }}
          transition={{ type: 'tween', duration: 0.2 }}
          className="relative"
          style={{
            width: deviceWidth,
            height: deviceHeight,
          }}
        >
          <div
            className={`relative bg-white overflow-hidden shadow-lg`}
            style={{
              width: deviceWidth,
              height: deviceHeight,
            }}
          >
            {/* Loading Overlay */}
            <AnimatePresence>
              {isLoading && (
                <motion.div
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-white z-10 flex items-center justify-center"
                >
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
                    <p className="text-sm text-gray-600">Loading preview...</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Preview iframe */}
            <iframe
              ref={iframeRef}
              src={session.url}
              className="w-full h-full border-none"
              onLoad={() => setIsLoading(false)}
              style={{
                width: deviceWidth,
                height: deviceHeight,
              }}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}