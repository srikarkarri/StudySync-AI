
import React from 'react';
import { Page } from '../types';
import { HomeIcon, BookOpenIcon, PresentationChartBarIcon, XMarkIcon } from './icons/IconComponents';

interface SidebarProps {
    currentPage: Page;
    onNavigate: (page: Page) => void;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const NavItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center w-full px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
            isActive
                ? 'bg-primary-500 text-white shadow-lg'
                : 'text-gray-400 hover:bg-gray-700 hover:text-white'
        }`}
    >
        <span className="mr-3">{icon}</span>
        {label}
    </button>
);

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate, isOpen, setIsOpen }) => {
    const sidebarClasses = `
        fixed left-0 top-0 h-full w-64 bg-gray-900 text-white p-4 z-50
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
    `;

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 lg:hidden"
                    onClick={() => setIsOpen(false)}
                    aria-hidden="true"
                ></div>
            )}

            <aside className={sidebarClasses}>
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center">
                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-primary-400 mr-2">
                            <path d="M12 2.25a.75.75 0 01.75.75v11.5a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75z" />
                            <path fillRule="evenodd" d="M4.5 6.375a.75.75 0 01.75-.75h13.5a.75.75 0 010 1.5H5.25a.75.75 0 01-.75-.75zm0 6a.75.75 0 01.75-.75h13.5a.75.75 0 010 1.5H5.25a.75.75 0 01-.75-.75zM4.5 18.375a.75.75 0 01.75-.75h13.5a.75.75 0 010 1.5H5.25a.75.75 0 01-.75-.75z" clipRule="evenodd" />
                        </svg>
                        <h1 className="text-xl font-bold">StudySync AI</h1>
                    </div>
                     {/* Close button for mobile */}
                    <button onClick={() => setIsOpen(false)} className="lg:hidden p-1 text-gray-400 hover:text-white">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
                <nav className="space-y-2">
                    <NavItem
                        icon={<HomeIcon />}
                        label="Dashboard"
                        isActive={currentPage === 'dashboard'}
                        onClick={() => onNavigate('dashboard')}
                    />
                    <NavItem
                        icon={<BookOpenIcon />}
                        label="My Lectures"
                        isActive={currentPage === 'lectures'}
                        onClick={() => onNavigate('lectures')}
                    />
                    <NavItem
                        icon={<PresentationChartBarIcon />}
                        label="Progress Analytics"
                        isActive={currentPage === 'analytics'}
                        onClick={() => onNavigate('analytics')}
                    />
                </nav>
            </aside>
        </>
    );
};

export default Sidebar;