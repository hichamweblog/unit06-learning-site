import { unitSchema, type RawUnit, type RawBlock, type RawActivity } from './types';

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  correctOptionId: string;
  correctAnswerText: string;
  hint: string;
  explanation: string;
  level?: string;
  category?: string;
}

export interface Flashcard {
  cardId: string;
  front: string;
  back: string;
  category?: string;
}

/** نموذج الوحدة الجاهز للعرض: المحتوى نفسه مع خيارات أسئلة مُطبَّعة (معرّفات + مواضع موزّعة) */
export interface Unit extends Omit<RawUnit, 'quiz' | 'flashcards' | 'activities'> {
  quiz: QuizQuestion[];
  flashcards: Flashcard[];
  activities: {
    classify: Extract<RawActivity, { kind: 'classify' }>[];
    difference: Extract<RawActivity, { kind: 'difference' }>[];
  };
  /** عدد المحاور المكتملة يُحسب مقابل هذه المعرّفات */
  sectionIds: string[];
}

export class UnitValidationError extends Error {
  readonly issues: string[];

  constructor(slug: string, issues: string[]) {
    super(`فشل التحقق من وحدة «${slug}»: ${issues.join('؛ ')}`);
    this.name = 'UnitValidationError';
    this.issues = issues;
  }
}

function duplicates(values: string[]): string[] {
  const seen = new Set<string>();
  const repeated = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) repeated.add(value);
    seen.add(value);
  }
  return [...repeated];
}

function optionId(slug: string, questionId: string, index: number): string {
  return `${slug}-q${questionId}-option-${String.fromCharCode(97 + index)}`;
}

function validateBlocks(sectionId: string, blocks: RawBlock[], issues: string[]) {
  for (const block of blocks) {
    if (block.type === 'check' && block.answerIndex >= block.options.length) {
      issues.push(`${sectionId}: خيار الإجابة الصحيحة في «${block.id}» خارج نطاق الخيارات`);
    }
    if (block.type === 'table' && block.rows.some((row) => row.length !== block.headers.length)) {
      issues.push(`${sectionId}: عدد خلايا صف في جدول «${block.caption}» لا يطابق عدد العناوين`);
    }
    if (block.type === 'group' && block.table.rows.some((row) => row.length !== block.table.headers.length)) {
      issues.push(`${sectionId}: عدد خلايا صف في جدول «${block.table.caption}» لا يطابق عدد العناوين`);
    }
  }
}

/**
 * يتحقق من محتوى الوحدة ويحوّله إلى نموذج العرض.
 * لا يعدّل المصدر: كل التصحيحات يجب أن تكون داخل ملف الوحدة نفسه.
 */
export function normalizeUnit(input: unknown): Unit {
  const parsed = unitSchema.safeParse(input);
  if (!parsed.success) {
    const slug = (input as { slug?: string } | null)?.slug ?? 'unknown';
    throw new UnitValidationError(
      slug,
      parsed.error.issues.map((issue) => `${issue.path.join('.') || 'root'}: ${issue.message}`),
    );
  }

  const raw = parsed.data;
  const issues: string[] = [];
  const sectionIds = raw.sections.map((section) => section.id);

  for (const id of duplicates(sectionIds)) issues.push(`معرّف محور مكرر: ${id}`);
  for (const id of duplicates(raw.quiz.map((item) => String(item.id)))) issues.push(`معرّف سؤال مكرر: ${id}`);
  for (const id of duplicates(raw.flashcards.map((card) => card.id))) issues.push(`معرّف بطاقة مكرر: ${id}`);
  if (!raw.slug.startsWith('unit-')) issues.push(`المعرّف اللاتيني يجب أن يبدأ بـ unit- (${raw.slug})`);

  for (const section of raw.sections) validateBlocks(section.id, section.blocks, issues);

  for (const branch of raw.mindMap.branches) {
    if (branch.sectionId && !sectionIds.includes(branch.sectionId)) {
      issues.push(`الخريطة الذهنية: الفرع «${branch.title}» يشير إلى محور غير موجود (${branch.sectionId})`);
    }
  }

  const checkIds = raw.sections.flatMap((section) =>
    section.blocks.filter((block) => block.type === 'check').map((block) => block.id),
  );
  for (const id of duplicates(checkIds)) issues.push(`معرّف سؤال فهم مكرر: ${id}`);

  const quiz: QuizQuestion[] = raw.quiz.map((item) => {
    const id = String(item.id);
    const repeatedOptions = duplicates(item.options);
    if (repeatedOptions.length > 0) issues.push(`السؤال ${id}: خيار مكرر (${repeatedOptions.join('، ')})`);

    const matches = item.options
      .map((text, index) => ({ text, index }))
      .filter(({ text }) => text === item.correctAnswer);
    if (matches.length !== 1) {
      issues.push(`السؤال ${id}: الإجابة الصحيحة تطابق ${matches.length} من الخيارات؛ المطلوب تطابق واحد بالضبط`);
    }

    const originalOptions = item.options.map((text, index) => ({ id: optionId(raw.slug, id, index), text }));
    const matchingIndex = matches[0]?.index ?? -1;
    const numericId = Number(id);
    const fallbackSeed = [...id].reduce((sum, character) => sum + character.charCodeAt(0), 0);
    const seed = Number.isSafeInteger(numericId) ? numericId : fallbackSeed;
    const length = originalOptions.length;
    const desiredPosition = (((seed - 1) % length) + length) % length;
    const rotation = (((matchingIndex - desiredPosition) % length) + length) % length;
    const options = [...originalOptions.slice(rotation), ...originalOptions.slice(0, rotation)];

    return {
      id,
      question: item.question,
      options,
      correctOptionId: matchingIndex >= 0 ? originalOptions[matchingIndex]?.id ?? '' : '',
      correctAnswerText: item.correctAnswer,
      hint: item.hint,
      explanation: item.explanation,
      ...(item.level ? { level: item.level } : {}),
      ...(item.category ? { category: item.category } : {}),
    };
  });

  if (issues.length > 0) throw new UnitValidationError(raw.slug, issues);

  return {
    ...raw,
    sectionIds,
    activities: {
      classify: raw.activities.classify.filter(
        (item): item is Extract<RawActivity, { kind: 'classify' }> => item.kind === 'classify',
      ),
      difference: raw.activities.difference.filter(
        (item): item is Extract<RawActivity, { kind: 'difference' }> => item.kind === 'difference',
      ),
    },
    quiz,
    flashcards: raw.flashcards.map((card) => ({
      // معرّف مسبوق بالوحدة حتى لا تتداخل بطاقات الوحدات في سجل التقدم
      cardId: `${raw.slug}:${card.id}`,
      front: card.front,
      back: card.back,
      ...(card.category ? { category: card.category } : {}),
    })),
  };
}
