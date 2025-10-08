import React, { useEffect, useCallback } from 'react';
import { Spinner } from '@telegram-apps/telegram-ui';
import { useAuth, useAppState, usePrograms } from './hooks';
import { 
  ProgramSelector, 
  TemplateList, 
  ProgramEditor, 
  ProgramDetails, 
  WorkoutLogger,
  WorkoutSummary,
  WorkoutHistory,
  WorkoutDetail
} from './components';
import { AppScreen } from './types';
import type { Program, ProgramTemplate, WorkoutHistoryItem } from './types';
import { supabaseService } from './lib/supabase';

const App: React.FC = () => {
  const { user, loading: authLoading, error: authError } = useAuth();
  const { 
    state, 
    setScreen, 
    setPrograms, 
    setCurrentProgram, 
    startWorkout,
    setWorkoutSummary,
    setWorkoutHistory,
    setCurrentWorkoutDetail,
    setLoading, 
    setError, 
    clearError 
  } = useAppState();
  const { 
    programs, 
    templates, 
    loading: programsLoading,
    initialize,
    loadPrograms, 
    loadTemplates, 
    createProgram,
    updateProgram,
    copyTemplate,
    deleteProgram
  } = usePrograms();

  useEffect(() => {
    if (user && !authLoading) {
      initialize(user.id);
    }
  }, [user, authLoading, initialize]);

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

  const handleViewHistory = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      clearError();
      const history = await supabaseService.getCompletedWorkouts(user.id);
      setWorkoutHistory(history);
      setScreen(AppScreen.WORKOUT_HISTORY);
    } catch (error) {
      console.error('❌ Load history error:', error);
      setError(`Ошибка загрузки истории: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    } finally {
      setLoading(false);
    }
  }, [user, setWorkoutHistory, setLoading, clearError, setError, setScreen]);

  const handleViewWorkoutDetail = useCallback(async (workout: WorkoutHistoryItem) => {
    try {
      setLoading(true);
      clearError();
      const details = await supabaseService.getWorkoutDetail(workout.id);
      setCurrentWorkoutDetail(details, workout);
      setScreen(AppScreen.WORKOUT_DETAIL);
    } catch (error) {
      console.error('❌ Load workout detail error:', error);
      setError(`Ошибка загрузки деталей: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    } finally {
      setLoading(false);
    }
  }, [setCurrentWorkoutDetail, setLoading, clearError, setError, setScreen]);

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

  const handleStartWorkout = useCallback(async (program: Program) => {
    if (!user) return;
    
    try {
      console.log('🏋️ Starting workout:', program);
      
      const existingSession = await supabaseService.getInProgressSession(
        user.id,
        program.id
      );
      
      if (existingSession) {
        console.log('✅ Found existing session, resuming');
        startWorkout(program, existingSession.id);
      } else {
        console.log('✅ Starting new session');
        startWorkout(program);
      }
      
      setScreen(AppScreen.WORKOUT_LOGGER);
    } catch (error) {
      console.error('❌ Start workout error:', error);
      alert('Ошибка при запуске тренировки');
    }
  }, [user, startWorkout, setScreen]);

  const handleFinishWorkout = useCallback((completedSets: any[], duration: number) => {
    console.log('✅ Workout finished:', completedSets, duration);
    setWorkoutSummary(completedSets, duration);
    setScreen(AppScreen.WORKOUT_SUMMARY);
  }, [setWorkoutSummary, setScreen]);

  const handleCancelWorkout = useCallback(() => {
    console.log('❌ Workout cancelled');
    setScreen(AppScreen.PROGRAM_SELECTOR);
  }, [setScreen]);

  const handleCompleteSummary = useCallback(() => {
    console.log('✅ Summary completed');
    setScreen(AppScreen.PROGRAM_SELECTOR);
  }, [setScreen]);

  const handleBack = useCallback(() => {
    setScreen(AppScreen.PROGRAM_SELECTOR);
  }, [setScreen]);

  const handleBackToHistory = useCallback(() => {
    setScreen(AppScreen.WORKOUT_HISTORY);
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
      {state.screen === AppScreen.PROGRAM_SELECTOR && user && (
        <ProgramSelector
          programs={state.programs}
          userName={user?.first_name || 'Друг'}
          userId={user.id}
          onCreateProgram={handleCreateProgram}
          onSelectTemplate={handleSelectTemplate}
          onSelectProgram={handleSelectProgram}
          onViewHistory={handleViewHistory}
        />
      )}

      {state.screen === AppScreen.PROGRAM_DETAILS && state.current_program && user && (
        <ProgramDetails
          program={state.current_program}
          userId={user.id}
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

      {/* ✅ ИСПРАВЛЕНО: Добавлена проверка user */}
      {state.screen === AppScreen.PROGRAM_EDITOR && user && (
        <ProgramEditor
          onSave={handleProgramEditorSave}
          onBack={handleBack}
          initialData={state.current_program}
          userId={user.id}
        />
      )}

      {state.screen === AppScreen.WORKOUT_LOGGER && state.workout_session && user && (
        <WorkoutLogger
          session={state.workout_session}
          userId={user.id}
          onFinish={handleFinishWorkout}
          onCancel={handleCancelWorkout}
        />
      )}

      {state.screen === AppScreen.WORKOUT_SUMMARY && 
       state.workout_session && 
       state.workout_completed_sets && 
       state.workout_duration !== undefined && (
        <WorkoutSummary
          programName={state.workout_session.program_name}
          completedSets={state.workout_completed_sets}
          duration={state.workout_duration}
          totalExercises={state.workout_session.exercises.length}
          onFinish={handleCompleteSummary}
        />
      )}

      {state.screen === AppScreen.WORKOUT_HISTORY && user && (
        <WorkoutHistory
          userId={user.id}
          onBack={handleBack}
          onViewDetail={handleViewWorkoutDetail}
        />
      )}

      {state.screen === AppScreen.WORKOUT_DETAIL && 
       state.current_workout_info && 
       state.current_workout_detail && (
        <WorkoutDetail
          workout={state.current_workout_info}
          onBack={handleBackToHistory}
        />
      )}
    </div>
  );
};

export default App;
