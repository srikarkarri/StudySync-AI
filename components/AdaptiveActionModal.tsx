import React, { useState, useEffect } from 'react';
import { QuizQuestion } from '../types';
import Card from './Card';
import Button from './Button';
import { XMarkIcon, CheckCircleIcon, XCircleIcon } from './icons/IconComponents';

interface AdaptiveActionModalProps {
    isOpen: boolean;
    isLoading: boolean;
    onClose: () => void;
    type?: 'explanation' | 'quiz';
    data?: any;
}

const QuizContent: React.FC<{ question: QuizQuestion; onClose: () => void }> = ({ question, onClose }) => {
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

    useEffect(() => {
        setSelectedAnswer(null);
    }, [question]);

    const handleAnswerSelect = (option: string) => {
        if (selectedAnswer) return;
        setSelectedAnswer(option);
    };

    const getOptionClass = (option: string) => {
        if (!selectedAnswer) {
            return 'bg-gray-100 dark:bg-gray-800/80 hover:bg-gray-200 dark:hover:bg-gray-700';
        }
        if (option === question.correctAnswer) {
            return 'bg-green-500/20 text-green-500 border-green-500';
        }
        if (option === selectedAnswer && option !== question.correctAnswer) {
            return 'bg-red-500/20 text-red-500 border-red-500';
        }
        return 'bg-gray-100 dark:bg-gray-800/80 cursor-not-allowed opacity-70';
    };

    return (
        <>
            <h3 className="text-xl font-bold mb-4">🧠 Stay Sharp!</h3>
            <p className="text-lg font-semibold mb-6">{question.question}</p>
            <div className="space-y-3">
                {question.options.map(option => (
                    <button
                        key={option}
                        onClick={() => handleAnswerSelect(option)}
                        disabled={!!selectedAnswer}
                        className={`w-full text-left p-3 rounded-lg border transition-all duration-200 flex items-center justify-between ${getOptionClass(option)}`}
                    >
                        {option}
                        {selectedAnswer && option === question.correctAnswer && <CheckCircleIcon className="w-5 h-5 text-green-500" />}
                        {selectedAnswer && option === selectedAnswer && option !== question.correctAnswer && <XCircleIcon className="w-5 h-5 text-red-500" />}
                    </button>
                ))}
            </div>
             <Button onClick={onClose} className="mt-6 w-full">
                Continue Studying
            </Button>
        </>
    );
};


const AdaptiveActionModal: React.FC<AdaptiveActionModalProps> = ({ isOpen, isLoading, onClose, type, data }) => {
     if (!isOpen && !isLoading) return null;

     const renderContent = () => {
        if (isLoading) {
            return (
                <div className="h-48 flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                    <p className="mt-4 text-gray-500">AI is preparing some help...</p>
                </div>
            );
        }

        if (type === 'explanation' && data) {
            return (
                <>
                    <h3 className="text-xl font-bold mb-4">💡 Quick Boost!</h3>
                    <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{data}</p>
                    <Button onClick={onClose} className="mt-6 w-full">Got it!</Button>
                </>
            );
        }

        if (type === 'quiz' && data) {
            return <QuizContent question={data as QuizQuestion} onClose={onClose} />;
        }
        
        return null;
    };


    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] animate-fade-in" onClick={onClose}>
            <Card className="w-full max-w-lg mx-4 p-6 animate-slide-in-up relative" onClick={(e) => e.stopPropagation()}>
                 <button onClick={onClose} className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                    <XMarkIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                </button>
                {renderContent()}
            </Card>
        </div>
    );
};

export default AdaptiveActionModal;
