import { rawContentSchema, type RawUnitContent } from './contentSchema';
import { reviewedPenaltyDefinition, reviewFlashcard, reviewPenaltyDetail, reviewQuizItem } from './reviewedContent';

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
  bloomLevel?: string;
  category?: string;
}

export interface Flashcard {
  cardId: string;
  front: string;
  back: string;
  category?: string;
}

export interface UnitContent {
  metadata: RawUnitContent['unit_metadata'];
  fullUnitText: RawUnitContent['full_unit_text'];
  mindMap: RawUnitContent['mind_map'];
  quiz: QuizQuestion[];
  flashcards: Flashcard[];
  bac: RawUnitContent['bac_and_predicted_questions'];
}

export class ContentValidationError extends Error {
  readonly issues: string[];

  constructor(issues: string[]) {
    super(`فشل التحقق من محتوى الوحدة: ${issues.join('؛ ')}`);
    this.name = 'ContentValidationError';
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

export function normalizeContent(input: unknown): UnitContent {
  const parsed = rawContentSchema.safeParse(input);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => `${issue.path.join('.') || 'root'}: ${issue.message}`);
    throw new ContentValidationError(issues);
  }

  const raw: RawUnitContent = parsed.data;
  const issues: string[] = [];
  const questionIds = raw.quiz.map((question) => String(question.id));
  const cardIds = raw.flashcards.map((card) => card.card_id);

  for (const id of duplicates(questionIds)) issues.push(`معرّف سؤال مكرر: ${id}`);
  for (const id of duplicates(cardIds)) issues.push(`معرّف بطاقة مكرر: ${id}`);

  const quiz: QuizQuestion[] = raw.quiz.map((sourceQuestion) => {
    const question = reviewQuizItem(sourceQuestion);
    const id = String(question.id);
    const questionPrefix = `السؤال ${id}`;
    const optionTexts = question.options;
    const repeatedOptions = duplicates(optionTexts);
    if (repeatedOptions.length > 0) issues.push(`${questionPrefix}: خيار مكرر (${repeatedOptions.join('، ')})`);
    const matches = optionTexts
      .map((text, index) => ({ text, index }))
      .filter(({ text }) => text === question.correct_answer);
    if (matches.length !== 1) {
      issues.push(`${questionPrefix}: الإجابة الصحيحة تطابق ${matches.length} من الخيارات؛ المطلوب تطابق واحد بالضبط`);
    }
    const originalOptions = optionTexts.map((text, index) => ({
      id: `q${id}-option-${String.fromCharCode(97 + index)}`,
      text,
    }));
    const matchingIndex = matches[0]?.index ?? -1;
    const numericId = Number(id);
    const fallbackSeed = [...id].reduce((sum, character) => sum + character.charCodeAt(0), 0);
    const seed = Number.isSafeInteger(numericId) ? numericId : fallbackSeed;
    const desiredPosition = ((seed - 1) % originalOptions.length + originalOptions.length) % originalOptions.length;
    const rotation = ((matchingIndex - desiredPosition) % originalOptions.length + originalOptions.length) % originalOptions.length;
    const options = [...originalOptions.slice(rotation), ...originalOptions.slice(0, rotation)];
    const bloomLevel = question.bloom_level;
    const category = question.category;
    return {
      id,
      question: question.question,
      options,
      correctOptionId: matchingIndex >= 0 ? originalOptions[matchingIndex]?.id ?? '' : '',
      correctAnswerText: question.correct_answer,
      hint: question.hint,
      explanation: question.explanation,
      ...(bloomLevel ? { bloomLevel } : {}),
      ...(category ? { category } : {}),
    };
  });

  if (issues.length > 0) throw new ContentValidationError(issues);

  const flashcards: Flashcard[] = raw.flashcards.map((sourceCard) => {
    const card = reviewFlashcard(sourceCard);
    return {
      cardId: card.card_id,
      front: card.front,
      back: card.back,
      ...(card.category ? { category: card.category } : {}),
    };
  });

  const sourcePenalties = raw.full_unit_text.section_3_curative_method_penalties;
  const fullUnitText: RawUnitContent['full_unit_text'] = {
    ...raw.full_unit_text,
    section_3_curative_method_penalties: {
      ...sourcePenalties,
      definition_penalty: reviewedPenaltyDefinition,
      types_of_penalties: sourcePenalties.types_of_penalties.map((group) => ({
        ...group,
        crimes_and_details: group.crimes_and_details.map(reviewPenaltyDetail),
      })),
    },
  };

  const comparison = raw.bac_and_predicted_questions.predicted_practice_tables.comparison_table_penalties;
  if (comparison.rows.some((row) => row.length !== comparison.headers.length)) {
    throw new ContentValidationError(['جدول المقارنة: عدد خلايا الصف لا يطابق عدد العناوين']);
  }

  return {
    metadata: raw.unit_metadata,
    fullUnitText,
    mindMap: raw.mind_map,
    quiz,
    flashcards,
    bac: raw.bac_and_predicted_questions,
  };
}
