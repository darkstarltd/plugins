// src/types/preview.ts - Preview System Types
export interface PreviewConfig {
  id: string;
  type: 'web' | 'mobile' | 'desktop';
  framework: 'react' | 'flutter' | 'javascript' | 'java' | 'vue' | 'angular';
  device?: DeviceConfig;
  url?: string;
  buildPath?: string;
  entryPoint?: string;
  hotReload: boolean;
  autoRefresh: boolean;
}

export interface DeviceConfig {
  id: string;
  name: string;
  type: 'phone' | 'tablet' | 'desktop' | 'custom';
  width: number;
  height: number;
  pixelRatio: number;
  userAgent?: string;
  orientation: 'portrait' | 'landscape';
  platform: 'ios' | 'android' | 'web' | 'windows' | 'macos' | 'linux';
}

export interface PreviewSession {
  id: string;
  config: PreviewConfig;
  status: 'starting' | 'running' | 'stopped' | 'error' | 'building';
  url?: string;
  buildOutput?: BuildOutput;
  errors?: PreviewError[];
  lastUpdated: Date;
  devServer?: DevServerInfo;
}

export interface BuildOutput {
  success: boolean;
  duration: number;
  size?: number;
  output: string;
  warnings: string[];
  errors: string[];
}

export interface PreviewError {
  id: string;
  type: 'build' | 'runtime' | 'network';
  message: string;
  file?: string;
  line?: number;
  column?: number;
  stack?: string;
}

export interface DevServerInfo {
  port: number;
  host: string;
  protocol: 'http' | 'https';
  pid?: number;
}