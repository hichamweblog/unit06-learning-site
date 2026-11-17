import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getMetaForPath } from '../lib/seo';
import { site } from '../lib/site';
import { trackPageView } from '../lib/analytics';

function upsertMeta(attribute: 'name' | 'property', key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function upsertCanonical(href: string) {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }
  link.href = href;
}

/**
 * يحدّث وسوم الصفحة (العنوان، الوصف، canonical، Open Graph، البيانات المنظمة)
 * عند كل تنقّل داخل التطبيق. أثناء البناء، يكتب سكربت الـ prerender نفس الوسوم
 * مباشرة في ملفات HTML حتى تراها محركات البحث وشبكات المشاركة.
 */
export function SeoManager() {
  const { pathname } = useLocation();

  useEffect(() => {
    const meta = getMetaForPath(pathname);
    const image = `${site.url}/images/unit06-share.jpg`;

    document.title = meta.title;
    upsertMeta('name', 'description', meta.description);
    upsertMeta('name', 'robots', meta.robots);
    upsertMeta('property', 'og:title', meta.title);
    upsertMeta('property', 'og:description', meta.description);
    upsertMeta('property', 'og:url', meta.canonical);
    upsertMeta('property', 'og:type', meta.type);
    upsertMeta('property', 'og:image', image);
    upsertMeta('property', 'og:site_name', site.name);
    upsertMeta('property', 'og:locale', site.locale);
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', meta.title);
    upsertMeta('name', 'twitter:description', meta.description);
    upsertMeta('name', 'twitter:image', image);
    upsertCanonical(meta.canonical);

    const previous = document.getElementById('page-structured-data');
    previous?.remove();
    if (meta.jsonLd.length > 0) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = 'page-structured-data';
      script.textContent = JSON.stringify(meta.jsonLd);
      document.head.appendChild(script);
    }

    trackPageView(pathname);
  }, [pathname]);

  return null;
}
