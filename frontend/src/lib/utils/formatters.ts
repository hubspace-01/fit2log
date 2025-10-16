export const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${seconds} сек`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return secs > 0 ? `${mins} мин ${secs} сек` : `${mins} мин`;
};

export const formatTime = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};

export const formatWeight = (weight: number): string => {
  return weight % 1 === 0 ? weight.toString() : weight.toFixed(1);
};

export const formatDistance = (meters: number): string => {
  if (meters >= 1000) {
    const km = meters / 1000;
    return km % 1 === 0 ? `${km} км` : `${km.toFixed(1)} км`;
  }
  return `${meters} м`;
};

export const formatReps = (reps: number): string => {
  return `${reps} повт`;
};

export const formatSetDisplay = (exerciseType: 'reps' | 'time' | 'distance', data: {
  reps?: number;
  weight?: number;
  duration?: number;
  distance?: number;
}): string => {
  if (exerciseType === 'reps') {
    return `${formatReps(data.reps || 0)} • ${data.weight || 0} кг`;
  } else if (exerciseType === 'time') {
    return formatDuration(data.duration || 0);
  } else if (exerciseType === 'distance') {
    return formatDistance(data.distance || 0);
  }
  return '';
};
