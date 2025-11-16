
import React, { useState } from 'react';
import { Lecture, CornellNotes } from '../types';
import { UploadCloudIcon, FileAudioIcon, FileVideoIcon, FilePdfIcon, ArrowPathIcon, CheckCircleIcon, XCircleIcon, XMarkIcon, AcademicCapIcon, BeakerIcon, PencilIcon, PlayCircleIcon } from '../components/icons/IconComponents';
import Button from '../components/Button';
import Card from '../components/Card';
import FlashcardViewer from '../components/FlashcardViewer';
import NotesModal from '../components/NotesModal';
import SummaryModal from '../components/SummaryModal';

const FileTypeIcon: React.FC<{ type?: string, className?: string }> = ({ type, className = "w-8 h-8" }) => {
    if (!type) return null;
    if (type.startsWith('audio/')) return <FileAudioIcon className={`${className} text-blue-400`} />;
    if (type.startsWith('video/')) return <FileVideoIcon className={`${className} text-purple-400`} />;
    if (type === 'application/pdf') return <FilePdfIcon className={`${className} text-red-400`} />;
    return null;
};

const LectureStatus: React.FC<{ status: Lecture['status'] }> = ({ status }) => {
    switch (status) {
        case 'ready':
            return <span className="text-xs font-medium text-green-500 bg-green-500/10 px-2 py-1 rounded-full">Ready</span>;
        case 'processing':
            return <span className="text-xs font-medium text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-full flex items-center"><ArrowPathIcon className="w-4 h-4 mr-1 animate-spin" /> Processing...</span>;
        case 'error':
            return <span className="text-xs font-medium text-red-500 bg-red-500/10 px-2 py-1 rounded-full flex items-center"><XCircleIcon className="w-4 h-4 mr-1" /> Error</span>;
        default:
            return null;
    }
};

interface MyLecturesProps {
    lectures: Lecture[];
    onProcessNewLecture: (file: File) => void;
    onStartQuiz: (lecture: Lecture) => void;
    onSaveNotes: (lectureId: string, notes: CornellNotes) => void;
    onStartStudySession: (lecture: Lecture) => void;
}

