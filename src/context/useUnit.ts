import { useContext } from 'react';
import { UnitContext } from './unitContext';
import type { Unit } from '../data/units/normalize';

export function useUnit(): Unit {
  const unit = useContext(UnitContext);
  if (!unit) throw new Error('useUnit يجب أن يُستخدم داخل UnitProvider');
  return unit;
}

/** مفاتيح التقدّم معزولة لكل وحدة حتى لا تتداخل إنجازات الوحدات */
export const sectionKey = (unit: Unit, id: string) => `${unit.slug}:${id}`;
export const activityKey = (unit: Unit, id: string) => `${unit.slug}:activity:${id}`;
export const storageKey = (unit: Unit, name: string) => `${unit.slug}_${name}`;
