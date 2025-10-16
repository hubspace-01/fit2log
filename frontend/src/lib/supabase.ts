import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

let validatedTelegramId: string | null = null;
const customHeaders: Record<string, string> = {};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  },
  global: {
    headers: customHeaders
  }
});

class SupabaseService {
  public supabase = supabase;

  async validateTelegramInitData(initData: string) {
    try {
      const { data, error } = await supabase.functions.invoke('validate-telegram', {
        body: { initData }
      });
      
      if (error) throw error;
      if (!data?.ok) throw new Error(data?.error || 'Validation failed');

      if (data.user?.id) {
        validatedTelegramId = data.user.id;
        customHeaders['x-telegram-id'] = data.user.id;
        
        if (data.access_token) {
          customHeaders['Authorization'] = `Bearer ${data.access_token}`;
        }
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  getCurrentTelegramId(): string | null {
    return validatedTelegramId;
  }

  async getPrograms(userId: string) {
    const { data, error } = await supabase
      .from('programs')
      .select(`
        *,
        exercises (*)
      `)
      .eq('user_id', userId)
      .eq('is_template', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getProgramTemplates() {
    const { data, error } = await supabase
      .from('program_templates')
      .select(`
        *,
        template_exercises (*)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async copyTemplate(templateId: string, userId: string) {
    try {
      const { data: template, error: templateError } = await supabase
        .from('program_templates')
        .select(`
          *,
          template_exercises (*)
        `)
        .eq('id', templateId)
        .single();

      if (templateError) throw templateError;
      if (!template) throw new Error('Template not found');

      const { data: program, error: programError } = await supabase
        .from('programs')
        .insert({
          user_id: userId,
          program_name: template.template_name,
          is_template: false,
          day_order: null,
          weekday_hint: null
        })
        .select()
        .single();

      if (programError) throw programError;

      if (template.template_exercises && template.template_exercises.length > 0) {
        const exercises = template.template_exercises.map((ex: any) => ({
          program_id: program.id,
          user_id: userId,
          exercise_name: ex.exercise_name,
          exercise_type: ex.exercise_type || 'reps',
          target_sets: ex.target_sets,
          target_reps: ex.target_reps,
          target_weight: ex.target_weight || 0,
          duration: ex.duration || 0,
          distance: ex.distance || 0,
          order_index: ex.order_index,
          notes: ex.notes || ''
        }));

        const { error: exercisesError } = await supabase
          .from('exercises')
          .insert(exercises);

        if (exercisesError) throw exercisesError;
      }

      return { ok: true, program };
    } catch (error) {
      throw error;
    }
  }

  async createProgram(programData: any) {
    const { program_name, exercises, user_id, day_order, weekday_hint } = programData;
    
    if (!user_id) {
      throw new Error('User ID is required');
    }

    const { data: program, error: programError } = await supabase
      .from('programs')
      .insert({
        user_id: user_id,
        program_name,
        is_template: false,
        day_order: day_order !== undefined && day_order !== null ? day_order : null,
        weekday_hint: weekday_hint || null
      })
      .select()
      .single();

    if (programError) throw programError;

    if (exercises && exercises.length > 0) {
      const exercisesData = exercises.map((ex: any, index: number) => ({
        program_id: program.id,
        user_id: user_id,
        exercise_name: ex.exercise_name,
        exercise_type: ex.exercise_type || 'reps',
        target_sets: ex.target_sets,
        target_reps: ex.target_reps,
        target_weight: ex.target_weight || 0,
        duration: ex.duration || 0,
        distance: ex.distance || 0,
        order_index: index,
        notes: ex.notes || ''
      }));

      const { error: exercisesError } = await supabase
        .from('exercises')
        .insert(exercisesData);

      if (exercisesError) throw exercisesError;
    }

    return program;
  }

  async updateProgram(programId: string, programData: any) {
    const { program_name, exercises, user_id, day_order, weekday_hint } = programData;
    
    if (!user_id) {
      throw new Error('User ID is required');
    }

    const { data: program, error: programError } = await supabase
      .from('programs')
      .update({
        program_name,
        day_order: day_order !== undefined && day_order !== null ? day_order : null,
        weekday_hint: weekday_hint || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', programId)
      .eq('user_id', user_id)
      .select()
      .single();

    if (programError) throw programError;

    const { error: deleteError } = await supabase
      .from('exercises')
      .delete()
      .eq('program_id', programId);

    if (deleteError) throw deleteError;

    if (exercises && exercises.length > 0) {
      const exercisesData = exercises.map((ex: any, index: number) => ({
        program_id: programId,
        user_id: user_id,
        exercise_name: ex.exercise_name,
        exercise_type: ex.exercise_type || 'reps',
        target_sets: ex.target_sets,
        target_reps: ex.target_reps,
        target_weight: ex.target_weight || 0,
        duration: ex.duration || 0,
        distance: ex.distance || 0,
        order_index: index,
        notes: ex.notes || ''
      }));

      const { error: exercisesError } = await supabase
        .from('exercises')
        .insert(exercisesData);

      if (exercisesError) throw exercisesError;
    }

    return program;
  }

  async deleteProgram(programId: string, userId: string) {
    const { error: exercisesError } = await supabase
      .from('exercises')
      .delete()
      .eq('program_id', programId)
      .eq('user_id', userId);

    if (exercisesError) throw exercisesError;

    const { error: programError } = await supabase
      .from('programs')
      .delete()
      .eq('id', programId)
      .eq('user_id', userId);

    if (programError) throw programError;

    return { success: true };
  }

  async createWorkoutSession(sessionData: {
    user_id: string;
    program_id: string;
    program_name: string;
    started_at: string;
  }) {
    const { data, error } = await supabase
      .from('workout_sessions')
      .insert({
        user_id: sessionData.user_id,
        program_id: sessionData.program_id,
        program_name: sessionData.program_name,
        started_at: sessionData.started_at,
        status: 'in_progress'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateWorkoutSession(sessionId: string, updates: {
    status?: 'in_progress' | 'completed' | 'cancelled';
    completed_at?: string;
    total_duration?: number;
  }) {
    const { data, error } = await supabase
      .from('workout_sessions')
      .update(updates)
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getInProgressSession(userId: string, programId: string) {
    const { data, error } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('program_id', programId)
      .eq('status', 'in_progress')
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async getSessionLogs(sessionId: string) {
    const { data, error } = await supabase
      .from('logs')
      .select('*')
      .eq('session_id', sessionId)
      .order('datetime', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async saveWorkoutLog(logData: {
    user_id: string;
    program_id: string;
    exercise_id: string;
    exercise_name: string;
    set_no: number;
    reps: number;
    weight: number;
    datetime: string;
    duration?: number;
    distance?: number;
    comments?: string;
    session_id?: string;
  }) {
    const { data, error } = await supabase
      .from('logs')
      .insert({
        user_id: logData.user_id,
        program_id: logData.program_id,
        exercise_id: logData.exercise_id,
        exercise_name: logData.exercise_name,
        set_no: logData.set_no,
        reps: logData.reps,
        weight: logData.weight,
        duration: logData.duration || 0,
        distance: logData.distance || 0,
        datetime: logData.datetime,
        comments: logData.comments || null,
        session_id: logData.session_id || null
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async saveWorkoutLogs(logs: any[]) {
    if (logs.length === 0) return [];

    const { data, error } = await supabase
      .from('logs')
      .insert(logs)
      .select();

    if (error) throw error;
    return data || [];
  }

  async getWorkoutHistory(programId: string, limit = 10) {
    const { data, error } = await supabase
      .from('logs')
      .select('*')
      .eq('program_id', programId)
      .order('datetime', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  async getExerciseHistory(exerciseId: string, limit = 5) {
    const { data, error } = await supabase
      .from('logs')
      .select('*')
      .eq('exercise_id', exerciseId)
      .order('datetime', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  async getLastWorkout(userId: string, programId: string) {
    const { data, error } = await supabase
      .from('logs')
      .select('*')
      .eq('user_id', userId)
      .eq('program_id', programId)
      .order('datetime', { ascending: false })
      .limit(1);

    if (error) throw error;
    return data && data.length > 0 ? data[0] : null;
  }

  async createExercises(programId: string, userId: string, exercises: any[]) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const exercisesData = exercises.map((ex, index) => ({
      program_id: programId,
      user_id: userId,
      exercise_name: ex.exercise_name,
      exercise_type: ex.exercise_type || 'reps',
      target_sets: ex.target_sets,
      target_reps: ex.target_reps,
      target_weight: ex.target_weight || 0,
      duration: ex.duration || 0,
      distance: ex.distance || 0,
      order_index: index,
      notes: ex.notes || ''
    }));

    const { data, error } = await supabase
      .from('exercises')
      .insert(exercisesData)
      .select();

    if (error) throw error;
    return data;
  }

  async getCompletedWorkouts(userId: string) {
    const { data, error } = await supabase
      .from('workout_sessions')
      .select(`
        id,
        program_name,
        completed_at,
        total_duration
      `)
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    
    if (!data || data.length === 0) return [];

    const workoutsWithStats = await Promise.all(
      data.map(async (workout) => {
        const { data: logs, error: logsError } = await supabase
          .from('logs')
          .select('exercise_name')
          .eq('session_id', workout.id);

        if (logsError) {
          return {
            ...workout,
            exercises_count: 0,
            total_sets: 0,
          };
        }

        const exerciseNames = new Set(logs?.map(log => log.exercise_name) || []);
        
        return {
          ...workout,
          exercises_count: exerciseNames.size,
          total_sets: logs?.length || 0,
        };
      })
    );

    return workoutsWithStats;
  }

  async getWorkoutDetail(sessionId: string) {
    const { data, error } = await supabase
      .from('logs')
      .select('exercise_name, set_no, reps, weight, duration, distance')
      .eq('session_id', sessionId)
      .order('datetime', { ascending: true});

    if (error) throw error;

    return (data || []).map((log: any) => {
      let display_value = '';
      
      if (log.duration > 0) {
        display_value = `${log.duration}сек`;
      } else if (log.distance > 0) {
        display_value = `${log.distance}м`;
      } else {
        display_value = `${log.reps}×${log.weight}кг`;
      }

      return {
        exercise_name: log.exercise_name,
        set_no: log.set_no,
        display_value
      };
    });
  }

  async getPersonalRecords(userId: string, exerciseName?: string) {
    let query = this.supabase
      .from('personal_records')
      .select('*')
      .eq('user_id', userId)
      .eq('is_current', true)
      .order('achieved_at', { ascending: false });

    if (exerciseName) {
      query = query.eq('exercise_name', exerciseName);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  async savePersonalRecord(recordData: any) {
    const { data, error } = await this.supabase
      .from('personal_records')
      .insert(recordData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updatePersonalRecord(recordId: string, updates: any) {
    const { data, error } = await this.supabase
      .from('personal_records')
      .update(updates)
      .eq('id', recordId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getAllPersonalRecords(userId: string) {
    const { data, error } = await this.supabase
      .from('personal_records')
      .select('*')
      .eq('user_id', userId)
      .order('achieved_at', { ascending: false});

    if (error) throw error;
    return data || [];
  }

  async getRecordHistory(userId: string, exerciseName: string, reps?: number) {
    let query = this.supabase
      .from('personal_records')
      .select('*')
      .eq('user_id', userId)
      .eq('exercise_name', exerciseName)
      .order('achieved_at', { ascending: false });

    if (reps !== undefined) {
      query = query.eq('record_reps', reps);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  async getBasicStats(userId: string) {
    const { data: workouts, error: workoutsError } = await this.supabase
      .from('workout_sessions')
      .select('id, total_duration')
      .eq('user_id', userId)
      .eq('status', 'completed');

    if (workoutsError) throw workoutsError;

    const totalWorkouts = workouts?.length || 0;
    const totalDuration = workouts?.reduce((sum, w) => sum + (w.total_duration || 0), 0) || 0;

    const { data: weeklyData, error: weeklyError } = await this.supabase
      .from('workout_sessions')
      .select('completed_at')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false });

    if (weeklyError) throw weeklyError;

    let activeWeeksStreak = 0;
    if (weeklyData && weeklyData.length > 0) {
      const weeks = new Set<string>();
      weeklyData.forEach(w => {
        if (w.completed_at) {
          const date = new Date(w.completed_at);
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          weeks.add(weekStart.toISOString().split('T')[0]);
        }
      });

      const sortedWeeks = Array.from(weeks).sort().reverse();
      const currentWeek = new Date();
      currentWeek.setDate(currentWeek.getDate() - currentWeek.getDay());

      for (let i = 0; i < sortedWeeks.length; i++) {
        const expectedWeek = new Date(currentWeek);
        expectedWeek.setDate(currentWeek.getDate() - (i * 7));
        const expectedWeekStr = expectedWeek.toISOString().split('T')[0];

        if (sortedWeeks[i] === expectedWeekStr) {
          activeWeeksStreak++;
        } else {
          break;
        }
      }
    }

    return {
      total_workouts: totalWorkouts,
      active_weeks_streak: activeWeeksStreak,
      total_duration_minutes: totalDuration
    };
  }

  async getLast7Days(userId: string) {
    const { data, error } = await this.supabase
      .from('workout_sessions')
      .select('completed_at')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .gte('completed_at', (() => {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);
        return sevenDaysAgo.toISOString();
      })());

    if (error) throw error;

    const workoutDates = (data || [])
      .map(w => {
        if (w.completed_at) {
          return new Date(w.completed_at).toISOString().split('T')[0];
        }
        return null;
      })
      .filter(Boolean) as string[];

    const { data: splitPrograms, error: splitError } = await this.supabase
      .from('programs')
      .select('id')
      .eq('user_id', userId)
      .not('day_order', 'is', null)
      .gt('day_order', 0);

    if (splitError) throw splitError;

    const splitSize = splitPrograms?.length || 0;
    let progressPercent: number | undefined;

    if (splitSize > 0) {
      progressPercent = Math.round((workoutDates.length / splitSize) * 100);
    }

    return {
      workout_count: workoutDates.length,
      workout_dates: workoutDates,
      split_size: splitSize > 0 ? splitSize : undefined,
      progress_percent: progressPercent
    };
  }

  async getTopExercises(userId: string, limit: number = 5) {
    const { data, error } = await this.supabase
      .from('logs')
      .select('exercise_name, weight, reps, duration, distance')
      .eq('user_id', userId);

    if (error) throw error;

    const exerciseData = (data || []).reduce((acc, log) => {
      const name = log.exercise_name;
      if (!acc[name]) {
        acc[name] = {
          total_sets: 0,
          total_volume: 0,
          total_duration: 0,
          total_distance: 0,
          has_weight: false,
          has_duration: false,
          has_distance: false
        };
      }
      
      acc[name].total_sets++;
      
      if (log.weight > 0 && log.reps > 0) {
        acc[name].total_volume += log.weight * log.reps;
        acc[name].has_weight = true;
      }
      
      if (log.duration > 0) {
        acc[name].total_duration += log.duration;
        acc[name].has_duration = true;
      }
      
      if (log.distance > 0) {
        acc[name].total_distance += log.distance;
        acc[name].has_distance = true;
      }
      
      return acc;
    }, {} as Record<string, any>);

    const topExercises = Object.entries(exerciseData)
      .map(([exercise_name, data]: [string, any]) => {
        let secondary_metric = '';
        
        if (data.has_weight) {
          secondary_metric = `${Math.round(data.total_volume).toLocaleString()} кг`;
        } else if (data.has_duration) {
          const minutes = Math.round(data.total_duration / 60);
          secondary_metric = `${minutes} мин`;
        } else if (data.has_distance) {
          const km = (data.total_distance / 1000).toFixed(1);
          secondary_metric = `${km} км`;
        }
        
        return {
          exercise_name,
          total_sets: data.total_sets,
          secondary_metric: secondary_metric || undefined
        };
      })
      .sort((a, b) => b.total_sets - a.total_sets)
      .slice(0, limit);

    return topExercises;
  }

  async updateWorkoutLog(logId: string, updates: {
    reps?: number;
    weight?: number;
    duration?: number;
    distance?: number;
  }) {
    const { data, error } = await this.supabase
      .from('logs')
      .update(updates)
      .eq('id', logId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

export const supabaseService = new SupabaseService();
