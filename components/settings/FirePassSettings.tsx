
import React from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { produce } from 'immer';
import { DownloadIcon, KeyRound, UploadIcon } from '../icons';
import { FirePassEntry } from '../../types';
import { useToast } from '../Toast';

interface FirePassSettingsProps {
  onMasterPasswordChange: () => void;
  onVaultImport: (secrets: FirePassEntry[]) => void;
  onVaultExport: () => void;
  onClearVault: () => void;
}

const SettingRow: React.FC<{ label: string; children: React.ReactNode; description?: string }> = ({ label, children, description }) => (
  <div className="py-2">
    <div className="flex items-center justify-between">
      <label className="text-sm font-medium text-text-muted">{label}</label>
      <div className="flex items-center gap-3">{children}</div>
    </div>
    {description && <p className="text-xs text-text-dim mt-1 max-w-sm text-right ml-auto">{description}</p>}
  </div>
);

const ToggleSwitch: React.FC<{ checked: boolean; onChange: (checked: boolean) => void; }> = ({ checked, onChange }) => (
    <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" />
        <div className="w-11 h-6 bg-bg-inset rounded-full peer peer-focus:ring-2 peer-focus:ring-accent peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
    </label>
);

export const FirePassSettings: React.FC<FirePassSettingsProps> = (props) => {
    const { onMasterPasswordChange, onVaultImport, onVaultExport, onClearVault } = props;
    const { settings, setSettings } = useSettings();
    const { firepass } = settings;
    const toast = useToast();
    const importFileRef = React.useRef<HTMLInputElement>(null);

    const handleAutoLockChange = (minutes: number) => {
        setSettings(produce(draft => {
            draft.firepass.autoLockMinutes = minutes;
        }));
    };

    const handlePasswordGeneratorChange = <K extends keyof typeof firepass.passwordGenerator>(key: K, value: (typeof firepass.passwordGenerator)[K]) => {
      setSettings(produce(draft => {
          (draft.firepass.passwordGenerator as any)[key] = value;
      }));
    };
    
    const handleVaultImportClick = () => {
        importFileRef.current?.click();
    };
  
    const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const importedSecrets = JSON.parse(event.target?.result as string);
                    if (Array.isArray(importedSecrets) && importedSecrets.every(s => s.id && s.key && s.value)) {
                        onVaultImport(importedSecrets);
                    } else {
                        throw new Error('Invalid secret format');
                    }
                } catch (err) {
                    toast.showToast('Failed to import vault. Invalid file format.', 'error');
                }
            };
            reader.readAsText(file);
        }
        if(e.target) e.target.value = '';
    };

    const lockOptions = [5, 15, 30, 60, 0]; // 0 for never

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-text-base">FirePass Vault</h2>
            <div className="divide-y divide-border-base">
                <SettingRow label="Change Master Password">
                    <button onClick={onMasterPasswordChange} className="px-3 py-1 text-sm rounded-md bg-bg-surface hover:bg-border-base flex items-center gap-2"><KeyRound className="w-4 h-4"/>Change</button>
                </SettingRow>
                <SettingRow label="Auto-Lock Vault" description="Automatically lock the vault after a period of inactivity.">
                    <select
                        value={firepass.autoLockMinutes}
                        onChange={(e) => handleAutoLockChange(Number(e.target.value))}
                        className="bg-bg-inset border border-border-base rounded-md px-2 py-1 text-sm"
                    >
                        {lockOptions.map(min => <option key={min} value={min}>{min === 0 ? 'Never' : `${min} Minutes`}</option>)}
                    </select>
                </SettingRow>
                <SettingRow label="Vault Data">
                    <div className="flex gap-2">
                        <input type="file" ref={importFileRef} className="hidden" accept=".json" onChange={handleFileSelected} />
                        <button onClick={handleVaultImportClick} className="px-3 py-1 text-sm flex items-center gap-2 rounded-md bg-bg-surface hover:bg-border-base"><UploadIcon className="w-4 h-4" /> Import</button>
                        <button onClick={onVaultExport} className="px-3 py-1 text-sm flex items-center gap-2 rounded-md bg-bg-surface hover:bg-border-base"><DownloadIcon className="w-4 h-4" /> Export</button>
                    </div>
                </SettingRow>
                <SettingRow label="Clear All Vault Data" description="This will permanently delete all secrets. This action cannot be undone.">
                    <button onClick={onClearVault} className="px-3 py-1 text-sm rounded-md bg-red-800/80 text-red-200 hover:bg-red-700/80">Delete Vault</button>
                </SettingRow>
            </div>

            <h3 className="text-lg font-bold text-text-base pt-4">Password Generator Defaults</h3>
            <div className="divide-y divide-border-base">
                <SettingRow label="Password Length">
                    <input type="range" min="8" max="64" step="1" value={firepass.passwordGenerator.length} onChange={(e) => handlePasswordGeneratorChange('length', parseInt(e.target.value, 10))} className="w-40 h-2 bg-bg-surface rounded-lg appearance-none cursor-pointer" style={{accentColor: 'var(--color-accent)'}} />
                    <span className="font-mono text-sm w-8 text-center">{firepass.passwordGenerator.length}</span>
                </SettingRow>
                <SettingRow label="Include Uppercase (A-Z)">
                    <ToggleSwitch checked={firepass.passwordGenerator.useUppercase} onChange={(c) => handlePasswordGeneratorChange('useUppercase', c)} />
                </SettingRow>
                <SettingRow label="Include Lowercase (a-z)">
                    <ToggleSwitch checked={firepass.passwordGenerator.useLowercase} onChange={(c) => handlePasswordGeneratorChange('useLowercase', c)} />
                </SettingRow>
                <SettingRow label="Include Numbers (0-9)">
                    <ToggleSwitch checked={firepass.passwordGenerator.useNumbers} onChange={(c) => handlePasswordGeneratorChange('useNumbers', c)} />
                </SettingRow>
                <SettingRow label="Include Symbols (!@#$)">
                    <ToggleSwitch checked={firepass.passwordGenerator.useSymbols} onChange={(c) => handlePasswordGeneratorChange('useSymbols', c)} />
                </SettingRow>
            </div>
        </div>
    );
};