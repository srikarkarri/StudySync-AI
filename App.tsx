
import React, { useState, useMemo, useCallback } from 'react';
import { Page, Lecture, QuizQuestion, CornellNotes } from './types';
import { ThemeProvider } from './hooks/useTheme';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import MyLectures from './pages/LectureUpload';
import Analytics from './pages/Analytics';
import StudySession from './pages/StudySession';
import Quiz from './pages/Quiz';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { processLectureFile, updateRetentionMetrics } from './services/geminiService';

const MOCK_LECTURES: Lecture[] = [
    {
      id: '1',
      title: 'Introduction to Quantum Mechanics.mp4',
      date: '2024-07-28',
      duration: '58min',
      status: 'ready',
      fileType: 'video/mp4',
      retentionScore: 85,
      lastReviewed: '2024-07-25',
      nextReviewDate: '2024-08-05',
      userNotes: {
        pairs: [
            { cue: 'What is wave-particle duality?', note: '• Particles can exhibit both wave-like and particle-like properties.\n• The double-slit experiment is a key demonstration.' },
            { cue: 'What is the Schrödinger equation?', note: '• A fundamental equation that describes how the quantum state of a physical system changes over time.' },
            { cue: 'What is quantum superposition?', note: '• A particle can be in multiple states at once until it is measured. Observation collapses the superposition.' }
        ],
        summary: 'This lecture covered the core principles of quantum mechanics, including wave-particle duality shown by the double-slit experiment, the foundational Schrödinger equation for describing quantum state evolution, and the concept of superposition where particles exist in multiple states simultaneously until observed.',
      },
      processedData: {
        summary: 'This lecture introduced the fundamental principles of quantum mechanics, including wave-particle duality, the Schrödinger equation, and quantum superposition. It covered the historical context and the key experiments that led to the development of quantum theory.',
        keyConcepts: ['Wave-Particle Duality', 'Schrödinger Equation', 'Quantum Superposition', 'Heisenberg Uncertainty Principle'],
        practiceQuestions: [
          { question: 'What principle states that particles can exhibit properties of both waves and particles?', options: ['Heisenberg Uncertainty Principle', 'Quantum Superposition', 'Wave-Particle Duality', 'Schrödinger Equation'], correctAnswer: 'Wave-Particle Duality'},
          { question: 'Which equation is central to quantum mechanics for describing how a quantum state evolves over time?', options: ['Newton\'s Second Law', 'Einstein\'s Field Equations', 'Maxwell\'s Equations', 'Schrödinger Equation'], correctAnswer: 'Schrödinger Equation'}
        ],
        flashcards: [
          { front: 'What is wave-particle duality?', back: 'The concept that every particle or quantum entity may be described as either a particle or a a wave.' },
          { front: 'What is the Schrödinger equation?', back: 'A mathematical equation that describes the changes over time of a physical system in which quantum effects, such as wave–particle duality, are significant.' },
          { front: 'What is quantum superposition?', back: 'A fundamental principle of quantum mechanics that states that, much like waves in classical physics, any two (or more) quantum states can be added together ("superposed") and the result will be another valid quantum state.' }
        ],
        youtubeLinks: [],
        transcription: ''
      }
    },
    { id: '2', title: 'Cellular Biology Notes.pdf', date: '2024-07-27', duration: 'N/A', status: 'ready', fileType: 'application/pdf', retentionScore: 72, lastReviewed: '2024-07-20', nextReviewDate: new Date().toISOString().split('T')[0], processedData: { summary: 'A summary of cellular biology.', keyConcepts: ['Mitochondria', 'Cell Membrane'], practiceQuestions: [{question: 'What is the powerhouse of the cell?', options:['Nucleus', 'Mitochondria', 'Ribosome', 'Chloroplast'], correctAnswer: 'Mitochondria'}], flashcards: [], youtubeLinks: [], transcription: '' } },
    { id: '3', title: 'The Cold War History.mp3', date: '2024-07-26', duration: '45min', status: 'processing', fileType: 'audio/mpeg' },
];


