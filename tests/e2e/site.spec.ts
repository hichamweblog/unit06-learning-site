import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('الصفحة الرئيسية تعرض المنصة وقائمة الوحدات', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1, name: /راجع العلوم الإسلامية/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'الوحدات التعليمية' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 3, name: 'منهج الإسلام في محاربة الانحراف والجريمة' })).toBeVisible();
  await expect(page.locator('body')).not.toContainText('۞');
});

test('الوحدة تُحمّل من مسارها وتعرض محطاتها الثلاث', async ({ page }) => {
  await page.goto('/units/unit-06');
  await expect(page.getByRole('heading', { level: 1, name: 'منهج الإسلام في محاربة الانحراف والجريمة' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'المحطات التعليمية الثلاث' })).toBeVisible();
  await expect(page.getByRole('link', { name: /ابدأ التعلم/ })).toBeVisible();
});

test('الدرس يعرض الكتل ويمنع تسجيل الإنجاز قبل الإجابة', async ({ page }) => {
  await page.goto('/units/unit-06/learn');
  await expect(page.getByRole('heading', { name: 'مفهوم الانحراف والجريمة' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'أنهيت مراجعة هذا المحور' })).toBeDisabled();
  await page.getByRole('button', { name: /محظورات شرعية زجر الله عنها/ }).click();
  await page.getByRole('button', { name: 'تحقّق من اختياري' }).click();
  await expect(page.locator('.feedback')).toContainText('إجابة موفقة');
  await page.getByRole('button', { name: 'أنهيت مراجعة هذا المحور' }).click();
  await expect(page.getByRole('button', { name: /أُنجز هذا المحور/ })).toBeDisabled();
});

test('الخريطة التفاعلية تنقل إلى المحور الصحيح', async ({ page }) => {
  await page.goto('/units/unit-06/map');
  await page.getByRole('button', { name: 'الخريطة التفاعلية' }).click();
  await page.getByRole('button', { name: /المنهج الوقائي/ }).first().click();
  await expect(page.getByRole('heading', { name: 'المنهج الوقائي', exact: true })).toBeVisible();
});

test('الأنشطة والاختبار والبطاقات وتدريبات البكالوريا تعمل', async ({ page }) => {
  await page.goto('/units/unit-06/activities');
  await expect(page.getByRole('heading', { level: 1, name: 'الأنشطة والتقويم' })).toBeVisible();
  await expect(page.getByText('الفرز والتمييز السريع')).toBeVisible();

  await page.goto('/units/unit-06/activities?tab=quiz');
  await expect(page.getByRole('heading', { name: 'اختر طريقة المراجعة' })).toBeVisible();

  await page.goto('/units/unit-06/activities?tab=bac');
  await expect(page.locator('.practice-card__title').first()).toHaveText('تطبيق 1');
});

test('الروابط القديمة تُحوّل إلى مسارات الوحدة', async ({ page }) => {
  await page.goto('/learn?section=2');
  await expect(page).toHaveURL(/\/units\/unit-06\/learn\?section=2$/);
  await expect(page.getByRole('heading', { name: 'المنهج العلاجي والعقوبات' })).toBeVisible();

  await page.goto('/quiz');
  await expect(page).toHaveURL(/\/units\/unit-06\/activities\?tab=quiz$/);
});

test('صفحة المنهجية تعرض المصادر والخصوصية', async ({ page }) => {
  await page.goto('/about');
  await expect(page.getByRole('heading', { level: 1, name: 'عن المنصة والمنهجية' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'المصادر المعتمدة' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'ما نعرفه عنك' })).toBeVisible();
});

test('المسارات غير الموجودة تعرض صفحة 404', async ({ page }) => {
  await page.goto('/units/unknown-unit');
  await expect(page.getByRole('heading', { name: 'لم نجد هذه الصفحة' })).toBeVisible();
});

test('وسوم الصفحة تتغيّر مع التنقّل', async ({ page }) => {
  await page.goto('/units/unit-06/learn');
  await expect(page).toHaveTitle(/الدرس: منهج الإسلام/);
  const canonical = page.locator('link[rel="canonical"]');
  await expect(canonical).toHaveAttribute('href', /\/units\/unit-06\/learn$/);
  await expect(page.locator('script[type="application/ld+json"]').first()).toBeAttached();
});
