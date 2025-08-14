
import React from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { produce } from 'immer';

const SettingRow: React.FC<{ label: string; children: React.ReactNode; description?: string }> = ({ label, children, description }) => (
  <div>
    <div className="flex items-center justify-between">
      <label className="text-sm font-medium text-text-muted">{label}</label>
      <div className="flex items-center gap-3">{children}</div>
    </div>
    {description && <p className="text-xs text-text-dim mt-1 max-w-sm text-right">{description}</p>}
  </div>
);

const ToggleSwitch: React.FC<{ checked: boolean; onChange: (checked: boolean) => void; }> = ({ checked, onChange }) => (
    <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" />
        <div className="w-11 h-6 bg-bg-inset rounded-full peer peer-focus:ring-2 peer-focus:ring-accent peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
    </label>
);

export const AccessibilitySettings: React.FC = () => {
    const { settings, setSettings } = useSettings();
    const { accessibility } = settings;

    const handleChange = <K extends keyof typeof accessibility>(key: K, value: (typeof accessibility)[K]) => {
        setSettings(produce(draft => {
            draft.accessibility[key] = value;
        }));
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-text-base">Accessibility</h2>
             <div className="space-y-4">
                <SettingRow label="Global Font Size" description="Affects the font size of the entire UI, excluding the code editor.">
                    <input
                        type="range"
                        min="12" max="20" step="1"
                        value={accessibility.globalFontSize}
                        onChange={(e) => handleChange('globalFontSize', parseInt(e.target.value, 10))}
                        className="w-40 h-2 bg-bg-surface rounded-lg appearance-none cursor-pointer" style={{accentColor: 'var(--color-accent)'}}
                    />
                    <span className="font-mono text-sm w-8 text-center">{accessibility.globalFontSize}px</span>
                </SettingRow>

                 <SettingRow label="Reduce Motion" description="Disables animations and transitions throughout the application.">
                    <ToggleSwitch
                        checked={accessibility.reduceMotion}
                        onChange={(c) => handleChange('reduceMotion', c)}
                    />
                </SettingRow>
                
                <SettingRow label="High Contrast Mode" description="Increases text contrast for better readability. Overrides current theme.">
                    <ToggleSwitch
                        checked={accessibility.highContrast}
                        onChange={(c) => handleChange('highContrast', c)}
                    />
                </SettingRow>
            </div>
        </div>
    );
};