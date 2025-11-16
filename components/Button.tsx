
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'ghost';
    className?: string;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
    const baseClasses = "inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-950 disabled:opacity-50 disabled:cursor-not-allowed";

    const variantClasses = {
        primary: 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm focus:ring-primary-500',
        secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 focus:ring-gray-500',
        ghost: 'bg-transparent text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-900/20 focus:ring-primary-500',
    };

    return (
        <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
            {children}
        </button>
    );
};

export default Button;
