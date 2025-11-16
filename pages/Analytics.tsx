
import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line, CartesianGrid } from 'recharts';
import { AnalyticsData } from '../types';
import { getAnalyticsData } from '../services/geminiService';
import Card from '../components/Card';

const Analytics: React.FC = () => {
    const [data, setData] = useState<AnalyticsData | null>(null);

    useEffect(() => {
        getAnalyticsData().then(setData);
    }, []);

    if (!data) {
        return <div className="flex items-center justify-center h-full">Loading analytics...</div>;
    }

    const StreakDay: React.FC<{count: number}> = ({ count }) => {
        let colorClass = 'bg-gray-200 dark:bg-gray-800';
        if (count > 0 && count <= 1) colorClass = 'bg-primary-200 dark:bg-primary-900';
        if (count > 1 && count <= 3) colorClass = 'bg-primary-400 dark:bg-primary-700';
        if (count > 3) colorClass = 'bg-primary-600 dark:bg-primary-500';

        return <div className={`w-3 h-3 rounded-sm ${colorClass}`} />;
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <h1 className="text-3xl font-bold">Progress Analytics</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 text-center">
                    <p className="text-gray-400">Current Streak</p>
                    <p className="text-4xl font-bold">{data.streak} Days 🔥</p>
                </Card>
                <Card className="p-6 text-center">
                    <p className="text-gray-400">Focus Score</p>
                    <p className="text-4xl font-bold text-green-500">{data.focusScore}%</p>
                </Card>
                <Card className="p-6 text-center">
                    <p className="text-gray-400">Total Study Time</p>
                    <p className="text-4xl font-bold">{data.studyTime.reduce((acc, curr) => acc + curr.time, 0)} Hours</p>
                </Card>
            </div>
            
            <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Study Streak Calendar</h2>
                <div className="flex flex-wrap gap-1">
                    {data.streakCalendar.map(day => <StreakDay key={day.date} count={day.count} />)}
                </div>
            </Card>

            {data.forgettingCurve && (
                 <Card className="p-6">
                    <h2 className="text-xl font-bold mb-4">Predicted Forgetting Curve</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Based on your recent quiz performance, this is your predicted memory retention for the last studied topic. Review it before it drops too low!</p>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.forgettingCurve} margin={{ top: 5, right: 30, left: 10, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                                <XAxis dataKey="day" stroke="rgb(156 163 175)" label={{ value: 'Days From Now', position: 'insideBottom', offset: -15, fill: 'rgb(156 163 175)' }} />
                                <YAxis stroke="rgb(156 163 175)" domain={[0, 100]} label={{ value: 'Retention %', angle: -90, position: 'insideLeft', fill: 'rgb(156 163 175)' }} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', border: 'none', borderRadius: '0.5rem' }}
                                    labelFormatter={(label) => `Day ${label}`}
                                    formatter={(value: number) => [`${value.toFixed(0)}%`, 'Retention']}
                                />
                                <Line type="monotone" dataKey="retention" stroke="#8B5CF6" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                    <h2 className="text-xl font-bold mb-4">Time Spent by Subject (hours)</h2>
                    <div className="h-80">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.studyTime} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                                <XAxis type="number" stroke="rgb(156 163 175)" />
                                <YAxis dataKey="subject" type="category" stroke="rgb(156 163 175)" width={100} />
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', border: 'none', borderRadius: '0.5rem' }}/>
                                <Bar dataKey="time" fill="#8B5CF6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
                <Card className="p-6">
                    <h2 className="text-xl font-bold mb-4">Quiz Performance (%)</h2>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.quizPerformance} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                                <XAxis dataKey="date" stroke="rgb(156 163 175)" />
                                <YAxis stroke="rgb(156 163 175)" />
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', border: 'none', borderRadius: '0.5rem' }}/>
                                <Line type="monotone" dataKey="score" stroke="#8B5CF6" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Analytics;
