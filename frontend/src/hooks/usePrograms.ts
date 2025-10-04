import { useState, useCallback } from 'react';
import { supabaseService } from '../lib/supabase';
import type { Program, ProgramTemplate } from '../types';

export const usePrograms = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [templates, setTemplates] = useState<ProgramTemplate[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPrograms = useCallback(async () => {
    try {
      setLoading(true);
      const data = await supabaseService.getPrograms();
      setPrograms(data);
    } catch (error) {
      console.error('Load programs error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const data = await supabaseService.getProgramTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Load templates error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const createProgram = useCallback(async (programData: any) => {
    const newProgram = await supabaseService.createProgram({
      user_id: programData.user_id,
      program_name: programData.program_name,
      exercises: programData.exercises, // Передаём упражнения сразу в createProgram
      is_template: false
    });

    await loadPrograms();
    return newProgram;
  }, [loadPrograms]);

  const copyTemplate = useCallback(async (templateId: string, userId: string) => {
    const newProgram = await supabaseService.copyTemplate(templateId, userId);
    await loadPrograms();
    return newProgram;
  }, [loadPrograms]);

  // ✅ НОВОЕ: Удаление программы
  const deleteProgram = useCallback(async (programId: string) => {
    await supabaseService.deleteProgram(programId);
    await loadPrograms();
  }, [loadPrograms]);

  return {
    programs,
    templates,
    loading,
    loadPrograms,
    loadTemplates,
    createProgram,
    copyTemplate,
    deleteProgram // ✅ Экспортируем deleteProgram
  };
};
