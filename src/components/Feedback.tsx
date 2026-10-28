import type { ReactNode } from 'react';

export function Feedback({ correct, title, children }: { correct: boolean; title: string; children?: ReactNode }) {
  return (
    <div className={`feedback ${correct ? 'feedback--correct' : 'feedback--incorrect'}`} role="status" aria-live="polite">
      <span className="feedback__icon" aria-hidden="true">{correct ? '✓' : '×'}</span>
      <div><strong>{title}</strong>{children && <div className="feedback__body">{children}</div>}</div>
    </div>
  );
}
