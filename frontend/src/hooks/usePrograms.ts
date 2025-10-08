import { useState, useCallback } from 'react';
import { supabaseService } from '../lib/supabase';
import type { Program, ProgramTemplate } from '../types';

export const usePrograms = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [templates, setTemplates] = useState<ProgramTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // ✅ НОВОЕ: Инициализация userId
  const initialize = useCallback((uid: string) => {
    setUserId(uid);
  }, []);

  // ✅ ИСПРАВЛЕНО: Передаём userId
  const loadPrograms = useCallback(async () => {
    if (!userId) {
      console.warn('⚠️ Cannot load programs: userId not set');
      return;
    }
    
    try {
      setLoading(true);
      const data = await supabaseService.getPrograms(userId);
      setPrograms(data);
    } catch (error) {
      console.error('Load programs error:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

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

  // ✅ ИСПРАВЛЕНО: Передаём userId
  const deleteProgram = useCallback(async (programId: string) => {
    if (!userId) {
      throw new Error('User ID is required for delete');
    }
    await supabaseService.deleteProgram(programId, userId);
    await loadPrograms();
  }, [userId, loadPrograms]);

  return {
    programs,
    templates,
    loading,
    initialize,  // ✅ НОВОЕ: Экспортируем initialize
    loadPrograms,
    loadTemplates,
    createProgram,
    updateProgram,
    copyTemplate,
    deleteProgram
  };
};
