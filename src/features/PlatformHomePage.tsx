import { Link } from 'react-router-dom';
import { plannedUnits, publishedUnits } from '../data/units/registry';
import { site, unitPath } from '../lib/site';

const steps = [
  {
    number: '01',
    title: 'افهم',
    text: 'درس مرتّب في محاور قصيرة، كل محور ينتهي بسؤال فهم يثبّت الفكرة قبل الانتقال.',
  },
  {
    number: '02',
    title: 'اربط',
    text: 'خرائط ذهنية تفاعلية وصور عالية الدقة تُظهر بنية الوحدة كاملة في صفحة واحدة.',
  },
  {
    number: '03',
    title: 'تدرّب',
    text: 'بطاقات استرجاع، بنك أسئلة، وتطبيقات بكالوريا بإجابات نموذجية تُكشف بعد المحاولة.',
  },
];

export function PlatformHomePage() {
  return (
    <div className="home-page page-wrap">
      <section className="hero-panel hero-panel--clean platform-hero" aria-labelledby="platform-title">
        <div className="hero-panel__inner">
          <div className="hero-badge">
            <span>{site.tagline} · بكالوريا</span>
          </div>

          <h1 id="platform-title">
            راجع العلوم الإسلامية
            <br className="hero-title-break" />
            بثقة، لا بضجيج
          </h1>

          <div className="hero-panel__content">
            <p className="hero-panel__lead-title">{site.description}</p>
            <ul className="hero-panel__objectives">
              <li>محتوى مُراجَع ومطابق للتدرجات الرسمية، بلا حشو</li>
              <li>تعلّم، خرائط، بطاقات، واختبارات في مسار واحد</li>
              <li>يعمل على الهاتف دون اتصال بعد الزيارة الأولى</li>
            </ul>
          </div>

          <div className="hero-panel__actions">
            {publishedUnits[0] && (
              <Link className="button button--copper hero-btn-cta" to={unitPath(publishedUnits[0].slug, 'learn')}>
                ابدأ التعلم الآن <span aria-hidden="true">←</span>
              </Link>
            )}
            <Link className="button button--hero-outline" to="/about">
              عن المنصة والمنهجية
            </Link>
          </div>
        </div>
      </section>

      <section className="units-section" aria-labelledby="units-title">
        <header className="section-intro">
          <div>
            <p className="eyebrow">المحتوى المتاح</p>
            <h2 id="units-title">الوحدات التعليمية</h2>
          </div>
          <p>نبدأ بوحدة واحدة نُتقنها بدل عشر وحدات ناقصة، ثم نوسّع التغطية وحدة بعد وحدة.</p>
        </header>

        <div className="unit-grid">
          {publishedUnits.map((unit) => (
            <article className="unit-card" key={unit.slug}>
              <span className="unit-card__number" aria-hidden="true"><bdi>{String(unit.number).padStart(2, '0')}</bdi></span>
              <div className="unit-card__body">
                <p className="eyebrow">{unit.program.label}</p>
                <h3>{unit.title}</h3>
                <p className="unit-card__summary">{unit.summary}</p>
                <ul className="unit-card__meta">
                  <li><bdi>{unit.sections.length}</bdi> محاور</li>
                  <li><bdi>{unit.quiz.length}</bdi> سؤالًا</li>
                  <li><bdi>{unit.flashcards.length}</bdi> بطاقة</li>
                  <li><bdi>{unit.practice.length}</bdi> تطبيق بكالوريا</li>
                </ul>
                <div className="button-row">
                  <Link className="button button--navy button--small" to={unitPath(unit.slug, 'learn')}>
                    ابدأ الوحدة <span aria-hidden="true">←</span>
                  </Link>
                  <Link className="button button--outline button--small" to={unitPath(unit.slug)}>
                    نظرة عامة
                  </Link>
                </div>
              </div>
            </article>
          ))}

          {plannedUnits.map((unit) => (
            <article className="unit-card unit-card--planned" key={unit.title}>
              <span className="unit-card__number" aria-hidden="true"><bdi>{String(unit.number).padStart(2, '0')}</bdi></span>
              <div className="unit-card__body">
                <p className="eyebrow">قيد الإعداد</p>
                <h3>{unit.title}</h3>
                <p className="unit-card__summary">{unit.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="pathway-section" aria-labelledby="how-title">
        <header className="section-intro">
          <div>
            <p className="eyebrow">طريقة العمل</p>
            <h2 id="how-title">ثلاث خطوات لكل وحدة</h2>
          </div>
          <p>الهدف ليس قراءة الدرس مرة واحدة، بل أن تستطيع استحضاره يوم الامتحان.</p>
        </header>

        <div className="pathway-grid pathway-grid--three">
          {steps.map((step) => (
            <article className="pathway-card pathway-card--enhanced pathway-card--navy" key={step.number}>
              <header className="pathway-card__header">
                <span className="pathway-card__step-label">الخطوة {step.number}</span>
                <span className="pathway-card__number" aria-hidden="true"><bdi>{step.number}</bdi></span>
              </header>
              <h3 className="pathway-card__title">{step.title}</h3>
              <p className="pathway-card__desc">{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="trust-strip" aria-label="مبادئ المنصة">
        <div>
          <strong>مراجعة تحريرية</strong>
          <p>كل تعريف ودليل يُراجع ويُصحّح، والتصحيحات موثّقة.</p>
        </div>
        <div>
          <strong>خصوصية كاملة</strong>
          <p>لا حساب، ولا إعلانات، وتقدمك يبقى على جهازك.</p>
        </div>
        <div>
          <strong>يعمل دون اتصال</strong>
          <p>بعد الزيارة الأولى يمكنك المراجعة بشبكة ضعيفة أو بلا شبكة.</p>
        </div>
      </section>
    </div>
  );
}
