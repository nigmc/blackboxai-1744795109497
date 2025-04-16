interface WorkoutPerformance {
  exercise: string;
  weight?: number;
  reps?: number;
  duration?: number;
  notes: string;
}

interface WorkoutHistory {
  date: string;
  dayNumber: number;
  performances: WorkoutPerformance[];
}

interface WorkoutProgress {
  currentPlan: any;
  history: WorkoutHistory[];
  lastCompletedDay?: number;
}

export function saveWorkoutProgress(progress: WorkoutProgress) {
  localStorage.setItem('workoutProgress', JSON.stringify({
    ...progress,
    lastUpdated: new Date().toISOString()
  }));
}

export function getWorkoutProgress(): WorkoutProgress | null {
  const data = localStorage.getItem('workoutProgress');
  return data ? JSON.parse(data) : null;
}

export function recordWorkoutComplete(dayNumber: number, performances: WorkoutPerformance[]) {
  const progress = getWorkoutProgress() || { currentPlan: null, history: [] };
  
  progress.history.push({
    date: new Date().toISOString(),
    dayNumber,
    performances
  });
  
  progress.lastCompletedDay = dayNumber;
  saveWorkoutProgress(progress);
  return progress;
}
