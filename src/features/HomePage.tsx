import { Link } from 'react-router-dom';
import { unitContent, studentPracticeQuestions } from '../data';
import { useProgress } from '../context/useProgress';
import { ProgressBar } from '../components/ProgressBar';
import { ResetProgressButton } from '../components/ResetProgressButton';

interface PathwayItem {
  number: string;
  stepLabel: string;
  title: string;
  focus: string;
  copy: string;
  to: string;
  action: string;
  tone: 'navy' | 'copper' | 'sage';
}

const pathways: PathwayItem[] = [
  {
    number: '01',
    stepLabel: 'المحطة الأولى · الفهم والتأسيس',
    title: 'الدرس والمفاهيم النظرية',
    focus: 'الشرح المنهجي والتأصيل',
    copy: 'استوعب محاور الوحدة الأربعة مع الشواهد الشرعية المشكولة، والتعريفات الاصطلاحية، وجداول الفروق الدقيقة.',
    to: '/learn',
    action: 'ابدأ التعلم',
    tone: 'navy',
  },
  {
    number: '02',
    stepLabel: 'المحطة الثانية · الربط البصري',
    title: 'الخرائط الذهنية',
    focus: 'الربط والاستحضار الشامل',
    copy: 'استحضر العلاقات والروابط الذهنية بصرياً عبر خريطة شجرية تفاعلية ومعرض يضم 3 خرائط مصورة ملونة عالية الدقة.',
    to: '/map',
    action: 'استكشف الخرائط الذهنية',
    tone: 'copper',
  },
  {
    number: '03',
    stepLabel: 'المحطة الثالثة · التثبيت والامتحان',
    title: 'الأنشطة والتقويم الشامل',
    focus: 'التطبيق العملي والجاهزية',
    copy: 'مركز تطبيقي متدرج يجمع بطاقات الحفظ الذكية، أنشطة الفرز، بنك الأسئلة (20 سؤالاً)، وتدريبات البكالوريا النموذجية.',
    to: '/activities',
    action: 'ادخل مركز الأنشطة',
    tone: 'sage',
  },
];

const routeLabels: Record<string, string> = {
  '/learn': 'الدرس والمفاهيم',
  '/map': 'الخرائط الذهنية',
  '/activities': 'الأنشطة والتقويم',
  '/quiz': 'اختبر نفسك',
  '/flashcards': 'بطاقات المراجعة',
  '/bac': 'تدريبات البكالوريا',
};

function getSavedBacEvaluationCount(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = localStorage.getItem('unit06_bac_evaluations');
    if (!raw) return 0;
    const parsed = JSON.parse(raw);
    return Object.keys(parsed).length;
  } catch {
    return 0;
  }
}

export function HomePage() {
  const { progress } = useProgress();
  const completed = progress.completedSections.filter((id) => ['concepts', 'prevention', 'penalties', 'wisdom'].includes(id)).length;
  const completedActivities = progress.completedSections.filter((id) => !['concepts', 'prevention', 'penalties', 'wisdom'].includes(id)).length;
  const masteredCards = unitContent.flashcards.filter((card) => progress.masteredFlashcardIds.includes(card.cardId)).length;
  const reviewCards = unitContent.flashcards.filter((card) => progress.reviewFlashcardIds.includes(card.cardId)).length;
  const bacEvaluated = getSavedBacEvaluationCount();

  const totalPossible = 4 + unitContent.flashcards.length + studentPracticeQuestions.length;
  const currentTotalDone = completed + masteredCards + bacEvaluated;
  const overallPercentage = Math.min(100, Math.round((currentTotalDone / totalPossible) * 100));

  const hasProgress = Boolean(
    completed || completedActivities || progress.lastRoute || progress.latestQuizScore !== undefined ||
    progress.masteredFlashcardIds.length || progress.reviewFlashcardIds.length || bacEvaluated > 0,
  );

  const resumeRoute = progress.lastRoute && routeLabels[progress.lastRoute] ? progress.lastRoute : '/learn';
  const resumeLabel = progress.lastRoute ? routeLabels[resumeRoute] : 'الدرس والمفاهيم';

  return (
    <div className="home-page page-wrap">
      {/* 1. HERO SECTION */}
      <section className="hero-panel hero-panel--clean" aria-labelledby="home-title">
        <div className="hero-panel__inner">
          <div className="hero-badge">
            <span>برنامج بكالوريا 2026 · مادة العلوم الإسلامية</span>
          </div>

          <h1 id="home-title">
            منهج الإسلام في محاربة
            <br className="hero-title-break" />
            الانحراف والجريمة
          </h1>

          <div className="hero-panel__content">
            <p className="hero-panel__lead-title">وحدة تعليمية وفق التدرجات الرسمية:</p>
            <ul className="hero-panel__objectives">
              <li>استوعب المفاهيم بأدلتها الشرعية</li>
              <li>استعرض الخرائط الذهنية الشاملة</li>
              <li>تدرّب على أسئلة البكالوريا النموذجية مع إمكانية التقييم الذاتي الفوري.</li>
            </ul>
          </div>

          <div className="hero-panel__actions">
            <Link className="button button--copper hero-btn-cta" to="/learn">
              ابدأ التعلم <span aria-hidden="true">←</span>
            </Link>
            <Link className="button button--hero-outline" to="/map">
              الخرائط الذهنية
            </Link>
            <Link className="button button--hero-outline" to="/activities">
              الأنشطة والتقويم
            </Link>
          </div>
        </div>
      </section>

      {/* 2. THE THREE CORE LEARNING HUBS */}
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

      {/* 3. CONTINUOUS SELF-MONITORING & PROGRESS DASHBOARD */}
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
                <span className="p-metric-card__value"><bdi>{completed} / 4</bdi></span>
                <span className="p-metric-card__hint">المفاهيم · الوقاية · العقوبات · الحكمة</span>
              </div>

              <div className="p-metric-card">
                <span className="p-metric-card__label">بطاقات المراجعة المتقنة</span>
                <span className="p-metric-card__value"><bdi>{masteredCards} / {unitContent.flashcards.length}</bdi></span>
                <span className="p-metric-card__hint">بطاقات للمراجعة: {reviewCards}</span>
              </div>

              <div className="p-metric-card">
                <span className="p-metric-card__label">تطبيقات البكالوريا المقيّمة</span>
                <span className="p-metric-card__value"><bdi>{bacEvaluated} / {studentPracticeQuestions.length}</bdi></span>
                <span className="p-metric-card__hint">مقارنة ذاتية مع نموذج الإجابة</span>
              </div>
            </div>

            <div className="progress-dashboard__bottom">
              <div className="progress-dashboard__bar-area">
                <ProgressBar value={completed} max={4} label="تقدم محاور الدرس الأساسية" />
                {progress.latestQuizScore !== undefined && (
                  <p className="saved-result">
                    آخر نتيجة للاختبار الشامل: <strong><bdi>{progress.latestQuizScore}%</bdi></strong>
                    {progress.bestQuizScore !== undefined && <> · أعلى نتيجة: <strong><bdi>{progress.bestQuizScore}%</bdi></strong></>}
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
            <Link className="button button--copper" to="/learn">
              ابدأ بالمحور الأول الآن <span aria-hidden="true">←</span>
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
