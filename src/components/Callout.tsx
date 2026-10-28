import type { ReactNode } from 'react';

export function Callout({ title, children, tone = 'info' }: { title: string; children: ReactNode; tone?: 'info' | 'warning' | 'success' }) {
  return (
    <aside className={`callout callout--${tone}`}>
      <span className="callout__mark" aria-hidden="true">{tone === 'warning' ? '!' : tone === 'success' ? '✓' : 'i'}</span>
      <div><h2>{title}</h2><div>{children}</div></div>
    </aside>
  );
}
