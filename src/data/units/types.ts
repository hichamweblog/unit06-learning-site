import { z } from 'zod';

/**
 * مخطط الوحدة التعليمية (Unit model)
 * -----------------------------------
 * كل وحدة في المنصة هي ملف JSON واحد يتبع هذا المخطط، ويُعرض عبر مكوّنات عامة.
 * إضافة وحدة جديدة = إضافة ملف JSON وتسجيله في `registry.ts` فقط، دون تعديل الواجهة.
 */

const arabicText = z
  .string()
  .trim()
  .min(1, 'النص مطلوب')
  .refine((value) => /[\p{Script=Arabic}]/u.test(value), 'يجب أن يتضمن النص حروفاً عربية');
const plainText = z.string().trim().min(1, 'القيمة لا يجوز أن تكون فارغة');

export const blockSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('definitions'),
    items: z
      .array(
        z.object({
          term: arabicText,
          text: arabicText,
          tone: z.enum(['navy', 'copper']).optional(),
        }),
      )
      .min(1),
  }),
  z.object({ type: z.literal('paragraph'), text: arabicText }),
  z.object({
    type: z.literal('evidence'),
    items: z
      .array(z.object({ title: arabicText, explanation: arabicText, proof: arabicText }))
      .min(1),
  }),
  z.object({
    type: z.literal('bullets'),
    title: arabicText.optional(),
    eyebrow: arabicText.optional(),
    intro: arabicText.optional(),
    style: z.enum(['plain', 'numbered']).default('plain'),
    layout: z.enum(['note', 'principles', 'wisdom']).default('note'),
    items: z.array(arabicText).min(1),
  }),
  z.object({
    type: z.literal('callout'),
    title: arabicText,
    text: arabicText,
    eyebrow: arabicText.optional(),
    icon: plainText.optional(),
  }),
  z.object({
    type: z.literal('table'),
    caption: arabicText,
    headers: z.array(arabicText).min(2),
    rows: z.array(z.array(arabicText).min(2)).min(1),
  }),
  z.object({
    type: z.literal('group'),
    eyebrow: arabicText.optional(),
    title: arabicText,
    intro: arabicText.optional(),
    table: z.object({
      caption: arabicText,
      headers: z.array(arabicText).min(2),
      rows: z.array(z.array(arabicText).min(2)).min(1),
    }),
  }),
  z.object({
    type: z.literal('check'),
    id: plainText,
    question: arabicText,
    options: z.array(arabicText).min(2),
    answerIndex: z.number().int().min(0),
    explanation: arabicText,
  }),
]);

export const sectionSchema = z.object({
  id: plainText,
  label: arabicText,
  title: arabicText,
  eyebrow: arabicText.optional(),
  blocks: z.array(blockSchema).min(1),
});

export const quizItemSchema = z.object({
  id: z.union([z.string().trim().min(1), z.number().int()]),
  question: arabicText,
  options: z.array(arabicText).min(2),
  correctAnswer: arabicText,
  hint: arabicText,
  explanation: arabicText,
  level: plainText.optional(),
  category: arabicText.optional(),
});

export const flashcardSchema = z.object({
  id: plainText,
  front: arabicText,
  back: arabicText,
  category: arabicText.optional(),
});

export const activitySchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('classify'),
    prompt: arabicText,
    group: arabicText,
    answer: arabicText,
    choices: z.array(arabicText).min(2),
    explanation: arabicText,
  }),
  z.object({
    kind: z.literal('difference'),
    prompt: arabicText,
    table: z
      .object({
        caption: arabicText,
        headers: z.array(arabicText).min(2),
        rows: z.array(z.array(arabicText).min(2)).min(1),
      })
      .optional(),
    answer: arabicText,
    choices: z.array(arabicText).min(2),
    explanation: arabicText,
  }),
]);

export const practiceSchema = z.object({
  id: plainText,
  topic: arabicText,
  prompt: arabicText,
  passage: arabicText.optional(),
  modelAnswer: z.array(arabicText).min(1),
});

export const bacArchiveSchema = z.object({
  year: plainText.optional(),
  topic: arabicText,
  question: arabicText,
  modelAnswer: arabicText,
});

export const unitSchema = z.object({
  id: plainText,
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]+$/, 'المعرّف اللاتيني يجب أن يتكون من حروف صغيرة وأرقام وشرطات'),
  number: z.number().int().positive(),
  title: arabicText,
  shortTitle: arabicText.optional(),
  subject: arabicText,
  level: arabicText,
  program: z.object({
    label: arabicText,
    year: arabicText.optional(),
    sourceUrl: z.string().url().optional(),
  }),
  summary: arabicText,
  objectives: z.array(arabicText).min(1),
  status: z.enum(['published', 'draft', 'coming-soon']).default('published'),
  provenance: z.object({
    reviewedBy: arabicText.optional(),
    reviewedAt: plainText.optional(),
    sources: z.array(arabicText).default([]),
    notes: arabicText.optional(),
  }),
  sections: z.array(sectionSchema).min(1),
  mindMap: z.object({
    root: arabicText,
    branches: z
      .array(
        z.object({
          title: arabicText,
          items: z.array(arabicText).min(1),
          sectionId: plainText.optional(),
        }),
      )
      .min(1),
  }),
  gallery: z
    .array(
      z.object({
        id: plainText,
        title: arabicText,
        badge: arabicText.optional(),
        src: plainText,
        fileName: plainText.optional(),
      }),
    )
    .default([]),
  quiz: z.array(quizItemSchema).min(1),
  flashcards: z.array(flashcardSchema).min(1),
  activities: z.object({
    classify: z.array(activitySchema).default([]),
    difference: z.array(activitySchema).default([]),
  }),
  practice: z.array(practiceSchema).default([]),
  bacArchive: z.array(bacArchiveSchema).default([]),
  /** عبارات تظهر في أزرار الانتقال بين المحاور */
  copy: z
    .object({
      learnEyebrow: arabicText.optional(),
      learnTitle: arabicText.optional(),
      learnDescription: arabicText.optional(),
    })
    .default({}),
});

export type RawUnit = z.infer<typeof unitSchema>;
export type RawBlock = z.infer<typeof blockSchema>;
export type RawSection = z.infer<typeof sectionSchema>;
export type RawQuizItem = z.infer<typeof quizItemSchema>;
export type RawActivity = z.infer<typeof activitySchema>;
export type RawPractice = z.infer<typeof practiceSchema>;
