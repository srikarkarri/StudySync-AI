
import React from 'react';

interface CircularProgressProps {
    progress: number;
    size?: number;
    strokeWidth?: number;
    children?: React.ReactNode;
}

const CircularProgress: React.FC<CircularProgressProps> = ({ progress, size = 200, strokeWidth = 10, children }) => {
    const center = size / 2;
    const radius = center - strokeWidth;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
                <circle
                    stroke="currentColor"
                    className="text-gray-200 dark:text-gray-700"
                    fill="transparent"
                    strokeWidth={strokeWidth}
                    r={radius}
                    cx={center}
                    cy={center}
                />
                <circle
                    stroke="currentColor"
                    className="text-primary-500"
                    fill="transparent"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    r={radius}
                    cx={center}
                    cy={center}
                    style={{ transition: 'stroke-dashoffset 0.3s ease' }}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                {children}
            </div>
        </div>
    );
};

export default CircularProgress;
