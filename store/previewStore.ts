// src/store/previewStore.ts - Preview State Management
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { PreviewConfig, PreviewSession, DeviceConfig, DevServerInfo } from '../types/preview';

interface PreviewStore {
  sessions: PreviewSession[];
  activeSessionId: string | null;
  devices: DeviceConfig[];
  isBuilding: boolean;
  buildLog: string[];
  
  // Actions
  createSession: (config: PreviewConfig) => Promise<string>;
  startSession: (sessionId: string) => Promise<void>;
  stopSession: (sessionId: string) => Promise<void>;
  setActiveSession: (sessionId: string | null) => void;
  updateSession: (sessionId: string, updates: Partial<PreviewSession>) => void;
  addBuildLog: (sessionId: string, message: string) => void;
  clearBuildLog: (sessionId: string) => void;
  addDevice: (device: DeviceConfig) => void;
  removeDevice: (deviceId: string) => void;
}

// Dev server management (mocked for frontend)
async function startDevServer(config: PreviewConfig): Promise<DevServerInfo> {
  console.log("Starting dev server for", config.framework);
  return new Promise(resolve => setTimeout(() => resolve({
    port: 3000,
    host: 'localhost',
    protocol: 'http',
    pid: 12345
  }), 1500));
}

async function stopDevServer(devServer: DevServerInfo): Promise<void> {
  console.log("Stopping dev server on port", devServer.port);
  return Promise.resolve();
}


export const usePreviewStore = create<PreviewStore>()(
  subscribeWithSelector((set, get) => ({
    sessions: [],
    activeSessionId: null,
    devices: getDefaultDevices(),
    isBuilding: false,
    buildLog: [],

    createSession: async (config) => {
      const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newSession: PreviewSession = {
        id: sessionId,
        config,
        status: 'stopped',
        lastUpdated: new Date(),
        errors: [],
      };

      set(state => ({
        sessions: [...state.sessions, newSession],
        activeSessionId: sessionId
      }));

      return sessionId;
    },

    startSession: async (sessionId) => {
      const state = get();
      const session = state.sessions.find(s => s.id === sessionId);
      if (!session) return;

      state.updateSession(sessionId, { status: 'starting' });

      try {
        const devServerInfo = await startDevServer(session.config);
        
        state.updateSession(sessionId, {
          status: 'running',
          devServer: devServerInfo,
          url: `${devServerInfo.protocol}://${devServerInfo.host}:${devServerInfo.port}`,
          lastUpdated: new Date()
        });
      } catch (error) {
        state.updateSession(sessionId, {
          status: 'error',
          errors: [{
            id: `error-${Date.now()}`,
            type: 'build',
            message: error instanceof Error ? error.message : 'Failed to start session'
          }],
          lastUpdated: new Date()
        });
      }
    },

    stopSession: async (sessionId) => {
      const state = get();
      const session = state.sessions.find(s => s.id === sessionId);
      if (!session) return;

      try {
        if (session.devServer) {
          await stopDevServer(session.devServer);
        }
        
        state.updateSession(sessionId, {
          status: 'stopped',
          devServer: undefined,
          url: undefined,
          lastUpdated: new Date()
        });
      } catch (error) {
        console.error('Failed to stop session:', error);
      }
    },

    setActiveSession: (sessionId) => {
      set({ activeSessionId: sessionId });
    },

    updateSession: (sessionId, updates) => {
      set(state => ({
        sessions: state.sessions.map(session =>
          session.id === sessionId ? { ...session, ...updates, lastUpdated: new Date() } : session
        )
      }));
    },

    addBuildLog: (sessionId, message) => {
      set(state => ({
        buildLog: [...state.buildLog, `[${new Date().toLocaleTimeString()}] ${message}`]
      }));
    },

    clearBuildLog: (sessionId) => {
      set({ buildLog: [] });
    },

    addDevice: (device) => {
      set(state => ({
        devices: [...state.devices, device]
      }));
    },

    removeDevice: (deviceId) => {
      set(state => ({
        devices: state.devices.filter(d => d.id !== deviceId)
      }));
    },
  }))
);

// Default device configurations
function getDefaultDevices(): DeviceConfig[] {
  return [
    {
      id: 'iphone-14-pro',
      name: 'iPhone 14 Pro',
      type: 'phone',
      width: 393,
      height: 852,
      pixelRatio: 3,
      orientation: 'portrait',
      platform: 'ios',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15'
    },
    {
      id: 'pixel-7',
      name: 'Pixel 7',
      type: 'phone',
      width: 412,
      height: 915,
      pixelRatio: 2.75,
      orientation: 'portrait',
      platform: 'android',
      userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36'
    },
    {
      id: 'ipad-air',
      name: 'iPad Air',
      type: 'tablet',
      width: 820,
      height: 1180,
      pixelRatio: 2,
      orientation: 'portrait',
      platform: 'ios'
    },
    {
      id: 'desktop-1920',
      name: 'Desktop (1920x1080)',
      type: 'desktop',
      width: 1920,
      height: 1080,
      pixelRatio: 1,
      orientation: 'landscape',
      platform: 'web'
    },
    {
      id: 'laptop-1440',
      name: 'Laptop (1440x900)',
      type: 'desktop',
      width: 1440,
      height: 900,
      pixelRatio: 1,
      orientation: 'landscape',
      platform: 'web'
    }
  ];
}