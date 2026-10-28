import { Link } from 'react-router-dom';
import { unitContent } from '../data';
import { useProgress } from '../context/useProgress';
import { ProgressBar } from '../components/ProgressBar';
import { ResetProgressButton } from '../components/ResetProgressButton';

const pathways = [
  { number: '01', title: 'تعلّم', copy: 'اقرأ المحاور الأربعة على مهل، مع تعريفات وشواهد وجداول قابلة للمراجعة.', to: '/learn', action: 'افتح الدرس', tone: 'navy' },
  { number: '02', title: 'استكشف', copy: 'تتبّع فروع الوحدة الستة، وانتقل من الخريطة إلى موضوع الدرس المرتبط.', to: '/map', action: 'افتح الخريطة', tone: 'copper' },
  { number: '03', title: 'تدرّب', copy: 'صنّف الأمثلة، وطابق الجريمة بنوع العقوبة، وقارن بين الأنواع.', to: '/activities', action: 'ابدأ نشاطًا', tone: 'sage' },
  { number: '04', title: 'قيّم نفسك', copy: 'جرّب أسئلة الاختبار، ثم راجع التفسير والبطاقات وتطبيقات الوحدة.', to: '/quiz', action: 'ابدأ الاختبار', tone: 'ink' },
];

const routeLabels: Record<string, string> = {
  '/learn': 'الدرس', '/map': 'الخريطة المفاهيمية', '/activities': 'الأنشطة', '/quiz': 'الاختبار',
  '/flashcards': 'البطاقات', '/bac': 'تدريب الوحدة',
};

export function HomePage() {
  const { progress } = useProgress();
  const completed = progress.completedSections.filter((id) => ['concepts', 'prevention', 'penalties', 'wisdom'].includes(id)).length;
  const completedActivities = progress.completedSections.filter((id) => !['concepts', 'prevention', 'penalties', 'wisdom'].includes(id)).length;
  const masteredCards = unitContent.flashcards.filter((card) => progress.masteredFlashcardIds.includes(card.cardId)).length;
  const reviewCards = unitContent.flashcards.filter((card) => progress.reviewFlashcardIds.includes(card.cardId)).length;
  const hasProgress = Boolean(
    completed || completedActivities || progress.lastRoute || progress.latestQuizScore !== undefined ||
    progress.masteredFlashcardIds.length || progress.reviewFlashcardIds.length,
  );
  const resumeRoute = progress.lastRoute && routeLabels[progress.lastRoute] ? progress.lastRoute : '/learn';
  const resumeLabel = progress.lastRoute ? routeLabels[resumeRoute] : 'الدرس';

  return (
    <div className="home-page page-wrap">
      <section className="hero-panel" aria-labelledby="home-title">
        <div className="hero-panel__copy">
          <p className="eyebrow eyebrow--light">الوحدة السادسة · العلوم الإسلامية</p>
          <h1 id="home-title">{unitContent.metadata.unit_title}</h1>
          <p className="hero-panel__lead">تعرّف إلى مفاهيم الانحراف والجريمة، واستكشف أساليب الوقاية والعقوبات، ثم طبّق ما تعلّمته في أنشطة وأسئلة قصيرة.</p>
          <div className="hero-panel__actions">
            <Link className="button button--copper" to="/learn">ابدأ التعلم <span aria-hidden="true">←</span></Link>
            <Link className="button button--hero-outline" to="/map">استكشف الخريطة</Link>
          </div>
        </div>
        <div className="hero-panel__art" aria-hidden="true">
          <div className="hero-ring hero-ring--outer" />
          <div className="hero-ring hero-ring--inner" />
          <div className="hero-art-badge">
            <span className="hero-art-badge__label">الوحدة</span>
            <span className="hero-art-badge__number">06</span>
          </div>
        </div>
      </section>

      <section className="pathway-section" aria-labelledby="pathway-title">
        <div className="section-intro">
          <div><p className="eyebrow">مسار تعلم مرن</p><h2 id="pathway-title">اختر خطوتك التالية</h2></div>
          <p>يمكنك التنقل بحرية بين المحاور والأنشطة، والعودة إلى ما تحتاج مراجعته.</p>
        </div>
        <div className="pathway-grid">
          {pathways.map((path) => (
            <article className={`pathway-card pathway-card--${path.tone}`} key={path.number}>
              <span className="pathway-card__number"><bdi>{path.number}</bdi></span>
              <h3>{path.title}</h3>
              <p>{path.copy}</p>
              <Link className="text-link" to={path.to}>{path.action}<span aria-hidden="true"> ←</span></Link>
            </article>
          ))}
        </div>
      </section>

      {hasProgress && (
        <section className="progress-panel" aria-labelledby="progress-title">
          <div className="progress-panel__top">
            <div><p className="eyebrow">على هذا الجهاز فقط</p><h2 id="progress-title">تابع من حيث وصلت</h2></div>
            <ResetProgressButton compact />
          </div>
          <div className="progress-panel__grid">
            <div>
              <ProgressBar value={completed} max={4} label="محاور الدرس المكتملة" />
              {progress.latestQuizScore !== undefined && <p className="saved-result">آخر نتيجة للاختبار: <strong><bdi>{progress.latestQuizScore}%</bdi></strong>{progress.bestQuizScore !== undefined && <> · الأفضل: <bdi>{progress.bestQuizScore}%</bdi></>}</p>}
              <p className="privacy-inline">يبقى تقدمك على هذا الجهاز ولا يُرسل إلى أي جهة.</p>
            </div>
            <div className="resume-card">
              <span className="resume-card__marker" aria-hidden="true">↶</span>
              <div><strong>آخر مسار زرته</strong><span>{resumeLabel ?? 'الدرس'}</span></div>
              <Link className="button button--outline button--small" to={resumeRoute}>تابع</Link>
            </div>
          </div>
          <p className="progress-panel__note">البطاقات المتقنة: <bdi>{masteredCards}</bdi> · بطاقات للمراجعة: <bdi>{reviewCards}</bdi> · الأنشطة المكتملة: <bdi>{completedActivities}</bdi></p>
        </section>
      )}

    </div>
  );
}
