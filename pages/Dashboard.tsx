
import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Page, Lecture, AnalyticsData } from '../types';
import Card from '../components/Card';
import Button from '../components/Button';
import { getAnalyticsData } from '../services/geminiService';

interface DashboardProps {
    onNavigate: (page: Page) => void;
    lectures: Lecture[];
    studyLecture: Lecture | null;
    onStartStudySession: (lecture: Lecture) => void;
}

const recentLectures: Lecture[] = [
    { id: '1', title: 'Quantum Mechanics Intro', date: '2024-07-28', duration: '58min', status: 'ready' },
    { id: '2', title: 'Cellular Biology', date: '2024-07-27', duration: '1h 12min', status: 'ready' },
    { id: '3', title: 'The Cold War', date: '2024-07-26', duration: '45min', status: 'processing' },
];

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, lectures, studyLecture, onStartStudySession }) => {
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

    useEffect(() => {
        getAnalyticsData().then(setAnalytics);
    }, []);

    if (!analytics) {
        return <div className="flex items-center justify-center h-full">Loading dashboard...</div>;
    }

    const reviewsDue = lectures.filter(l => l.nextReviewDate && new Date(l.nextReviewDate) <= new Date() && l.status === 'ready');


    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {/* Focus Session */}
            <Card className="md:col-span-2 lg:col-span-2 p-6 flex flex-col justify-between bg-gradient-to-br from-primary-900 to-gray-900 text-white">
                <div>
                    <h2 className="text-2xl font-bold">Today's Focus Session</h2>
                    <p className="text-primary-300 mt-1 truncate">{studyLecture ? studyLecture.title : 'No ready lectures to study'}</p>
                </div>
                <div className="flex items-center justify-between mt-8">
                    <div className="text-5xl font-bold">25:00</div>
                    <Button onClick={() => studyLecture && onStartStudySession(studyLecture)} disabled={!studyLecture} className="bg-white text-primary-600 hover:bg-gray-100 disabled:bg-gray-300 disabled:text-gray-500">
                        Start Studying
                    </Button>
                </div>
            </Card>

            {/* Study Streak */}
            <Card className="p-6 flex flex-col items-center justify-center">
                 <div className="text-6xl mb-2">🔥</div>
                 <div className="text-4xl font-bold">{analytics.streak}</div>
                 <p className="text-gray-500 dark:text-gray-400">Day Streak</p>
            </Card>
            
            {/* Upcoming Reviews */}
             <Card className="md:col-span-3 p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Upcoming Reviews</h2>
                </div>
                {reviewsDue.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400">No reviews due today. Great job staying on top of your studies!</p>
                ) : (
                    <ul className="space-y-3">
                        {reviewsDue.map(lecture => (
                            <li key={lecture.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors">
                                <div>
                                    <p className="font-semibold">{lecture.title}</p>
                                    <p className="text-sm text-red-500 font-medium">Due for review</p>
                                </div>
                                <Button variant="secondary" onClick={() => onStartStudySession(lecture)}>Review Now</Button>
                            </li>
                        ))}
                    </ul>
                )}
            </Card>


            {/* Recent Lectures */}
            <Card className="md:col-span-2 lg:col-span-3 p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Recent Lectures</h2>
                    <Button variant="ghost" onClick={() => onNavigate('lectures')}>View All</Button>
                </div>
                <ul className="space-y-3">
                    {recentLectures.map(lecture => (
                        <li key={lecture.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors">
                            <div>
                                <p className="font-semibold">{lecture.title}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{lecture.date} &middot; {lecture.duration}</p>
                            </div>
                            {lecture.status === 'ready' ? (
                                <span className="text-xs font-medium text-green-500 bg-green-500/10 px-2 py-1 rounded-full">Ready</span>
                            ) : (
                                <span className="text-xs font-medium text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-full animate-pulse-sm">Processing...</span>
                            )}
                        </li>
                    ))}
                </ul>
            </Card>
            
            {/* Weekly Progress */}
            <Card className="md:col-span-2 lg:col-span-3 p-6">
                <h2 className="text-xl font-bold mb-4">Weekly Progress (hours)</h2>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={analytics.weeklyProgress} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                            <XAxis dataKey="name" stroke="rgb(156 163 175)" />
                            <YAxis stroke="rgb(156 163 175)"/>
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', border: 'none', borderRadius: '0.5rem' }} />
                            <Area type="monotone" dataKey="hours" stroke="#8B5CF6" fillOpacity={1} fill="url(#colorUv)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </div>
    );
};

export default Dashboard;
