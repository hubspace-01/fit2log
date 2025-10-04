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
    const newProgram = await supabaseService.createProgram(programData);
    await loadPrograms();
    return newProgram;
  }, [loadPrograms]);

  // ✅ НОВОЕ: Обновление программы
  const updateProgram = useCallback(async (programId: string, programData: any) => {
    const updatedProgram = await supabaseService.updateProgram(programId, programData);
    await loadPrograms();
    return updatedProgram;
  }, [loadPrograms]);

  const copyTemplate = useCallback(async (templateId: string, userId: string) => {
    const newProgram = await supabaseService.copyTemplate(templateId, userId);
    await loadPrograms();
    return newProgram;
  }, [loadPrograms]);

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
    updateProgram, // ✅ Экспортируем updateProgram
    copyTemplate,
    deleteProgram
  };
};
