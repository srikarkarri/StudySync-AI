import React, { useState, useRef, useEffect, useCallback } from 'react';
import { analyzeFacialExpression } from '../services/geminiService';
import Button from './Button';

interface MindMirrorProps {
    onEmotionChange: (emotion: string) => void;
}

const MindMirror: React.FC<MindMirrorProps> = ({ onEmotionChange }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isTracking, setIsTracking] = useState(false);
    const [displayedEmotion, setDisplayedEmotion] = useState<string>('Not Tracking');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const emotionHistory = useRef<string[]>([]);

    const startWebcam = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Error accessing webcam:", err);
            setError("Could not access webcam. Please check permissions.");
        }
    };

    const stopWebcam = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
    };
    
    // Function to get the most frequent emotion from history for stable UI
    const getStableEmotion = (history: string[]): string => {
        if (history.length === 0) return 'Neutral';
        const counts = history.reduce((acc, emotion) => {
            acc[emotion] = (acc[emotion] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
    };

    const captureAndAnalyze = useCallback(async () => {
        if (!videoRef.current || !canvasRef.current || videoRef.current.readyState < 3 || isAnalyzing) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (context) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            
            const base64Image = canvas.toDataURL('image/jpeg', 0.7).split(',')[1];
            
            if (base64Image) {
                try {
                    setIsAnalyzing(true);
                    const emotion = await analyzeFacialExpression(base64Image);
                    
                    // Fire the event immediately for responsiveness
                    onEmotionChange(emotion);

                    // Update history for stable UI display
                    emotionHistory.current.push(emotion);
                    if (emotionHistory.current.length > 3) {
                        emotionHistory.current.shift(); // Keep last 3 emotions
                    }
                    setDisplayedEmotion(getStableEmotion(emotionHistory.current));

                } catch (apiError) {
                    console.error("Emotion analysis failed:", apiError);
                    setDisplayedEmotion("Error");
                } finally {
                    setIsAnalyzing(false);
                }
            }
        }
    }, [onEmotionChange, isAnalyzing]);

    const toggleTracking = () => {
        setIsTracking(prev => !prev);
    };

    useEffect(() => {
        if (isTracking) {
            startWebcam();
            const videoElement = videoRef.current;
            const handleCanPlay = () => {
                 if (intervalRef.current) clearInterval(intervalRef.current);
                 intervalRef.current = setInterval(captureAndAnalyze, 5000); 
            };
            videoElement?.addEventListener('canplay', handleCanPlay);
            return () => videoElement?.removeEventListener('canplay', handleCanPlay);
        } else {
            stopWebcam();
            if (intervalRef.current) clearInterval(intervalRef.current);
            setDisplayedEmotion('Not Tracking');
            emotionHistory.current = [];
        }
        return () => {
            stopWebcam();
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isTracking, captureAndAnalyze]);

    const getEmotionEmoji = (emotion: string) => {
        switch (emotion) {
            case 'Focused': return '🎯';
            case 'Confused': return '🤔';
            case 'Bored': return '😴';
            case 'Frustrated': return '😠';
            case 'Neutral': return '😐';
            default: return '👀';
        }
    };
    
    const emotionToShow = isAnalyzing ? "Analyzing..." : displayedEmotion;
    const emojiToShow = isAnalyzing ? '🧐' : getEmotionEmoji(displayedEmotion);

    return (
        <div className="bg-gray-100 dark:bg-gray-900/70 p-4 rounded-lg w-full">
            <h3 className="font-bold mb-3 text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400">Mind Mirror</h3>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="relative w-48 h-36 bg-gray-900 rounded-lg overflow-hidden border-2 border-gray-300 dark:border-gray-700">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]"></video>
                    <canvas ref={canvasRef} className="hidden"></canvas>
                     {!isTracking && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                            <p className="text-white text-xs">Webcam Off</p>
                        </div>
                    )}
                </div>
                <div className="flex-1 text-center md:text-left">
                    <p className="text-lg font-semibold">Current State:</p>
                    <p className="text-3xl font-bold text-primary-400 flex items-center justify-center md:justify-start">
                        <span className="text-4xl mr-2">{emojiToShow}</span>
                        {emotionToShow}
                    </p>
                </div>
                <Button onClick={toggleTracking} className="w-full md:w-auto mt-2 md:mt-0">
                    {isTracking ? 'Stop Tracking' : 'Start Mind Mirror'}
                </Button>
            </div>
        </div>
    );
};

export default MindMirror;