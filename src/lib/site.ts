const env = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env ?? {};

/** إعدادات المنصة: تُستخدم في العلامة، والتنقّل، ووسوم المشاركة، وخرائط الموقع. */
export const site = {
  name: 'منهاج',
  tagline: 'العلوم الإسلامية للبكالوريا',
  description:
    'منصة مراجعة للعلوم الإسلامية في البكالوريا الجزائرية: دروس مُراجعة، خرائط ذهنية، بطاقات استرجاع، بنك أسئلة، وتدريبات بكالوريا مع تصحيح.',
  /** يُستخدم في الروابط المطلقة (canonical و Open Graph) */
  url: env.VITE_SITE_URL ?? 'https://manhaj-islam.vercel.app',
  locale: 'ar_DZ',
  twitter: '@manhaj',
  analytics: {
    /** اسم النطاق في Umami أو Plausible. اتركه فارغًا لتعطيل التحليلات. */
    domain: env.VITE_ANALYTICS_DOMAIN ?? '',
    provider: (env.VITE_ANALYTICS_PROVIDER ?? 'umami') as 'umami' | 'plausible',
  },
} as const;

export const unitPath = (slug: string, page?: string) =>
  page ? `/units/${slug}/${page}` : `/units/${slug}`;
