# إضافة وحدة جديدة

لا تحتاج إلى تعديل أي مكوّن واجهة. الخطوات أربع فقط.

## 1) أنشئ ملف الوحدة

`src/data/units/unit07.json` (أو أي رقم). الحد الأدنى:

```json
{
  "id": "UNIT_07",
  "slug": "unit-07",
  "number": 7,
  "title": "عنوان الوحدة كما في التدرج الرسمي",
  "shortTitle": "عنوان قصير للرأس",
  "subject": "العلوم الإسلامية",
  "level": "السنة الثالثة ثانوي",
  "program": { "label": "بكالوريا 2027 · العلوم الإسلامية", "sourceUrl": "https://education.gov.dz" },
  "summary": "جملة أو جملتان تصفان الوحدة (تُستخدم في SEO والبطاقة).",
  "objectives": ["هدف 1", "هدف 2", "هدف 3"],
  "status": "published",
  "provenance": {
    "reviewedBy": "اسم المراجع",
    "reviewedAt": "2026-11-17",
    "sources": ["التدرجات الرسمية ...", "الكتاب المدرسي ..."]
  },
  "sections": [ /* انظر أدناه */ ],
  "mindMap": { "root": "عنوان الوحدة", "branches": [ { "title": "فرع", "items": ["عنصر"], "sectionId": "concepts" } ] },
  "gallery": [],
  "quiz": [ /* ... */ ],
  "flashcards": [ /* ... */ ],
  "activities": { "classify": [], "difference": [] },
  "practice": [],
  "bacArchive": []
}
```

## 2) اكتب المحاور ككتل

كل محور: `{ id, label, title, eyebrow?, blocks[] }`، و**يجب** أن يحتوي على كتلة `check` واحدة على الأقل (الاختبارات تتحقق من ذلك).

أنواع الكتل:

| النوع | الحقول | الاستخدام |
|---|---|---|
| `definitions` | `items: [{ term, text, tone? }]` | تعريفان أو أكثر في بطاقات |
| `paragraph` | `text` | مقدمة/تأسيس |
| `evidence` | `items: [{ title, explanation, proof }]` | وسيلة + شرحها + دليلها |
| `bullets` | `title?`, `eyebrow?`, `style`, `layout`, `items` | `layout: note` (ملاحظة جانبية) / `principles` / `wisdom` |
| `callout` | `title`, `text`, `eyebrow?`, `icon?` | مفهوم محوري في إطار |
| `table` | `caption`, `headers`, `rows` | جدول مستقل |
| `group` | `title`, `intro?`, `table` | قسم بجدول (مثل أنواع العقوبات) |
| `check` | `id`, `question`, `options`, `answerIndex`, `explanation` | سؤال فهم داخل الدرس |

## 3) أضف الأسئلة والبطاقات والأنشطة

- `quiz[]`: `{ id, question, options[≥2], correctAnswer, hint, explanation, level?, category? }` — `correctAnswer` يجب أن يطابق خيارًا واحدًا حرفيًا. لا تكتب موضع الإجابة: التطبيع يوزّعه بالتساوي.
- `flashcards[]`: `{ id, front, back, category? }`.
- `activities.classify[]`: `{ kind: "classify", group, prompt, answer, choices, explanation }`.
- `activities.difference[]`: `{ kind: "difference", prompt, answer, choices, explanation, table? }` — ضع `table` في العنصر الأول ليُعرض كمرجع.
- `practice[]`: `{ id, topic, prompt, passage?, modelAnswer[] }`.
- `bacArchive[]`: `{ year?, topic, question, modelAnswer }`.

## 4) سجّلها

في `src/data/units/registry.ts`:

```ts
import unit07 from './unit07.json';
const unitSources: unknown[] = [unit06, unit07];
```

ثم:

```bash
npm run validate:content
npm test
npm run build
```

سيظهر المسار تلقائيًا في `/units/unit-07/...`، وفي صفحة المنصة، وفي `sitemap.xml`، وفي وسوم الصفحات والبيانات المنظمة.

## قواعد تحريرية

- لا تنسخ نص الكتاب المدرسي حرفيًا؛ أعد الصياغة.
- شكّل الأدلة الشرعية واذكر مصدرها بين قوسين.
- لا تُدرج كلمات مثل «بكالوريا/امتحان/سنة» داخل الأسئلة والبطاقات (هناك اختبار يرفضها).
- حدّث `provenance.reviewedAt` مع كل مراجعة، وأضف سطرًا في سجل المراجعة.
- الصور: ضعها في `public/images/`، واستخدم مسارًا يبدأ بـ `/`، وأضف وصفًا بديلًا عبر `title`.
