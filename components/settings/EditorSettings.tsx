
import React from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { produce } from 'immer';
import { Settings } from '../../types';

const SettingRow: React.FC<{ label: string; children: React.ReactNode; description?: string }> = ({ label, children, description }) => (
  <div>
    <div className="flex items-center justify-between">
      <label className="text-sm font-medium text-text-muted">{label}</label>
      <div className="flex items-center gap-3">{children}</div>
    </div>
    {description && <p className="text-xs text-text-dim mt-1 max-w-xs text-right">{description}</p>}
  </div>
);

const RadioButtonGroup: React.FC<{ options: {label: string, value: string}[], name: string, selectedValue: string, onChange: (value: string) => void }> = ({ options, name, selectedValue, onChange }) => (
    <div className="flex items-center gap-1 bg-bg-surface p-1 rounded-md">
        {options.map(({label, value}) => (
            <button key={value} onClick={() => onChange(value)} className={`px-3 py-1 text-sm rounded-md transition-colors ${selectedValue === value ? 'bg-primary text-on-primary' : 'hover:bg-bg-inset'}`}>
                {label}
            </button>
        ))}
    </div>
);

const ToggleSwitch: React.FC<{ checked: boolean; onChange: (checked: boolean) => void; }> = ({ checked, onChange }) => (
    <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" />
        <div className="w-11 h-6 bg-bg-inset rounded-full peer peer-focus:ring-2 peer-focus:ring-accent peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
    </label>
);

export const EditorSettings: React.FC = () => {
    const { settings, setSettings } = useSettings();
    const { editor } = settings;

    const handleChange = <K extends keyof Settings['editor']>(key: K, value: Settings['editor'][K]) => {
        setSettings(produce(draft => {
            draft.editor[key] = value;
        }));
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-text-base">Editor</h2>
            <div className="space-y-4">
                 <SettingRow label="Font Family">
                    <RadioButtonGroup
                        name="font-family"
                        selectedValue={editor.fontFamily}
                        onChange={(v) => handleChange('fontFamily', v as 'mono' | 'sans')}
                        options={[{label: "Mono", value: "mono"}, {label: "Sans", value: "sans"}]}
                    />
                </SettingRow>

                <SettingRow label="Font Size">
                    <input type="range" min="12" max="24" step="1" value={editor.fontSize} onChange={(e) => handleChange('fontSize', parseInt(e.target.value, 10))} className="w-40 h-2 bg-bg-surface rounded-lg appearance-none cursor-pointer" style={{accentColor: 'var(--color-accent)'}} />
                    <span className="font-mono text-sm w-8 text-center">{editor.fontSize}px</span>
                </SettingRow>
                
                <SettingRow label="Line Height">
                    <input type="range" min="1.2" max="2.0" step="0.1" value={editor.lineHeight} onChange={(e) => handleChange('lineHeight', parseFloat(e.target.value))} className="w-40 h-2 bg-bg-surface rounded-lg appearance-none cursor-pointer" style={{accentColor: 'var(--color-accent)'}} />
                    <span className="font-mono text-sm w-8 text-center">{editor.lineHeight.toFixed(1)}</span>
                </SettingRow>

                <SettingRow label="Word Wrap">
                    <ToggleSwitch checked={editor.wordWrap} onChange={(c) => handleChange('wordWrap', c)} />
                </SettingRow>
                
                <SettingRow label="Show Minimap">
                    <ToggleSwitch checked={editor.showMinimap} onChange={(c) => handleChange('showMinimap', c)} />
                </SettingRow>

                <SettingRow label="Enable Bracket Matching">
                    <ToggleSwitch checked={editor.enableBracketMatching} onChange={(c) => handleChange('enableBracketMatching', c)} />
                </SettingRow>
            </div>
        </div>
    );
};