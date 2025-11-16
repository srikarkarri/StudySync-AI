
import { GoogleGenAI, Type, Chat } from "@google/genai";
import { QuizQuestion, AnalyticsData, ProcessedLectureData, CornellNotes, Lecture } from '../types';

// IMPORTANT: In a real application, the API key would be securely managed and not hardcoded.
// Here we assume it's available via process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });


const MOCK_ANALYTICS: AnalyticsData = {
    streak: 5,
    weeklyProgress: [
        { name: 'Mon', hours: 2 }, { name: 'Tue', hours: 3 }, { name: 'Wed', hours: 1.5 },
        { name: 'Thu', hours: 4 }, { name: 'Fri', hours: 2.5 }, { name: 'Sat', hours: 5 },
        { name: 'Sun', hours: 1 },
    ],
    studyTime: [
        { subject: 'Biology', time: 12 }, { subject: 'Quantum Physics', time: 8 },
        { subject: 'History', time: 5 }, { subject: 'Math', time: 10 },
    ],
    quizPerformance: [
        { date: '2024-07-01', score: 75 }, { date: '2024-07-08', score: 80 },
        { date: '2024-07-15', score: 82 }, { date: '2024-07-22', score: 90 },
    ],
    focusScore: 88,
    streakCalendar: Array.from({ length: 180 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return {
            date: d.toISOString().split('T')[0],
            count: Math.random() > 0.3 ? Math.floor(Math.random() * 5) : 0,
        };
    }),
    forgettingCurve: Array.from({ length: 30 }).map((_, i) => ({
        day: i + 1,
        retention: 100 * Math.exp(-0.1 * (i + Math.random() * 2)), // Simulate a curve
    })),
};

// FIX: Helper function to convert a File object to a base64 string for the Gemini API.
const fileToGenerativePart = async (file: File) => {
  const base64EncodedData = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  return {
    inlineData: {
      data: base64EncodedData,
      mimeType: file.type,
    },
  };
};

// FIX: Replaced mock function with a real Gemini API call to process lecture files.
export const processLectureFile = async (file: File): Promise<ProcessedLectureData> => {
    console.log(`AI processing for ${file.name}`);
    
    const filePart = await fileToGenerativePart(file);
    
    const prompt = `Based on the content of this file, please do the following:
1.  Transcribe the entire lecture if it's audio or video. If it's a document, extract the text.
2.  Provide a concise summary of the main topics.
3.  List the key concepts discussed.
4.  Generate 5 multiple-choice practice questions, each with 4 options, and clearly indicate the correct answer.
5.  Create a set of flashcards for the key concepts (front and back).
6.  Find 3 relevant YouTube video links that could supplement this material.

Structure the entire output as a single JSON object with the following keys: "transcription", "summary", "keyConcepts", "practiceQuestions", "flashcards", "youtubeLinks".`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: { parts: [filePart, {text: prompt}] },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    summary: { type: Type.STRING, description: "Concise summary of the lecture." },
                    keyConcepts: { 
                        type: Type.ARRAY, 
                        items: { type: Type.STRING },
                        description: "List of key concepts."
                    },
                    practiceQuestions: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                question: { type: Type.STRING },
                                options: { 
                                    type: Type.ARRAY, 
                                    items: { type: Type.STRING }
                                },
                                correctAnswer: { type: Type.STRING }
                            },
                            required: ['question', 'options', 'correctAnswer']
                        },
                        description: "Array of 5 multiple-choice questions."
                    },
                    flashcards: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                front: { type: Type.STRING, description: "Front side of the flashcard (term/question)." },
                                back: { type: Type.STRING, description: "Back side of the flashcard (definition/answer)." }
                            },
                            required: ['front', 'back']
                        },
                        description: "Array of flashcards for key concepts."
                    },
                    youtubeLinks: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "Array of 3 relevant YouTube video URLs."
                    },
                    transcription: { type: Type.STRING, description: "Full transcription or text extraction from the file." }
                },
                required: ['summary', 'keyConcepts', 'practiceQuestions', 'flashcards', 'youtubeLinks', 'transcription']
            }
        }
    });

    const result = JSON.parse(response.text);
    console.log("Processing complete.");
    return result;
};

export const generateCornellNotes = async (lectureData: ProcessedLectureData): Promise<CornellNotes> => {
    console.log("Generating Cornell Notes...");

    const prompt = `Based on the following lecture summary and key concepts, generate notes in the Cornell Note-taking format. The output must be a single, valid JSON object with two keys: "pairs" and "summary".
- "pairs": An array of objects. Each object should have two string keys: "cue" and "note". The "cue" should be a concise question or keyword, and the "note" should be the detailed point-form explanation corresponding to that cue.
- "summary": A concise 2-3 sentence summary of the key information from the notes.

Lecture Summary:
${lectureData.summary}

Key Concepts:
${lectureData.keyConcepts.join(', ')}
`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    pairs: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                cue: { type: Type.STRING, description: "A concise question or keyword." },
                                note: { type: Type.STRING, description: "Detailed notes corresponding to the cue." }
                            },
                            required: ['cue', 'note']
                        },
                        description: "An array of cue-note pairs."
                    },
                    summary: { type: Type.STRING, description: "A concise 2-3 sentence summary." }
                },
                required: ['pairs', 'summary']
            }
        }
    });

    const result: CornellNotes = JSON.parse(response.text);
    console.log("Cornell Notes generated.");
    return result;
};


