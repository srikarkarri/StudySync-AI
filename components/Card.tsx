
import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
    return (
        <div className={`bg-white dark:bg-gray-900/70 dark:backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 ${className}`}>
            {children}
        </div>
    );
};

export default Card;
