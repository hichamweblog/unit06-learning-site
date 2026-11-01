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
  highlights: string[];
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
    highlights: [
      'مفهوم الجريمة والانحراف والفرق الجوهري بينهما',
      'وسائل المنهج الوقائي الثلاث (إيمان، عبادات، أخلاق)',
      'المنهج العلاجي: الحدود والقصاص والتعزير',
      'الحكمة من التشريع وخصائص العقوبات الإسلامية',
    ],
    to: '/learn',
    action: 'افتح الدرس والمفاهيم',
    tone: 'navy',
  },
  {
    number: '02',
    stepLabel: 'المحطة الثانية · الربط البصري',
    title: 'الخرائط الذهنية',
    focus: 'الربط والاستحضار الشامل',
    copy: 'استحضر العلاقات والروابط الذهنية بصرياً عبر خريطة شجرية تفاعلية ومعرض يضم 3 خرائط مصورة ملونة عالية الدقة.',
    highlights: [
      'خريطة شجرية تفاعلية تغطي الفروع المفاهيمية الخمسة',
      '3 خرائط مصورة شاملة قابلة للمعاينة والتحميل',
      'عارض تكبير متقدم وتمرير سلس لمراجعة سريعة قبل الامتحان',
    ],
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
    highlights: [
      'بطاقات مراجعة ذكية مع تقييم حفظ فوري',
      'أنشطة فرز للأحكام والعقوبات وتصنيف النصوص',
      'اختبار إلكتروني شامل ومصحح تلقائياً (20 سؤالاً)',
      '13 تطبيقاً نموذجياً للبكالوريا مع مسودة تقييم ذاتي',
    ],
    to: '/activities',
    action: 'ادخل مركز الأنشطة',
    tone: 'sage',
  },
];

interface NecessityItem {
  id: string;
  name: string;
  domain: string;
  penalty: string;
  wisdom: string;
}

