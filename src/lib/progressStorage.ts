import { z } from 'zod';

export const PROGRESS_STORAGE_KEY = 'unit06-learning-progress-v1';

export const progressSchema = z.object({
  schemaVersion: z.literal(1),
  completedSections: z.array(z.string().min(1)),
  lastRoute: z.string().max(200).optional(),
  bestQuizScore: z.number().finite().min(0).max(100).optional(),
  latestQuizScore: z.number().finite().min(0).max(100).optional(),
  masteredFlashcardIds: z.array(z.string().min(1)),
  reviewFlashcardIds: z.array(z.string().min(1)),
  updatedAt: z.string().min(1),
});

export type UserProgressV1 = z.infer<typeof progressSchema>;

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export type ProgressWarning = 'corrupt' | 'unavailable' | 'write-failed' | null;

export interface ProgressReadResult {
  progress: UserProgressV1;
  warning: ProgressWarning;
}

function localStorageOrNull(): StorageLike | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}

export function defaultProgress(now: Date = new Date()): UserProgressV1 {
  return {
    schemaVersion: 1,
    completedSections: [],
    masteredFlashcardIds: [],
    reviewFlashcardIds: [],
    updatedAt: now.toISOString(),
  };
}

export function readProgress(storage: StorageLike | null = localStorageOrNull()): ProgressReadResult {
  const empty = defaultProgress();
  if (!storage) return { progress: empty, warning: 'unavailable' };

  let stored: string | null;
  try {
    stored = storage.getItem(PROGRESS_STORAGE_KEY);
  } catch {
    return { progress: empty, warning: 'unavailable' };
  }
  if (stored === null) return { progress: empty, warning: null };

  let decoded: unknown;
  try {
    decoded = JSON.parse(stored) as unknown;
  } catch {
    try { storage.removeItem(PROGRESS_STORAGE_KEY); } catch { /* ignored: state still starts clean */ }
    return { progress: empty, warning: 'corrupt' };
  }
  const parsed = progressSchema.safeParse(decoded);
  if (!parsed.success) {
    try { storage.removeItem(PROGRESS_STORAGE_KEY); } catch { /* ignored: state still starts clean */ }
    return { progress: empty, warning: 'corrupt' };
  }
  const value = parsed.data;
  return {
    progress: {
      ...value,
      completedSections: [...new Set(value.completedSections)],
      masteredFlashcardIds: [...new Set(value.masteredFlashcardIds)],
      reviewFlashcardIds: [...new Set(value.reviewFlashcardIds)],
    },
    warning: null,
  };
}

export function writeProgress(progress: UserProgressV1, storage: StorageLike | null = localStorageOrNull()): { ok: boolean; warning: ProgressWarning } {
  if (!storage) return { ok: false, warning: 'unavailable' };
  const parsed = progressSchema.safeParse(progress);
  if (!parsed.success) return { ok: false, warning: 'write-failed' };
  try {
    storage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(parsed.data));
    return { ok: true, warning: null };
  } catch {
    return { ok: false, warning: 'write-failed' };
  }
}

export function clearProgress(storage: StorageLike | null = localStorageOrNull()): { ok: boolean; warning: ProgressWarning } {
  if (!storage) return { ok: false, warning: 'unavailable' };
  try {
    storage.removeItem(PROGRESS_STORAGE_KEY);
    return { ok: true, warning: null };
  } catch {
    return { ok: false, warning: 'write-failed' };
  }
}
