import React from 'react';
import { CheckCircle, Sparkles, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Tier, TierName } from '../types';
import { useToast } from './Toast';

const TIERS: Tier[] = [
    {
        name: 'Explorer',
        price: 0,
        features: [
            'Basic AI Code Suggestions',
            '1 Project Workspace',
            'Community Support',
            'Standard Deployment Tools'
        ]
    },
    {
        name: 'Architect',
        price: 15,
        features: [
            'Advanced AI Code Completion',
            'AI-Powered Debugging',
            '10 Project Workspaces',
            'Live Collaboration (up to 5 users)',
            'Priority Support',
            'Advanced Deployment Tools',
        ]
    },
    {
        name: 'Forge Master',
        price: 49,
        features: [
            'All Architect Features',
            'AI Project Health Analysis',
            'Unlimited Project Workspaces',
            'Live Collaboration (unlimited)',
            'Dedicated Support Agent',
            'Enterprise-Grade Security',
        ]
    }
];

const TierCard: React.FC<{ tier: Tier; isCurrent: boolean; onUpgrade: (tier: TierName) => void }> = ({ tier, isCurrent, onUpgrade }) => {
    const isPopular = tier.name === 'Architect';
    const toast = useToast();

    const handleUpgrade = () => {
        onUpgrade(tier.name);
        toast.showToast(`Successfully upgraded to the ${tier.name} plan!`, 'success');
    }

    return (
        <div className={`relative bg-bg-surface border ${isCurrent ? 'border-primary' : 'border-border-base'} rounded-xl p-6 flex flex-col`}>
            {isPopular && <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-accent text-on-accent text-xs font-bold px-3 py-1 rounded-full">MOST POPULAR</div>}
            <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-text-base">{tier.name}</h3>
                <p className="text-4xl font-black text-text-base my-2">${tier.price}<span className="text-base font-normal text-text-muted">/mo</span></p>
            </div>
            <ul className="space-y-3 text-text-muted flex-grow">
                {tier.features.map(feature => (
                    <li key={feature} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-400 mr-2 shrink-0" />
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>
            <button
                onClick={handleUpgrade}
                disabled={isCurrent}
                className={`w-full mt-8 py-3 rounded-lg font-semibold transition-colors ${isCurrent ? 'bg-bg-inset text-text-dim cursor-not-allowed' : 'bg-primary text-on-primary hover:opacity-90'}`}
            >
                {isCurrent ? 'Current Plan' : 'Upgrade Plan'}
            </button>
        </div>
    );
};

export const Billing: React.FC = () => {
    const { user, upgradeTier } = useAuth();

    return (
        <div className="flex-1 p-4 md:p-8 overflow-y-auto bg-bg-base">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-text-base">Find the Plan That's Right for You</h1>
                <p className="text-text-muted mt-2 max-w-2xl mx-auto">
                    Unlock powerful AI features and boost your productivity with our tailored subscription plans.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {TIERS.map(tier => (
                    <TierCard
                        key={tier.name}
                        tier={tier}
                        isCurrent={user?.tier === tier.name}
                        onUpgrade={upgradeTier}
                    />
                ))}
            </div>
        </div>
    );
};

export default Billing;