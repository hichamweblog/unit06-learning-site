import unit06 from './unit06.json';
import { normalizeUnit, type Unit } from './normalize';

/**
 * سجل الوحدات: أضف ملف JSON جديدًا إلى هذا المصفوفة ليظهر في المنصة تلقائيًا.
 * لا تحتاج إلى تعديل أي مكوّن واجهة.
 */
const unitSources: unknown[] = [unit06];

export const units: Unit[] = unitSources
  .map((source) => normalizeUnit(source))
  .sort((a, b) => a.number - b.number);

export const publishedUnits = units.filter((unit) => unit.status === 'published');

export const defaultUnit = publishedUnits[0] ?? units[0];

export function getUnit(slug: string | undefined): Unit | undefined {
  if (!slug) return undefined;
  return units.find((unit) => unit.slug === slug);
}

export function requireUnit(slug: string | undefined): Unit {
  const unit = getUnit(slug);
  if (!unit) throw new Error(`الوحدة غير موجودة: ${slug ?? 'بدون معرّف'}`);
  return unit;
}

/** وحدات مخطّطة تُعرض في صفحة المنصة دون محتوى بعد */
export const plannedUnits = [
  {
    number: 1,
    title: 'الوحدة الأولى',
    description: 'قيد الإعداد: الدرس والخرائط وبنك الأسئلة ومواضيع البكالوريا.',
  },
  {
    number: 2,
    title: 'الوحدة الثانية',
    description: 'قيد الإعداد: الدرس والخرائط وبنك الأسئلة ومواضيع البكالوريا.',
  },
] as const;
