
import React, { useState } from 'react';
import { EyeIcon, EyeOffIcon } from '../icons';

export const PasswordInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    return (
        <div className="relative">
            <input
                {...props}
                type={isPasswordVisible ? 'text' : 'password'}
            />
            <button
                type="button"
                onClick={() => setIsPasswordVisible(prev => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-dim hover:text-text-base"
                aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
            >
                {isPasswordVisible ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
            </button>
        </div>
    );
};
