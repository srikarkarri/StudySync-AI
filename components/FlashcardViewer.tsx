
import React, { useState } from 'react';
import { Lecture } from '../types';
import Button from './Button';
import { XMarkIcon } from './icons/IconComponents';

const FlashcardViewer: React.FC<{ lecture: Lecture; onClose: () => void }> = ({ lecture, onClose }) => {
    const flashcards = lecture.processedData?.flashcards || [];
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    if (flashcards.length === 0) {
        return null;
    }

    const currentCard = flashcards[currentIndex];

    const handleNext = () => {
        if (isFlipped) {
            // Wait for flip back animation before changing card
            setIsFlipped(false);
            setTimeout(() => {
                setCurrentIndex((prev) => (prev + 1) % flashcards.length);
            }, 250);
        } else {
            setCurrentIndex((prev) => (prev + 1) % flashcards.length);
        }
    };

    const handlePrev = () => {
        if (isFlipped) {
             // Wait for flip back animation before changing card
            setIsFlipped(false);
            setTimeout(() => {
                setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
            }, 250);
        } else {
            setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
        }
    };
    
    const flipCard = () => setIsFlipped(!isFlipped);

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="relative w-full max-w-xl mx-4 animate-slide-in-up" onClick={(e) => e.stopPropagation()}>
                <div style={{ perspective: '1000px' }}>
                    <div
                        className={`relative w-full h-80 rounded-xl shadow-2xl cursor-pointer transition-transform duration-500 text-center flex items-center justify-center p-6 ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}
                        style={{ transformStyle: 'preserve-3d' }}
                        onClick={flipCard}
                    >
                        {/* Front Side */}
                        <div className="absolute inset-0 w-full h-full bg-white dark:bg-gray-800 rounded-xl p-6 flex items-center justify-center" style={{ backfaceVisibility: 'hidden' }}>
                            <p className="text-2xl font-semibold text-gray-800 dark:text-gray-100">{currentCard.front}</p>
                        </div>
                        {/* Back Side */}
                        <div className="absolute inset-0 w-full h-full bg-primary-600 text-white rounded-xl p-6 flex items-center justify-center" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                            <p className="text-xl">{currentCard.back}</p>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                    <Button variant="secondary" onClick={handlePrev}>Previous</Button>
                    <div className="text-center">
                        <p className="font-medium">{currentIndex + 1} / {flashcards.length}</p>
                        <p className="text-sm text-gray-400">Click card to flip</p>
                    </div>
                    <Button variant="secondary" onClick={handleNext}>Next</Button>
                </div>
                 <button 
                    onClick={onClose} 
                    className="absolute -top-3 -right-3 p-2 bg-gray-800 text-white rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-white transition-transform hover:scale-110"
                    aria-label="Close flashcard viewer"
                >
                    <XMarkIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default FlashcardViewer;
