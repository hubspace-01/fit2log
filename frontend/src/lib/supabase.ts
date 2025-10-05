import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});

class SupabaseService {
  async validateTelegramInitData(initData: string) {
    try {
      const { data, error } = await supabase.functions.invoke('validate-telegram', {
        body: { initData }
      });
      
      if (error) throw error;
      if (!data?.ok) throw new Error(data?.error || 'Validation failed');

      if (data.access_token && data.refresh_token) {
        await supabase.auth.setSession({
          access_token: data.access_token,
          refresh_token: data.refresh_token
        });
      }

      return data;
    } catch (error) {
      console.error('Validation error:', error);
      throw error;
    }
  }

  async getPrograms() {
    const { data, error } = await supabase
      .from('programs')
      .select(`
        *,
        exercises (*)
      `)
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
      console.log('🔍 Copying template:', templateId, 'for user:', userId);
      
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

      console.log('✅ Template loaded:', template);

      const { data: program, error: programError } = await supabase
        .from('programs')
        .insert({
          user_id: userId,
          program_name: template.template_name,
          is_template: false
        })
        .select()
        .single();

      if (programError) throw programError;

      console.log('✅ Program created:', program);

      if (template.template_exercises && template.template_exercises.length > 0) {
        const exercises = template.template_exercises.map((ex: any) => ({
          program_id: program.id,
          user_id: userId,
          exercise_name: ex.exercise_name,
          exercise_type: ex.exercise_type || 'reps', // ✅ НОВОЕ
          target_sets: ex.target_sets,
          target_reps: ex.target_reps,
          target_weight: ex.target_weight || 0,
          duration: ex.duration || 0, // ✅ НОВОЕ
          distance: ex.distance || 0, // ✅ НОВОЕ
          order_index: ex.order_index,
          notes: ex.notes || ''
        }));

        const { error: exercisesError } = await supabase
          .from('exercises')
          .insert(exercises);

        if (exercisesError) throw exercisesError;

        console.log('✅ Exercises copied:', exercises.length);
      }

      return { ok: true, program };
    } catch (error) {
      console.error('❌ Copy template error:', error);
      throw error;
    }
  }

  async createProgram(programData: any) {
    const { program_name, exercises, user_id } = programData;
    
    if (!user_id) {
      throw new Error('User ID is required');
    }

    const { data: program, error: programError } = await supabase
      .from('programs')
      .insert({
        user_id: user_id,
        program_name,
        is_template: false
      })
      .select()
      .single();

    if (programError) throw programError;

    if (exercises && exercises.length > 0) {
      const exercisesData = exercises.map((ex: any, index: number) => ({
        program_id: program.id,
        user_id: user_id,
        exercise_name: ex.exercise_name,
        exercise_type: ex.exercise_type || 'reps', // ✅ НОВОЕ: дефолт 'reps'
        target_sets: ex.target_sets,
        target_reps: ex.target_reps,
        target_weight: ex.target_weight || 0,
        duration: ex.duration || 0, // ✅ НОВОЕ
        distance: ex.distance || 0, // ✅ НОВОЕ
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
    const { program_name, exercises, user_id } = programData;
    
    if (!user_id) {
      throw new Error('User ID is required');
    }

    const { data: program, error: programError } = await supabase
      .from('programs')
      .update({
        program_name,
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
        exercise_type: ex.exercise_type || 'reps', // ✅ НОВОЕ
        target_sets: ex.target_sets,
        target_reps: ex.target_reps,
        target_weight: ex.target_weight || 0,
        duration: ex.duration || 0, // ✅ НОВОЕ
        distance: ex.distance || 0, // ✅ НОВОЕ
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

  async deleteProgram(programId: string) {
    const { error: exercisesError } = await supabase
      .from('exercises')
      .delete()
      .eq('program_id', programId);

    if (exercisesError) throw exercisesError;

    const { error: programError } = await supabase
      .from('programs')
      .delete()
      .eq('id', programId);

    if (programError) throw programError;

    return { success: true };
  }

  async saveWorkoutLog(logData: {
    user_id: string;
    program_id: string;
    exercise_id: string;
    exercise_name: string;
    set_no: number;
    reps: number;
    weight: number;
    rpe?: number;
    datetime: string;
    duration?: number; // ✅ НОВОЕ
    distance?: number; // ✅ НОВОЕ
    comments?: string;
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
        rpe: logData.rpe || null,
        duration: logData.duration || 0, // ✅ НОВОЕ
        distance: logData.distance || 0, // ✅ НОВОЕ
        datetime: logData.datetime,
        comments: logData.comments || null
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
      exercise_type: ex.exercise_type || 'reps', // ✅ НОВОЕ
      target_sets: ex.target_sets,
      target_reps: ex.target_reps,
      target_weight: ex.target_weight || 0,
      duration: ex.duration || 0, // ✅ НОВОЕ
      distance: ex.distance || 0, // ✅ НОВОЕ
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
}

export const supabaseService = new SupabaseService();
