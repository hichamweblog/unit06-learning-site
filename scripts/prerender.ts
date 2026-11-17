/**
 * توليد صفحات ثابتة (prerender) لكل مسار قابل للفهرسة + sitemap.xml.
 *
 * يعمل بعد `vite build`: يبني حزمة SSR مؤقتة، يرسم كل مسار عبر React،
 * ثم يحقن HTML والوسوم الوصفية في dist/. بذلك ترى محركات البحث وشبكات
 * المشاركة (فيسبوك/واتساب/تيك توك) محتوى حقيقيًا بدل صفحة فارغة.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';
import { getMetaForPath, indexablePaths } from '../src/lib/seo';
import { site } from '../src/lib/site';

const root = fileURLToPath(new URL('..', import.meta.url));
const distDir = join(root, 'dist');
const ssrDir = join(root, 'dist-ssr');
const sitemapOnly = process.argv.includes('--sitemap-only');

const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function headTags(path: string): string {
  const meta = getMetaForPath(path);
  const image = `${site.url}/images/unit06-share.jpg`;
  const structured = meta.jsonLd
    .map((item) => `<script type="application/ld+json">${JSON.stringify(item)}</script>`)
    .join('\n    ');

  return [
    `<link rel="canonical" href="${meta.canonical}" />`,
    `<meta name="robots" content="${meta.robots}" />`,
    `<meta property="og:type" content="${meta.type}" />`,
    `<meta property="og:site_name" content="${site.name}" />`,
    `<meta property="og:locale" content="${site.locale}" />`,
    `<meta property="og:title" content="${escapeHtml(meta.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(meta.description)}" />`,
    `<meta property="og:url" content="${meta.canonical}" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${escapeHtml(site.description)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(meta.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(meta.description)}" />`,
    `<meta name="twitter:image" content="${image}" />`,
    structured,
  ].join('\n    ');
}

function inject(template: string, path: string, body: string): string {
  const meta = getMetaForPath(path);
  return template
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(meta.title)}</title>`)
    .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${escapeHtml(meta.description)}" />`)
    .replace('</head>', `    ${headTags(path)}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${body}</div>`);
}

async function writeSitemap(paths: string[]) {
  const today = new Date().toISOString().slice(0, 10);
  const urls = paths
    .map((path) => {
      const meta = getMetaForPath(path);
      const priority = path === '/' ? '1.0' : path === '/about' ? '0.5' : '0.8';
      return `  <url>\n    <loc>${meta.canonical}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
    })
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  await writeFile(join(root, 'public', 'sitemap.xml'), xml);
  if (!sitemapOnly) await writeFile(join(distDir, 'sitemap.xml'), xml);
  return paths.length;
}

async function main() {
  const paths = indexablePaths();

  if (sitemapOnly) {
    const count = await writeSitemap(paths);
    console.log(`تم توليد sitemap.xml لـ ${count} مسارًا.`);
    return;
  }

  await build({
    configFile: join(root, 'vite.config.ts'),
    logLevel: 'warn',
    build: { ssr: 'src/entry-server.tsx', outDir: 'dist-ssr', emptyOutDir: true },
  });

  const { render } = (await import(join(ssrDir, 'entry-server.js'))) as { render: (url: string) => string };
  const template = await readFile(join(distDir, 'index.html'), 'utf8');

  let written = 0;
  for (const path of paths) {
    const html = inject(template, path, render(path));
    const relative = path === '/' ? '' : path.replace(/^\//, '');
    const targets = path === '/'
      ? [join(distDir, 'index.html')]
      : [join(distDir, `${relative}.html`), join(distDir, relative, 'index.html')];
    for (const target of targets) {
      await mkdir(dirname(target), { recursive: true });
      await writeFile(target, html);
    }
    written += 1;
  }

  const count = await writeSitemap(paths);
  console.log(`prerender: ${written} صفحة ثابتة · sitemap: ${count} مسارًا.`);
}

main().catch((error) => {
  console.error('فشل الـ prerender:', error);
  process.exit(1);
});
