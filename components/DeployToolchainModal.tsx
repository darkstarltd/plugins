import React, { useState, useMemo } from 'react';
import Modal from './Modal';
import { FirePassEntry } from '../types';
import { HardHat, LockIcon } from 'lucide-react';
import { useToast } from './Toast';

interface DeployToolchainModalProps {
  isOpen: boolean;
  onClose: () => void;
  firePassEntries: FirePassEntry[];
  isVaultLocked: boolean;
  onUnlock: () => void;
}

const DeployToolchainModal: React.FC<DeployToolchainModalProps> = ({ isOpen, onClose, firePassEntries, isVaultLocked, onUnlock }) => {
  const [command, setCommand] = useState('npm run build && npm run deploy');
  const [envVars, setEnvVars] = useState('DATABASE_URL=${vault:DB_CONN_STRING}\nAPI_KEY=${vault:API_SECRET}');
  const [logs, setLogs] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const toast = useToast();

  const secretsMap = useMemo(() => {
    if (isVaultLocked) return new Map<string, string>();
    return new Map(firePassEntries.map(entry => [entry.key, entry.value]));
  }, [firePassEntries, isVaultLocked]);

  const parseAndInjectEnv = (envText: string): Record<string, string> => {
    const injectedEnv: Record<string, string> = {};
    const vaultKeyRegex = /\${vault:([a-zA-Z0-9_]+)}/g;
    
    envText.split('\n').forEach(line => {
      const parts = line.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        let value = parts.slice(1).join('=').trim();
        
        value = value.replace(vaultKeyRegex, (match, vaultKey) => {
            return secretsMap.get(vaultKey) || `VAULT_KEY_NOT_FOUND:${vaultKey}`;
        });

        injectedEnv[key] = value;
      }
    });
    return injectedEnv;
  };

  const executeCommand = async () => {
    setIsRunning(true);
    setLogs('');
    
    const addLog = (message: string, delay = 50) => {
        return new Promise<void>(resolve => {
            setTimeout(() => {
                setLogs(prev => prev + message + '\n');
                resolve();
            }, delay);
        });
    };

    await addLog(`> ${command}`);
    const injectedEnv = parseAndInjectEnv(envVars);
    await addLog(`> Injected environment keys: ${Object.keys(injectedEnv).join(', ')}`);
    
    await addLog("Starting build process...", 1000);
    await addLog("Build successful. Output size: 2.4MB", 2000);
    
    await addLog("Starting deployment...", 500);
    
    let deploymentLog = "Deploying with configuration:\n";
    for (const [key, value] of Object.entries(injectedEnv)) {
        deploymentLog += `  ${key}=${value}\n`;
    }
    
    // Redact secrets for logging
    let redactedLog = deploymentLog;
    secretsMap.forEach((secretValue) => {
        if (secretValue) { // Ensure secret is not empty
            redactedLog = redactedLog.replace(new RegExp(secretValue, 'g'), '********');
        }
    });

    await addLog(redactedLog, 1500);
    await addLog("Deployment to production successful!", 2000);
    await addLog("Process finished with exit code 0.", 500);

    setIsRunning(false);
    toast.showToast('Deployment simulation complete!', 'success');
  };

  const LockedView = () => (
    <div className="flex flex-col items-center justify-center h-full text-center text-text-dim p-8">
        <LockIcon className="w-16 h-16 text-accent opacity-50 mb-6" />
        <h2 className="text-2xl font-bold mb-2 text-text-base">FirePass Vault is Locked</h2>
        <p className="mb-6">You must unlock your vault to inject secrets into the deploy toolchain.</p>
        <button
            onClick={() => { onClose(); onUnlock(); }}
            className="px-6 py-2 bg-accent text-on-accent font-semibold rounded-md hover:opacity-90 transition-all shadow-md hover:shadow-lg"
        >
           Unlock Vault
        </button>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Deploy Toolchain" size="4xl">
      {isVaultLocked ? <LockedView /> : (
        <div className="flex flex-col h-full space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-dim mb-1">Command</label>
            <input
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              className="w-full bg-bg-inset border border-border-base rounded-lg p-2 font-mono focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-dim mb-1">Environment Variables (use ${'${vault:KEY}'})</label>
            <textarea
              value={envVars}
              onChange={(e) => setEnvVars(e.target.value)}
              rows={4}
              className="w-full bg-bg-inset border border-border-base rounded-lg p-2 font-mono focus:outline-none focus:ring-2 focus:ring-primary resize-y"
            />
          </div>
          <div>
            <button
              onClick={executeCommand}
              disabled={isRunning}
              className="px-4 py-2 bg-primary text-on-primary font-semibold rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <HardHat className="w-4 h-4" />
              {isRunning ? 'Running...' : 'Run Command'}
            </button>
          </div>
          <div className="flex-grow bg-bg-inset rounded-lg p-4 overflow-y-auto min-h-[250px] border border-border-base">
            <pre className="text-sm font-mono whitespace-pre-wrap text-text-base">{logs || 'Logs will appear here...'}</pre>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default DeployToolchainModal;