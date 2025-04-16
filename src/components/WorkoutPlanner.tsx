import { useState } from "react";
import { generateWorkoutPlan } from "../services/geminiService";

export default function WorkoutPlanner() {
  const [formData, setFormData] = useState({
    level: "beginner",
    goals: "",
    equipment: "",
    time: "30"
  });
  const [plan, setPlan] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await generateWorkoutPlan({
        fitnessLevel: formData.level,
        goals: formData.goals,
        equipment: formData.equipment,
        time: `${formData.time} minutes`
      });
      setPlan(response);
    } catch (error) {
      console.error(error);
      setPlan("Error generating workout plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">AI Workout Planner</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Fitness Level</label>
          <select
            value={formData.level}
            onChange={(e) => setFormData({...formData, level: e.target.value})}
            className="w-full p-2 border rounded"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Goals</label>
          <input
            type="text"
            value={formData.goals}
            onChange={(e) => setFormData({...formData, goals: e.target.value})}
            className="w-full p-2 border rounded"
            placeholder="Strength, endurance, weight loss, etc."
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Equipment Available</label>
          <input
            type="text"
            value={formData.equipment}
            onChange={(e) => setFormData({...formData, equipment: e.target.value})}
            className="w-full p-2 border rounded"
            placeholder="Dumbbells, resistance bands, etc."
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Time per session (minutes)</label>
          <input
            type="number"
            value={formData.time}
            onChange={(e) => setFormData({...formData, time: e.target.value})}
            className="w-full p-2 border rounded"
            min="10"
            max="120"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate Workout Plan"}
        </button>
      </form>
      
      {plan && (
        <div className="mt-6 p-4 bg-gray-50 rounded">
          <h3 className="font-bold mb-2">Your Custom Workout Plan:</h3>
          <pre className="whitespace-pre-wrap">{plan}</pre>
        </div>
      )}
    </div>
  );
}