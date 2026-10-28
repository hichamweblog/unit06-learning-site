import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { ProgressProvider } from '../../src/context/ProgressProvider';
import { useProgress } from '../../src/context/useProgress';
import { PROGRESS_STORAGE_KEY } from '../../src/lib/progressStorage';

function Harness() {
  const { progress, markSectionComplete, markFlashcard, resetProgress } = useProgress();
  const [mountKey, setMountKey] = useState(0);
  return <div key={mountKey}>
    <p>المحاور: {progress.completedSections.join(',') || 'فارغة'}</p>
    <p>البطاقات: {progress.masteredFlashcardIds.join(',') || 'فارغة'}</p>
    <button type="button" onClick={() => markSectionComplete('concepts')}>أكمل المحور</button>
    <button type="button" onClick={() => markFlashcard('FC_U6_01', 'mastered')}>أتقن بطاقة</button>
    <button type="button" onClick={() => resetProgress()}>امسح</button>
    <button type="button" onClick={() => setMountKey((value) => value + 1)}>أعد عرض المستهلك</button>
  </div>;
}

beforeEach(() => localStorage.clear());

describe('ProgressProvider', () => {
  it('يحفظ الإكمال والبطاقة محليًا ويستعيدهما بعد إعادة تركيب المستهلك', () => {
    render(<MemoryRouter><ProgressProvider><Harness /></ProgressProvider></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: 'أكمل المحور' }));
    fireEvent.click(screen.getByRole('button', { name: 'أتقن بطاقة' }));
    expect(screen.getByText('المحاور: concepts')).toBeInTheDocument();
    expect(screen.getByText('البطاقات: FC_U6_01')).toBeInTheDocument();
    expect(localStorage.getItem(PROGRESS_STORAGE_KEY)).toContain('FC_U6_01');
  });

  it('يعيد حالة التقدم إلى البداية عند المسح', () => {
    render(<MemoryRouter><ProgressProvider><Harness /></ProgressProvider></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: 'أكمل المحور' }));
    fireEvent.click(screen.getByRole('button', { name: 'امسح' }));
    expect(screen.getByText('المحاور: فارغة')).toBeInTheDocument();
    expect(localStorage.getItem(PROGRESS_STORAGE_KEY)).toBeNull();
  });
});
