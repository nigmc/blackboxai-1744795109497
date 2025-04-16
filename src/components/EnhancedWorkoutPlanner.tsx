import { useState, useEffect } from 'react';
import { generate30DayPlan } from '../services/workoutService';
import { getWorkoutProgress, saveWorkoutProgress, recordWorkoutComplete } from '../services/storageService';

interface ExercisePerformance {
  weight?: number;
  reps?: number;
  notes: string;
}

export default function EnhancedWorkoutPlanner() {
  const [plan, setPlan] = useState<any>(null);
  const [currentDay, setCurrentDay] = useState(1);
  const [performances, setPerformances] = useState<Record<string, ExercisePerformance>>({});
  const [isGenerating, setIsGenerating] = useState(false);

  // Load saved progress on mount
  useEffect(() => {
    const saved = getWorkoutProgress();
    if (saved?.currentPlan) {
      setPlan(saved.currentPlan);
      setCurrentDay(saved.lastCompletedDay ? saved.lastCompletedDay + 1 : 1);
    }
  }, []);

  const generateNewPlan = async () => {
    setIsGenerating(true);
    try {
      const newPlan = await generate30DayPlan('intermediate', 'strength and conditioning');
      setPlan(newPlan);
      setCurrentDay(1);
      saveWorkoutProgress({
        currentPlan: newPlan,
        history: [],
        lastCompletedDay: 0
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCompleteDay = () => {
    const performanceRecords = plan.days[currentDay-1].exercises.map(ex => ({
      exercise: ex.name,
      ...performances[ex.name],
    }));

    const updatedProgress = recordWorkoutComplete(currentDay, performanceRecords);
    setPlan(updatedProgress.currentPlan);
    setCurrentDay(prev => Math.min(prev + 1, 30));
    setPerformances({});
  };

  const updatePerformance = (exerciseName: string, field: string, value: any) => {
    setPerformances(prev => ({
      ...prev,
      [exerciseName]: {
        ...(prev[exerciseName] || { notes: '' }),
        [field]: value
      }
    }));
  };

  if (!plan) {
    return (
      <div className="p-6">
        <button 
          onClick={generateNewPlan}
          disabled={isGenerating}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {isGenerating ? 'Generating...' : 'Generate 30-Day Plan'}
        </button>
      </div>
    );
  }

  const currentWorkout = plan.days[currentDay-1];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Day {currentDay} of 30</h2>
      
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Today's Workout</h3>
        {currentWorkout.exercises.map((exercise: any) => (
          <div key={exercise.name} className="mb-4 p-4 border rounded">
            <h4 className="font-bold">{exercise.name}</h4>
            <p className="text-gray-600 mb-2">{exercise.instructions.join(' ')}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-2">
              <div>
                <label className="block text-sm font-medium">Weight (kg)</label>
                <input
                  type="number"
                  value={performances[exercise.name]?.weight || ''}
                  onChange={(e) => updatePerformance(exercise.name, 'weight', e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Reps</label>
                <input
                  type="number"
                  value={performances[exercise.name]?.reps || ''}
                  onChange={(e) => updatePerformance(exercise.name, 'reps', e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium">Notes</label>
              <textarea
                value={performances[exercise.name]?.notes || ''}
                onChange={(e) => updatePerformance(exercise.name, 'notes', e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleCompleteDay}
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        Complete Day {currentDay}
      </button>
    </div>
  );
}
