
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

export const SecuritySettings: React.FC = () => {
    const { settings, setSettings } = useSettings();
    const { security } = settings;

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-text-base">Security</h2>
             <div className="space-y-4">
                <SettingRow label="Application Lock" description="Require a PIN or Pattern to unlock the app on startup.">
                    <span className="text-sm px-3 py-1 bg-bg-inset rounded-md">Coming Soon</span>
                </SettingRow>
            </div>
        </div>
    );
};