
import React from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { produce } from 'immer';

export const AdvancedSettings: React.FC = () => {
    const { settings, setSettings } = useSettings();
    const { advanced } = settings;

    const handleChange = (value: string) => {
        setSettings(produce(draft => {
            draft.advanced.systemPrompt = value;
        }));
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-text-base">Advanced</h2>
             <div className="space-y-2">
                <label className="text-sm font-medium text-text-muted">AI System Prompt</label>
                <p className="text-xs text-text-dim mt-1">
                    This is the core instruction given to the AI assistant before every conversation. Edit with caution.
                </p>
                <textarea
                    value={advanced.systemPrompt}
                    onChange={(e) => handleChange(e.target.value)}
                    rows={6}
                    className="w-full bg-bg-inset border border-border-base rounded-md p-2 text-sm font-mono"
                />
            </div>
        </div>
    );
};