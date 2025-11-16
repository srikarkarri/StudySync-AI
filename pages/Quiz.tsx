
import React, { useState, useEffect } from 'react';
import { Page, QuizQuestion, Lecture } from '../types';
import Button from '../components/Button';
import { CheckCircleIcon, XCircleIcon } from '../components/icons/IconComponents';

interface QuizProps {
    onNavigate: (page: Page) => void;
    questions: QuizQuestion[];
    topic: string;
    lecture: Lecture;
    onComplete: (lecture: Lecture, score: number) => void;
}

const Quiz: React.FC<QuizProps> = ({ onNavigate, questions, topic, lecture, onComplete }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [score, setScore] =useState(0);
    const [showXP, setShowXP] = useState(false);
    const quizCompletedRef = React.useRef(false);

    useEffect(() => {
        // Reset state when questions change
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setIsCorrect(null);
        setScore(0);
        quizCompletedRef.current = false;
    }, [questions]);

    const handleAnswerSelect = (option: string) => {
        if (selectedAnswer) return; // Prevent changing answer
        setSelectedAnswer(option);
        const correct = option === questions[currentQuestionIndex].correctAnswer;
        setIsCorrect(correct);
        if (correct) {
            setScore(prev => prev + 10);
            setShowXP(true);
            setTimeout(() => setShowXP(false), 1000);
        }
    };
    
    const handleNextQuestion = () => {
        setSelectedAnswer(null);
        setIsCorrect(null);
        setCurrentQuestionIndex(prev => prev + 1);
    };

    if (questions.length === 0) {
        return <div className="text-center p-8">Loading quiz...</div>;
    }
    
    if (currentQuestionIndex >= questions.length) {
        // This effect runs only once when the quiz is completed.
        useEffect(() => {
            if (!quizCompletedRef.current) {
                const finalScorePercent = (score / (questions.length * 10)) * 100;
                onComplete(lecture, finalScorePercent);
                quizCompletedRef.current = true;
            }
        }, []); // Empty dependency array ensures it runs once on mount of this view

        return (
            <div className="text-center max-w-md mx-auto animate-fade-in">
                <h1 className="text-3xl font-bold mb-4">Quiz Complete!</h1>
                <p className="text-xl text-gray-500 dark:text-gray-400 mb-6">
                    You scored {score} points! Your retention score has been updated.
                </p>
                <div className="text-5xl mb-6">🎉</div>
                <Button onClick={() => onNavigate('dashboard')}>Back to Dashboard</Button>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];

    const getOptionClass = (option: string) => {
        if (!selectedAnswer) {
            return 'bg-gray-100 dark:bg-gray-800/80 hover:bg-gray-200 dark:hover:bg-gray-700';
        }
        if (option === currentQuestion.correctAnswer) {
            return 'bg-green-500/20 text-green-500 border-green-500';
        }
        if (option === selectedAnswer && option !== currentQuestion.correctAnswer) {
            return 'bg-red-500/20 text-red-500 border-red-500';
        }
        return 'bg-gray-100 dark:bg-gray-800/80 cursor-not-allowed opacity-70';
    };

    return (
        <div className="max-w-2xl mx-auto animate-fade-in">
             <h1 className="text-2xl font-bold mb-2 truncate" title={topic}>Quiz: {topic}</h1>
            <div className="flex justify-between items-center mb-4">
                <p className="text-sm font-medium text-gray-500">Question {currentQuestionIndex + 1} of {questions.length}</p>
                <div className="relative">
                    <p className="font-bold text-primary-500">{score} XP</p>
                    {showXP && <span className="absolute -top-6 right-0 text-green-500 font-bold animate-ping">+10</span>}
                </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-8">
                <div className="bg-primary-600 h-2 rounded-full" style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}></div>
            </div>
            
            <h2 className="text-2xl font-semibold mb-6">{currentQuestion.question}</h2>

            <div className="space-y-4">
                {currentQuestion.options.map(option => (
                    <button 
                        key={option} 
                        onClick={() => handleAnswerSelect(option)}
                        disabled={!!selectedAnswer}
                        className={`w-full text-left p-4 rounded-lg border transition-all duration-200 flex items-center justify-between ${getOptionClass(option)}`}
                    >
                        {option}
                        {selectedAnswer && option === currentQuestion.correctAnswer && <CheckCircleIcon className="w-6 h-6 text-green-500" />}
                        {selectedAnswer === option && option !== currentQuestion.correctAnswer && <XCircleIcon className="w-6 h-6 text-red-500" />}
                    </button>
                ))}
            </div>

            {selectedAnswer && (
                <div className="mt-8 text-center animate-slide-in-up">
                    <Button onClick={handleNextQuestion}>Next Question</Button>
                </div>
            )}
        </div>
    );
};

export default Quiz;
