import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { clearProgress, defaultProgress, readProgress, writeProgress, type ProgressReadResult, type UserProgressV1 } from '../lib/progressStorage';
import { ProgressContext } from './progressContext';

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<ProgressReadResult>(() => readProgress());
  const snapshotRef = useRef(snapshot);

  const updateProgress = useCallback((patch: Partial<Omit<UserProgressV1, 'schemaVersion' | 'updatedAt'>>) => {
    const current = snapshotRef.current.progress;
    const next: UserProgressV1 = {
      ...current,
      ...patch,
      schemaVersion: 1,
      completedSections: [...new Set(patch.completedSections ?? current.completedSections)],
      masteredFlashcardIds: [...new Set(patch.masteredFlashcardIds ?? current.masteredFlashcardIds)],
      reviewFlashcardIds: [...new Set(patch.reviewFlashcardIds ?? current.reviewFlashcardIds)],
      updatedAt: new Date().toISOString(),
    };
    const result = writeProgress(next);
    const nextSnapshot: ProgressReadResult = { progress: next, warning: result.warning };
    snapshotRef.current = nextSnapshot;
    setSnapshot(nextSnapshot);
  }, []);

  const markSectionComplete = useCallback((sectionId: string) => {
    const current = snapshotRef.current.progress.completedSections;
    if (!current.includes(sectionId)) updateProgress({ completedSections: [...current, sectionId] });
  }, [updateProgress]);

  const recordQuizScore = useCallback((score: number) => {
    const previousBest = snapshotRef.current.progress.bestQuizScore ?? 0;
    updateProgress({ latestQuizScore: score, bestQuizScore: Math.max(previousBest, score) });
  }, [updateProgress]);

  const markFlashcard = useCallback((cardId: string, state: 'mastered' | 'review') => {
    const current = snapshotRef.current.progress;
    const mastered = new Set(current.masteredFlashcardIds);
    const review = new Set(current.reviewFlashcardIds);
    if (state === 'mastered') {
      mastered.add(cardId);
      review.delete(cardId);
    } else {
      review.add(cardId);
      mastered.delete(cardId);
    }
    updateProgress({ masteredFlashcardIds: [...mastered], reviewFlashcardIds: [...review] });
  }, [updateProgress]);

  const resetProgress = useCallback(() => {
    const clean = defaultProgress();
    const result = clearProgress();
    const nextSnapshot: ProgressReadResult = { progress: clean, warning: result.warning };
    snapshotRef.current = nextSnapshot;
    setSnapshot(nextSnapshot);
  }, []);

  const value = useMemo(() => ({
    progress: snapshot.progress,
    warning: snapshot.warning,
    updateProgress,
    markSectionComplete,
    recordQuizScore,
    markFlashcard,
    resetProgress,
  }), [snapshot, updateProgress, markSectionComplete, recordQuizScore, markFlashcard, resetProgress]);

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}
