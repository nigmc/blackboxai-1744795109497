import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Type definitions
interface ExerciseVideo {
  id: { videoId: string };
  snippet: { title: string; thumbnails: { default: { url: string } } };
}

interface NutritionData {
  calories: number;
  nutrients: {
    PROCNT: number; // Protein
    FAT: number;    // Fat
    CHOCDF: number; // Carbs
  };
}

interface Exercise {
  name: string;
  steps: string[];
  setsReps: string;
  muscles: string;
  videoId?: string;
}

interface WorkoutDay {
  name: string;
  exercises: Exercise[];
}

interface WorkoutPlan {
  summary: string;
  days: WorkoutDay[];
}

// API Key Management
const getRequiredKey = (key: string | undefined, name: string): string => {
  if (!key) throw new Error(`Missing ${name} API key in .env file`);
  return key;
};

const EDAMAM_APP_ID = process.env.VITE_EDAMAM_APP_ID;
const EDAMAM_APP_KEY = process.env.VITE_EDAMAM_APP_KEY;
const YOUTUBE_API_KEY = process.env.VITE_YOUTUBE_API_KEY;
const GEMINI_API_KEY = getRequiredKey(process.env.VITE_GEMINI_API_KEY, 'Gemini');

// Initialize services
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export const checkApiKeys = (): boolean => {
  try {
    getRequiredKey(YOUTUBE_API_KEY, 'YouTube');
    if (!EDAMAM_APP_ID || !EDAMAM_APP_KEY) console.warn('Edamam API keys missing - nutrition features disabled');
    return true;
  } catch (error) {
    console.error('API configuration error:', error instanceof Error ? error.message : error);
    return false;
  }
};

// Nutrition Services
export const getNutritionData = async (food: string): Promise<NutritionData> => {
  if (!EDAMAM_APP_ID || !EDAMAM_APP_KEY) throw new Error('Edamam API not configured');
  const response = await axios.get(
    `https://api.edamam.com/api/nutrition-data?app_id=${EDAMAM_APP_ID}&app_key=${EDAMAM_APP_KEY}&ingr=${encodeURIComponent(food)}`
  );
  return response.data;
};

// Exercise Services
export const searchExerciseVideos = async (exercise: string): Promise<ExerciseVideo[]> => {
  if (!YOUTUBE_API_KEY) throw new Error('YouTube API not configured');
  const response = await axios.get(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${exercise} workout&type=video&key=${YOUTUBE_API_KEY}`
  );
  return response.data.items;
};

// AI Workout Generation
export const generateWorkoutPlan = async (userInput: {
  level: string;
  goals: string;
  equipment: string;
  time: string;
}): Promise<WorkoutPlan> => {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  
  const prompt = `Create a detailed ${userInput.time}-minute workout plan for:
  - Level: ${userInput.level}
  - Goals: ${userInput.goals}
  - Equipment: ${userInput.equipment || 'none'}
  
  Include for each exercise:
  1. Name
  2. Step-by-step instructions
  3. Recommended sets/reps
  4. Targeted muscle groups
  5. YouTube search query for demo`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  
  // Parse and enhance with videos
  const days = parseWorkoutPlan(text);
  for (const day of days) {
    for (const exercise of day.exercises) {
      try {
        const videos = await searchExerciseVideos(exercise.name);
        exercise.videoId = videos[0]?.id?.videoId;
      } catch (error) {
        console.warn(`Couldn't fetch video for ${exercise.name}:`, error);
      }
    }
  }

  return {
    summary: text,
    days
  };
};

// Helper function to parse workout plan text
const parseWorkoutPlan = (text: string): WorkoutDay[] => {
  const days: WorkoutDay[] = [];
  const daySections = text.split('\n\n');
  
  daySections.forEach((section, index) => {
    const exercises: Exercise[] = [];
    const exerciseLines = section.split('\n');
    let currentExercise: Partial<Exercise> = {};
    
    exerciseLines.forEach(line => {
      if (line.match(/^\d+\./)) {
        if (currentExercise.name) {
          exercises.push(currentExercise as Exercise);
        }
        currentExercise = {
          name: line.replace(/^\d+\.\s*/, ''),
          steps: [],
          setsReps: '',
          muscles: ''
        };
      } else if (currentExercise.name) {
        if (line.includes('Steps:')) {
          // Handle steps
        } else if (line.includes('Sets/Reps:')) {
          currentExercise.setsReps = line.replace('Sets/Reps:', '').trim();
        } else if (line.includes('Muscles:')) {
          currentExercise.muscles = line.replace('Muscles:', '').trim();
        } else if (line.trim().startsWith('- ')) {
          currentExercise.steps?.push(line.replace('- ', '').trim());
        }
      }
    });
    
    if (currentExercise.name) {
      exercises.push(currentExercise as Exercise);
    }
    
    days.push({
      name: `Day ${index + 1}`,
      exercises
    });
  });

  return days;
};