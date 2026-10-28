import { expect, test } from '@playwright/test';

const studentRoutes = [
  ['/learn', 'تعلّم الدرس'],
  ['/map', 'الخريطة المفاهيمية'],
  ['/activities', 'أنشطة تطبيقية'],
  ['/quiz', 'اختبر فهمك'],
  ['/flashcards', 'البطاقات التعليمية'],
  ['/bac', 'تدرّب على أسئلة الوحدة'],
] as const;

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('العنوان والصفحات موجّهة للمتعلم فقط', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1, name: 'منهج الإسلام في محاربة الانحراف والجريمة' })).toBeVisible();
  await expect(page.getByRole('link', { name: /دليل تربوي|الأستاذ|المفتش|حول الوحدة/ })).toHaveCount(0);
  await expect(page.locator('body')).not.toContainText('۞');
  await expect(page.locator('body')).not.toContainText('السنة الثالثة ثانوي');
  await expect(page.locator('body')).not.toContainText(/فهمٌ|إنصافٌ|وقايةٌ|اختر مسارًا للتعلّم، ثم راجع فهمك بالأنشطة والبطاقات|20 سؤال · 20 بطاقة/);
  for (const [route, title] of studentRoutes) {
    await page.goto(route);
    await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible();
  }
  await page.goto('/learn?section=2');
  await expect(page.locator('.responsive-table').filter({ hasText: 'شرب الخمر' })).toContainText('حدّ (80 جلدة)');
  await page.goto('/bac');
  await expect(page.locator('.practice-card__header .eyebrow').first()).toHaveText('سؤال للتطبيق');
  for (const route of ['/guide', '/about']) {
    await page.goto(route);
    await expect(page.getByRole('heading', { name: 'لم نجد هذه الصفحة' })).toBeVisible();
  }
});

test('رحلة الدرس والخريطة والأنشطة المتنوعة تعمل', async ({ page }) => {
  await page.getByRole('link', { name: /ابدأ التعلم/ }).click();
  await expect(page.getByRole('heading', { name: 'مفهوم الانحراف والجريمة' })).toBeVisible();
  await expect(page.getByText('فائدة إثرائية')).toBeVisible();
  await page.getByRole('button', { name: 'أنهيت مراجعة هذا المحور' }).click();
  await expect(page.getByRole('button', { name: /أُنجز هذا المحور/ })).toBeDisabled();
  await page.getByRole('link', { name: /انتقل إلى الخريطة/ }).click();
  await page.getByRole('button', { name: /المنهج الوقائي/ }).click();
  await page.getByRole('link', { name: /افتح محور المنهج الوقائي/ }).click();
  await expect(page.getByRole('heading', { name: 'المنهج الوقائي', exact: true })).toBeVisible();

  const mobileMenu = page.getByRole('button', { name: 'فتح القائمة' });
  if (await mobileMenu.isVisible()) await mobileMenu.click();
  await page.getByRole('link', { name: 'الأنشطة' }).click();
  await page.getByRole('button', { name: 'المنهج وقائي' }).click();
  await page.getByRole('button', { name: 'تأكيد التصنيف' }).click();
  await expect(page.getByRole('status')).toContainText('تصنيف صحيح');

  await page.getByRole('tab', { name: 'المطابقة' }).click();
  const matches: Array<[string, string]> = [
    ['السرقة', 'الحدود'], ['القذف', 'الحدود'], ['الحرابة', 'الحدود'], ['الزنا', 'الحدود'],
    ['القتل العمد والجناية العمدية', 'القصاص'], ['القتل الخطأ والجناية الخطأ', 'الدية'],
    ['الرشوة والتزوير', 'التعزير'], ['احتكار الأسعار ومخالفة المرور', 'التعزير'],
  ];
  for (const [crime, category] of matches) await page.getByLabel(`اختر نوع عقوبة: ${crime}`).selectOption({ label: category });
  await page.getByRole('button', { name: 'تحقّق من المطابقة' }).click();
  await expect(page.getByText(/النتيجة:/)).toContainText('8');

  await page.getByRole('tab', { name: 'المقارنة' }).click();
  await page.getByRole('button', { name: 'التعزير' }).click();
  await page.getByRole('button', { name: 'تحقّق من الإجابة' }).click();
  await expect(page.getByRole('status')).toContainText('إجابة صحيحة');
  await page.getByRole('button', { name: 'السؤال التالي' }).click();
  await expect(page.locator('.comparison-question .activity-step__meta')).toContainText('2');
  await expect(page.locator('.comparison-question .activity-step__meta')).toContainText('7');
  await expect(page.locator('.comparison-question h3')).toContainText('مقدرة بنص شرعي لا تزيد ولا تنقص');

  await page.getByRole('tab', { name: 'أكمل الفراغ' }).click();
  await page.locator('#fill-blank-answer').fill('التعزير');
  await page.getByRole('button', { name: 'تحقّق' }).click();
  await expect(page.getByRole('status')).toContainText('إجابة صحيحة');
});