const necessities: NecessityItem[] = [
  {
    id: 'religion',
    name: 'حفظ الدين والأمن',
    domain: 'صيانة العقيدة والنظام العام',
    penalty: 'عقوبة الردة والحرابة',
    wisdom: 'حماية حرية المجتمع واستقراره وردع إشاعة الفوضى وترويع الآمنين.',
  },
  {
    id: 'life',
    name: 'حفظ النفس البشرية',
    domain: 'حرمة الدماء وسلامة الأبدان',
    penalty: 'القصاص والدية',
    wisdom: 'تحقيق العدالة وحقن الدماء وردع الاعتداء وتطييب نفس أولياء المقتول.',
  },
  {
    id: 'mind',
    name: 'حفظ العقل والفكر',
    domain: 'صيانة مناط التكليف والوعي',
    penalty: 'حد شرب الخمر',
    wisdom: 'حماية الإنسان من تغييب عقله وارتكاب الجرائم تحت تأثير المسكرات.',
  },
  {
    id: 'lineage',
    name: 'حفظ النسل والعرض',
    domain: 'طهارة الأسرة وكرامة الإنسان',
    penalty: 'حد الزنا وحد القذف',
    wisdom: 'صيانة كرامة الأفراد، ومنع اختلاط الأنساب، وحماية العفة والأعراض.',
  },
  {
    id: 'wealth',
    name: 'حفظ المال والتملك',
    domain: 'استقرار المعاملات والحقوق',
    penalty: 'حد السرقة والتعزير في الربا',
    wisdom: 'حفظ أموال الناس من النهب والتحايل وأكل أموال الناس بالباطل.',
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
      {/* 1. HERO SECTION WITH METHODOLOGY BLUEPRINT CARD */}
      <section className="hero-panel hero-panel--enhanced" aria-labelledby="home-title">
        <div className="hero-panel__copy">
          <div className="hero-badge">
            <span>برنامج بكالوريا 2026 · مادة العلوم الإسلامية</span>
          </div>

          <h1 id="home-title">{unitContent.metadata.unit_title}</h1>

          <p className="hero-panel__lead">
            منصة تعليمية متكاملة وفق المنهاج الجزائري الرسمي: استوعب المفاهيم بأدلتها الشرعية المشكولة، استعرض الخرائط الذهنية الشاملة، وتدرّب على أسئلة البكالوريا النموذجية مع إمكانية التقييم الذاتي الفوري.
          </p>

          <div className="hero-panel__actions">
            <Link className="button button--copper hero-btn-cta" to="/learn">
              ابدأ بالدرس والمفاهيم <span aria-hidden="true">←</span>
            </Link>
            <Link className="button button--hero-outline" to="/map">
              الخرائط الذهنية
            </Link>
            <Link className="button button--hero-outline" to="/activities">
              الأنشطة والتقويم
            </Link>
          </div>

          <div className="hero-metrics-strip" aria-label="إحصائيات المحتوى">
            <div className="hero-metric-item">
              <strong>4</strong>
              <span>محاور مفاهيمية</span>
            </div>
            <span className="hero-metric-sep" aria-hidden="true">/</span>
            <div className="hero-metric-item">
              <strong>3</strong>
              <span>خرائط ملونة عالية الدقة</span>
            </div>
            <span className="hero-metric-sep" aria-hidden="true">/</span>
            <div className="hero-metric-item">
              <strong>10</strong>
              <span>بطاقات مراجعة ذكية</span>
            </div>
            <span className="hero-metric-sep" aria-hidden="true">/</span>
            <div className="hero-metric-item">
              <strong>13</strong>
              <span>تطبيق بكالوريا بالحل</span>
            </div>
          </div>
        </div>

        {/* REPLACING STATIC NUMBER 6 WITH PURPOSEFUL BLUEPRINT CARD */}
        <div className="hero-panel__art-wrapper">
          <aside className="hero-blueprint-card" aria-label="معمارية الوحدة ومقاصد المنهج الإسلامي">
            <header className="hero-blueprint-card__header">
              <span className="blueprint-tag">معمارية الوحدة ومقاصدها</span>
              <h2 className="blueprint-title">تكامل ركائز المنهج الإسلامي</h2>
            </header>

            <div className="hero-blueprint-card__pillars">
              {/* Pillar 1: Preventive Approach */}
              <div className="blueprint-pillar blueprint-pillar--prevention">
                <div className="blueprint-pillar__head">
                  <span className="pillar-badge">01 · المنهج الوقائي</span>
                  <span className="pillar-timing">قبلي (استباقي)</span>
                </div>
                <p className="pillar-aim">بناء الوازع الذاتي وتحصين الفرد قبل وقوع الجريمة:</p>
                <ul className="pillar-points">
                  <li>تقوية الإيمان والصلة بالله واليوم الآخر</li>
                  <li>المحافظة على العبادات والتزكية النفسية</li>
                  <li>إشاعة مكارم الأخلاق والفضائل الاجتماعية</li>
                </ul>
              </div>

              {/* Pillar 2: Remedial / Punitive Approach */}
              <div className="blueprint-pillar blueprint-pillar--treatment">
                <div className="blueprint-pillar__head">
                  <span className="pillar-badge">02 · المنهج العلاجي</span>
                  <span className="pillar-timing">بعدي (زجري وعلاجي)</span>
                </div>
                <p className="pillar-aim">تشريع العقوبات العادلة لحفظ المجتمع واستقراره:</p>
                <ul className="pillar-points">
                  <li><strong>الحدود:</strong> مقدرة شرعاً حقاً لله ولا تقبل العفو</li>
                  <li><strong>القصاص والدية:</strong> حفظ النفس مع قبول العفو</li>
                  <li><strong>التعزير:</strong> عقوبات غير مقدرة مفوضة للقاضي</li>
                </ul>
              </div>
            </div>

            {/* Unifying Ultimate Purpose */}
            <footer className="hero-blueprint-card__target">
              <div className="target-head">
                <span className="target-tag">الغاية المشتركة والمقصد الأسمى</span>
              </div>
              <p className="target-summary">
                <strong>حفظ الضروريات الخمس:</strong> الدين · النفس · العقل · النسل والعرض · المال
              </p>
            </footer>
          </aside>
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

              <div className="pathway-card__highlights">
                <span className="highlights-title">عناصر المحطة:</span>
                <ul>
                  {path.highlights.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              </div>

              <footer className="pathway-card__footer">
                <Link className="button button--small button--navy pathway-card__btn" to={path.to}>
                  {path.action} <span aria-hidden="true">←</span>
                </Link>
              </footer>
            </article>
          ))}
        </div>
      </section>

      {/* 3. THE 5 PRESERVED NECESSITIES MATRIX */}
      <section className="necessities-section" aria-labelledby="necessities-title">
        <header className="section-intro">
          <div>
            <p className="eyebrow">ربط العقوبات بالمقاصد</p>
            <h2 id="necessities-title">الكليات الخمس وعقوباتها في الوحدة</h2>
          </div>
          <p>
            كل عقوبة شُرعت في الإسلام هدفها حماية ضرورة من مقاصد الشريعة الخمسة لاستقرار المجتمع وكرامة الإنسان:
          </p>
        </header>

        <div className="necessities-grid">
          {necessities.map((item, idx) => (
            <article className="necessity-card" key={item.id}>
              <header className="necessity-card__header">
                <span className="necessity-card__idx">0{idx + 1}</span>
                <h3 className="necessity-card__title">{item.name}</h3>
              </header>
              <span className="necessity-card__domain">{item.domain}</span>
              <div className="necessity-card__penalty">
                <span className="penalty-tag">العقوبة المقررة:</span>
                <strong className="penalty-value">{item.penalty}</strong>
              </div>
              <p className="necessity-card__wisdom">{item.wisdom}</p>
            </article>
          ))}
        </div>
      </section>

      {/* 4. LEARNING CONTINUITY & PROGRESS DASHBOARD */}
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
            {/* Top metric overview */}
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

            {/* Bottom progress bar & resume CTA */}
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
