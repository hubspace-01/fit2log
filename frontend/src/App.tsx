import React, { useEffect, useCallback } from 'react';
import { Spinner } from '@telegram-apps/telegram-ui';
import { useAuth, useAppState, usePrograms } from './hooks';
import { ProgramSelector, TemplateList, ProgramEditor } from './components';
import { AppScreen } from './types';
import type { Program, ProgramTemplate } from './types';

const App: React.FC = () => {
  const { user, loading: authLoading, error: authError } = useAuth();
  const { state, setScreen, setPrograms, setCurrentProgram, setLoading, setError, clearError } = useAppState();
  const { programs, templates, loading: programsLoading, loadPrograms, loadTemplates, createProgram, copyTemplate } = usePrograms();

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
    alert(`Программа "${program.program_name}" выбрана!\n${program.exercises?.length || 0} упражнений`);
  }, [setCurrentProgram]);

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
      
      setScreen(AppScreen.PROGRAM_SELECTOR);
    } catch (error) {
      console.error('Save error:', error);
      setError('Ошибка при сохранении программы');
    } finally {
      setLoading(false);
    }
  }, [user, createProgram, setLoading, clearError, setError, setScreen]);

  const handleTemplateSelect = useCallback(async (template: ProgramTemplate) => {
    if (!user) return;

    try {
      setLoading(true);
      clearError();
      await copyTemplate(template.id, user.id);
      setScreen(AppScreen.PROGRAM_SELECTOR);
    } catch (error) {
      console.error('Copy template error:', error);
      setError('Ошибка при копировании шаблона');
    } finally {
      setLoading(false);
    }
  }, [user, copyTemplate, setLoading, clearError, setError, setScreen]);

  const handleBack = useCallback(() => {
    setScreen(AppScreen.PROGRAM_SELECTOR);
  }, [setScreen]);

  if (authLoading || state.screen === AppScreen.LOADING) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: 'var(--tg-theme-bg-color)'
      }}>
        <Spinner size="l" />
      </div>
    );
  }

  if (authError) {
    return (
      <div style={{ padding: '16px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>😕</div>
        <h2>Ошибка авторизации</h2>
        <p style={{ color: 'var(--tg-theme-hint-color)' }}>{authError}</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--tg-theme-bg-color)' }}>
      {state.screen === AppScreen.PROGRAM_SELECTOR && (
        <ProgramSelector
          programs={programs}
          userName={user?.first_name || 'Друг'}
          onCreateProgram={handleCreateProgram}
          onSelectTemplate={handleSelectTemplate}
          onSelectProgram={handleSelectProgram}
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
    </div>
  );
};

export default App;
