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
  private accessToken?: string;

  async validateTelegramInitData(initData: string) {
    try {
      const { data, error } = await supabase.functions.invoke('validate-telegram', {
        body: { initData }
      });

      if (error) throw error;
      if (!data?.ok) throw new Error(data?.error || 'Validation failed');

      this.accessToken = data.access_token;

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

  async copyTemplate(templateId: string) {
    try {
      const { data, error } = await supabase.functions.invoke('copy-template', {
        body: { templateId }
      });

      if (error) throw error;
      if (!data?.ok) throw new Error(data?.error || 'Failed to copy template');
      return data.program;
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
