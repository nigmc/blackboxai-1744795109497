import { useState } from 'react';
import { getNutritionData } from '../services/apiService';

interface Meal {
  name: string;
  ingredients: string[];
  nutrition?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export default function MealPlanner() {
  const [query, setQuery] = useState('');
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    
    try {
      // In a real app, you would get meal suggestions from an API first
      // For demo purposes, we'll create a mock meal and get its nutrition
      const mockMeal: Meal = {
        name: `Custom ${query} Meal`,
        ingredients: [query]
      };

      // Get nutrition data for each ingredient
      const nutritionData = await getNutritionData(query);
      
      const newMeal: Meal = {
        ...mockMeal,
        nutrition: {
          calories: nutritionData.calories,
          protein: nutritionData.nutrients.PROCNT,
          carbs: nutritionData.nutrients.CHOCDF,
          fat: nutritionData.nutrients.FAT
        }
      };

      setMeals([...meals, newMeal]);
    } catch (err) {
      setError('Failed to get nutrition data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-green-600 mb-6">AI Meal Planner</h1>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mb-8 bg-white p-6 rounded-lg shadow-md">
        <div className="flex gap-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Enter an ingredient or meal"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition duration-200 disabled:opacity-50"
          >
            {loading ? 'Analyzing...' : 'Analyze Nutrition'}
          </button>
        </div>
      </form>

      {meals.length > 0 && (
        <div className="space-y-6">
          {meals.map((meal, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{meal.name}</h2>
              
              <div className="mb-4">
                <h3 className="font-medium text-gray-700 mb-1">Ingredients:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {meal.ingredients.map((ingredient, i) => (
                    <li key={i} className="text-gray-700">{ingredient}</li>
                  ))}
                </ul>
              </div>

              {meal.nutrition && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-600">Calories</p>
                    <p className="text-2xl font-bold">{Math.round(meal.nutrition.calories)}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-600">Protein</p>
                    <p className="text-2xl font-bold">{Math.round(meal.nutrition.protein)}g</p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-sm text-yellow-600">Carbs</p>
                    <p className="text-2xl font-bold">{Math.round(meal.nutrition.carbs)}g</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-sm text-red-600">Fat</p>
                    <p className="text-2xl font-bold">{Math.round(meal.nutrition.fat)}g</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}