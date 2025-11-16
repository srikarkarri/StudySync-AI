import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Page, Lecture, CornellNotes, QuizQuestion } from '../types';
import { useTabFocus } from '../hooks/useTabFocus';
import CircularProgress from '../components/CircularProgress';
import Button from '../components/Button';
import { BookOpenIcon, PencilIcon, AcademicCapIcon, BeakerIcon } from '../components/icons/IconComponents';
import SummaryModal from '../components/SummaryModal';
import NotesModal from '../components/NotesModal';
import FlashcardViewer from '../components/FlashcardViewer';
import MindMirror from '../components/MindMirror';
import AdaptiveActionModal from '../components/AdaptiveActionModal';
import { getSimplifiedExplanation } from '../services/geminiService';
import ChatAssistant from '../components/ChatAssistant';


interface StudySessionProps {
    onNavigate: (page: Page) => void;
    currentStudyLecture: Lecture | null;
    onStartQuiz: (lecture: Lecture) => void;
    onSaveNotes: (lectureId: string, notes: CornellNotes) => void;
}

const SESSION_DURATION_SECONDS = 25 * 60; // 25 minutes

const StudySession: React.FC<StudySessionProps> = ({ onNavigate, currentStudyLecture, onStartQuiz, onSaveNotes }) => {
    const [timeLeft, setTimeLeft] = useState(SESSION_DURATION_SECONDS);
    const [isActive, setIsActive] = useState(false);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const [isSummaryOpen, setIsSummaryOpen] = useState(false);
    const [isNotesOpen, setIsNotesOpen] = useState(false);
    const [isFlashcardsOpen, setIsFlashcardsOpen] = useState(false);
    
    const [adaptiveAction, setAdaptiveAction] = useState<{ type: 'explanation' | 'quiz'; data: any } | null>(null);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const lastActionTimestamp = useRef<number>(0);

    const [switchScore, setSwitchScore] = useState(0);
    const [showFocusMessage, setShowFocusMessage] = useState(false);
    const focusMessageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const chimeRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        chimeRef.current = new Audio('https://cdn.pixabay.com/audio/2022/03/15/audio_221c9704d9.mp3');
    }, []);

    const handleUnfocus = () => {
        if (isActive) {
            if (focusMessageTimerRef.current) {
                clearTimeout(focusMessageTimerRef.current);
            }
            chimeRef.current?.play().catch(e => console.error("Audio playback failed:", e));
            setSwitchScore(prev => prev + 1);
            setShowFocusMessage(true);
            focusMessageTimerRef.current = setTimeout(() => {
                setShowFocusMessage(false);
            }, 15000);
        }
    };

    useTabFocus(handleUnfocus);

    useEffect(() => {
        if (isActive && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            if (timerRef.current) clearInterval(timerRef.current);
            setIsActive(false);
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [isActive, timeLeft]);

    useEffect(() => {
        return () => {
            if (focusMessageTimerRef.current) {
                clearTimeout(focusMessageTimerRef.current);
            }
        };
    }, []);
    
    const handleEmotionChange = useCallback(async (emotion: string) => {
        const now = Date.now();
        // Cooldown to prevent spamming the user.
        if (now - lastActionTimestamp.current < 15000) {
            return;
        }

        if (!isActive || adaptiveAction || isActionLoading) {
            return;
        }
        
        const nonFocusedStates = ['Confused', 'Bored', 'Frustrated'];

        if (nonFocusedStates.includes(emotion)) {
             if (!currentStudyLecture?.processedData) return;
            
            lastActionTimestamp.current = now;
            setIsActive(false); // Pause timer
            setIsActionLoading(true);

            try {
                const explanation = await getSimplifiedExplanation(currentStudyLecture.processedData);
                setAdaptiveAction({ type: 'explanation', data: explanation });
            } catch (error) {
                console.error("Failed to get simplified explanation", error);
                setIsActive(true); // Resume timer on error
            } finally {
                setIsActionLoading(false);
            }
        }
    }, [isActive, adaptiveAction, isActionLoading, currentStudyLecture]);
    
    const handleCloseAdaptiveModal = () => {
        setAdaptiveAction(null);
        setIsActive(true); // Resume timer when modal is closed
    };

    const toggleTimer = () => {
        setIsActive(!isActive);
    };

    const resetTimer = () => {
        if(timerRef.current) clearInterval(timerRef.current);
        setIsActive(false);
        setTimeLeft(SESSION_DURATION_SECONDS);
        setSwitchScore(0);
    };

    if (!currentStudyLecture) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <h1 className="text-2xl font-bold">No Study Session Selected</h1>
                <p className="text-gray-500 mt-2">Please start a study session from your dashboard or lectures page.</p>
                <Button onClick={() => onNavigate('dashboard')} className="mt-6">
                    Go to Dashboard
                </Button>
            </div>
        );
    }

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const progress = ((SESSION_DURATION_SECONDS - timeLeft) / SESSION_DURATION_SECONDS) * 100;
    const focusScore = Math.max(0, 100 - (switchScore * 5));

    const getFocusScoreColor = (score: number) => {
        if (score > 75) return 'text-green-500';
        if (score > 40) return 'text-yellow-500';
        return 'text-red-500';
    };


    return (
        <div className="relative animate-fade-in">
            {showFocusMessage && (
                <div className="fixed bottom-8 right-8 z-50 w-full max-w-sm animate-slide-in-up">
                    <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl shadow-2xl p-6 border border-gray-200 dark:border-primary-700">
                        <div className="flex items-start">
                            <div className="text-3xl mr-4">🙌</div>
                            <div>
                                <h2 className="text-xl font-bold mb-1">Stay Focused!</h2>
                                <p className="text-sm text-gray-600 dark:text-gray-300">You're doing great! Keep up the momentum.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <div className="flex flex-col items-center">
                 <h1 className="text-3xl font-bold mb-2 text-center">Focus Session: {currentStudyLecture.title}</h1>
                 <p className="text-lg text-gray-500 dark:text-gray-400 mb-6 text-center">{currentStudyLecture.processedData?.keyConcepts[0] || 'Focus on the key concepts.'}</p>
                 
                <div className="flex flex-col lg:flex-row items-center justify-center gap-8 w-full max-w-5xl mb-8">
                     <div className="flex-1 w-full lg:w-auto">
                         <MindMirror onEmotionChange={handleEmotionChange} />
                     </div>
                     
                     <div className="flex flex-col items-center justify-center">
                         <CircularProgress progress={progress} size={220} strokeWidth={10}>
                             <div className="text-center">
                                 <div className="text-5xl font-bold tracking-tighter">
                                     {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                                 </div>
                                 <p className="text-gray-500 uppercase text-sm tracking-widest">{isActive ? 'Focusing' : 'Paused'}</p>
                             </div>
                         </CircularProgress>

                         <div className="flex gap-4 mt-4">
                             <Button onClick={toggleTimer} className="w-28">
                                 {isActive ? 'Pause' : 'Start'}
                             </Button>
                             <Button onClick={resetTimer} variant="secondary" className="w-28">
                                 Reset
                             </Button>
                         </div>
                         <div className="flex gap-4 mt-4">
                             <div className="text-center p-3 bg-gray-100 dark:bg-gray-900/70 rounded-lg w-32">
                                 <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">Switch Score</p>
                                 <p className="text-2xl font-bold">{switchScore}</p>
                             </div>
                              <div className="text-center p-3 bg-gray-100 dark:bg-gray-900/70 rounded-lg w-32">
                                 <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">Focus Score</p>
                                 <p className={`text-2xl font-bold ${getFocusScoreColor(focusScore)}`}>{focusScore}%</p>
                             </div>
                         </div>
                     </div>
                 </div>


                <div className="w-full max-w-4xl">
                    {timeLeft === 0 ? (
                        <div className="animate-slide-in-up text-center">
                            <h2 className="text-2xl font-bold text-green-500 mb-4">Session Complete!</h2>
                            <p className="mb-6">Great work! Time to test your knowledge.</p>
                            <Button onClick={() => onStartQuiz(currentStudyLecture)} className="px-8 py-3 text-lg">
                                Take Quiz
                            </Button>
                        </div>
                    ) : (
                        <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg">
                            <h3 className="font-bold mb-3 text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 text-center">Study Materials</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <Button variant="secondary" onClick={() => setIsSummaryOpen(true)}>
                                    <BookOpenIcon className="w-4 h-4 mr-2" /> Summary
                                </Button>
                                <Button variant="secondary" onClick={() => setIsNotesOpen(true)}>
                                    <PencilIcon className="w-4 h-4 mr-2" /> My Notes
                                </Button>
                                <Button variant="secondary" onClick={() => setIsFlashcardsOpen(true)} disabled={!currentStudyLecture.processedData?.flashcards?.length}>
                                    <AcademicCapIcon className="w-4 h-4 mr-2" /> Flashcards
                                </Button>
                                <Button variant="secondary" onClick={() => onStartQuiz(currentStudyLecture)} disabled={!currentStudyLecture.processedData?.practiceQuestions?.length}>
                                    <BeakerIcon className="w-4 h-4 mr-2" /> Take Quiz
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {isSummaryOpen && <SummaryModal lecture={currentStudyLecture} onClose={() => setIsSummaryOpen(false)} />}
            {isNotesOpen && <NotesModal lecture={currentStudyLecture} onClose={() => setIsNotesOpen(false)} onSave={onSaveNotes} />}
            {isFlashcardsOpen && <FlashcardViewer lecture={currentStudyLecture} onClose={() => setIsFlashcardsOpen(false)} />}
            
            <AdaptiveActionModal 
                isOpen={!!adaptiveAction} 
                isLoading={isActionLoading}
                onClose={handleCloseAdaptiveModal}
                type={adaptiveAction?.type}
                data={adaptiveAction?.data}
            />

            {currentStudyLecture?.processedData && (
                <ChatAssistant lecture={currentStudyLecture} />
            )}
        </div>
    );
};

export default StudySession;