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
      .select('*, exercises (*)')
      .eq('is_template', false)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getProgramTemplates() {
    const { data, error } = await supabase
      .from('program_templates')
      .select('*, template_exercises (*)')
      .eq('is_active', true);

    if (error) throw error;
    return data || [];
  }

  async copyTemplate(templateId: string, userId: string) {
    try {
      console.log('Copying template:', templateId, 'for user:', userId);

      // Получаем шаблон с упражнениями
      const { data: template, error: templateError } = await supabase
        .from('program_templates')
        .select('*, template_exercises (*)')
        .eq('id', templateId)
        .single();

      if (templateError) {
        console.error('Template fetch error:', templateError);
        throw templateError;
      }

      console.log('Template found:', template);

      // Создаем новую программу
      const { data: newProgram, error: programError } = await supabase
        .from('programs')
        .insert({
          user_id: userId,
          program_name: template.template_name,
          is_template: false
        })
        .select()
        .single();

      if (programError) {
        console.error('Program create error:', programError);
        throw programError;
      }

      console.log('Program created:', newProgram);

      // Копируем упражнения если есть
      if (template.template_exercises && template.template_exercises.length > 0) {
        const exercises = template.template_exercises.map((ex: any) => ({
          program_id: newProgram.id,
          user_id: userId,
          exercise_name: ex.exercise_name,
          target_sets: ex.target_sets,
          target_reps: ex.target_reps,
          target_weight: ex.target_weight,
          order_index: ex.order_index,
          notes: ex.notes
        }));

        console.log('Creating exercises:', exercises);

        const { error: exercisesError } = await supabase
          .from('exercises')
          .insert(exercises);

        if (exercisesError) {
          console.error('Exercises create error:', exercisesError);
          throw exercisesError;
        }
      }

      // Получаем полную программу с упражнениями
      const { data: completeProgram, error: fetchError } = await supabase
        .from('programs')
        .select('*, exercises (*)')
        .eq('id', newProgram.id)
        .single();

      if (fetchError) {
        console.error('Fetch complete program error:', fetchError);
        throw fetchError;
      }

      console.log('Complete program:', completeProgram);
      return completeProgram;
    } catch (error) {
      console.error('Copy template error:', error);
      throw error;
    }
  }

  async createProgram(program: any) {
    const { data, error } = await supabase
      .from('programs')
      .insert(program)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async createExercises(exercises: any[]) {
    const { data, error } = await supabase
      .from('exercises')
      .insert(exercises)
      .select();

    if (error) throw error;
    return data;
  }
}

export const supabaseService = new SupabaseService();
