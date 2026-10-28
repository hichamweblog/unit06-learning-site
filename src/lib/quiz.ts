import type { QuizQuestion } from '../data/normalizeContent';

export interface QuizAnswer {
  selectedOptionId: string | null;
  confirmed: boolean;
}

export interface QuizScore {
  correct: number;
  total: number;
  answered: number;
  unanswered: number;
  percent: number;
  wrongQuestionIds: string[];
}

export type AnswerMap = Record<string, QuizAnswer>;

export function calculateQuizScore(questions: readonly QuizQuestion[], answers: Readonly<AnswerMap>): QuizScore {
  let correct = 0;
  let answered = 0;
  const wrongQuestionIds: string[] = [];

  for (const question of questions) {
    const answer = answers[question.id];
    if (!answer?.confirmed || !answer.selectedOptionId) {
      wrongQuestionIds.push(question.id);
      continue;
    }
    answered += 1;
    if (answer.selectedOptionId === question.correctOptionId) correct += 1;
    else wrongQuestionIds.push(question.id);
  }

  const total = questions.length;
  return {
    correct,
    total,
    answered,
    unanswered: total - answered,
    percent: total === 0 ? 0 : Math.round((correct / total) * 100),
    wrongQuestionIds,
  };
}

export function shuffleItems<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[target]] = [shuffled[target]!, shuffled[index]!];
  }
  return shuffled;
}
