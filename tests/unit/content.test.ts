import source from '../../src/data/unit06_crime_prevention_master.json';
import { describe, expect, it } from 'vitest';
import { ContentValidationError, normalizeContent } from '../../src/data/normalizeContent';

describe('مصدر الوحدة والمراجعات المعروضة', () => {
  it('يتحقق من الأقسام ويطبّع الأسئلة والبطاقات مع إبقاء مصدر JSON دون تعديل', () => {
    const content = normalizeContent(source);
    expect(content.metadata.unit_id).toBe('UNIT_06');
    expect(content.quiz).toHaveLength(20);
    expect(content.flashcards).toHaveLength(20);
    expect(content.mindMap.branches).toHaveLength(6);
    expect(content.quiz.every((question) => question.options.length >= 4)).toBe(true);
    expect(content.quiz.every((question) => question.options.some((option) => option.id === question.correctOptionId && option.text === question.correctAnswerText))).toBe(true);
    expect(content.flashcards[0]?.front).toBe('ما التعريف الاصطلاحي لـ «الانحراف»؟');
    expect(source.quiz[16]?.correct_answer).toContain('إسقاط عدم تنفيذ');
  });

  it('يزيل إشارات الامتحان والسنة والمصدر من النصوص التعليمية المعروضة', () => {
    const content = normalizeContent(source);
    const visibleText = [
      ...content.quiz.flatMap((question) => [question.question, question.hint, question.explanation, question.correctAnswerText, ...question.options.map((option) => option.text)]),
      ...content.flashcards.flatMap((card) => [card.front, card.back, card.category ?? '']),
    ].join(' ');
    expect(visibleText).not.toMatch(/بكالوريا|امتحان|20\d{2}|رسمي|المصدر|الملف|الأستاذ|المفتش|JSON/);
  });

  it('يوزّع الإجابة الصحيحة بالتساوي على مواضع الخيارات الأربعة', () => {
    const content = normalizeContent(source);
    const positions = content.quiz.map((question) => question.options.findIndex((option) => option.id === question.correctOptionId));
    expect(positions).toHaveLength(20);
    expect([0, 1, 2, 3].map((position) => positions.filter((item) => item === position).length)).toEqual([5, 5, 5, 5]);
  });

  it('يعرض صياغة السؤال 17 بعد تصحيحها دون المساس بنص JSON الأصلي', () => {
    const content = normalizeContent(source);
    expect(content.quiz.find((question) => question.id === '17')?.correctAnswerText)
      .toBe('درء الحد أو عدم إقامته عند وجود شبهة معتبرة في الإثبات.');
    expect(source.quiz[16]?.correct_answer)
      .toBe('إسقاط عدم تنفيذ الحد عند وجود أي شك أو احتمال أو نقص في شروط الإثبات الشرعي.');
  });

  it('يخفف الصياغة المطلقة ويعرض مقدار عقوبة شرب الخمر في موضعه', () => {
    const content = normalizeContent(source);
    expect(content.quiz.find((question) => question.id === '20')?.correctAnswerText)
      .toBe('من حكم العقوبات: تطهير الجاني وكفارة إثمه.');
    const wine = content.fullUnitText.section_3_curative_method_penalties.types_of_penalties
      .flatMap((group) => group.crimes_and_details).find((detail) => detail.crime === 'شرب الخمر');
    expect(wine?.penalty).toBe('حدّ (80 جلدة)');
    const wineCard = content.flashcards.find((card) => card.cardId === 'FC_U6_10');
    expect(wineCard?.back).toBe('حفظ العقل.');
    const wineRelatedQuizText = content.quiz
      .filter((question) => /شرب الخمر|شرب المسكرات/.test([question.question, ...question.options.map((option) => option.text)].join(' ')))
      .map((question) => [question.question, ...question.options.map((option) => option.text), question.correctAnswerText, question.hint, question.explanation].join(' '))
      .join(' ');
    expect(wineRelatedQuizText).not.toMatch(/(?:80|40)\s*جلد\w*/);
  });

  it('يرفض إجابة صحيحة لا تطابق الخيارات في المصدر', () => {
    const invalid = structuredClone(source);
    invalid.quiz[0]!.correct_answer = 'إجابة غير موجودة في الخيارات';
    expect(() => normalizeContent(invalid)).toThrow(ContentValidationError);
    expect(() => normalizeContent(invalid)).toThrow(/تطابق 0 من الخيارات/);
  });

  it('يرفض معرف سؤال أو بطاقة مكررًا', () => {
    const invalid = structuredClone(source);
    invalid.quiz[1]!.id = invalid.quiz[0]!.id;
    invalid.flashcards[1]!.card_id = invalid.flashcards[0]!.card_id;
    expect(() => normalizeContent(invalid)).toThrow(/معرّف سؤال مكرر/);
  });
});
