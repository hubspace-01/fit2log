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

  // ✅ НОВОЕ: копирование шаблона БЕЗ Edge Function
  async copyTemplate(templateId: string, userId: string) {
    try {
      console.log('🔍 Copying template:', templateId, 'for user:', userId);
      
      // 1. Получаем шаблон с упражнениями
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

      // 2. Создаём новую программу
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

      // 3. Копируем упражнения из шаблона
      if (template.template_exercises && template.template_exercises.length > 0) {
        const exercises = template.template_exercises.map((ex: any) => ({
          program_id: program.id,
          user_id: userId,
          exercise_name: ex.exercise_name,
          target_sets: ex.target_sets,
          target_reps: ex.target_reps,
          target_weight: ex.target_weight || 0,
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

  async createExercises(programId: string, userId: string, exercises: any[]) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const exercisesData = exercises.map((ex, index) => ({
      program_id: programId,
      user_id: userId,
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
