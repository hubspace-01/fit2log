import React, { useState, useEffect } from 'react';
import { Button, Title, Text } from '@telegram-apps/telegram-ui';
import { Edit2 } from 'lucide-react';
import { telegramService } from '../lib/telegram';
import { Stepper } from './Stepper';
import { TimeInput } from './TimeInput';
import type { EditSetData, WorkoutLogUpdate } from '../types';

interface EditSetModalProps {
  isOpen: boolean;
  setData: EditSetData | null;
  onSave: (updatedData: EditSetData & WorkoutLogUpdate) => void;
  onClose: () => void;
}

export const EditSetModal: React.FC<EditSetModalProps> = ({
  isOpen,
  setData,
  onSave,
  onClose
}) => {
  const [reps, setReps] = useState(0);
  const [weight, setWeight] = useState(0);
  const [duration, setDuration] = useState(0);
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    if (isOpen && setData) {
      telegramService.hapticFeedback('impact', 'light');
      setReps(setData.reps || 0);
      setWeight(setData.weight || 0);
      setDuration(setData.duration || 0);
      setDistance(setData.distance || 0);
    }
  }, [isOpen, setData]);

  if (!isOpen || !setData) return null;

  const handleSave = () => {
    telegramService.hapticFeedback('impact', 'medium');
    
    const updatedData: EditSetData & WorkoutLogUpdate = {
      id: setData.id,
      exercise_type: setData.exercise_type,
      set_no: setData.set_no,
      reps: 0,
      weight: 0,
      duration: 0,
      distance: 0
    };

    if (setData.exercise_type === 'reps') {
      updatedData.reps = reps;
      updatedData.weight = weight;
    } else if (setData.exercise_type === 'time') {
      updatedData.duration = duration;
    } else if (setData.exercise_type === 'distance') {
      updatedData.distance = distance;
    }

    onSave(updatedData);
  };

  const handleClose = () => {
    telegramService.hapticFeedback('impact', 'light');
    onClose();
  };

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 999,
          animation: 'fadeIn 0.2s ease-out'
        }}
        onClick={handleClose}
      />
      
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'var(--tg-theme-bg-color)',
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px',
          maxHeight: '70vh',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1000,
          animation: 'slideUp 0.3s ease-out'
        }}
      >
        <div style={{
          padding: '40px 24px 24px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: 'rgba(33, 150, 243, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px'
          }}>
            <Edit2 size={40} color="rgb(33, 150, 243)" strokeWidth={2} />
          </div>

          <Title level="1" weight="2" style={{ fontSize: '20px', marginBottom: '12px' }}>
            Редактировать подход {setData.set_no}
          </Title>
          
          <Text style={{ 
            fontSize: '14px', 
            color: 'var(--tg-theme-hint-color)',
            display: 'block',
            lineHeight: '1.5',
            marginBottom: '24px'
          }}>
            Исправьте данные выполненного подхода
          </Text>

          <div style={{ textAlign: 'left' }}>
            {setData.exercise_type === 'reps' && (
              <>
                <Stepper
                  label="Повторения"
                  value={reps}
                  onChange={setReps}
                  min={1}
                  max={50}
                  step={1}
                />
                <Stepper
                  label="Вес (кг)"
                  value={weight}
                  onChange={setWeight}
                  min={0}
                  max={500}
                  step={2.5}
                  suffix=" кг"
                />
              </>
            )}

            {setData.exercise_type === 'time' && (
              <TimeInput
                label="Время"
                value={duration}
                onChange={setDuration}
                min={5}
                max={3600}
              />
            )}

            {setData.exercise_type === 'distance' && (
              <Stepper
                label="Расстояние"
                value={distance}
                onChange={setDistance}
                min={100}
                max={50000}
                step={100}
                suffix=" м"
              />
            )}
          </div>
        </div>

        <div style={{
          padding: '0 24px',
          paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <Button
            size="l"
            stretched
            mode="filled"
            onClick={handleSave}
            style={{ fontSize: '16px' }}
          >
            Сохранить
          </Button>

          <Button
            size="l"
            stretched
            mode="outline"
            onClick={handleClose}
            style={{ fontSize: '16px' }}
          >
            Отмена
          </Button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </>
  );
};
