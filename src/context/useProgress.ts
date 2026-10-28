import { useContext } from 'react';
import { ProgressContext } from './progressContext';

export function useProgress() {
  const value = useContext(ProgressContext);
  if (!value) throw new Error('useProgress يجب أن يستخدم داخل ProgressProvider');
  return value;
}
