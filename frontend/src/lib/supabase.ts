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
      const { data, error } = await supabase.functions.invoke('copy-template', {
        body: { template_id: templateId, user_id: userId }
      });

      if (error) throw error;
      if (!data?.ok) throw new Error(data?.error || 'Copy failed');

      return data;
    } catch (error) {
      console.error('Copy template error:', error);
      throw error;
    }
  }

  async createProgram(programData: any) {
    const { program_name, exercises } = programData;
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('User not authenticated');

    const { data: program, error: programError } = await supabase
      .from('programs')
      .insert({
        user_id: user.id,
        program_name,
        is_template: false
      })
      .select()
      .single();

    if (programError) throw programError;

    if (exercises && exercises.length > 0) {
      const exercisesData = exercises.map((ex: any, index: number) => ({
        program_id: program.id,
        user_id: user.id,
        exercise_name: ex.exercise_name,
        target_sets: ex.target_sets,
        target_reps: ex.target_reps,
        target_weight: ex.target_weight || 0,
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

  // ✅ НОВОЕ: Удаление программы
  async deleteProgram(programId: string) {
    // Сначала удаляем упражнения (каскадное удаление может быть настроено в БД, но на всякий случай делаем явно)
    const { error: exercisesError } = await supabase
      .from('exercises')
      .delete()
      .eq('program_id', programId);

    if (exercisesError) throw exercisesError;

    // Затем удаляем саму программу
    const { error: programError } = await supabase
      .from('programs')
      .delete()
      .eq('id', programId);

    if (programError) throw programError;

    return { success: true };
  }

  async createExercises(programId: string, exercises: any[]) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('User not authenticated');

    const exercisesData = exercises.map((ex, index) => ({
      program_id: programId,
      user_id: user.id,
      exercise_name: ex.exercise_name,
      target_sets: ex.target_sets,
      target_reps: ex.target_reps,
      target_weight: ex.target_weight || 0,
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
