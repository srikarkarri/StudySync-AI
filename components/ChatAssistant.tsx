import React, { useState, useRef, useEffect } from 'react';
import { Lecture } from '../types';
import { getChatResponse } from '../services/geminiService';
import { ChatBubbleOvalLeftEllipsisIcon, XMarkIcon } from './icons/IconComponents';

interface ChatAssistantProps {
    lecture: Lecture;
}

type Message = {
    role: 'user' | 'model';
    text: string;
};

const ChatAssistant: React.FC<ChatAssistantProps> = ({ lecture }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            setMessages([
                { role: 'model', text: `Hi! I'm Sync, your AI Tutor. Ask me anything about "${lecture.title}"!` }
            ]);
        }
    }, [isOpen, lecture.title]);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || isLoading) return;

        const newUserMessage: Message = { role: 'user', text: userInput };
        setMessages(prev => [...prev, newUserMessage]);
        setUserInput('');
        setIsLoading(true);

        try {
            if (!lecture.processedData) throw new Error("Lecture data not processed.");
            const responseText = await getChatResponse(lecture.processedData, userInput);
            const modelMessage: Message = { role: 'model', text: responseText };
            setMessages(prev => [...prev, modelMessage]);
        } catch (error) {
            console.error("Failed to get chat response:", error);
            const errorMessage: Message = { role: 'model', text: 'Sorry, I ran into an issue. Please try again.' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!lecture.processedData) {
        return null;
    }

    return (
        <>
            {/* Floating Action Button */}
            <button
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-8 right-8 z-50 w-16 h-16 bg-primary-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary-700 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-950 ${isOpen ? 'hidden' : 'block'}`}
                aria-label="Open AI Tutor"
            >
                <ChatBubbleOvalLeftEllipsisIcon className="w-8 h-8" />
            </button>

            {/* Chat Window */}
            <div className={`fixed bottom-8 right-8 z-50 w-full max-w-sm h-[70vh] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0 pointer-events-none'}`}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-bold text-lg">AI Tutor: Sync</h3>
                    <button onClick={() => setIsOpen(false)} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>
                
                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto">
                    <div className="space-y-4">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${msg.role === 'user' ? 'bg-primary-500 text-white rounded-br-none' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'}`}>
                                    <p className="text-sm">{msg.text}</p>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                 <div className="max-w-[80%] rounded-2xl px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-bl-none">
                                     <div className="flex items-center space-x-1">
                                         <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse-sm" style={{animationDelay: '0s'}}></span>
                                         <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse-sm" style={{animationDelay: '0.2s'}}></span>
                                         <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse-sm" style={{animationDelay: '0.4s'}}></span>
                                     </div>
                                 </div>
                             </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="relative">
                        <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder="Ask a question..."
                            className="w-full px-4 py-2 pr-12 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
                            disabled={isLoading}
                        />
                        <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary-500 text-white rounded-full hover:bg-primary-600 disabled:bg-gray-400" disabled={isLoading || !userInput.trim()}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                            </svg>
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default ChatAssistant;