export interface User {
  id: string;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export interface Program {
  id: string;
  user_id: string;
  program_name: string;
  is_template: boolean;
  created_at: string;
  updated_at: string;
  exercises?: Exercise[];
}

export type ExerciseType = 'reps' | 'time' | 'distance';

export interface Exercise {
  id: string;
  program_id: string;
  user_id: string;
  exercise_name: string;
  exercise_type?: ExerciseType;
  target_sets: number;
  target_reps: number;
  target_weight: number;
  duration?: number;
  distance?: number;
  order_index: number;
  notes?: string;
}

export interface LogItem {
  id: string;
  user_id: string;
  program_id?: string;
  exercise_id?: string;
  session_id?: string; // ✅ НОВОЕ: Связь с сессией
  datetime: string;
  exercise_name: string;
  set_no: number;
  reps: number;
  weight: number;
  rpe?: number;
  duration?: number;
  distance?: number;
  comments?: string;
}

export interface ProgramTemplate {
  id: string;
  template_name: string;
  description: string;
  category: string;
  is_active: boolean;
  created_at: string;
  template_exercises?: TemplateExercise[];
}

export interface TemplateExercise {
  id: string;
  template_id: string;
  exercise_name: string;
  exercise_type?: ExerciseType;
  target_sets: number;
  target_reps: number;
  target_weight: number;
  duration?: number;
  distance?: number;
  order_index: number;
  notes?: string;
}

// ✅ НОВОЕ: Интерфейс для workout_session из БД
export interface WorkoutSessionDB {
  id: string;
  user_id: string;
  program_id: string;
  program_name: string;
  started_at: string;
  completed_at?: string;
  status: 'in_progress' | 'completed' | 'cancelled';
  total_duration?: number;
  created_at: string;
  updated_at: string;
}

export interface WorkoutSession {
  id?: string; // ✅ НОВОЕ: ID сессии из БД
  program_id: string;
  program_name: string;
  started_at: string;
  exercises: Exercise[];
  current_exercise_index: number;
  logs: LogItem[];
}

export interface AppState {
  screen: AppScreen;
  programs: Program[];
  current_program?: Program;
  workout_session?: WorkoutSession;
  workout_completed_sets?: any[];
  workout_duration?: number;
  loading: boolean;
  error?: string;
}

export enum AppScreen {
  LOADING = 'LOADING',
  AUTH_ERROR = 'AUTH_ERROR',
  PROGRAM_SELECTOR = 'PROGRAM_SELECTOR',
  PROGRAM_EDITOR = 'PROGRAM_EDITOR',
  PROGRAM_DETAILS = 'PROGRAM_DETAILS',
  TEMPLATE_LIST = 'TEMPLATE_LIST',
  WORKOUT_LOGGER = 'WORKOUT_LOGGER',
  WORKOUT_SUMMARY = 'WORKOUT_SUMMARY'
}
