import { GoogleGenerativeAI } from '@google/generative-ai';

interface ExerciseProgression {
  week1: string;
  week2: string;
  week3: string;
  deload: string;
}

interface Exercise {
  name: string;
  instructions: string[];
  progression: ExerciseProgression;
  muscles: string[];
  videoId?: string;
}

interface WorkoutDay {
  dayNumber: number;
  focus: string;
  exercises: Exercise[];
  completed: boolean;
  notes: string;
}

interface WorkoutPlan {
  id: string;
  startDate: string;
  level: string;
  days: WorkoutDay[];
  progressMetrics: {
    strength: Record<string, number>;
    endurance: Record<string, number>;
  };
}

const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY!);

export async function generate30DayPlan(level: string, goals: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  
  const prompt = `Create a 30-day progressive workout plan for:
  - Level: ${level}
  - Goals: ${goals}
  
  Structure:
  - 4 weeks (3 progressive, 1 deload)
  - For each exercise include:
    1. Name and description
    2. 4-week progression scheme
    3. Targeted muscle groups
    4. YouTube search terms for form
  - Include trackable performance metrics`;

  const result = await model.generateContent(prompt);
  return parseWorkoutPlan(result.response.text());
}

function parseWorkoutPlan(text: string): WorkoutPlan {
  // Parse the AI response into structured data
  const days: WorkoutDay[] = [];
  const daySections = text.split('Day ');
  
  daySections.forEach((section, i) => {
    if (i > 0 && i <= 30) {
      days.push({
        dayNumber: i,
        focus: '',
        exercises: parseExercises(section),
        completed: false,
        notes: ''
      });
    }
  });
  
  return {
    id: Date.now().toString(),
    startDate: new Date().toISOString(),
    level: '',
    days,
    progressMetrics: { strength: {}, endurance: {} }
  };
}

function parseExercises(text: string): Exercise[] {
  // Parse exercises from text
  return [];
}
