import { useState } from 'react';
import { generateWorkoutPlan } from '../services/apiService';
import { getNutritionData } from '../services/apiService';

interface WeightLossPlan {
  currentWeight: number;
  targetWeight: number;
  timelineWeeks: number;
  dailyCalorieTarget: number;
  workoutPlan: any;
  mealPlan: any;
  progressChart: {
    weeklyGoals: { week: number; targetWeight: number }[];
    estimatedTimeline: Date[];
  };
}

export default function WeightLossPlanner() {
  type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive';

  const [formData, setFormData] = useState({
    currentWeight: 70,
    targetWeight: 60,
    height: 170,
    age: 30,
    gender: 'female' as 'male' | 'female',
    activityLevel: 'moderate' as ActivityLevel,
    timelineWeeks: 12
  });
  const [plan, setPlan] = useState<WeightLossPlan | null>(null);
  const [loading, setLoading] = useState(false);

  const calculateDailyCalories = () => {
    // Harris-Benedict equation for BMR
    let bmr;
    if (formData.gender === 'male') {
      bmr = 88.362 + (13.397 * formData.currentWeight) + 
            (4.799 * formData.height) - (5.677 * formData.age);
    } else {
      bmr = 447.593 + (9.247 * formData.currentWeight) + 
            (3.098 * formData.height) - (4.330 * formData.age);
    }

    // Apply activity factor
    const activityFactors: Record<ActivityLevel, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      veryActive: 1.9
    };
    
    const tdee = bmr * activityFactors[formData.activityLevel as ActivityLevel];
    return Math.round(tdee - 500); // 500 calorie deficit for weight loss
  };

  const [currentProgress, setCurrentProgress] = useState<{
    weight: number;
    date: Date;
    meals: any[];
    workouts: any[];
  }[]>([]);

  const generateMealPlan = async (calories: number) => {
    // Calculate protein goal (0.7-1.2g per kg of body weight)
    const proteinMin = Math.round(formData.currentWeight * 0.7);
    const proteinMax = Math.round(formData.currentWeight * 1.2);
    const proteinGrams = Math.round((proteinMin + proteinMax) / 2);
    
    // Get AI-generated meal plan from API
    try {
      const response = await fetch('https://api.nutritionai.com/v1/mealplan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NUTRITIONAI_API_KEY}`
        },
        body: JSON.stringify({
          calories,
          protein: proteinGrams,
          weight: formData.currentWeight,
          preferences: formData.gender === 'male' ? 'high-protein' : 'balanced'
        })
      });
      
      if (!response.ok) throw new Error('API request failed');
      return await response.json();
      
    } catch (error) {
      console.error('AI meal plan failed, using fallback:', error);
      // Fallback calculations
      const carbsGrams = Math.round((calories * 0.4) / 4);
      const fatGrams = Math.round((calories * 0.3) / 9);

      // Calculate micronutrient targets
      const fiber = Math.round(calories / 100);
      const sugar = Math.round(calories * 0.05 / 4);
      const sodium = 2300;

      return {
        calories,
        macros: {
          protein: proteinGrams,
          carbs: carbsGrams,
          fat: fatGrams,
          fiber,
          sugar,
          sodium
        },
        meals: [
          {
            name: "Breakfast",
            calories: Math.round(calories * 0.3),
            macros: {
              protein: Math.round(proteinGrams * 0.3),
              carbs: Math.round(carbsGrams * 0.3),
              fat: Math.round(fatGrams * 0.3)
            },
            description: "High protein breakfast",
            options: [
              "Greek yogurt (1 cup) with berries (1/2 cup) and almonds (1 oz)",
              "Scrambled eggs (2 whole + 2 whites) with whole wheat toast and avocado",
              "Oatmeal with protein powder, banana, and peanut butter"
            ],
            nutrients: ["Calcium", "Vitamin D", "Antioxidants"]
          },
          {
            name: "Lunch",
            calories: Math.round(calories * 0.35),
            macros: {
              protein: Math.round(proteinGrams * 0.35),
              carbs: Math.round(carbsGrams * 0.35),
              fat: Math.round(fatGrams * 0.35)
            },
            description: "Balanced meal with lean protein",
            options: [
              "Grilled chicken breast with quinoa and roasted vegetables",
              "Turkey wrap with whole wheat tortilla",
              "Lentil soup with whole grain bread"
            ],
            nutrients: ["Iron", "B Vitamins", "Fiber"]
          },
          {
            name: "Dinner",
            calories: Math.round(calories * 0.3),
            macros: {
              protein: Math.round(proteinGrams * 0.3),
              carbs: Math.round(carbsGrams * 0.3),
              fat: Math.round(fatGrams * 0.3)
            },
            description: "Light protein with healthy fats",
            options: [
              "Grilled salmon with asparagus and sweet potato",
              "Lean beef with broccoli and brown rice", 
              "Tofu stir-fry with mixed veggies"
            ],
            nutrients: ["Omega-3", "Vitamin A", "Potassium"]
          },
          {
            name: "Snacks",
            calories: Math.round(calories * 0.05),
            macros: {
              protein: Math.round(proteinGrams * 0.05),
              carbs: Math.round(carbsGrams * 0.05),
              fat: Math.round(fatGrams * 0.05)
            },
            description: "Healthy snacks",
            options: [
              "Protein shake with almond milk",
              "Handful of almonds with an apple",
              "Greek yogurt with chia seeds"
            ],
            nutrients: ["Healthy fats", "Protein"]
          }
        ],
        water: {
          amount: Math.round(calories / 30),
          description: "Stay hydrated"
        }
      };
    }
        {
          name: "Breakfast",
          calories: Math.round(calories * 0.3),
          macros: {
            protein: Math.round(proteinGrams * 0.3),
            carbs: Math.round(carbsGrams * 0.3),
            fat: Math.round(fatGrams * 0.3)
          },
          description: "High protein breakfast to start your day",
          options: [
            "Greek yogurt (1 cup) with mixed berries (1/2 cup) and almonds (1 oz)",
            "Scrambled eggs (2 whole + 2 whites) with whole wheat toast (1 slice) and avocado (1/4)",
            "Oatmeal (1/2 cup dry) with protein powder (1 scoop), banana (1/2), and peanut butter (1 tbsp)"
          ],
          nutrients: ["Calcium", "Vitamin D", "Antioxidants", "Fiber"]
        },
        {
          name: "Lunch",
          calories: Math.round(calories * 0.35),
          macros: {
            protein: Math.round(proteinGrams * 0.35),
            carbs: Math.round(carbsGrams * 0.35),
            fat: Math.round(fatGrams * 0.35)
          },
          description: "Balanced meal with lean protein and complex carbs",
          options: [
            "Grilled chicken breast (4oz) with quinoa (1/2 cup cooked) and roasted vegetables (1 cup)",
            "Turkey wrap (whole wheat tortilla, 3oz turkey, lettuce, tomato, mustard)",
            "Lentil soup (1.5 cups) with whole grain bread (1 slice) and side salad (2 cups)"
          ],
          nutrients: ["Iron", "B Vitamins", "Fiber", "Protein"]
        },
        {
          name: "Dinner",
          calories: Math.round(calories * 0.3),
          macros: {
            protein: Math.round(proteinGrams * 0.3),
            carbs: Math.round(carbsGrams * 0.3),
            fat: Math.round(fatGrams * 0.3)
          },
          description: "Light protein with healthy fats and vegetables",
          options: [
            "Grilled salmon (5oz) with asparagus (1 cup) and sweet potato (1/2 medium)",
            "Lean beef (4oz) with broccoli (1 cup) and brown rice (1/2 cup)",
            "Tofu stir-fry (5oz tofu, 1 cup mixed veggies) with quinoa (1/2 cup)"
          ],
          nutrients: ["Omega-3", "Vitamin A", "Potassium", "Protein"]
        },
        {
          name: "Snacks",
          calories: Math.round(calories * 0.05),
          macros: {
            protein: Math.round(proteinGrams * 0.05),
            carbs: Math.round(carbsGrams * 0.05),
            fat: Math.round(fatGrams * 0.05)
          },
          description: "Healthy snacks to keep you satisfied",
          options: [
            "Protein shake (1 scoop) with almond milk (1 cup)",
            "Handful of almonds (1 oz) with an apple",
            "Greek yogurt (3/4 cup) with chia seeds (1 tsp)"
          ],
          nutrients: ["Healthy fats", "Protein", "Fiber"]
        }
      ],
      water: {
        amount: Math.round(calories / 30), // ml per calorie
        description: "Stay hydrated throughout the day"
      }
    };
  };

  // Rest of the component implementation...
  // [Previous implementation of logProgress, generatePlan, calculateDaysRemaining, and render methods]
}