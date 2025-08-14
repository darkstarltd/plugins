
import React, { useState, useEffect } from 'react';
import { KeyRound, User, AtSign, Phone, MailQuestion } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ContactForm } from './ContactForm';
import { AuroraBackground } from '../common/AuroraBackground';
import { AdminLoginModal } from './AdminLoginModal';
import { PasswordInput } from '../common/PasswordInput';

const Logo: React.FC = () => (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M24 8C15.1634 8 8 15.1634 8 24V40C8 48.8366 15.1634 56 24 56H32C45.2548 56 56 45.2548 56 32C56 18.7452 45.2548 8 32 8H24Z" fill="url(#logo_gradient_auth)"/>
        <path d="M48 12L50 16L54 18L50 20L48 24L46 20L42 18L46 16L48 12Z" fill="white"/>
        <defs>
        <linearGradient id="logo_gradient_auth" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
        <stop stopColor="#3b82f6"/>
        <stop offset="1" stopColor="#a855f7"/>
        </linearGradient>
        </defs>
    </svg>
);


type AuthMode = 'signin' | 'signup';

export const AuthScreen: React.FC = () => {
    const [mode, setMode] = useState<AuthMode>('signin');
    const [isContactFormOpen, setIsContactFormOpen] = useState(false);

    const [logoClicks, setLogoClicks] = useState(0);
    const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

    const handleLogoClick = () => {
        setLogoClicks(c => c + 1);
    };

    useEffect(() => {
        if (logoClicks === 0) return;

        if (logoClicks === 2) {
            setIsAdminModalOpen(true);
        }
        const timer = setTimeout(() => setLogoClicks(0), 500);
        return () => clearTimeout(timer);
    }, [logoClicks]);


    return (
        <div className="min-h-screen w-full bg-bg-base flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <AuroraBackground />
            <div className="absolute top-4 right-4 z-10">
                <button onClick={() => setIsContactFormOpen(true)} className="p-2 text-text-muted hover:text-text-base transition-colors" title="Contact Support">
                    <MailQuestion className="w-6 h-6" />
                </button>
            </div>
            
            <div className="w-full max-w-md z-10">
                <div 
                    className="flex flex-col items-center mb-8 cursor-pointer"
                    onClick={handleLogoClick}
                    title="FireFly Logo (Double-tap for admin)"
                >
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg mb-4">
                        <Logo />
                    </div>
                    <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-gray-200 to-gray-500 drop-shadow-md font-display">FireFly</h1>
                    <p className="text-text-muted mt-2 text-center">Unlock Your Code's Potential</p>
                </div>

                <div className="bg-glass rounded-xl p-8 shadow-2xl">
                    <div className="flex border-b border-white/10 mb-6">
                        <TabButton id="signin" label="Sign In" activeTab={mode} setActiveTab={setMode} />
                        <TabButton id="signup" label="Sign Up" activeTab={mode} setActiveTab={setMode} />
                    </div>
                    {mode === 'signin' ? <SignInForm /> : <SignUpForm />}
                </div>
                 <p className="text-center text-xs text-text-dim mt-6">
                    By signing in, you agree to our Terms of Service and Privacy Policy.
                </p>
            </div>
            {isContactFormOpen && <ContactForm onClose={() => setIsContactFormOpen(false)} />}
            {isAdminModalOpen && <AdminLoginModal onClose={() => setIsAdminModalOpen(false)} />}
        </div>
    );
};

const TabButton: React.FC<{ id: AuthMode; label: string; activeTab: AuthMode; setActiveTab: (mode: AuthMode) => void }> = ({ id, label, activeTab, setActiveTab }) => (
    <button
        onClick={() => setActiveTab(id)}
        className={`flex-1 pb-3 text-sm font-semibold transition-all duration-200 border-b-2 ${
            activeTab === id ? 'text-primary border-primary' : 'text-text-muted border-transparent hover:text-text-base'
        }`}
        aria-current={activeTab === id ? 'page' : undefined}
    >
        {label}
    </button>
);

const SignInForm: React.FC = () => {
    const { signin } = useAuth();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        const success = await signin(email);
        if (!success) {
            setError('No account found with that email. Please sign up.');
        }
        setIsLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <InputField id="email-signin" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} icon={AtSign} required />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button type="submit" disabled={isLoading} className="w-full bg-primary text-on-primary font-bold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50">
                {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
        </form>
    );
};

const SignUpForm: React.FC = () => {
    const { signup } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [masterPassword, setMasterPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (masterPassword.length < 8) {
            setError('Password must be at least 8 characters long.');
            return;
        }
        setError('');
        setIsLoading(true);
        await signup({ name, email, phone, masterPassword });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
             <InputField id="name" type="text" placeholder="Your Name" value={name} onChange={e => setName(e.target.value)} icon={User} required />
             <InputField id="email-signup" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} icon={AtSign} required />
             <InputField id="phone" type="tel" placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} icon={Phone} required />
             <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-dim z-10" />
                <PasswordInput
                    id="master-password"
                    placeholder="Master Password (min 8 chars)"
                    value={masterPassword}
                    onChange={e => setMasterPassword(e.target.value)}
                    className="w-full bg-black/20 border border-white/20 rounded-lg pl-10 pr-10 py-2.5 text-sm text-text-base placeholder-text-dim focus:ring-2 focus:ring-primary focus:outline-none"
                    required
                />
            </div>
             {error && <p className="text-sm text-red-400">{error}</p>}
            <button type="submit" disabled={isLoading} className="w-full bg-primary text-on-primary font-bold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50">
                {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
        </form>
    );
};

const InputField: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { icon: React.ElementType }> = ({ icon: Icon, ...props }) => (
    <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-dim" />
        <input
            {...props}
            className="w-full bg-black/20 border border-white/20 rounded-lg pl-10 pr-3 py-2.5 text-sm text-text-base placeholder-text-dim focus:ring-2 focus:ring-primary focus:outline-none"
        />
    </div>
);
