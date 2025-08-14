// src/components/Preview/DeviceSelector.tsx - Device Selection Component
import React, { useState } from 'react';
import { usePreviewStore } from '../../store/previewStore';
import { DeviceConfig } from '../../types/preview';
import { Plus, Edit, Trash2, Smartphone, Tablet, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DeviceSelectorProps {
  selectedDevice?: DeviceConfig;
  onDeviceSelect: (device: DeviceConfig) => void;
}

export const DeviceSelector: React.FC<DeviceSelectorProps> = ({ selectedDevice, onDeviceSelect }) => {
  const { devices, addDevice, removeDevice } = usePreviewStore();
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [editingDevice, setEditingDevice] = useState<DeviceConfig | null>(null);

  const groupedDevices = devices.reduce((acc, device) => {
    if (!acc[device.type]) acc[device.type] = [];
    acc[device.type].push(device);
    return acc;
  }, {} as Record<string, DeviceConfig[]>);

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'phone': return Smartphone;
      case 'tablet': return Tablet;
      case 'desktop': return Monitor;
      default: return Monitor;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Device Emulator</h3>
        <button
          onClick={() => setShowAddDevice(true)}
          className="px-3 py-1.5 bg-primary text-on-primary text-sm rounded-md flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          Add Device
        </button>
      </div>

      {Object.entries(groupedDevices).map(([type, deviceList]) => (
        <div key={type} className="space-y-2">
          <h4 className="text-sm font-medium text-text-muted capitalize">
            {type}s
          </h4>
          <div className="grid grid-cols-1 gap-2">
            {deviceList.map(device => {
              const Icon = getDeviceIcon(device.type);
              const isSelected = selectedDevice?.id === device.id;
              
              return (
                <motion.button
                  key={device.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onDeviceSelect(device)}
                  className={`p-3 rounded-lg border text-left transition-all group relative ${isSelected ? 'border-primary bg-primary/10' : 'border-border-base hover:border-border-base bg-bg-surface'}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isSelected ? 'bg-primary/20 text-primary' : 'bg-bg-inset text-text-muted'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-medium text-sm text-text-base">
                        {device.name}
                      </h5>
                      <p className="text-xs text-text-dim">
                        {device.width} × {device.height} 
                        {device.pixelRatio > 1 && ` @${device.pixelRatio}x`}
                      </p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}