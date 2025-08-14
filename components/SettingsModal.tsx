
import React, { useState } from 'react';
import Modal from './Modal';
import { FirePassEntry } from '../types';
import { Palette, Bot, ShieldCheck, Accessibility, Lock, SlidersHorizontal, Code } from 'lucide-react';
import { AppearanceSettings } from './settings/AppearanceSettings';
import { AISettings } from './settings/AISettings';
import { FirePassSettings } from './settings/FirePassSettings';
import { AccessibilitySettings } from './settings/AccessibilitySettings';
import { SecuritySettings } from './settings/SecuritySettings';
import { AdvancedSettings } from './settings/AdvancedSettings';
import { EditorSettings } from './settings/EditorSettings';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMasterPasswordChange: () => void;
  onVaultImport: (secrets: FirePassEntry[]) => void;
  onVaultExport: () => void;
  onClearVault: () => void;
}

type SettingsTab = 'appearance' | 'editor' | 'ai' | 'firepass' | 'security' | 'accessibility' | 'advanced';

const TABS: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'editor', label: 'Editor', icon: Code },
    { id: 'ai', label: 'AI', icon: Bot },
    { id: 'firepass', label: 'FirePass', icon: ShieldCheck },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'accessibility', label: 'Accessibility', icon: Accessibility },
    { id: 'advanced', label: 'Advanced', icon: SlidersHorizontal },
];

const SettingsModal: React.FC<SettingsModalProps> = (props) => {
  const { isOpen, onClose } = props;
  const [activeTab, setActiveTab] = useState<SettingsTab>('appearance');

  const renderContent = () => {
    switch (activeTab) {
      case 'appearance': return <AppearanceSettings />;
      case 'editor': return <EditorSettings />;
      case 'ai': return <AISettings />;
      case 'firepass': return <FirePassSettings {...props} />;
      case 'security': return <SecuritySettings />;
      case 'accessibility': return <AccessibilitySettings />;
      case 'advanced': return <AdvancedSettings />;
      default: return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings" size="4xl">
      <div className="flex h-full max-h-[75vh]">
        <div className="w-48 shrink-0 pr-4 border-r border-border-base space-y-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 p-2 rounded-md text-left text-sm transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary/20 text-text-base font-semibold'
                  : 'text-text-muted hover:bg-bg-inset'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
        <div className="flex-1 pl-6 overflow-y-auto pr-2">
          {renderContent()}
        </div>
      </div>
    </Modal>
  );
};

export default SettingsModal;