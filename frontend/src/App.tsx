import React, { useEffect, useCallback } from 'react';
import { Spinner, Card, Title, Text } from '@telegram-apps/telegram-ui';
import { AlertCircle } from 'lucide-react';
import { useAuth, useAppState, usePrograms } from './hooks';
import { 
  ProgramSelector, 
  TemplateList, 
  ProgramEditor, 
  ProgramDetails, 
  WorkoutLogger,
  WorkoutSummary,
  WorkoutHistory,
  WorkoutDetail,
  StatisticsWithTabs,
  Profile
} from './components';
import { AppScreen } from './types';
import type { Program, ProgramTemplate, WorkoutHistoryItem } from './types';
import { supabaseService } from './lib/supabase';
import { telegramService } from './lib/telegram';

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
    setSettings,
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
      telegramService.hapticFeedback('impact', 'light');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      setError(`Ошибка загрузки истории: ${errorMessage}`);
      telegramService.showAlert(`Ошибка загрузки истории: ${errorMessage}`);
      telegramService.hapticFeedback('impact', 'medium');
    } finally {
      setLoading(false);
    }
  }, [user, setWorkoutHistory, setLoading, clearError, setError, setScreen]);

  const handleViewStatistics = useCallback(() => {
    setScreen(AppScreen.STATISTICS);
  }, [setScreen]);

  const handleViewProfile = useCallback(() => {
    setScreen(AppScreen.PROFILE);
  }, [setScreen]);

  const handleViewWorkoutDetail = useCallback(async (workout: WorkoutHistoryItem) => {
    try {
      setLoading(true);
      clearError();
      const details = await supabaseService.getWorkoutDetail(workout.id);
      setCurrentWorkoutDetail(details, workout);
      setScreen(AppScreen.WORKOUT_DETAIL);
      telegramService.hapticFeedback('impact', 'light');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      setError(`Ошибка загрузки деталей: ${errorMessage}`);
      telegramService.showAlert(`Ошибка загрузки деталей: ${errorMessage}`);
      telegramService.hapticFeedback('impact', 'medium');
    } finally {
      setLoading(false);
    }
  }, [setCurrentWorkoutDetail, setLoading, clearError, setError, setScreen]);

  const handleProgramEditorSave = useCallback(async (programData: Partial<Program>) => {
    if (!user) {
      telegramService.showAlert('Ошибка: пользователь не авторизован');
      return;
    }
    
    try {
      setLoading(true);
      clearError();
      
      const dataWithUserId = {
        ...programData,
        user_id: user.id
      };
      
      let savedProgramId = state.current_program?.id;
      
      if (state.current_program) {
        await updateProgram(state.current_program.id, dataWithUserId);
      } else {
        const newProgram = await createProgram(dataWithUserId);
        savedProgramId = newProgram.id;
      }
      
      await loadPrograms();
      
      if (savedProgramId) {
        const updatedProgram = programs.find(p => p.id === savedProgramId);
        if (updatedProgram) {
          setCurrentProgram(updatedProgram);
          setScreen(AppScreen.PROGRAM_DETAILS);
          return;
        }
      }
      
      setScreen(AppScreen.PROGRAM_SELECTOR);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      setError(`Ошибка: ${errorMessage}`);
      telegramService.showAlert(`Ошибка при сохранении: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [user, state.current_program, createProgram, updateProgram, loadPrograms, programs, setCurrentProgram, setLoading, clearError, setError, setScreen]);

  const handleTemplateSelect = useCallback(async (template: ProgramTemplate) => {
    if (!user) return;
    try {
      setLoading(true);
      clearError();
      
      await copyTemplate(template.id, user.id);
      
      await loadPrograms();
      setScreen(AppScreen.PROGRAM_SELECTOR);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      setError(`Ошибка: ${errorMessage}`);
      telegramService.showAlert(`Ошибка при копировании: ${errorMessage}`);
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
      setError('Ошибка при удалении программы');
      telegramService.showAlert('Ошибка при удалении программы');
    } finally {
      setLoading(false);
    }
  }, [deleteProgram, setLoading, clearError, setError, setScreen]);

  const handleStartWorkout = useCallback(async (program: Program) => {
    if (!user) return;
    
    try {
      const existingSession = await supabaseService.getInProgressSession(
        user.id,
        program.id
      );
      
      if (existingSession) {
        startWorkout(program, existingSession.id);
      } else {
        startWorkout(program);
      }
      
      setScreen(AppScreen.WORKOUT_LOGGER);
    } catch (error) {
      telegramService.showAlert('Ошибка при запуске тренировки');
    }
  }, [user, startWorkout, setScreen]);

  const handleFinishWorkout = useCallback((completedSets: any[], duration: number, sessionId: string) => {
    setWorkoutSummary(completedSets, duration, sessionId);
    setScreen(AppScreen.WORKOUT_SUMMARY);
  }, [setWorkoutSummary, setScreen]);

  const handleCancelWorkout = useCallback(() => {
    setScreen(AppScreen.PROGRAM_SELECTOR);
  }, [setScreen]);

  const handleCompleteSummary = useCallback(() => {
    setScreen(AppScreen.PROGRAM_SELECTOR);
  }, [setScreen]);

  const handleBack = useCallback(() => {
    setScreen(AppScreen.PROGRAM_SELECTOR);
  }, [setScreen]);

  const handleBackFromDetails = useCallback(() => {
    setScreen(AppScreen.PROGRAM_SELECTOR);
  }, [setScreen]);

  const handleBackFromEditor = useCallback(() => {
    if (state.current_program) {
      setScreen(AppScreen.PROGRAM_DETAILS);
    } else {
      setScreen(AppScreen.PROGRAM_SELECTOR);
    }
  }, [state.current_program, setScreen]);

  const handleBackToHistory = useCallback(() => {
    setScreen(AppScreen.WORKOUT_HISTORY);
  }, [setScreen]);

  if (authLoading || state.screen === AppScreen.LOADING) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        flexDirection: 'column',
        gap: '12px',
        backgroundColor: 'var(--tg-theme-bg-color)'
      }}>
        <Spinner size="l" />
        <Text style={{ color: 'var(--tg-theme-hint-color)' }}>
          Загрузка...
        </Text>
      </div>
    );
  }

  if (authError || state.screen === AppScreen.AUTH_ERROR) {
    return (
      <div style={{ 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        padding: '16px',
        backgroundColor: 'var(--tg-theme-bg-color)'
      }}>
        <Card style={{
          textAlign: 'center',
          padding: '60px 16px',
          maxWidth: '400px'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            marginBottom: '16px'
          }}>
            <AlertCircle 
              size={64} 
              color="var(--tg-theme-destructive-text-color)" 
              strokeWidth={1.5}
            />
          </div>
          <Title level="3" weight="2" style={{ 
            marginBottom: '8px', 
            fontSize: '18px'
          }}>
            Ошибка авторизации
          </Title>
          <Text style={{ 
            color: 'var(--tg-theme-hint-color)', 
            fontSize: '14px',
            display: 'block'
          }}>
            {authError}
          </Text>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--tg-theme-bg-color)' }}>
      {state.screen === AppScreen.PROGRAM_SELECTOR && user && (
        <ProgramSelector
          programs={state.programs}
          userName={user?.first_name || 'Друг'}
          userId={user.id}
          onCreateProgram={handleCreateProgram}
          onSelectTemplate={handleSelectTemplate}
          onSelectProgram={handleSelectProgram}
          onViewHistory={handleViewHistory}
          onViewRecords={handleViewStatistics}
          onViewStatistics={handleViewStatistics}
          onViewProfile={handleViewProfile}
        />
      )}

      {state.screen === AppScreen.PROGRAM_DETAILS && state.current_program && user && (
        <ProgramDetails
          program={state.current_program}
          userId={user.id}
          onBack={handleBackFromDetails}
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

      {state.screen === AppScreen.PROGRAM_EDITOR && user && (
        <ProgramEditor
          onSave={handleProgramEditorSave}
          onBack={handleBackFromEditor}
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
       state.workout_duration !== undefined && 
       user && (
        <WorkoutSummary
          programName={state.workout_session.program_name}
          completedSets={state.workout_completed_sets}
          duration={state.workout_duration}
          totalExercises={state.workout_session.exercises.length}
          sessionId={state.workout_session.id}
          userId={user.id}
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

      {state.screen === AppScreen.STATISTICS && user && (
        <StatisticsWithTabs
          userId={user.id}
          onBack={handleBack}
        />
      )}

      {state.screen === AppScreen.PROFILE && user && (
        <Profile
          user={user}
          settings={state.settings}
          onBack={handleBack}
          onSettingsChange={setSettings}
        />
      )}
    </div>
  );
};

export default App;