const App: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<Page>('landing');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [lectures, setLectures] = useState<Lecture[]>(MOCK_LECTURES);
    const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[] | null>(null);
    const [quizTopic, setQuizTopic] = useState<string>('');
    const [quizLecture, setQuizLecture] = useState<Lecture | null>(null);
    const [currentStudyLecture, setCurrentStudyLecture] = useState<Lecture | null>(
        () => MOCK_LECTURES.find(l => l.status === 'ready') || null
    );

    const navigate = (page: Page) => {
        setCurrentPage(page);
        setIsSidebarOpen(false); // Close sidebar on navigation
    };

    const handleProcessNewLecture = async (file: File) => {
        const newLecture: Lecture = {
            id: Date.now().toString(),
            title: file.name,
            date: new Date().toLocaleDateString('en-CA'),
            duration: 'N/A',
            status: 'processing',
            fileType: file.type,
        };

        setLectures(prev => [newLecture, ...prev]);

        try {
            const processedData = await processLectureFile(file);
            setLectures(prev => prev.map(l =>
                l.id === newLecture.id ? { ...l, status: 'ready', processedData } : l
            ));
        } catch (error) {
            console.error("Failed to process lecture", error);
            setLectures(prev => prev.map(l =>
                l.id === newLecture.id ? { ...l, status: 'error' } : l
            ));
        }
    };
    
    const handleStartQuiz = (lecture: Lecture) => {
        if (lecture.processedData?.practiceQuestions) {
            const questionsWithIds = lecture.processedData.practiceQuestions.map((q, index) => ({
                ...q,
                id: `${lecture.id}-q-${index}`
            }));
            setQuizQuestions(questionsWithIds);
            setQuizTopic(lecture.title);
            setQuizLecture(lecture);
            navigate('quiz');
        }
    };

    const handleQuizComplete = async (lecture: Lecture, score: number) => {
        console.log(`Quiz complete for ${lecture.title} with score ${score}. Updating retention metrics...`);
        try {
            const { retentionScore, nextReviewDate } = await updateRetentionMetrics(lecture, score);
            setLectures(prev => prev.map(l =>
                l.id === lecture.id ? { 
                    ...l, 
                    retentionScore: Math.round(retentionScore),
                    lastReviewed: new Date().toISOString().split('T')[0],
                    nextReviewDate: nextReviewDate
                } : l
            ));
        } catch (error) {
            console.error("Failed to update retention metrics via API:", error);
            // Fallback to a simple local update if API fails
            const today = new Date();
            const nextReview = new Date();
            const daysToAdd = score > 80 ? 14 : (score > 50 ? 7 : 3);
            nextReview.setDate(today.getDate() + daysToAdd);

             setLectures(prev => prev.map(l =>
                 l.id === lecture.id ? { 
                     ...l, 
                     retentionScore: Math.round(score),
                     lastReviewed: today.toISOString().split('T')[0],
                     nextReviewDate: nextReview.toISOString().split('T')[0]
                 } : l
             ));
        }
    };

    const handleSaveNotes = useCallback((lectureId: string, notes: CornellNotes) => {
        setLectures(prev => prev.map(l =>
            l.id === lectureId ? { ...l, userNotes: notes } : l
        ));
    }, []);

    const handleStartStudySession = (lecture: Lecture) => {
        setCurrentStudyLecture(lecture);
        navigate('study');
    };

    const mainContent = useMemo(() => {
        switch (currentPage) {
            case 'landing':
                return <LandingPage onNavigate={() => navigate('dashboard')} />;
            case 'dashboard':
                return <Dashboard 
                            onNavigate={navigate} 
                            lectures={lectures}
                            studyLecture={currentStudyLecture} 
                            onStartStudySession={handleStartStudySession} 
                        />;
            case 'lectures':
                return <MyLectures 
                            lectures={lectures} 
                            onProcessNewLecture={handleProcessNewLecture} 
                            onStartQuiz={handleStartQuiz} 
                            onSaveNotes={handleSaveNotes}
                            onStartStudySession={handleStartStudySession}
                        />;
            case 'analytics':
                return <Analytics />;
            case 'study':
                return <StudySession 
                            onNavigate={navigate} 
                            currentStudyLecture={currentStudyLecture}
                            onStartQuiz={handleStartQuiz}
                            onSaveNotes={handleSaveNotes}
                        />;
            case 'quiz':
                return quizQuestions && quizLecture ? (
                    <Quiz 
                        onNavigate={navigate} 
                        questions={quizQuestions} 
                        topic={quizTopic}
                        lecture={quizLecture}
                        onComplete={handleQuizComplete}
                    />
                ) : (
                    <div className="text-center p-8">
                        <h2 className="text-xl font-semibold">No Quiz Selected</h2>
                        <p className="text-gray-500 mt-2">Please select a quiz from the 'My Lectures' page to begin.</p>
                    </div>
                );
            default:
                return <Dashboard lectures={lectures} onNavigate={navigate} studyLecture={currentStudyLecture} onStartStudySession={handleStartStudySession} />;
        }
    }, [currentPage, lectures, quizQuestions, quizTopic, quizLecture, handleSaveNotes, currentStudyLecture]);
    
    return (
        <ThemeProvider>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-200 font-sans transition-colors duration-300">
                {currentPage === 'landing' ? (
                    mainContent
                ) : (
                    <div className="flex">
                        <Sidebar 
                            currentPage={currentPage} 
                            onNavigate={navigate} 
                            isOpen={isSidebarOpen}
                            setIsOpen={setIsSidebarOpen}
                        />
                        <div className="flex-1 flex flex-col lg:ml-64">
                            <Header onMenuClick={() => setIsSidebarOpen(true)} />
                            <main className="p-4 sm:p-6 lg:p-8 flex-1">
                                {mainContent}
                            </main>
                        </div>
                    </div>
                )}
            </div>
        </ThemeProvider>
    );
};

export default App;