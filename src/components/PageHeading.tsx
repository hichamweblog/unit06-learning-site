import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface PageHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function PageHeading({ eyebrow, title, description, action }: PageHeadingProps) {
  return (
    <header className="page-heading">
      <div>
        <nav className="breadcrumbs" aria-label="مسار التنقل">
          <ol><li><Link to="/">الرئيسية</Link></li><li className="breadcrumbs__separator" aria-hidden="true">/</li><li aria-current="page">{title}</li></ol>
        </nav>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p className="page-heading__description">{description}</p>}
      </div>
      {action && <div className="page-heading__action">{action}</div>}
    </header>
  );
}
