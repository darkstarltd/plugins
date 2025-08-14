// src/components/Preview/FlutterPreview.tsx - Flutter-specific preview
import React, { useState, useEffect, useRef } from 'react';
import { PreviewAPI } from '../../services/PreviewAPI';
import { 
  Play, 
  Square, 
  RefreshCw, 
  Zap,
  Terminal,
  AlertTriangle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../Toast';

interface FlutterDevice {
  id: string;
  name: string;
  platform: string;
  type: 'mobile' | 'web' | 'desktop';
  isConnected: boolean;
}

interface FlutterPreviewProps {
  projectPath: string;
  onHotReload?: () => void;
}

export const FlutterPreview: React.FC<FlutterPreviewProps> = ({ projectPath, onHotReload }) => {
  const toast = useToast();
  const [devices, setDevices] = useState<FlutterDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [buildOutput, setBuildOutput] = useState<string[]>([]);
  const [flutterUrl, setFlutterUrl] = useState<string>('');
  const [showConsole, setShowConsole] = useState(false);

  useEffect(() => {
    loadFlutterDevices();
  }, []);

  const loadFlutterDevices = async () => {
    try {
      const deviceList = await PreviewAPI.getFlutterDevices();
      setDevices(deviceList);
      const webDevice = deviceList.find(d => d.platform === 'web');
      if (webDevice) setSelectedDevice(webDevice.id);
      else if (deviceList.length > 0) setSelectedDevice(deviceList[0].id);
    } catch (error) {
      toast.showToast('Failed to load Flutter devices. Make sure Flutter is installed.', 'error');
    }
  };

  const startFlutterApp = async () => {
    if (!selectedDevice) return;
    setIsLoading(true);
    setBuildOutput(['Starting Flutter application...']);
    try {
      const result = await PreviewAPI.runFlutterApp(selectedDevice, projectPath);
      if (result.success) {
        setIsRunning(true);
        setFlutterUrl(result.url || '');
        setBuildOutput(prev => [...prev, 'Flutter app started successfully!']);
        toast.showToast(`App is running on ${devices.find(d => d.id === selectedDevice)?.name}`, 'success');
      } else {
        setBuildOutput(prev => [...prev, 'Failed to start Flutter app']);
        toast.showToast('Failed to start Flutter application', 'error');
      }
    } catch (error) {
      setBuildOutput(prev => [...prev, `Error: ${error}`]);
      toast.showToast('Failed to start Flutter application', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-bg-surface">
      <div className="p-4 border-b border-border-base">
        <h3 className="text-lg font-semibold mb-3">Flutter Preview</h3>
        <div className="flex items-center gap-4">
            <select
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              className="input flex-1 bg-bg-inset border-border-base"
              disabled={isRunning}
            >
              {devices.map(device => (
                <option key={device.id} value={device.id}>
                  {device.name} ({device.platform})
                </option>
              ))}
            </select>
            <button
              onClick={startFlutterApp}
              disabled={!selectedDevice || isLoading}
              className="btn btn-primary bg-primary text-on-primary"
            >
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              <span>{isLoading ? "Starting" : "Run"}</span>
            </button>
        </div>
      </div>
      <div className="flex-1 flex">
        {flutterUrl ? (
          <iframe
            src={flutterUrl}
            className="w-full h-full border-none"
            title="Flutter Preview"
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-text-dim">
            <p>Select a device and click Run.</p>
          </div>
        )}
      </div>
    </div>
  );
}