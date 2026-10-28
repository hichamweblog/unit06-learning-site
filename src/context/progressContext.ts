import { createContext } from 'react';
import type { ProgressReadResult, UserProgressV1 } from '../lib/progressStorage';

export interface ProgressContextValue {
  progress: UserProgressV1;
  warning: ProgressReadResult['warning'];
  updateProgress: (patch: Partial<Omit<UserProgressV1, 'schemaVersion' | 'updatedAt'>>) => void;
  markSectionComplete: (sectionId: string) => void;
  recordQuizScore: (score: number) => void;
  markFlashcard: (cardId: string, state: 'mastered' | 'review') => void;
  resetProgress: () => void;
}

export const ProgressContext = createContext<ProgressContextValue | null>(null);
