// src/utils/previewUtils.ts - Utility functions
import { PreviewError } from '../types/preview';

export const PreviewUtils = {
  detectFramework: (projectPath: string): string => {
    // This would analyze project files to detect framework
    // Implementation would check for specific files:
    // - pubspec.yaml = Flutter
    // - package.json with react = React
    // - pom.xml or build.gradle = Java
    // - index.html + .js files = Vanilla JavaScript
    return 'react'; // Default for now
  },

  getPreviewTemplate: (framework: string): string => {
    const templates = {
      react: `
        <!DOCTYPE html>
        <html>
          <head>
            <title>FireFly React Preview</title>
            <style>
              body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
              #root { height: 100vh; }
            </style>
          </head>
          <body>
            <div id="root"></div>
            <script type="module" src="/src/main.jsx"></script>
          </body>
        </html>
      `,
      flutter: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>FireFly Flutter Preview</title>
            <meta name="viewport" content="width=device-width,initial-scale=1">
          </head>
          <body>
            <div id="flutter-view"></div>
            <script src="flutter.js" defer></script>
          </body>
        </html>
      `,
      javascript: `
        <!DOCTYPE html>
        <html>
          <head>
            <title>FireFly JavaScript Preview</title>
            <style>
              body { margin: 0; padding: 20px; font-family: system-ui, sans-serif; }
            </style>
          </head>
          <body>
            <div id="app"></div>
            <script type="module" src="/src/main.js"></script>
          </body>
        </html>
      `
    };
    
    return templates[framework as keyof typeof templates] || templates.javascript;
  },

  generateViteConfig: (framework: string): string => {
    const configs = {
      react: `
        import { defineConfig } from 'vite'
        import react from '@vitejs/plugin-react'
        
        export default defineConfig({
          plugins: [react()],
          server: {
            port: 3000,
            host: true,
            hmr: { overlay: false }
          },
          build: {
            outDir: 'dist',
            sourcemap: true
          }
        })
      `,
      vue: `
        import { defineConfig } from 'vite'
        import vue from '@vitejs/plugin-vue'
        
        export default defineConfig({
          plugins: [vue()],
          server: {
            port: 3000,
            host: true,
            hmr: { overlay: false }
          }
        })
      `,
      javascript: `
        import { defineConfig } from 'vite'
        
        export default defineConfig({
          server: {
            port: 3000,
            host: true,
            hmr: { overlay: false }
          },
          build: {
            rollupOptions: {
              input: 'index.html'
            }
          }
        })
      `
    };
    
    return configs[framework as keyof typeof configs] || configs.javascript;
  },

  formatBuildError: (error: string): PreviewError => {
    // Parse build error and extract useful information
    const lines = error.split('\n');
    const errorLine = lines.find(line => line.includes('Error:'));
    
    return {
      id: `error-${Date.now()}`,
      type: 'build',
      message: errorLine || error,
      // Could extract file, line, column from error if format is known
    };
  }
};