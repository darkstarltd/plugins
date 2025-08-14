
import React, { useState, useMemo, useEffect } from 'react';
import { FirePassEntry, PasswordGeneratorSettings } from '../types';
import { useToast } from './Toast';
import { SearchIcon, KeyIcon, EyeIcon, EyeOffIcon, PencilIcon, TrashIcon, PlusIcon, FolderIcon, LockIcon, ShieldAlertIcon } from './icons';
import { produce } from 'immer';
import { useSettings } from '../contexts/SettingsContext';
import { useFirePass } from '../contexts/FirePassContext';
import SetupVaultModal from './SetupVaultModal';
import UnlockVaultModal from './UnlockVaultModal';


const calculatePasswordStrength = (password: string): { score: number; label: string; color: string } => {
    let score = 0;
    if (!password) return { score: 0, label: 'Very Weak', color: 'bg-red-500' };

    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    
    const strength = {
        0: { label: 'Very Weak', color: 'bg-red-700' },
        1: { label: 'Weak', color: 'bg-red-500' },
        2: { label: 'Medium', color: 'bg-yellow-500' },
        3: { label: 'Strong', color: 'bg-green-500' },
        4: { label: 'Very Strong', color: 'bg-green-400' },
        5: { label: 'Excellent', color: 'bg-sky-400' },
    }[score] || { label: 'Very Weak', color: 'bg-red-700' };

    return { score, ...strength };
};


const PasswordStrengthIndicator: React.FC<{ password: string }> = ({ password }) => {
    const { score, label, color } = calculatePasswordStrength(password);
    const width = (score / 5) * 100;
    if (!password) return null;
    return (
        <div className="space-y-1">
            <div className="w-full bg-bg-surface rounded-full h-2">
                <div className={`h-2 rounded-full ${color} transition-all`} style={{ width: `${width}%` }}></div>
            </div>
            <span className="text-xs font-semibold" style={{ color: `var(--${color.replace('bg-', 'color-')})` }}>{label}</span>
        </div>
    );
};


