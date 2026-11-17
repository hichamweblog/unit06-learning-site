import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { units } from '../src/data/units/registry';

const publicDir = fileURLToPath(new URL('../public/', import.meta.url));
const issues: string[] = [];

for (const unit of units) {
  if (unit.status !== 'published') continue;
  for (const image of unit.gallery) {
    const path = `${publicDir}${image.src.replace(/^\//, '')}`;
    if (!existsSync(path)) issues.push(`${unit.slug}: صورة الخريطة غير موجودة (${image.src})`);
  }
  const checks = unit.sections.flatMap((section) =>
    section.blocks.filter((block) => block.type === 'check'),
  );
  if (checks.length !== unit.sections.length) {
    issues.push(`${unit.slug}: عدد أسئلة الفهم (${checks.length}) لا يطابق عدد المحاور (${unit.sections.length})`);
  }
}

const summary = units
  .map(
    (unit) =>
      `• ${unit.slug}: ${unit.sections.length} محاور · ${unit.quiz.length} سؤالًا · ${unit.flashcards.length} بطاقة · ${unit.practice.length} تطبيق بكالوريا`,
  )
  .join('\n');

if (issues.length > 0) {
  console.error(`فشل التحقق من المحتوى:\n${issues.map((issue) => `- ${issue}`).join('\n')}`);
  process.exit(1);
}

console.log(`تم التحقق من ${units.length} وحدة بنجاح:\n${summary}`);
