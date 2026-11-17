import { units } from '../data/units/registry';
import { site, unitPath } from './site';

export interface PageMeta {
  title: string;
  description: string;
  path: string;
  canonical: string;
  robots: string;
  type: 'website' | 'article';
  jsonLd: Record<string, unknown>[];
}

const PAGE_LABELS: Record<string, { title: string; description: (unitTitle: string) => string }> = {
  learn: {
    title: 'الدرس',
    description: (unitTitle) => `شرح ${unitTitle} في أربعة محاور مع الأدلة الشرعية والجداول وأسئلة الفهم.`,
  },
  map: {
    title: 'الخرائط الذهنية',
    description: (unitTitle) => `خرائط ذهنية مصوّرة وتفاعلية لوحدة ${unitTitle} تساعد على الاستحضار السريع.`,
  },
  activities: {
    title: 'الأنشطة والتقويم',
    description: (unitTitle) =>
      `بطاقات استرجاع، أنشطة فرز ومقارنة، بنك أسئلة، وتدريبات بكالوريا لوحدة ${unitTitle}.`,
  },
  quiz: {
    title: 'اختبر نفسك',
    description: (unitTitle) => `اختبار تقويمي على وحدة ${unitTitle} مع تصحيح فوري وتلميحات.`,
  },
  flashcards: {
    title: 'بطاقات المراجعة',
    description: (unitTitle) => `بطاقات استرجاع نشط لوحدة ${unitTitle} مع متابعة البطاقات المتقنة.`,
  },
  bac: {
    title: 'تدريبات البكالوريا',
    description: (unitTitle) => `أسئلة بكالوريا نموذجية محلولة لوحدة ${unitTitle} مع إجابات نموذجية.`,
  },
};

function courseSchema(unit: (typeof units)[number]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: unit.title,
    description: unit.summary,
    inLanguage: 'ar',
    educationalLevel: unit.level,
    provider: { '@type': 'Organization', name: site.name, url: site.url },
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'online',
      courseWorkload: 'PT3H',
    },
    about: unit.subject,
  };
}

function breadcrumbs(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${site.url}${item.path}`,
    })),
  };
}

export function getMetaForPath(pathname: string): PageMeta {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : '/';
  const canonical = (target: string) => `${site.url}${target === '/' ? '/' : target}`;
  const segments = path.split('/').filter(Boolean);

  const base = {
    canonical: canonical(path),
    path,
    robots: 'index,follow,max-image-preview:large',
    type: 'website' as const,
  };

  if (path === '/') {
    return {
      ...base,
      title: `${site.name} | ${site.tagline}`,
      description: site.description,
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: site.name,
          url: site.url,
          inLanguage: 'ar',
          description: site.description,
        },
        breadcrumbs([{ name: site.name, path: '/' }]),
      ],
    };
  }

  if (path === '/about') {
    return {
      ...base,
      title: `عن المنصة والمنهجية | ${site.name}`,
      description: 'كيف يُبنى محتوى المنصة، ومن يراجعه، وما مصادره، وكيف نتعامل مع بياناتك.',
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'AboutPage',
          name: `عن ${site.name}`,
          url: canonical('/about'),
          inLanguage: 'ar',
        },
        breadcrumbs([
          { name: site.name, path: '/' },
          { name: 'عن المنصة', path: '/about' },
        ]),
      ],
    };
  }

  if (segments[0] === 'units' && segments[1]) {
    const unit = units.find((item) => item.slug === segments[1]);
    if (unit) {
      const page = segments[2];
      const unitUrl = unitPath(unit.slug);
      if (!page) {
        return {
          ...base,
          title: `${unit.title} | ${unit.subject} · ${site.name}`,
          description: unit.summary,
          jsonLd: [
            courseSchema(unit),
            breadcrumbs([
              { name: site.name, path: '/' },
              { name: `الوحدة ${unit.number}`, path: unitUrl },
            ]),
          ],
        };
      }
      const label = PAGE_LABELS[page];
      if (label) {
        return {
          ...base,
          title: `${label.title}: ${unit.title} | ${site.name}`,
          description: label.description(unit.title),
          type: 'article',
          jsonLd: [
            courseSchema(unit),
            breadcrumbs([
              { name: site.name, path: '/' },
              { name: `الوحدة ${unit.number}`, path: unitUrl },
              { name: label.title, path: unitPath(unit.slug, page as keyof typeof PAGE_LABELS) },
            ]),
          ],
        };
      }
    }
  }

  return {
    ...base,
    title: `الصفحة غير موجودة | ${site.name}`,
    description: 'الرابط المطلوب غير موجود في المنصة.',
    robots: 'noindex,follow',
    jsonLd: [],
  };
}

/** كل المسارات القابلة للفهرسة — تُستخدم في sitemap والـ prerender */
export function indexablePaths(): string[] {
  const paths = ['/', '/about'];
  for (const unit of units.filter((item) => item.status === 'published')) {
    paths.push(unitPath(unit.slug));
    for (const page of Object.keys(PAGE_LABELS) as (keyof typeof PAGE_LABELS)[]) {
      paths.push(unitPath(unit.slug, page));
    }
  }
  return [...new Set(paths)];
}
