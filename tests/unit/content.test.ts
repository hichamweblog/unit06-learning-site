import { describe, expect, it } from 'vitest';
import rawUnit06 from '../../src/data/units/unit06.json';
import { UnitValidationError, normalizeUnit } from '../../src/data/units/normalize';
import { units } from '../../src/data/units/registry';
import { getMetaForPath, indexablePaths } from '../../src/lib/seo';

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

describe('مخطط الوحدة العامة', () => {
  it('يحمّل الوحدة 06 من السجل بصيغة موحّدة', () => {
    const unit = units.find((item) => item.slug === 'unit-06');
    expect(unit).toBeDefined();
    expect(unit?.sections.map((section) => section.id)).toEqual(['concepts', 'prevention', 'penalties', 'wisdom']);
    expect(unit?.quiz).toHaveLength(20);
    expect(unit?.flashcards).toHaveLength(20);
    expect(unit?.practice).toHaveLength(13);
    expect(unit?.activities.classify).toHaveLength(12);
    expect(unit?.activities.difference).toHaveLength(6);
    expect(unit?.mindMap.branches).toHaveLength(6);
  });

  it('يضمن أن كل إجابة صحيحة تطابق خيارًا واحدًا بالضبط', () => {
    const unit = normalizeUnit(rawUnit06);
    for (const question of unit.quiz) {
      const matches = question.options.filter((option) => option.text === question.correctAnswerText);
      expect(matches).toHaveLength(1);
      expect(matches[0]?.id).toBe(question.correctOptionId);
    }
  });

  it('يوزّع الإجابة الصحيحة بالتساوي على مواضع الخيارات', () => {
    const unit = normalizeUnit(rawUnit06);
    const positions = unit.quiz.map((question) =>
      question.options.findIndex((option) => option.id === question.correctOptionId),
    );
    expect([0, 1, 2, 3].map((position) => positions.filter((item) => item === position).length)).toEqual([5, 5, 5, 5]);
  });

  it('يعزل معرّفات البطاقات باسم الوحدة لمنع تداخل التقدم', () => {
    const unit = normalizeUnit(rawUnit06);
    expect(unit.flashcards.every((card) => card.cardId.startsWith('unit-06:'))).toBe(true);
  });

  it('يُبقي روابط الخريطة الذهنية مرتبطة بمحاور موجودة', () => {
    const unit = normalizeUnit(rawUnit06);
    for (const branch of unit.mindMap.branches) {
      expect(unit.sectionIds).toContain(branch.sectionId);
    }
  });

  it('يحتوي كل محور على سؤال فهم واحد على الأقل', () => {
    const unit = normalizeUnit(rawUnit06);
    for (const section of unit.sections) {
      expect(section.blocks.some((block) => block.type === 'check')).toBe(true);
    }
  });

  it('لا يسرّب إشارات الامتحان أو المصدر داخل الأسئلة والبطاقات', () => {
    const unit = normalizeUnit(rawUnit06);
    const visible = [
      ...unit.quiz.flatMap((question) => [
        question.question,
        question.hint,
        question.explanation,
        question.correctAnswerText,
        ...question.options.map((option) => option.text),
      ]),
      ...unit.flashcards.flatMap((card) => [card.front, card.back, card.category ?? '']),
    ].join(' ');
    expect(visible).not.toMatch(/بكالوريا|امتحان|20\d{2}|رسمي|المصدر|المفتش|JSON/);
  });

  it('يرفض إجابة صحيحة غير موجودة في الخيارات', () => {
    const invalid = clone(rawUnit06);
    invalid.quiz[0]!.correctAnswer = 'إجابة غير موجودة في الخيارات';
    expect(() => normalizeUnit(invalid)).toThrow(UnitValidationError);
    expect(() => normalizeUnit(invalid)).toThrow(/تطابق 0 من الخيارات/);
  });

  it('يرفض معرّفات مكررة في الأسئلة والبطاقات والمحاور', () => {
    const invalid = clone(rawUnit06);
    invalid.quiz[1]!.id = invalid.quiz[0]!.id;
    invalid.flashcards[1]!.id = invalid.flashcards[0]!.id;
    invalid.sections[1]!.id = invalid.sections[0]!.id;
    const error = (() => {
      try {
        normalizeUnit(invalid);
      } catch (thrown) {
        return thrown as UnitValidationError;
      }
      return null;
    })();
    expect(error?.issues.join(' ')).toMatch(/معرّف سؤال مكرر/);
    expect(error?.issues.join(' ')).toMatch(/معرّف بطاقة مكرر/);
    expect(error?.issues.join(' ')).toMatch(/معرّف محور مكرر/);
  });

  it('يرفض صفًا في الجدول لا يطابق عدد العناوين', () => {
    const invalid = clone(rawUnit06);
    const tableBlock = invalid.sections[2]!.blocks.find((block) => block.type === 'group');
    if (!tableBlock || tableBlock.type !== 'group') throw new Error('الوحدة لا تحتوي على كتلة جدول');
    tableBlock.table.rows[0]!.pop();
    expect(() => normalizeUnit(invalid)).toThrow(/لا يطابق عدد العناوين/);
  });

  it('يرفض سؤال فهم يشير إلى خيار غير موجود', () => {
    const invalid = clone(rawUnit06);
    const check = invalid.sections[0]!.blocks.find((block) => block.type === 'check');
    if (!check || check.type !== 'check') throw new Error('المحور لا يحتوي على سؤال فهم');
    check.answerIndex = 9;
    expect(() => normalizeUnit(invalid)).toThrow(/خارج نطاق الخيارات/);
  });
});

describe('بيانات SEO', () => {
  it('يعطي كل مسار عنوانًا فريدًا ووصفًا وبيانات منظمة', () => {
    const paths = indexablePaths();
    expect(paths).toContain('/');
    expect(paths).toContain('/about');
    expect(paths).toContain('/units/unit-06/learn');

    const titles = paths.map((path) => getMetaForPath(path).title);
    expect(new Set(titles).size).toBe(titles.length);

    for (const path of paths) {
      const meta = getMetaForPath(path);
      expect(meta.title.length).toBeGreaterThan(10);
      expect(meta.description.length).toBeGreaterThan(20);
      expect(meta.canonical.startsWith('http')).toBe(true);
      expect(meta.jsonLd.length).toBeGreaterThan(0);
    }
  });

  it('يضع noindex على المسارات غير المعروفة', () => {
    expect(getMetaForPath('/صفحة-غير-موجودة').robots).toContain('noindex');
  });
});
