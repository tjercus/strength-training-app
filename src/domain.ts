interface ExerciseSet {
  weight: number;
  reps: number;
}

interface Musclegroup {
  name: string
}
interface Exercise {
  name: string;
  musclegroups: Set<Musclegroup>
}
interface AppliedExercise {
  exercise: Exercise
  sets: Set<ExerciseSet>
}
interface Session {
  datetime: Date
  exercises: Set<AppliedExercise>
}

