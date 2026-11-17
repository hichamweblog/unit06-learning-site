import { type ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { getUnit } from '../data/units/registry';
import { NotFoundPage } from '../features/NotFoundPage';
import { UnitContext } from './unitContext';

/** يقرأ معرّف الوحدة من المسار (`/units/:slug/...`) ويوفّر محتواها لكل الصفحات. */
export function UnitProvider({ children }: { children: ReactNode }) {
  const { slug } = useParams<{ slug: string }>();
  const unit = getUnit(slug);
  if (!unit) return <NotFoundPage />;
  return <UnitContext.Provider value={unit}>{children}</UnitContext.Provider>;
}
