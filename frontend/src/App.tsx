import React, { useEffect, useCallback } from 'react';
import { Spinner } from '@telegram-apps/telegram-ui';
import { useAuth, useAppState, usePrograms } from './hooks';
import { ProgramSelector, TemplateList, ProgramEditor, ProgramDetails } from './components';
import { AppScreen } from './types';
import type { Program, ProgramTemplate } from './types';

const App: React.FC = () => {
  const { user, loading: authLoading, error: authError } = useAuth();
  const { 
    state, 
    setScreen, 
    setPrograms, 
    setCurrentProgram, 
    startWorkout,
    setLoading, 
    setError, 
    clearError 
  } = useAppState();
  const { 
    programs, 
    templates, 
    loading: programsLoading, 
    loadPrograms, 
    loadTemplates, 
    createProgram, 
    copyTemplate,
    deleteProgram // ✅ Добавили deleteProgram
  } = usePrograms();

  useEffect(() => {
    if (user && !authLoading) {
      loadPrograms().then(() => {
        setScreen(AppScreen.PROGRAM_SELECTOR);
      });
    }
  }, [user, authLoading, loadPrograms, setScreen]);

  useEffect(() => {
    if (programs.length > 0 && programs !== state.programs) {
      setPrograms(programs);
    }
  }, [programs, setPrograms, state.programs]);

  const handleCreateProgram = useCallback(() => {
    setScreen(AppScreen.PROGRAM_EDITOR);
  }, [setScreen]);

  const handleSelectTemplate = useCallback(async () => {
    if (templates.length === 0) {
      await loadTemplates();
    }
    setScreen(AppScreen.TEMPLATE_LIST);
  }, [templates.length, loadTemplates, setScreen]);

  const handleSelectProgram = useCallback((program: Program) => {
    setCurrentProgram(program);
    setScreen(AppScreen.PROGRAM_DETAILS);
  }, [setCurrentProgram, setScreen]);

  const handleProgramEditorSave = useCallback(async (programData: any) => {
    if (!user) return;
    try {
      setLoading(true);
      clearError();
      await createProgram({
        ...programData,
        user_id: user.id,
        is_template: false
      });
      await loadPrograms();
      setScreen(AppScreen.PROGRAM_SELECTOR);
    } catch (error) {
      console.error('Save error:', error);
      setError('Ошибка при сохранении программы');
    } finally {
      setLoading(false);
    }
  }, [user, createProgram, loadPrograms, setLoading, clearError, setError, setScreen]);

  const handleTemplateSelect = useCallback(async (template: ProgramTemplate) => {
    if (!user) return;
    try {
      setLoading(true);
      clearError();
      await copyTemplate(template.id, user.id);
      await loadPrograms();
      setScreen(AppScreen.PROGRAM_SELECTOR);
    } catch (error) {
      console.error('Copy template error:', error);
      setError('Ошибка при копировании шаблона');
    } finally {
      setLoading(false);
    }
  }, [user, copyTemplate, loadPrograms, setLoading, clearError, setError, setScreen]);

  const handleEditProgram = useCallback((program: Program) => {
    setCurrentProgram(program);
    setScreen(AppScreen.PROGRAM_EDITOR);
  }, [setCurrentProgram, setScreen]);

  // ✅ ИСПРАВЛЕНО: Реальное удаление программы
  const handleDeleteProgram = useCallback(async (programId: string) => {
    try {
      setLoading(true);
      clearError();
      await deleteProgram(programId);
      setScreen(AppScreen.PROGRAM_SELECTOR);
    } catch (error) {
      console.error('Delete error:', error);
      setError('Ошибка при удалении программы');
    } finally {
      setLoading(false);
    }
  }, [deleteProgram, setLoading, clearError, setError, setScreen]);

  const handleStartWorkout = useCallback((program: Program) => {
    startWorkout(program);
    setScreen(AppScreen.WORKOUT_LOGGER);
    alert('Экран тренировки в разработке');
  }, [startWorkout, setScreen]);

  const handleBack = useCallback(() => {
    setScreen(AppScreen.PROGRAM_SELECTOR);
  }, [setScreen]);

  if (authLoading || state.screen === AppScreen.LOADING) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Spinner size="l" />
      </div>
    );
  }

  if (authError || state.screen === AppScreen.AUTH_ERROR) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center',
        color: 'var(--tg-theme-destructive-text-color, #ff3b30)'
      }}>
        {authError}
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      {state.screen === AppScreen.PROGRAM_SELECTOR && (
        <ProgramSelector
          programs={state.programs}
          userName={user?.first_name || 'Друг'}
          onCreateProgram={handleCreateProgram}
          onSelectTemplate={handleSelectTemplate}
          onSelectProgram={handleSelectProgram}
        />
      )}

      {state.screen === AppScreen.PROGRAM_DETAILS && state.current_program && (
        <ProgramDetails
          program={state.current_program}
          onBack={handleBack}
          onEdit={handleEditProgram}
          onDelete={handleDeleteProgram}
          onStartWorkout={handleStartWorkout}
        />
      )}

      {state.screen === AppScreen.TEMPLATE_LIST && (
        <TemplateList
          templates={templates}
          loading={programsLoading}
          onSelectTemplate={handleTemplateSelect}
          onBack={handleBack}
        />
      )}

      {state.screen === AppScreen.PROGRAM_EDITOR && (
        <ProgramEditor
          onSave={handleProgramEditorSave}
          onBack={handleBack}
        />
      )}

      {state.screen === AppScreen.WORKOUT_LOGGER && (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Экран тренировки</h2>
          <p>В разработке...</p>
          <button onClick={handleBack}>Назад</button>
        </div>
      )}
    </div>
  );
};

export default App;
