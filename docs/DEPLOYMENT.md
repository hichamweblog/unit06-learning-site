# البناء والنشر

## بناء محلي

```bash
npm ci
npm run validate:content
npm run lint
npm test
npm run build      # tsc -b + vite build + prerender + sitemap
npm run preview
```

`npm run build` ينتج:

- `dist/` — حزمة المتصفح + نسخة HTML ثابتة لكل مسار (`/`, `/about`, `/units/unit-06`, `/units/unit-06/learn`, ...) في الشكلين `path/index.html` و`path.html`.
- `dist/sitemap.xml` و`public/sitemap.xml`.
- `dist-ssr/` — حزمة الخادم المؤقتة (مستبعدة من git).

## متغيرات البيئة (اختيارية)

| المتغير | الغرض | الافتراضي |
|---|---|---|
| `VITE_SITE_URL` | الرابط المطلق في canonical وOG وsitemap | `https://manhaj-islam.vercel.app` |
| `VITE_ANALYTICS_DOMAIN` | نطاق Umami/Plausible | فارغ (معطّل) |
| `VITE_ANALYTICS_PROVIDER` | `umami` أو `plausible` | `umami` |

### تفعيل التحليلات

1. أنشئ حسابًا في [Umami Cloud](https://umami.is) أو [Plausible](https://plausible.io) وأضف النطاق.
2. أضف سكربت المزوّد في `<head>` داخل `index.html`:

```html
<script defer src="https://cloud.umami.is/script.js" data-website-id="XXXX"></script>
```

3. اضبط `VITE_ANALYTICS_DOMAIN` ثم أعد البناء. الأحداث المُرسلة: `pageview`، `lesson_check_answered`، `lesson_section_completed`، `quiz_started`، `quiz_finished`.

لا كوكيز ولا معرّفات شخصية، ولا تُرسل الإجابات نفسها.

## Vercel

- Build Command: `npm run build`
- Output Directory: `dist`
- `vercel.json` فيه rewrite احتياطي إلى `index.html` للمسارات غير المولّدة (Vercel يقدّم الملفات الموجودة أولًا، فتصل الصفحات الثابتة كما هي).
- أضف `VITE_SITE_URL` في Project Settings → Environment Variables عند استخدام نطاق مخصص.

## Netlify

- Build Command: `npm run build`
- Publish Directory: `dist`
- `_redirects` يحوي `/* /index.html 200` — Netlify يقدّم الملفات الثابتة الموجودة قبل الـ fallback، ما لم يُستخدم `!`.
- أضف `netlify.toml` كما هو (بناء + headers لـ `sw.js`).

## Service Worker

غيّر `CACHE_NAME` في `public/sw.js` عند أي تغيير في الغلاف أو الاستراتيجية. التنقّل: شبكة أولًا ثم الغلاف المخزّن (فتعمل مسارات الوحدة دون اتصال بعد الزيارة الأولى).

## ما بعد النشر — فحص سريع

```bash
curl -s https://<domain>/units/unit-06/learn | grep -o '<title>[^<]*'
curl -s https://<domain>/sitemap.xml | head
```

- افتح `/units/unit-06/learn` وتحقق من العنوان والوصف في «عرض المصدر» (وليس بعد تحميل JS فقط).
- اختبر المعاينة في [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) و[WhatsApp](https://www.whatsapp.com/) — يجب أن تظهر الصورة والعنوان.
- سجّل الموقع في [Google Search Console](https://search.google.com/search-console) وأرسل `sitemap.xml`.
