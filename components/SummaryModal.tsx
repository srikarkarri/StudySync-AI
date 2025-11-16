
import React from 'react';
import { Lecture } from '../types';
import Card from './Card';
import { XMarkIcon } from './icons/IconComponents';

const SummaryModal: React.FC<{ lecture: Lecture; onClose: () => void }> = ({ lecture, onClose }) => {
    return (
        <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
            onClick={onClose}
        >
            <Card 
                className="w-full max-w-2xl mx-4 p-6 animate-slide-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-xl font-bold">{lecture.title}</h2>
                        <p className="text-primary-400">AI Generated Summary</p>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                        <XMarkIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>
                <div className="prose prose-invert max-w-none text-gray-600 dark:text-gray-300">
                    <p>{lecture.processedData?.summary}</p>
                </div>
            </Card>
        </div>
    );
};

export default SummaryModal;