test('تظهر أيقونة التلميح في وضع التدريب بعد تأكيد الإجابة', async ({ page }) => {
  await page.goto('/quiz');
  await page.getByRole('button', { name: /ابدأ التدريب/ }).click();
  await page.getByRole('radio').first().check();
  await page.getByRole('button', { name: 'تأكيد الإجابة' }).click();
  await expect(page.getByText(/التلميح:/)).toBeVisible();
  await expect(page.locator('.hint-note__icon').first()).toBeVisible();
});

test('الاختبار يقيّم الاختيار الصحيح ولا يكشف نتائج غير المجاب عنها مبكرًا', async ({ page }) => {
  await page.goto('/quiz');
  await page.getByRole('button', { name: /اختبر نفسك/ }).click();
  await expect(page.getByText(/ستظهر التغذية الراجعة بعد إنهاء الاختبار/)).toHaveCount(0);
  await page.getByRole('radio', { name: /هي محظورات شرعية زجر الله عنها بحد أو قصاص أو تعزير/ }).check();
  await page.getByRole('button', { name: 'تأكيد الإجابة' }).click();
  await expect(page.getByText(/ستظهر التغذية الراجعة بعد إنهاء الاختبار/)).toBeVisible();
  await page.getByRole('button', { name: 'السؤال 20، لم يجب' }).click();
  await page.getByRole('button', { name: 'إنهاء المحاولة' }).click();
  await expect(page.getByRole('dialog')).toContainText('19');
  await page.getByRole('button', { name: 'إنهاء وعرض النتيجة' }).click();
  await expect(page.getByRole('heading', { name: /1 من 20 إجابة صحيحة/ })).toBeVisible();
  await expect(page.getByText(/لم تجب عن هذا السؤال/).first()).toBeVisible();
});

test('كشف البطاقة وتسجيلها ثم مسح التقدم يعملان محليًا', async ({ page }) => {
  await page.goto('/flashcards');
  await page.getByRole('button', { name: 'اكشف الإجابة' }).click();
  await expect(page.getByRole('button', { name: 'أتقنتها' })).toBeVisible();
  await page.getByRole('button', { name: 'أتقنتها' }).click();
  await expect(page.getByText(/حُفظت البطاقة ضمن البطاقات المتقنة/)).toBeVisible();
  await page.reload();
  await expect(page.getByText('✓ متقنة')).toBeVisible();
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'تابع من حيث وصلت' })).toBeVisible();
  await page.getByRole('button', { name: 'إعادة ضبط التقدم' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'نعم، امسح التقدم' }).click();
  await expect(page.getByRole('heading', { name: 'تابع من حيث وصلت' })).toHaveCount(0);
});

test('أسئلة المراجعة تعرض الإجابة فقط بعد فتحها', async ({ page }) => {
  await page.goto('/bac');
  const firstAnswer = page.getByText(/الزنا بعد إحصان: الرجم/).first();
  await expect(firstAnswer).toBeHidden();
  await page.getByText('اعرض الإجابة النموذجية').first().click();
  await expect(firstAnswer).toBeVisible();
  await expect(page.getByRole('heading', { name: 'تطبيق 1', exact: true })).toBeVisible();
});

test('يمكن الوصول للخريطة والأنشطة بلوحة المفاتيح', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.locator('.skip-link')).toBeFocused();
  await page.keyboard.press('Enter');
  await page.goto('/map');
  const branch = page.getByRole('button', { name: /المنهج العلاجي/ });
  await branch.focus();
  await page.keyboard.press('Enter');
  await expect(branch).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('heading', { name: /المنهج العلاجي/ })).toBeVisible();
  await page.goto('/activities');
  const classifyTab = page.getByRole('tab', { name: 'التصنيف' });
  await classifyTab.focus();
  await page.keyboard.press('ArrowLeft');
  await expect(page.getByRole('tab', { name: 'المطابقة' })).toHaveAttribute('aria-selected', 'true');
});

test('نسخة الطباعة تعرض الإجابات وتخفي أدوات التحكم', async ({ page }) => {
  await page.goto('/bac');
  await page.locator('.practice-answer summary').first().click();
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.practice-answer[open] > ol').first()).toBeVisible();
  await expect(page.getByRole('button', { name: /طباعة الصفحة/ })).toBeHidden();
});

test('الجداول تتكيف مع الهاتف ولا يتجاوز التخطيط عرض الشاشة', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 780 });
  await page.goto('/learn?section=2');
  await expect(page.locator('.responsive-table__mobile').first()).toBeVisible();
  let widths = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, page: document.documentElement.scrollWidth }));
  expect(widths.page).toBeLessThanOrEqual(widths.viewport + 1);
  await page.goto('/activities');
  await page.getByRole('tab', { name: 'أكمل الفراغ' }).click();
  widths = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, page: document.documentElement.scrollWidth }));
  expect(widths.page).toBeLessThanOrEqual(widths.viewport + 1);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/learn?section=2');
  await expect(page.locator('.responsive-table__desktop').first()).toBeVisible();
  await expect(page.locator('.responsive-table__mobile').first()).toBeHidden();
});
