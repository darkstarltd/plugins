import React, { useState } from 'react';
import { Mail, Send, X } from 'lucide-react';

interface ContactFormProps {
    onClose: () => void;
}

export const ContactForm: React.FC<ContactFormProps> = ({ onClose }) => {
    const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('sending');
        setTimeout(() => {
            setStatus('sent');
        }, 1500); // Mock sending email
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-fade-in" onClick={onClose}>
            <div
                className="bg-bg-surface w-full max-w-lg rounded-xl border border-border-base shadow-2xl p-8 animate-scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-text-base flex items-center">
                        <Mail className="w-6 h-6 mr-3 text-primary" /> Contact Support
                    </h2>
                    <button onClick={onClose} className="p-1 rounded-full text-text-muted hover:bg-bg-inset hover:text-text-base">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {status === 'sent' ? (
                    <div className="text-center py-8">
                        <h3 className="text-xl font-semibold text-green-400 mb-2">Message Sent!</h3>
                        <p className="text-text-muted">We've received your message and will get back to you at support@firefly.dev shortly.</p>
                        <button onClick={onClose} className="mt-6 w-full bg-primary text-on-primary font-bold py-2.5 rounded-lg hover:opacity-90 transition-opacity">
                            Close
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <p className="text-sm text-text-muted mb-4">Have a question or need help? Send us a message.</p>
                        <div>
                            <label htmlFor="contact-email" className="block text-sm font-medium text-text-muted mb-1">Your Email</label>
                            <input id="contact-email" type="email" required placeholder="you@example.com" className="w-full bg-bg-inset border border-border-base rounded-lg px-3 py-2 text-sm text-text-base placeholder-text-dim focus:ring-2 focus:ring-primary focus:outline-none" />
                        </div>
                        <div>
                            <label htmlFor="contact-message" className="block text-sm font-medium text-text-muted mb-1">Message</label>
                            <textarea id="contact-message" required rows={4} placeholder="How can we help?" className="w-full bg-bg-inset border border-border-base rounded-lg px-3 py-2 text-sm text-text-base placeholder-text-dim focus:ring-2 focus:ring-primary focus:outline-none"></textarea>
                        </div>
                        <button type="submit" disabled={status === 'sending'} className="w-full flex items-center justify-center space-x-2 bg-primary text-on-primary font-bold py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50">
                            <Send className="w-5 h-5" />
                            <span>{status === 'sending' ? 'Sending...' : 'Send Message'}</span>
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};
