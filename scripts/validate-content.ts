import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { normalizeContent } from '../src/data/normalizeContent.ts';
import { studentPracticeQuestions } from '../src/data/studentPractice.ts';

const file = resolve('src/data/unit06_crime_prevention_master.json');
try {
  const raw: unknown = JSON.parse(readFileSync(file, 'utf8'));
  const content = normalizeContent(raw);
  console.log('✓ بنية ملف الوحدة صالحة.');
  console.log(`  أسئلة الاختبار: ${content.quiz.length} — البطاقات: ${content.flashcards.length} — فروع الخريطة: ${content.mindMap.branches.length}`);
  console.log(`  أسئلة المراجعة: ${studentPracticeQuestions.length} — صفوف جدول المقارنة: ${content.bac.predicted_practice_tables.comparison_table_penalties.rows.length}`);
  console.log('  تم التحقق من المعرفات ومطابقة الإجابات الصحيحة، مع توزيع مواضع الإجابات بين الخيارات.');
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
