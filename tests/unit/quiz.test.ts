import { describe, expect, it } from 'vitest';
import { unitContent } from '../../src/data';
import { calculateQuizScore, shuffleItems, type AnswerMap } from '../../src/lib/quiz';

describe('منطق تصحيح الاختبار', () => {
  it('يحسب الدرجة من كامل البنك ويعد غير المجاب خطأ لا إجابة صحيحة', () => {
    const [first, second, third] = unitContent.quiz;
    if (!first || !second || !third) throw new Error('بيانات الاختبار غير كافية');
    const wrongOption = second.options.find((option) => option.id !== second.correctOptionId);
    if (!wrongOption) throw new Error('لا يوجد خيار خاطئ للاختبار');
    const answers: AnswerMap = {
      [first.id]: { selectedOptionId: first.correctOptionId, confirmed: true },
      [second.id]: { selectedOptionId: wrongOption.id, confirmed: true },
      [third.id]: { selectedOptionId: third.correctOptionId, confirmed: false },
    };
    const result = calculateQuizScore([first, second, third], answers);
    expect(result).toEqual({ correct: 1, total: 3, answered: 2, unanswered: 1, percent: 33, wrongQuestionIds: [second.id, third.id] });
  });

  it('يعيد 0% للاختبار الفارغ ولا يقسم على صفر', () => {
    expect(calculateQuizScore([], {})).toEqual({ correct: 0, total: 0, answered: 0, unanswered: 0, percent: 0, wrongQuestionIds: [] });
  });

  it('يخلط ترتيب الأسئلة دون حذفها أو تغيير معرّفات الخيارات', () => {
    const original = unitContent.quiz.slice(0, 5);
    const before = original.map((question) => [question.id, question.correctOptionId, ...question.options.map((option) => option.id)]);
    const shuffled = shuffleItems(original, () => 0);
    expect(shuffled.map((question) => question.id).sort()).toEqual(original.map((question) => question.id).sort());
    expect(shuffled.map((question) => [question.id, question.correctOptionId, ...question.options.map((option) => option.id)]).sort()).toEqual(before.sort());
  });
});
