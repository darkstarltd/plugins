// src/services/PreviewAPI.ts - API Service for Preview Operations
import { PreviewConfig, BuildOutput } from '../types/preview';

interface FlutterDevice {
  id: string;
  name: string;
  platform: string;
  type: 'mobile' | 'web' | 'desktop';
  isConnected: boolean;
}

interface FlutterRunResult {
  success: boolean;
  url?: string;
  deviceId: string;
  processId: number;
}


// MOCKED API for frontend development
export class PreviewAPI {
  private static baseUrl = '/api/preview';

  static async buildProject(config: PreviewConfig): Promise<BuildOutput> {
    console.log("Mock Build:", config);
    return new Promise(res => setTimeout(() => res({
        success: true,
        duration: 1234,
        size: 2400,
        output: 'Build successful!',
        warnings: [],
        errors: [],
    }), 2000));
  }

  static async getFlutterDevices(): Promise<FlutterDevice[]> {
     console.log("Mock getFlutterDevices");
     return Promise.resolve([
        { id: 'chrome', name: 'Chrome', platform: 'web', type: 'web', isConnected: true },
        { id: 'macos', name: 'macOS', platform: 'desktop', type: 'desktop', isConnected: true },
        { id: 'pixel-5', name: 'Pixel 5', platform: 'android', type: 'mobile', isConnected: false },
     ]);
  }

  static async runFlutterApp(deviceId: string, projectPath: string): Promise<FlutterRunResult> {
     console.log("Mock runFlutterApp", { deviceId, projectPath });
     return new Promise(res => setTimeout(() => res({
        success: true,
        url: 'http://localhost:8080',
        deviceId,
        processId: 54321,
     }), 3000));
  }

  static async hotReload(sessionId: string): Promise<void> {
    console.log("Mock hotReload", { sessionId });
    return Promise.resolve();
  }

  static async getPreviewUrl(sessionId: string): Promise<string> {
    console.log("Mock getPreviewUrl", { sessionId });
    return Promise.resolve('http://localhost:3000');
  }
}