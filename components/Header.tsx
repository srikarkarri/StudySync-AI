
import React from 'react';
import { useTheme } from '../hooks/useTheme';
import { SunIcon, MoonIcon, Bars3Icon } from './icons/IconComponents';

interface HeaderProps {
    onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
    const { theme, toggleTheme } = useTheme();

    return (
        <header className="flex items-center justify-between lg:justify-end p-4 bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
             <button
                onClick={onMenuClick}
                className="lg:hidden p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Open menu"
            >
                <Bars3Icon />
            </button>
            <div className="flex items-center space-x-4">
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    aria-label="Toggle theme"
                >
                    {theme === 'light' ? <MoonIcon /> : <SunIcon />}
                </button>
                <div className="flex items-center space-x-3">
                    <img
                        className="h-9 w-9 rounded-full object-cover"
                        src="https://picsum.photos/100"
                        alt="User avatar"
                    />
                    <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Alex Doe</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Student</p>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;