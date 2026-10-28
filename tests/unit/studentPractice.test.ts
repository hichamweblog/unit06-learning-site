import { describe, expect, it } from 'vitest';
import { studentPracticeQuestions } from '../../src/data/studentPractice';

describe('مجموعة التدريب الموجّهة للمتعلم', () => {
  it('تحتوي على 13 تطبيقًا وكل سؤال له موضوع وسؤال وإجابة', () => {
    expect(studentPracticeQuestions).toHaveLength(13);
    for (const question of studentPracticeQuestions) {
      expect(question.topic.trim()).not.toBe('');
      expect(question.prompt.trim()).not.toBe('');
      expect(question.modelAnswer.length).toBeGreaterThan(0);
    }
  });

  it('لا تعرض عددًا ثابتًا لعقوبة شرب الخمر', () => {
    const wineQuestions = studentPracticeQuestions.filter((question) => /شرب الخمر|المسكرات/.test(`${question.prompt} ${question.passage ?? ''}`));
    const wineAnswers = wineQuestions.flatMap((question) => question.modelAnswer).join(' ');
    expect(wineAnswers).not.toMatch(/(?:40|80)\s*جلدة/);
  });

  it('تحافظ على نصوص الشواهد التي زوّد بها المستخدم دون إنشاء نص جديد', () => {
    expect(studentPracticeQuestions[0]?.passage).toContain('لا يَحِلُّ دَمُ امْرِئٍ مُسْلِمٍ');
    expect(studentPracticeQuestions[7]?.passage).toContain('لَا تَقْرَبُوا الصَّلَاةَ وَأَنْتُمْ سُكَارَى');
    expect(studentPracticeQuestions[9]?.passage).toContain('وَالسَّارِقُ وَالسَّارِقَةُ');
  });
});
