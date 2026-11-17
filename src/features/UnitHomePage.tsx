import { Link } from 'react-router-dom';
import { useProgress } from '../context/useProgress';
import { sectionKey, useUnit } from '../context/useUnit';
import { ProgressBar } from '../components/ProgressBar';
import { ResetProgressButton } from '../components/ResetProgressButton';
import { unitPath } from '../lib/site';

function splitTitle(title: string): [string, string] | null {
  const words = title.split(' ');
  if (words.length < 4) return null;
  const splitAt = Math.max(2, words.length - 2);
  return [words.slice(0, splitAt).join(' '), words.slice(splitAt).join(' ')];
}

function savedBacCount(slug: string): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = localStorage.getItem(`${slug}_bac_evaluations`);
    return raw ? Object.keys(JSON.parse(raw) as Record<string, unknown>).length : 0;
  } catch {
    return 0;
  }
}

const routeLabels: Record<string, string> = {
  learn: 'الدرس والمفاهيم',
  map: 'الخرائط الذهنية',
  activities: 'الأنشطة والتقويم',
  quiz: 'اختبر نفسك',
  flashcards: 'بطاقات المراجعة',
  bac: 'تدريبات البكالوريا',
};

export function UnitHomePage() {
  const unit = useUnit();
  const { progress } = useProgress();

  const completedSet = new Set(progress.completedSections);
  const completed = unit.sections.filter((section) => completedSet.has(sectionKey(unit, section.id))).length;
  const masteredCards = unit.flashcards.filter((card) => progress.masteredFlashcardIds.includes(card.cardId)).length;
  const reviewCards = unit.flashcards.filter((card) => progress.reviewFlashcardIds.includes(card.cardId)).length;
  const bacEvaluated = savedBacCount(unit.slug);

  const totalPossible = unit.sections.length + unit.flashcards.length + unit.practice.length;
  const currentTotalDone = completed + masteredCards + Math.min(bacEvaluated, unit.practice.length);
  const overallPercentage = Math.min(100, Math.round((currentTotalDone / Math.max(totalPossible, 1)) * 100));

  const hasProgress = Boolean(
    completed ||
      progress.lastRoute ||
      progress.latestQuizScore !== undefined ||
      progress.masteredFlashcardIds.length ||
      progress.reviewFlashcardIds.length ||
      bacEvaluated > 0,
  );

  const unitBase = unitPath(unit.slug);
  const page = progress.lastRoute?.startsWith(unitBase) ? progress.lastRoute.split('/').pop() ?? '' : '';
  const resumeRoute = progress.lastRoute && routeLabels[page] ? progress.lastRoute : unitPath(unit.slug, 'learn');
  const resumeLabel = routeLabels[page] ?? 'الدرس والمفاهيم';
  const titleLines = splitTitle(unit.title);

  const pathways = [
    {
      number: '01',
      stepLabel: 'المحطة الأولى · الفهم والتأسيس',
      title: 'الدرس والمفاهيم النظرية',
      focus: 'الشرح المنهجي والتأصيل',
      copy: `${unit.sections.length} محاور مع الشواهد الشرعية والتعريفات الاصطلاحية والجداول، وسؤال فهم بعد كل محور.`,
      to: unitPath(unit.slug, 'learn'),
      action: 'ابدأ التعلم',
      tone: 'navy',
    },
    {
      number: '02',
      stepLabel: 'المحطة الثانية · الربط البصري',
      title: 'الخرائط الذهنية',
      focus: 'الربط والاستحضار الشامل',
      copy: `خريطة تفاعلية نصية${unit.gallery.length ? `، ومعرض يضم ${unit.gallery.length} خرائط مصوّرة قابلة للتحميل` : ''} لاستحضار بنية الوحدة في دقائق.`,
      to: unitPath(unit.slug, 'map'),
      action: 'استكشف الخرائط',
      tone: 'copper',
    },
    {
      number: '03',
      stepLabel: 'المحطة الثالثة · التثبيت والامتحان',
      title: 'الأنشطة والتقويم الشامل',
      focus: 'التطبيق العملي والجاهزية',
      copy: `مركز تطبيقي يجمع ${unit.flashcards.length} بطاقة استرجاع، وأنشطة فرز ومقارنة، و${unit.quiz.length} سؤالًا، و${unit.practice.length} تطبيق بكالوريا.`,
      to: unitPath(unit.slug, 'activities'),
      action: 'ادخل مركز الأنشطة',
      tone: 'sage',
    },
  ] as const;

  return (
    <div className="home-page page-wrap">
      <section className="hero-panel hero-panel--clean" aria-labelledby="home-title">
        <div className="hero-panel__inner">
          <div className="hero-badge">
            <span>{unit.program.label}</span>
          </div>

          <h1 id="home-title">
            {titleLines ? (
              <>
                {titleLines[0]}
                <br className="hero-title-break" />
                {titleLines[1]}
              </>
            ) : (
              unit.title
            )}
          </h1>

          <div className="hero-panel__content">
            <p className="hero-panel__lead-title">وحدة تعليمية وفق التدرجات الرسمية:</p>
            <ul className="hero-panel__objectives">
              {unit.objectives.map((objective) => (
                <li key={objective}>{objective}</li>
              ))}
            </ul>
          </div>

          <div className="hero-panel__actions">
            <Link className="button button--copper hero-btn-cta" to={unitPath(unit.slug, 'learn')}>
              ابدأ التعلم <span aria-hidden="true">←</span>
            </Link>
            <Link className="button button--hero-outline" to={unitPath(unit.slug, 'map')}>
              الخرائط الذهنية
            </Link>
            <Link className="button button--hero-outline" to={unitPath(unit.slug, 'activities')}>
              الأنشطة والتقويم
            </Link>
          </div>

          <p className="hero-provenance">
            {unit.provenance.reviewedAt ? <>آخر مراجعة: {unit.provenance.reviewedAt} · </> : null}
            <Link to="/about">المصادر ومنهجية العمل</Link>
          </p>
        </div>
      </section>

      <section className="pathway-section" aria-labelledby="pathway-title">
        <header className="section-intro">
          <div>
            <p className="eyebrow">خطة المذاكرة المتدرجة</p>
            <h2 id="pathway-title">المحطات التعليمية الثلاث</h2>
          </div>
          <p>
            مسار منظم يضمن استيعاب المفاهيم النظرية، استحضار الروابط ذهنياً، واكتساب منهجية الحل في امتحان البكالوريا.
          </p>
        </header>

        <div className="pathway-grid pathway-grid--three">
          {pathways.map((path) => (
            <article className={`pathway-card pathway-card--enhanced pathway-card--${path.tone}`} key={path.number}>
              <header className="pathway-card__header">
                <span className="pathway-card__step-label">{path.stepLabel}</span>
                <span className="pathway-card__number" aria-hidden="true"><bdi>{path.number}</bdi></span>
              </header>

              <h3 className="pathway-card__title">{path.title}</h3>
              <p className="pathway-card__focus">{path.focus}</p>
              <p className="pathway-card__desc">{path.copy}</p>

              <footer className="pathway-card__footer">
                <Link className="button button--small button--navy pathway-card__btn" to={path.to}>
                  {path.action} <span aria-hidden="true">←</span>
                </Link>
              </footer>
            </article>
          ))}
        </div>
      </section>

      <section className="progress-panel progress-panel--modern" aria-labelledby="progress-title">
        <header className="progress-panel__top">
          <div>
            <p className="eyebrow">المتابعة الذاتية المستمرة</p>
            <h2 id="progress-title">سجل التعلم والجاهزية الشخصية</h2>
          </div>
          {hasProgress && <ResetProgressButton compact />}
        </header>

        {hasProgress ? (
          <div className="progress-dashboard">
            <div className="progress-dashboard__metrics">
              <div className="p-metric-card">
                <span className="p-metric-card__label">الإنجاز التقديري العام</span>
                <span className="p-metric-card__value"><bdi>{overallPercentage}%</bdi></span>
                <span className="p-metric-card__hint">من محاور وبطاقات وتدريبات الوحدة</span>
              </div>

              <div className="p-metric-card">
                <span className="p-metric-card__label">محاور الدرس المكتملة</span>
                <span className="p-metric-card__value"><bdi>{completed} / {unit.sections.length}</bdi></span>
                <span className="p-metric-card__hint">{unit.sections.map((section) => section.label).join(' · ')}</span>
              </div>

              <div className="p-metric-card">
                <span className="p-metric-card__label">بطاقات المراجعة المتقنة</span>
                <span className="p-metric-card__value"><bdi>{masteredCards} / {unit.flashcards.length}</bdi></span>
                <span className="p-metric-card__hint">بطاقات للمراجعة: {reviewCards}</span>
              </div>

              <div className="p-metric-card">
                <span className="p-metric-card__label">تطبيقات البكالوريا المقيّمة</span>
                <span className="p-metric-card__value"><bdi>{bacEvaluated} / {unit.practice.length}</bdi></span>
                <span className="p-metric-card__hint">مقارنة ذاتية مع نموذج الإجابة</span>
              </div>
            </div>

            <div className="progress-dashboard__bottom">
              <div className="progress-dashboard__bar-area">
                <ProgressBar value={completed} max={unit.sections.length} label="تقدم محاور الدرس الأساسية" />
                {progress.latestQuizScore !== undefined && (
                  <p className="saved-result">
                    آخر نتيجة للاختبار الشامل: <strong><bdi>{progress.latestQuizScore}%</bdi></strong>
                    {progress.bestQuizScore !== undefined && (
                      <> · أعلى نتيجة: <strong><bdi>{progress.bestQuizScore}%</bdi></strong></>
                    )}
                  </p>
                )}
                <p className="privacy-inline">يُحفظ تقدمك تلقائياً وبأمان على هذا المتصفح فقط دون الحاجة لأي تسجيل.</p>
              </div>

              <div className="resume-hero-box">
                <div className="resume-hero-box__info">
                  <span className="resume-hero-box__tag">آخر محطة زرتها</span>
                  <h3 className="resume-hero-box__title">{resumeLabel}</h3>
                </div>
                <Link className="button button--copper button--small" to={resumeRoute}>
                  استأنف التعلم <span aria-hidden="true">←</span>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="progress-empty-state">
            <div className="progress-empty-state__info">
              <h3>سجلك التعليمي جاهز للمتابعة</h3>
              <p>
                كل محور تكمله، بطاقة تتقنها، أو تطبيق بكالوريا تقيمه، سيُسجل هنا تلقائياً لتقيس جاهزيتك التامة للامتحان.
              </p>
            </div>
            <Link className="button button--copper" to={unitPath(unit.slug, 'learn')}>
              ابدأ بالمحور الأول الآن <span aria-hidden="true">←</span>
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
