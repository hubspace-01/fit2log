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

export interface Exercise {
  id: string;
  program_id: string;
  user_id: string;
  exercise_name: string;
  target_sets: number;
  target_reps: number;
  target_weight: number;
  order_index: number;
  notes?: string;
}

export interface LogItem {
  id: string;
  user_id: string;
  program_id?: string;
  exercise_id?: string;
  datetime: string;
  exercise_name: string;
  set_no: number;
  reps: number;
  weight: number;
  rpe?: number;
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
  target_sets: number;
  target_reps: number;
  target_weight: number;
  order_index: number;
  notes?: string;
}

export interface WorkoutSession {
  program_id: string;
  program_name: string;
  started_at: string;
  exercises: Exercise[];
  current_exercise_index: number;
  logs: Partial<LogItem>[];
}

export interface AuthData {
  user: User;
  access_token: string;
  expires_at: string;
}

export enum AppScreen {
  LOADING = 'loading',
  AUTH_ERROR = 'auth_error',
  PROGRAM_SELECTOR = 'program_selector',
  TEMPLATE_LIST = 'template_list',
  PROGRAM_EDITOR = 'program_editor',
  WORKOUT_LOGGER = 'workout_logger',
  PROGRESS_VIEW = 'progress_view',
}

export interface AppState {
  screen: AppScreen;
  user?: User;
  access_token?: string;
  programs: Program[];
  current_program?: Program;
  workout_session?: WorkoutSession;
  loading: boolean;
  error?: string;
}
