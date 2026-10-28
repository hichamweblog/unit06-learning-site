import { beforeEach, describe, expect, it } from 'vitest';
import { clearProgress, defaultProgress, PROGRESS_STORAGE_KEY, readProgress, writeProgress, type StorageLike } from '../../src/lib/progressStorage';

class MemoryStorage implements StorageLike {
  private readonly values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
  removeItem(key: string) { this.values.delete(key); }
}

class FailingStorage implements StorageLike {
  getItem(): string { throw new Error('blocked'); }
  setItem(): void { throw new Error('quota'); }
  removeItem(): void { throw new Error('blocked'); }
}

let storage: MemoryStorage;
beforeEach(() => { storage = new MemoryStorage(); });

describe('حفظ التقدم محليًا', () => {
  it('يحفظ ويسترجع التقدم ضمن الإصدار الأول', () => {
    const value = { ...defaultProgress(new Date('2026-10-28T10:00:00.000Z')), completedSections: ['concepts'], latestQuizScore: 75, bestQuizScore: 80 };
    expect(writeProgress(value, storage).ok).toBe(true);
    expect(storage.getItem(PROGRESS_STORAGE_KEY)).not.toBeNull();
    expect(readProgress(storage).progress).toEqual(value);
  });

  it('يتجاهل JSON تالفًا ويبدأ بحالة نظيفة ويحاول حذف المفتاح', () => {
    storage.setItem(PROGRESS_STORAGE_KEY, '{bad json');
    const result = readProgress(storage);
    expect(result.warning).toBe('corrupt');
    expect(storage.getItem(PROGRESS_STORAGE_KEY)).toBeNull();
  });

  it('يتعامل بأمان مع بنية تالفة أو إصدار قديم', () => {
    storage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify({ schemaVersion: 0, completedSections: ['concepts'] }));
    const result = readProgress(storage);
    expect(result.warning).toBe('corrupt');
    expect(result.progress.completedSections).toEqual([]);
    expect(storage.getItem(PROGRESS_STORAGE_KEY)).toBeNull();
  });

  it('يزيل المعرفات المكررة عند الاستعادة', () => {
    const value = { ...defaultProgress(), completedSections: ['learn', 'learn'], masteredFlashcardIds: ['FC_1', 'FC_1'], reviewFlashcardIds: [] };
    storage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(value));
    expect(readProgress(storage).progress.completedSections).toEqual(['learn']);
    expect(readProgress(storage).progress.masteredFlashcardIds).toEqual(['FC_1']);
  });

  it('لا يعطل التطبيق عند تعطل واجهة التخزين', () => {
    expect(readProgress(new FailingStorage()).warning).toBe('unavailable');
    expect(writeProgress(defaultProgress(), new FailingStorage())).toEqual({ ok: false, warning: 'write-failed' });
    expect(clearProgress(new FailingStorage()).warning).toBe('write-failed');
    expect(readProgress(null).warning).toBe('unavailable');
  });

  it('يمسح الحالة عند إعادة الضبط', () => {
    storage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(defaultProgress()));
    expect(clearProgress(storage)).toEqual({ ok: true, warning: null });
    expect(readProgress(storage).progress.completedSections).toEqual([]);
  });
});