const MyLectures: React.FC<MyLecturesProps> = ({ lectures, onProcessNewLecture, onStartQuiz, onSaveNotes, onStartStudySession }) => {
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);
    const [viewingFlashcardsFor, setViewingFlashcardsFor] = useState<Lecture | null>(null);
    const [editingNotesFor, setEditingNotesFor] = useState<Lecture | null>(null);


    const handleFileChange = (files: FileList | null) => {
        if (files && files[0]) {
            setFile(files[0]);
        }
    };

    const handleUpload = () => {
        if (!file) return;
        onProcessNewLecture(file);
        setFile(null);
    };

    const onDragEnter = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
    const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
    const onDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); };
    const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        handleFileChange(e.dataTransfer.files);
    };

    return (
        <div className="animate-fade-in">
            <h1 className="text-3xl font-bold mb-6">My Lectures</h1>
            
            <Card className="p-6">
                <div 
                    className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${isDragging ? 'border-primary-500 bg-primary-500/10' : 'border-gray-300 dark:border-gray-700'}`}
                    onDragEnter={onDragEnter} onDragLeave={onDragLeave} onDragOver={onDragOver} onDrop={onDrop}
                >
                    <UploadCloudIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                        Drag & drop your files here or <span className="font-semibold text-primary-500">browse</span>
                    </p>
                    <p className="text-sm text-gray-500">Supports: MP3, MP4, PDF</p>
                    <input
                        type="file"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) => handleFileChange(e.target.files)}
                        accept=".mp3,.mp4,.pdf"
                    />
                </div>

                {file && (
                    <div className="mt-6">
                        <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800/50 rounded-lg p-3">
                            <div className="flex items-center space-x-3">
                                <FileTypeIcon type={file.type} className="w-6 h-6" />
                                <div>
                                    <p className="font-semibold text-sm">{file.name}</p>
                                    <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            </div>
                            <Button onClick={handleUpload}>
                                Process with AI
                            </Button>
                        </div>
                    </div>
                )}
            </Card>

            <div className="mt-12">
                <h2 className="text-2xl font-bold mb-4">Uploaded Content</h2>
                <div className="space-y-4">
                    {lectures.map(lecture => (
                        <Card key={lecture.id} className="p-4 flex items-center justify-between">
                             <div className="flex items-center space-x-4">
                                <FileTypeIcon type={lecture.fileType} />
                                <div>
                                    <p className="font-semibold">{lecture.title}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{lecture.date} &middot; {lecture.duration}</p>
                                    {lecture.status === 'ready' && lecture.processedData?.keyConcepts && lecture.processedData.keyConcepts.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {lecture.processedData.keyConcepts.map((concept, index) => (
                                                <span key={index} className="bg-primary-100 dark:bg-primary-900/50 text-primary-800 dark:text-primary-300 text-xs font-medium px-2.5 py-1 rounded-full">
                                                    {concept}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <LectureStatus status={lecture.status} />
                                 {lecture.retentionScore && lecture.status === 'ready' && (
                                    <div className="text-center">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Mastery</p>
                                        <p className="font-bold text-primary-400">{lecture.retentionScore}%</p>
                                    </div>
                                )}
                                <div className="flex items-center space-x-2">
                                     {lecture.status === 'ready' && (
                                         <Button 
                                            variant="secondary" 
                                            className="px-3 py-1.5 text-xs font-semibold" 
                                            onClick={() => onStartStudySession(lecture)}
                                         >
                                            <PlayCircleIcon className="w-4 h-4 mr-1.5" />
                                            Study
                                         </Button>
                                    )}
                                    {lecture.status === 'ready' && (
                                         <Button 
                                            variant="secondary" 
                                            className="px-3 py-1.5 text-xs font-semibold" 
                                            onClick={() => setEditingNotesFor(lecture)}
                                         >
                                            <PencilIcon className="w-4 h-4 mr-1.5" />
                                            Notes
                                         </Button>
                                    )}
                                    {lecture.status === 'ready' && lecture.processedData?.practiceQuestions && lecture.processedData.practiceQuestions.length > 0 && (
                                        <Button 
                                            variant="secondary" 
                                            className="px-3 py-1.5 text-xs font-semibold" 
                                            onClick={() => onStartQuiz(lecture)}
                                        >
                                            <BeakerIcon className="w-4 h-4 mr-1.5" />
                                            Take Quiz
                                        </Button>
                                    )}
                                    {lecture.status === 'ready' && lecture.processedData?.flashcards && lecture.processedData.flashcards.length > 0 && (
                                        <Button 
                                            variant="secondary" 
                                            className="px-3 py-1.5 text-xs font-semibold" 
                                            onClick={() => setViewingFlashcardsFor(lecture)}
                                        >
                                            <AcademicCapIcon className="w-4 h-4 mr-1.5" />
                                            Flashcards
                                        </Button>
                                    )}
                                    {lecture.status === 'ready' && (
                                         <Button 
                                            variant="secondary" 
                                            className="px-3 py-1.5 text-xs font-semibold" 
                                            onClick={() => setSelectedLecture(lecture)}
                                         >
                                            View Summary
                                         </Button>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            {selectedLecture && <SummaryModal lecture={selectedLecture} onClose={() => setSelectedLecture(null)} />}
            {viewingFlashcardsFor && <FlashcardViewer lecture={viewingFlashcardsFor} onClose={() => setViewingFlashcardsFor(null)} />}
            {editingNotesFor && <NotesModal lecture={editingNotesFor} onClose={() => setEditingNotesFor(null)} onSave={onSaveNotes} />}
        </div>
    );
};

export default MyLectures;
