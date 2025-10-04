import React, { useEffect, useCallback } from 'react';
import { Spinner } from '@telegram-apps/telegram-ui';
import { useAuth, useAppState, usePrograms } from './hooks';
import { ProgramSelector, TemplateList, ProgramEditor, ProgramDetails, WorkoutLogger } from './components';
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
    updateProgram,
    copyTemplate,
    deleteProgram
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
    setCurrentProgram(undefined);
    setScreen(AppScreen.PROGRAM_EDITOR);
  }, [setCurrentProgram, setScreen]);

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
    if (!user) {
      alert('Ошибка: пользователь не авторизован');
      return;
    }
    
    try {
      console.log('🔍 Saving program:', programData);
      setLoading(true);
      clearError();
      
      const dataWithUserId = {
        ...programData,
        user_id: user.id
      };
      
      if (state.current_program) {
        console.log('✏️ Updating program:', state.current_program.id);
        await updateProgram(state.current_program.id, dataWithUserId);
      } else {
        console.log('➕ Creating new program');
        await createProgram(dataWithUserId);
      }
      
      await loadPrograms();
      setScreen(AppScreen.PROGRAM_SELECTOR);
    } catch (error) {
      console.error('❌ Save error:', error);
      setError(`Ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      alert(`Ошибка при сохранении: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    } finally {
      setLoading(false);
    }
  }, [user, state.current_program, createProgram, updateProgram, loadPrograms, setLoading, clearError, setError, setScreen]);

  const handleTemplateSelect = useCallback(async (template: ProgramTemplate) => {
    if (!user) return;
    try {
      console.log('🔍 Copying template:', template.id);
      setLoading(true);
      clearError();
      
      const result = await copyTemplate(template.id, user.id);
      console.log('✅ Template copied:', result);
      
      await loadPrograms();
      setScreen(AppScreen.PROGRAM_SELECTOR);
    } catch (error) {
      console.error('❌ Copy template error:', error);
      setError(`Ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      alert(`Ошибка при копировании: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    } finally {
      setLoading(false);
    }
  }, [user, copyTemplate, loadPrograms, setLoading, clearError, setError, setScreen]);

  const handleEditProgram = useCallback((program: Program) => {
    setCurrentProgram(program);
    setScreen(AppScreen.PROGRAM_EDITOR);
  }, [setCurrentProgram, setScreen]);

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

  // ✅ НОВОЕ: Начать тренировку
  const handleStartWorkout = useCallback((program: Program) => {
    console.log('🏋️ Starting workout:', program);
    startWorkout(program);
    setScreen(AppScreen.WORKOUT_LOGGER);
  }, [startWorkout, setScreen]);

  // ✅ НОВОЕ: Завершить тренировку
  const handleFinishWorkout = useCallback(() => {
    console.log('✅ Workout finished');
    // TODO: Сохранить логи в БД
    setScreen(AppScreen.PROGRAM_SELECTOR);
  }, [setScreen]);

  // ✅ НОВОЕ: Отменить тренировку
  const handleCancelWorkout = useCallback(() => {
    console.log('❌ Workout cancelled');
    setScreen(AppScreen.PROGRAM_SELECTOR);
  }, [setScreen]);

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
          initialData={state.current_program}
        />
      )}

      {/* ✅ НОВОЕ: Экран тренировки */}
      {state.screen === AppScreen.WORKOUT_LOGGER && state.workout_session && (
        <WorkoutLogger
          session={state.workout_session}
          onFinish={handleFinishWorkout}
          onCancel={handleCancelWorkout}
        />
      )}
    </div>
  );
};

export default App;
