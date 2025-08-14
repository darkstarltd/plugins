
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

const RadioButtonGroup: React.FC<{ options: {label: string, value: string}[], name: string, selectedValue: string, onChange: (value: string) => void }> = ({ options, name, selectedValue, onChange }) => (
    <div className="flex items-center gap-1 bg-bg-surface p-1 rounded-md">
        {options.map(({label, value}) => (
            <button key={value} onClick={() => onChange(value)} className={`px-3 py-1 text-sm rounded-md transition-colors ${selectedValue === value ? 'bg-primary text-on-primary' : 'hover:bg-bg-inset'}`}>
                {label}
            </button>
        ))}
    </div>
);

export const AISettings: React.FC = () => {
    const { settings, setSettings } = useSettings();
    const { ai } = settings;

    const handleChange = <K extends keyof typeof ai>(key: K, value: (typeof ai)[K]) => {
        setSettings(produce(draft => {
            draft.ai[key] = value;
        }));
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-text-base">AI Settings</h2>
             <div className="space-y-4">
                 <SettingRow label="Gemini API Key" description="Leave blank to use the default shared key.">
                     <input
                        type="password"
                        placeholder="sk-..."
                        value={ai.apiKey || ''}
                        onChange={(e) => handleChange('apiKey', e.target.value)}
                        className="bg-bg-inset border border-border-base rounded-md px-2 py-1 text-sm w-64"
                    />
                </SettingRow>

                 <SettingRow label="Mona's Personality" description="Adjust how the AI assistant responds to you.">
                    <RadioButtonGroup
                        name="ai-personality"
                        selectedValue={ai.personality}
                        onChange={(v) => handleChange('personality', v as 'concise' | 'detailed' | 'playful')}
                        options={[
                            { label: 'Concise', value: 'concise' },
                            { label: 'Detailed', value: 'detailed' },
                            { label: 'Playful', value: 'playful' },
                        ]}
                    />
                </SettingRow>
            </div>
        </div>
    );
};