// FIX: Replaced mock quiz generation with a real Gemini API call.
export const generateQuiz = async (topic: string): Promise<QuizQuestion[]> => {
    console.log(`Generating quiz for topic: ${topic}`);
    
    const prompt = `Generate 10 unique multiple-choice questions about ${topic}. For each question, provide 4 options and indicate the correct answer. Format the output as a JSON array of objects.`;
     
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { 
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        question: { type: Type.STRING },
                        options: { 
                            type: Type.ARRAY, 
                            items: { type: Type.STRING },
                            description: "An array of 4 possible answers."
                        },
                        correctAnswer: { type: Type.STRING }
                    },
                    required: ['question', 'options', 'correctAnswer']
                }
            }
        }
    });

    const questions: Omit<QuizQuestion, 'id'>[] = JSON.parse(response.text);
    
    // Add a unique ID to each question as required by the QuizQuestion type.
    return questions.map((q, index) => ({ ...q, id: String(index + 1) }));
};

export const getAnalyticsData = async (): Promise<AnalyticsData> => {
     await new Promise(resolve => setTimeout(resolve, 500));
     return MOCK_ANALYTICS;
}

export const analyzeFacialExpression = async (base64Image: string): Promise<string> => {
    const prompt = `Analyze the user's emotional state in this image from a webcam during a study session. Your primary determination should be if the user is "Focused" or not.

- **Focused State:** The user MUST be looking straight ahead at the screen, with eyes open, and without significant head movement (e.g., shaking, major tilting).
- **Non-Focused States:** If the "Focused" criteria are NOT met, classify the state as one of the following:
  - "Frustrated": If the user is shaking their head horizontally or shows clear signs of frustration.
  - "Bored": If the user's eyes are closed, they are yawning, or looking away disinterestedly.
  - "Confused": If the user has a tilted head, furrowed brow, or puzzled expression.

Provide only the single word for the detected state as your response.`;

    const imagePart = {
        inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image,
        },
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, { text: prompt }] },
        });

        const emotion = response.text.trim();
        const validEmotions = ["Focused", "Confused", "Bored", "Frustrated"];
        if (validEmotions.includes(emotion)) {
            return emotion;
        }
        console.warn(`Unexpected emotion from API: ${emotion}, defaulting to Confused.`);
        return "Confused";
    } catch (error) {
        console.error("Error analyzing facial expression:", error);
        return "Error";
    }
};

export const getSimplifiedExplanation = async (lectureData: ProcessedLectureData): Promise<string> => {
    console.log("Generating simplified explanation...");

    const prompt = `A student studying a lecture appears to be struggling (they might be confused, frustrated, or bored). First, provide a short, uplifting motivational message (1-2 sentences) to encourage them. Then, based on the following summary and key concepts from the lecture, provide a very simple, concise, one-paragraph explanation of the core idea to help them understand and re-engage.

Lecture Summary:
${lectureData.summary}

Key Concepts:
${lectureData.keyConcepts.join(', ')}
`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });

    console.log("Simplified explanation generated.");
    return response.text;
};

let chat: Chat | null = null;

export const getChatResponse = async (
    lectureData: ProcessedLectureData,
    message: string
): Promise<string> => {
    if (!chat) {
        const systemInstruction = `You are 'Sync', a friendly and helpful AI tutor. Your goal is to help the user understand the provided lecture material. Keep your answers concise and easy to understand.
Here is the context for the current lecture:
- Summary: ${lectureData.summary}
- Key Concepts: ${lectureData.keyConcepts.join(', ')}`;

        chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction,
            },
        });
    }
    
    try {
        const response = await chat.sendMessage({ message });
        return response.text;
    } catch (error) {
        console.error("Chat API error:", error);
        chat = null; // Reset chat on error
        return "Sorry, I encountered an error. Please try asking again.";
    }
};

export const updateRetentionMetrics = async (
    lecture: Lecture,
    quizScore: number
): Promise<{ retentionScore: number; nextReviewDate: string; forgettingCurve: { day: number, retention: number }[] }> => {
    console.log(`Updating retention for ${lecture.title} with score ${quizScore}%`);

    const prompt = `You are a learning expert specializing in spaced repetition based on the Ebbinghaus forgetting curve. A student is studying a lecture titled "${lecture.title}".

Current state:
- Previous Retention Score: ${lecture.retentionScore || 'N/A'}
- Last Reviewed: ${lecture.lastReviewed || 'Never'}
- Just completed a quiz with a score of: ${quizScore.toFixed(0)}%

Based on this new quiz score, perform the following calculations:
1.  **Calculate the new Retention Score:** This should be a value between 0 and 100, influenced by the recent quiz score. A higher score should significantly boost retention.
2.  **Predict the next optimal review date:** Based on the new retention score, determine how many days from today (${new Date().toISOString().split('T')[0]}) the user should review this topic next to maximize memory. The higher the retention, the longer the interval. Provide the date in YYYY-MM-DD format.
3.  **Generate a forgetting curve:** Create a dataset for a chart that visualizes the predicted decline in memory retention over the next 30 days, starting from the new retention score.

Return a single, valid JSON object with the following keys: "retentionScore", "nextReviewDate", "forgettingCurve".
- "retentionScore": A number (e.g., 85).
- "nextReviewDate": A string in "YYYY-MM-DD" format.
- "forgettingCurve": An array of 30 objects, each with "day" (from 1 to 30) and "retention" (a number from 0 to 100).
`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    retentionScore: { type: Type.NUMBER },
                    nextReviewDate: { type: Type.STRING },
                    forgettingCurve: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                day: { type: Type.NUMBER },
                                retention: { type: Type.NUMBER }
                            },
                            required: ['day', 'retention']
                        }
                    }
                },
                required: ['retentionScore', 'nextReviewDate', 'forgettingCurve']
            }
        }
    });

    const result = JSON.parse(response.text);
    console.log("Retention metrics updated:", result);
    return result;
};