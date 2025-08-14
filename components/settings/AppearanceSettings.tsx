
import React from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { produce } from 'immer';

const SettingRow: React.FC<{ label: string; children: React.ReactNode; description?: string }> = ({ label, children, description }) => (
  <div>
    <div className="flex items-center justify-between">
      <label className="text-sm font-medium text-text-muted">{label}</label>
      <div className="flex items-center gap-3">{children}</div>
    </div>
    {description && <p className="text-xs text-text-dim mt-1 max-w-xs text-right">{description}</p>}
  </div>
);

const ToggleSwitch: React.FC<{ checked: boolean; onChange: (checked: boolean) => void; }> = ({ checked, onChange }) => (
    <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" />
        <div className="w-11 h-6 bg-bg-inset rounded-full peer peer-focus:ring-2 peer-focus:ring-accent peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
    </label>
);


export const AppearanceSettings: React.FC = () => {
    const { settings, setSettings, themes } = useSettings();

    const handleThemeChange = (themeName: string) => {
        setSettings(produce(draft => {
            draft.appearance.theme = themeName;
        }));
    };

    const handleAnimatedBgChange = (enabled: boolean) => {
         setSettings(produce(draft => {
            draft.appearance.animatedBackground = enabled;
        }));
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-text-base">Appearance</h2>
            <div className="space-y-4">
                <SettingRow label="Theme" description="Change the overall color scheme of the IDE.">
                    <select
                        value={settings.appearance.theme}
                        onChange={(e) => handleThemeChange(e.target.value)}
                        className="bg-bg-inset border border-border-base rounded-md px-2 py-1 text-sm"
                    >
                        {themes.map(theme => (
                            <option key={theme.name} value={theme.name}>{theme.name}</option>
                        ))}
                    </select>
                </SettingRow>

                <SettingRow label="Animated Background" description="Toggle the animated aurora background effect on some screens.">
                    <ToggleSwitch
                        checked={settings.appearance.animatedBackground}
                        onChange={handleAnimatedBgChange}
                    />
                </SettingRow>
            </div>
        </div>
    );
};