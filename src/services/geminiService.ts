import { GoogleGenerativeAI } from "@google/generative-ai";

interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  nutrients?: {
    PROCNT: number;
    FAT: number;
    CHOCDF: number;
  };
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

interface MealPlan {
  meals: {
    name: string;
    description: string;
    ingredients: string[];
    nutrition: NutritionData;
  }[];
  summary: string;
}

export const generateMealPlan = async (userData: {
  goals: string;
  dietaryRestrictions: string;
  preferences: string;
}): Promise<MealPlan> => {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  
  const prompt = `Create a detailed nutrition plan with exact measurements based on:
  - Goals: ${userData.goals}
  - Dietary restrictions: ${userData.dietaryRestrictions}
  - Preferences: ${userData.preferences}
  
  Respond in JSON format with:
  {
    "meals": [
      {
        "name": "Meal name",
        "description": "Preparation instructions",
        "ingredients": ["100g ingredient1", "200ml ingredient2"],
        "nutrition": {
          "calories": number,
          "protein": number,
          "carbs": number,
          "fat": number
        }
      }
    ],
    "summary": "Nutritional summary"
  }`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    return JSON.parse(response) as MealPlan;
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to generate meal plan");
  }
};

export const analyzeNutrition = async (ingredients: string[]): Promise<NutritionData> => {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  
  const prompt = `Calculate total nutrition for these ingredients:
  ${ingredients.join("\n")}
  
  Respond with JSON:
  {
    "calories": number,
    "protein": number,
    "carbs": number, 
    "fat": number
  }`;

  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
};

export const generateWorkoutPlan = async (userData: {
  fitnessLevel: string;
  goals: string;
  equipment: string;
  time: string;
}) => {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  
  const prompt = `Create a personalized workout plan based on:
  - Fitness level: ${userData.fitnessLevel}
  - Goals: ${userData.goals}
  - Equipment: ${userData.equipment}
  - Time: ${userData.time}
  
  Include:
  1. Warm-up exercises
  2. Main workout (sets, reps, rest)
  3. Cool-down 
  4. Weekly schedule
  5. Progression tips`;

  const result = await model.generateContent(prompt);
  return result.response.text();
};