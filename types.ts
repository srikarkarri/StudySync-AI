
export type Page = 'landing' | 'dashboard' | 'lectures' | 'sessions' | 'analytics' | 'study' | 'quiz';

export interface CornellNotePair {
  cue: string;
  note: string;
}

export interface CornellNotes {
  pairs: CornellNotePair[];
  summary: string;
}

export interface ProcessedLectureData {
  summary: string;
  keyConcepts: string[];
  practiceQuestions: Omit<QuizQuestion, 'id'>[];
  flashcards: { front: string; back: string; }[];
  youtubeLinks: string[];
  transcription: string;
}

export interface Lecture {
  id: string;
  title: string;
  date: string;
  duration: string;
  status: 'processing' | 'ready' | 'error';
  processedData?: ProcessedLectureData;
  fileType?: string;
  userNotes?: CornellNotes;
  retentionScore?: number;
  lastReviewed?: string;
  nextReviewDate?: string;
}

export interface StudySession {
  id: string;
  topic: string;
  lecture: string;
  duration: number; // in minutes
}

export interface QuizQuestion {
  id:string;
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface AnalyticsData {
  streak: number;
  weeklyProgress: { name: string; hours: number }[];
  studyTime: { subject: string; time: number }[];
  quizPerformance: { date: string; score: number }[];
  focusScore: number;
  streakCalendar: { date: string; count: number }[];
  forgettingCurve?: { day: number; retention: number }[];
}