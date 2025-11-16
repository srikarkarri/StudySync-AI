import React, { useState, useEffect } from 'react';
import { Lecture, CornellNotes } from '../types';
import Card from './Card';
import Button from './Button';
import { XMarkIcon, TrashIcon } from './icons/IconComponents';
import { generateCornellNotes } from '../services/geminiService';

interface NotesModalProps {
    lecture: Lecture;
    onClose: () => void;
    onSave: (lectureId: string, notes: CornellNotes) => void;
}

const NotesModal: React.FC<NotesModalProps> = ({ lecture, onClose, onSave }) => {
    const [notes, setNotes] = useState<CornellNotes | null>(lecture.userNotes || null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!notes && !isLoading && lecture.processedData) {
            setIsLoading(true);
            generateCornellNotes(lecture.processedData)
                .then(generatedNotes => {
                    setNotes(prevNotes => {
                        if (prevNotes && prevNotes.pairs.length > 0 && (prevNotes.pairs[0].cue || prevNotes.pairs[0].note)) {
                            return prevNotes;
                        }
                        return generatedNotes;
                    });
                })
                .catch(error => {
                    console.error("Failed to generate Cornell notes", error);
                    // Set empty notes on failure to allow user to manually fill them
                    setNotes({ pairs: [{cue: '', note: ''}], summary: '' });
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [notes, isLoading, lecture.processedData]);

    const handlePairChange = (index: number, field: 'cue' | 'note', value: string) => {
        setNotes(prev => {
            if (!prev) return null;
            const newPairs = [...prev.pairs];
            newPairs[index] = { ...newPairs[index], [field]: value };
            return { ...prev, pairs: newPairs };
        });
    };

    const handleSummaryChange = (value: string) => {
        setNotes(prev => prev ? { ...prev, summary: value } : null);
    };

    const handleRemovePair = (index: number) => {
        setNotes(prev => {
            if (!prev) return null;
            const newPairs = prev.pairs.filter((_, i) => i !== index);
            return { ...prev, pairs: newPairs };
        });
    };
    
    const handleTextareaInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
        const textarea = e.currentTarget;
        textarea.style.height = 'auto'; // Reset height to shrink if text is deleted
        textarea.style.height = `${textarea.scrollHeight}px`;
    };

    const handleSave = () => {
        if (notes) {
            onSave(lecture.id, notes);
            onClose();
        }
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="h-96 flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500"></div>
                    <p className="mt-4 text-gray-500">Generating AI-powered notes...</p>
                </div>
            );
        }

        if (!notes) {
            return (
                <div className="h-96 flex items-center justify-center">
                    <p className="text-gray-500">Could not load notes.</p>
                </div>
            );
        }

        return (
            <>
                 <div className="grid grid-cols-3 gap-4 px-2 pb-2 border-b border-gray-300 dark:border-gray-700">
                    <h3 className="font-semibold text-primary-400">Cues / Questions</h3>
                    <h3 className="font-semibold text-primary-400 col-span-2">Main Notes</h3>
                </div>
                <div className="max-h-[24rem] overflow-y-auto pr-2">
                    {notes.pairs.map((pair, index) => (
                        <div key={index} className="grid grid-cols-3 gap-4 py-2 border-b border-gray-200 dark:border-gray-700/50">
                            <textarea
                                value={pair.cue}
                                onChange={(e) => handlePairChange(index, 'cue', e.target.value)}
                                onInput={handleTextareaInput}
                                placeholder="Cue..."
                                className="w-full p-1 rounded-lg bg-transparent focus:ring-1 focus:ring-primary-500 resize-none overflow-hidden text-sm"
                                rows={1}
                                aria-label={`Cue for note ${index + 1}`}
                            />
                            <div className="col-span-2 flex items-start gap-2">
                                <textarea
                                    value={pair.note}
                                    onChange={(e) => handlePairChange(index, 'note', e.target.value)}
                                    onInput={handleTextareaInput}
                                    placeholder="Main notes..."
                                    className="w-full p-1 rounded-lg bg-transparent focus:ring-1 focus:ring-primary-500 resize-none overflow-hidden"
                                    rows={1}
                                    aria-label={`Main note ${index + 1}`}
                                />
                                <button 
                                    onClick={() => handleRemovePair(index)} 
                                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                    aria-label={`Remove note ${index + 1}`}
                                >
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-4">
                    <h3 className="font-semibold mb-2 text-primary-400">Summary</h3>
                    <textarea
                        value={notes.summary}
                        onChange={(e) => handleSummaryChange(e.target.value)}
                        placeholder="A brief summary of the main points..."
                        className="w-full h-24 p-2 rounded-lg bg-transparent focus:ring-1 focus:ring-primary-500 resize-none"
                        aria-label="Summary of notes"
                    ></textarea>
                </div>
            </>
        );
    };

    return (
        <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
            onClick={onClose}
        >
            <Card
                className="w-full max-w-4xl mx-4 p-6 animate-slide-in-up bg-white dark:bg-gray-800"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-xl font-bold">{lecture.title}</h2>
                        <p className="text-gray-500 dark:text-gray-400">Cornell Notes</p>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                        <XMarkIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    {renderContent()}
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave} disabled={isLoading}>Save Notes</Button>
                </div>
            </Card>
        </div>
    );
};

export default NotesModal;