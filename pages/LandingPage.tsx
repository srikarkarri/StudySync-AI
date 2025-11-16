
import React from 'react';
import Button from '../components/Button';

interface LandingPageProps {
    onNavigate: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden animate-fade-in">
            <div className="absolute inset-0 bg-grid-gray-200/40 dark:bg-grid-gray-700/30 [mask-image:linear-gradient(to_bottom,white_50%,transparent_100%)]"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-primary-400/20 via-transparent to-blue-500/20 blur-3xl opacity-50"></div>
            
            <div className="relative z-10 text-center p-4">
                <div className="bg-white/50 dark:bg-gray-950/50 backdrop-blur-xl p-8 sm:p-12 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl animate-slide-in-up">
                    <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight bg-gradient-to-r from-primary-500 to-blue-500 text-transparent bg-clip-text mb-6">
                        Transform Your Study Sessions with AI
                    </h1>
                    <p className="max-w-2xl mx-auto text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-10">
                        Upload your lectures, notes, and textbooks. Get summaries, flashcards, practice quizzes, and focused study plans generated for you in minutes.
                    </p>
                    <Button onClick={onNavigate} className="px-8 py-4 text-lg shadow-primary-500/20 shadow-lg">
                        Start for Free
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