const generatePassword = (settings: PasswordGeneratorSettings) => {
    let charset = "";
    if (settings.useLowercase) charset += "abcdefghijklmnopqrstuvwxyz";
    if (settings.useUppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (settings.useNumbers) charset += "0123456789";
    if (settings.useSymbols) charset += "!@#$%^&*()_+-=[]{}|;:,.<>?";
    if (!charset) return "Select charsets";

    let password = "";
    // Ensure all selected charsets are included
    if (settings.useLowercase) password += "abcdefghijklmnopqrstuvwxyz".charAt(Math.floor(Math.random() * 26));
    if (settings.useUppercase) password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ".charAt(Math.floor(Math.random() * 26));
    if (settings.useNumbers) password += "0123456789".charAt(Math.floor(Math.random() * 10));
    if (settings.useSymbols) password += "!@#$%^&*()_+-=[]{}|;:,.<>?".charAt(Math.floor(Math.random() * 27));

    for (let i = password.length; i < settings.length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    // Shuffle the result
    return password.split('').sort(() => 0.5 - Math.random()).join('');
};

const VaultContent: React.FC = () => {
    const { settings } = useSettings();
    const { entries, updateEntries } = useFirePass();
    const generatorSettings = settings.firepass.passwordGenerator;
    
    const [key, setKey] = useState('');
    const [value, setValue] = useState('');
    const [group, setGroup] = useState('default');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [visibleSecrets, setVisibleSecrets] = useState<Set<string>>(new Set());
    const [selectedGroup, setSelectedGroup] = useState('all');
    const toast = useToast();

    const groups = useMemo(() => ['all', 'default', ...Array.from(new Set(entries.map(s => s.group).filter(Boolean) as string[]))], [entries]);
    
    const filteredEntries = useMemo(() => {
        return entries.filter(s => 
            (selectedGroup === 'all' || s.group === selectedGroup || (!s.group && selectedGroup === 'default')) && 
            s.key.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [entries, searchTerm, selectedGroup]);

    const resetForm = () => {
        setKey('');
        setValue('');
        setGroup(selectedGroup === 'all' ? 'default' : selectedGroup);
        setEditingId(null);
    };
    
    useEffect(() => {
        resetForm();
    }, [selectedGroup]);

    const handleSave = () => {
        if (!key || !value) {
            toast.showToast('Both key and value are required.', 'error');
            return;
        }
        if (!/^[A-Z0-9_]+$/.test(key)) {
            toast.showToast('Key must be uppercase, numbers, or underscores.', 'error');
            return;
        }

        if (editingId) {
            const updatedEntries = entries.map(s => s.id === editingId ? { ...s, key, value, group, lastUpdated: new Date().toISOString() } : s);
            updateEntries(updatedEntries);
            toast.showToast(`Secret "${key}" updated.`, 'success');
        } else {
            if (entries.some(s => s.key === key)) {
                toast.showToast(`Secret with key "${key}" already exists.`, 'error');
                return;
            }
            const newEntry: FirePassEntry = { id: `sec-${Date.now()}`, key, value, group, lastUpdated: new Date().toISOString(), category: 'other', metadata: {} };
            updateEntries([...entries, newEntry]);
            toast.showToast(`Secret "${key}" added.`, 'success');
        }
        resetForm();
    };
    
    const handleEdit = (entry: FirePassEntry) => {
        setEditingId(entry.id);
        setKey(entry.key);
        setValue(entry.value);
        setGroup(entry.group || 'default');
    };
    
    const handleDelete = (entryId: string) => {
        if (window.confirm('Are you sure you want to delete this secret?')) {
            const entryToDelete = entries.find(s => s.id === entryId);
            updateEntries(entries.filter(s => s.id !== entryId));
            toast.showToast(`Secret "${entryToDelete?.key}" deleted.`, 'info');
        }
    };

    const toggleVisibility = (entryId: string) => {
        setVisibleSecrets(produce(draft => {
            if (draft.has(entryId)) draft.delete(entryId);
            else draft.add(entryId);
        }));
    };

    return (
        <div className="grid grid-cols-12 gap-6 h-full">
            {/* Left Side: Groups */}
            <div className="col-span-3 p-2 bg-bg-surface rounded-xl border border-border-base flex flex-col space-y-1">
                 <h3 className="text-sm font-semibold text-text-dim px-2 pt-1 pb-2">Groups</h3>
                 {groups.map(g => (
                    <button key={g} onClick={() => setSelectedGroup(g)} className={`w-full text-left flex items-center gap-2 p-2 rounded-md capitalize transition-colors ${selectedGroup === g ? 'bg-primary/20 text-text-base' : 'text-text-muted hover:bg-bg-inset'}`}>
                        <FolderIcon className="w-5 h-5"/> {g}
                    </button>
                 ))}
            </div>

            {/* Middle Side: Secrets List */}
            <div className="col-span-5 flex flex-col h-full">
                <div className="relative mb-4">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-dim" />
                    <input type="text" placeholder="Search secrets..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-bg-surface border border-border-base rounded-md pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"/>
                </div>
                <div className="flex-grow bg-bg-surface border border-border-base rounded-xl overflow-y-auto">
                    {filteredEntries.length > 0 ? (
                    <div className="divide-y divide-border-base">
                        {filteredEntries.map(entry => (
                        <div key={entry.id} className="p-3 flex items-center justify-between hover:bg-bg-inset">
                            <div className="flex-grow overflow-hidden">
                                <p className="font-mono text-text-base truncate">{entry.key}</p>
                                <p className="font-mono text-sm text-text-dim truncate">{visibleSecrets.has(entry.id) ? entry.value : '••••••••••••••••'}</p>
                            </div>
                            <div className="flex items-center gap-2 text-text-dim ml-4">
                                <button onClick={() => toggleVisibility(entry.id)} title={visibleSecrets.has(entry.id) ? 'Hide' : 'Show'} className="hover:text-text-base">{visibleSecrets.has(entry.id) ? <EyeOffIcon className="w-5 h-5"/> : <EyeIcon className="w-5 h-5"/>}</button>
                                <button onClick={() => handleEdit(entry)} title="Edit" className="hover:text-text-base"><PencilIcon className="w-5 h-5"/></button>
                                <button onClick={() => handleDelete(entry.id)} title="Delete" className="hover:text-red-500"><TrashIcon className="w-5 h-5"/></button>
                            </div>
                        </div>
                        ))}
                    </div>
                    ) : (
                    <p className="p-4 text-center text-text-dim">{entries.length > 0 ? 'No secrets match your search.' : 'No secrets found in this group.'}</p>
                    )}
                </div>
            </div>
            
            {/* Right Side: Add/Edit Form */}
            <div className="col-span-4 p-4 bg-bg-surface rounded-xl border border-border-base flex flex-col space-y-4">
              <h3 className="text-lg font-semibold text-text-base">{editingId ? 'Edit Secret' : 'Add New Secret'}</h3>
              <input type="text" placeholder="Secret Key (e.g., API_KEY)" value={key} onChange={(e) => setKey(e.target.value)} className="w-full bg-bg-inset border border-border-base rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary" />
              <div>
                <input type="text" placeholder="Secret Value" value={value} onChange={(e) => setValue(e.target.value)} className="w-full bg-bg-inset border border-border-base rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary" />
                <div className="mt-2">
                    <PasswordStrengthIndicator password={value} />
                </div>
              </div>
              <input type="text" placeholder="Group (e.g., 'production')" value={group} onChange={(e) => setGroup(e.target.value)} className="w-full bg-bg-inset border border-border-base rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary" />
              
              <div className="flex items-center gap-2 pt-2">
                 <button onClick={handleSave} className="px-4 py-2 bg-primary text-on-primary font-semibold rounded-md hover:opacity-90 transition-all shadow-md hover:shadow-lg">
                    <PlusIcon className="w-4 h-4 inline-block mr-1"/> {editingId ? 'Update' : 'Save'}
                </button>
                {editingId && <button onClick={resetForm} className="px-4 py-2 bg-bg-inset text-text-base font-semibold rounded-md hover:bg-border-base transition-colors">Cancel</button>}
              </div>

              <div className="border-t border-border-base pt-4 mt-auto space-y-3">
                 <h3 className="text-lg font-semibold text-text-base">Password Generator</h3>
                 <button onClick={() => setValue(generatePassword(generatorSettings))} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-bg-inset text-text-base font-semibold rounded-md hover:bg-border-base transition-colors">
                    <KeyIcon className="w-5 h-5" /> Generate and fill value
                 </button>
              </div>
            </div>
        </div>
    );
};

export default function FirePass() {
    const { isLocked, needsSetup, setup, unlock } = useFirePass();
    const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
    const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);

    useEffect(() => {
        // These modals are for contextual use, not the initial app lock.
        // The main lock screen is handled in App.tsx.
    }, [isLocked, needsSetup]);

    const handleSetup = (password: string) => {
        setup(password);
        setIsSetupModalOpen(false);
    };

    const handleUnlock = async (password: string) => {
        const success = await unlock(password);
        if (success) {
            setIsUnlockModalOpen(false);
        }
        return success;
    };
    
    const CenteredMessage: React.FC<{icon: React.ElementType, title: string, children: React.ReactNode, buttonText: string, onButtonClick: () => void}> = ({icon: Icon, title, children, buttonText, onButtonClick}) => (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-bg-surface h-full rounded-xl border border-border-base">
            <Icon className="w-16 h-16 text-accent opacity-50 mb-6" />
            <h2 className="text-2xl font-bold mb-2 text-text-base">{title}</h2>
            <p className="mb-6 text-text-muted max-w-sm">{children}</p>
            <button
                onClick={onButtonClick}
                className="px-6 py-2 bg-accent text-on-accent font-semibold rounded-md hover:opacity-90 transition-all shadow-md hover:shadow-lg"
            >
               {buttonText}
            </button>
        </div>
    );

    let content;

    if (needsSetup) {
        content = <CenteredMessage icon={ShieldAlertIcon} title="Setup Your FirePass Vault" buttonText="Setup Vault" onButtonClick={() => setIsSetupModalOpen(true)}>
            Create a master password to start securely storing your secrets. This password cannot be recovered.
        </CenteredMessage>;
    } else if (isLocked) {
        content = <CenteredMessage icon={LockIcon} title="FirePass Vault is Locked" buttonText="Unlock Vault" onButtonClick={() => setIsUnlockModalOpen(true)}>
            Enter your master password to access and manage your secrets.
        </CenteredMessage>;
    } else {
        content = <VaultContent />;
    }

    return (
        <div className="flex-1 p-4 md:p-8 overflow-hidden bg-bg-base flex flex-col">
            <div className="mb-4">
                <h1 className="text-3xl font-bold text-text-base">FirePass Vault</h1>
                <p className="text-text-muted">Securely store and manage your API keys, tokens, and other secrets.</p>
            </div>
            <div className="flex-1 overflow-hidden">
                {content}
            </div>

            {isSetupModalOpen && <SetupVaultModal isOpen={isSetupModalOpen} onClose={() => setIsSetupModalOpen(false)} onSetup={handleSetup} />}
            {isUnlockModalOpen && <UnlockVaultModal isOpen={isUnlockModalOpen} onClose={() => setIsUnlockModalOpen(false)} onUnlock={handleUnlock} />}
        </div>
    );
};