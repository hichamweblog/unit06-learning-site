import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { unitContent } from '../data';
import { PageHeading } from '../components/PageHeading';

const branchDestinations = [
  '/learn?section=0',
  '/learn?section=1',
  '/learn?section=2',
  '/learn?section=3',
  '/learn?section=3',
  '/activities?tab=bac',
];
const destinationLabels = [
  'افتح محور المفاهيم الأساسية',
  'افتح محور المنهج الوقائي',
  'افتح محور المنهج العلاجي',
  'افتح محور الخصائص والحكمة',
  'افتح محور الخصائص والحكمة',
  'افتح تدريبات البكالوريا',
];

interface VisualMap {
  id: string;
  title: string;
  badge: string;
  number: string;
  description: string;
  imageSrc: string;
  fileName: string;
  highlights: string[];
}

const visualMaps: VisualMap[] = [
  {
    id: 'mindmap-buzan',
    title: 'الخريطة الذهنية الشاملة (Buzan Style)',
    badge: 'شجرة الوحدة الكاملة',
    number: '01',
    description: 'خريطة ذهنية تشجيرية شاملة تجمع محاور الوحدة الخمسة بأفرعها وأدلتها الشرعية، صممت لتنشيط الذاكرة البصرية واستحضار عناصر الدرس كاملة في ورقة واحدة.',
    imageSrc: '/images/maps/unit06-mindmap-buzan.jpg',
    fileName: 'خريطة_الوحدة_06_الشاملة.jpg',
    highlights: ['المفاهيم الأساسية', 'المنهج الوقائي', 'المنهج العلاجي وتفصيل العقوبات', 'خصائص العقوبات', 'الحكمة من التشريع'],
  },
  {
    id: 'infographic',
    title: 'الإنفوجرافيك التعليمي والرسوم التوضيحية',
    badge: 'رموز بصرية وإيضاحات',
    number: '02',
    description: 'رسم توضيحي عصري يوضح المنهجين (الوقائي والعلاجي) والفرق بينهما، مع تمثيل بصري للكليات الخمس، وتأديب الجناة، والرحمة بدرء الحدود بالشبهات.',
    imageSrc: '/images/maps/unit06-infographic.jpg',
    fileName: 'إنفوجرافيك_منهج_الإسلام_محاربة_الجريمة.jpg',
    highlights: ['الوقاية قبل وقوع الجريمة', 'العلاج بالردع بعد الجريمة', 'أقسام العقوبات الشرعية', 'الحكمة السامية والكليات الخمس'],
  },
  {
    id: 'integrated-vision',
    title: 'لوحة الرؤية المتكاملة (التأطير التراثي الأصيل)',
    badge: 'تأطير مفاهيمي دقيق',
    number: '03',
    description: 'تصميم تأطيري أصيل يميز بدقة منهجية بين «الانحراف» و«الجريمة»، ويفصّل أحكام الحدود (حق الله)، والقصاص والدية (حق العبد)، والتعزير (السلطة التقديرية للقاضي).',
    imageSrc: '/images/maps/unit06-integrated-vision.jpg',
    fileName: 'لوحة_الرؤية_المتكاملة_الوحدة_06.jpg',
    highlights: ['التمييز بين الانحراف والجريمة', 'عقوبات الحدود والشفاعة', 'القصاص والدية كبديل مالي', 'التعزير والسلطة التقديرية'],
  },
];

function makeStudentBranches() {
  return unitContent.mindMap.branches.map((branch, index) => {
    if (index === 0) return { ...branch, title: '1. المفاهيم الأساسية', sub_items: branch.sub_items.slice(0, 2) };
    if (index === 5) return { ...branch, title: '6. مهارات الإجابة' };
    return branch;
  });
}

export function MapPage() {
  const branches = makeStudentBranches();
  const [viewMode, setViewMode] = useState<'visual' | 'interactive'>('visual');
  const [selectedBranch, setSelectedBranch] = useState(0);
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  const activeBranch = branches[selectedBranch];
  const activeLightboxMap = activeLightboxIndex !== null ? visualMaps[activeLightboxIndex] : null;

  useEffect(() => {
    if (activeLightboxIndex === null) {
      setZoomLevel(1);
      return;
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setActiveLightboxIndex(null);
      } else if (e.key === 'ArrowRight') {
        setActiveLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : visualMaps.length - 1));
        setZoomLevel(1);
      } else if (e.key === 'ArrowLeft') {
        setActiveLightboxIndex((prev) => (prev !== null && prev < visualMaps.length - 1 ? prev + 1 : 0));
        setZoomLevel(1);
      } else if (e.key === '+' || e.key === '=') {
        setZoomLevel((z) => Math.min(z + 0.25, 2.5));
      } else if (e.key === '-') {
        setZoomLevel((z) => Math.max(z - 0.25, 1));
      } else if (e.key === '0') {
        setZoomLevel(1);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeLightboxIndex]);

  return (
    <div className="page-wrap inner-page map-page">
      <PageHeading
        eyebrow="الذاكرة البصرية والمفاهيمية"
        title="الخرائط الذهنية"
        description="استحضر محاور الوحدة وروابطها عبر الخرائط المصوّرة التوضيحية القابلة للتكبير والتحميل، أو تصفح الخريطة التفاعلية الشجرية."
      />

      <nav className="map-view-switcher" aria-label="أنماط عرض الخرائط">
        <button
          type="button"
          className={`map-view-switcher__btn ${viewMode === 'visual' ? 'map-view-switcher__btn--active' : ''}`}
          onClick={() => setViewMode('visual')}
          aria-pressed={viewMode === 'visual'}
        >
          <span className="switcher-icon" aria-hidden="true">🖼️</span>
          <span>الخرائط المصوّرة والإنفوجرافيك</span>
          <span className="switcher-badge">3 خرائط</span>
        </button>
        <button
          type="button"
          className={`map-view-switcher__btn ${viewMode === 'interactive' ? 'map-view-switcher__btn--active' : ''}`}
          onClick={() => setViewMode('interactive')}
          aria-pressed={viewMode === 'interactive'}
        >
          <span className="switcher-icon" aria-hidden="true">🌲</span>
          <span>الخريطة التفاعلية الشجرية</span>
        </button>
      </nav>

      {viewMode === 'visual' ? (
        <section className="visual-maps-section" aria-labelledby="visual-maps-title">
          <div className="section-intro">
            <div>
              <p className="eyebrow">استذكار بصري عالي الدقة</p>
              <h2 id="visual-maps-title">خرائط ذهنية وتأطيرية للمراجعة السريعة</h2>
            </div>
            <p>انقر على أي خريطة لمعاينتها بكامل الشاشة مع إمكانية التكبير والتصغير، أو حمّلها مباشرة للاحتفاظ بها والمراجعة دون إنترنت.</p>
          </div>

          <div className="visual-maps-grid">
            {visualMaps.map((map, index) => (
              <article className="visual-map-card" key={map.id}>
                <div
                  className="visual-map-card__preview"
                  onClick={() => {
                    setActiveLightboxIndex(index);
                    setZoomLevel(1);
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setActiveLightboxIndex(index);
                      setZoomLevel(1);
                    }
                  }}
                  aria-label={`معاينة وتكبير ${map.title}`}
                >
                  <img src={map.imageSrc} alt={map.title} loading="lazy" />
                  <div className="visual-map-card__overlay">
                    <span className="overlay-badge">
                      <span aria-hidden="true">🔍</span> انقر للمعاينة والتكبير
                    </span>
                  </div>
                </div>

                <div className="visual-map-card__content">
                  <div className="card-topline">
                    <span className="card-number"><bdi>{map.number}</bdi></span>
                    <span className="card-badge">{map.badge}</span>
                  </div>
                  <h3>{map.title}</h3>
                  <p className="card-desc">{map.description}</p>

                  <div className="card-chips" aria-label="أهم ما تغطيه الخريطة">
                    {map.highlights.map((h) => (
                      <span className="card-chip" key={h}>{h}</span>
                    ))}
                  </div>

                  <div className="card-actions">
                    <button
                      type="button"
                      className="button button--navy button--small"
                      onClick={() => {
                        setActiveLightboxIndex(index);
                        setZoomLevel(1);
                      }}
                    >
                      معاينة وتكبير <span aria-hidden="true">🔍</span>
                    </button>
                    <a
                      href={map.imageSrc}
                      download={map.fileName}
                      className="button button--outline button--small download-btn"
                      title={`تحميل ${map.title}`}
                    >
                      تحميل الخريطة <span aria-hidden="true">📥</span>
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : (
        <section className="interactive-map-section" aria-label="الخريطة المفاهيمية التفاعلية">
          <div className="map-canvas">
            <div className="map-root">
              <p className="eyebrow">الموضوع الرئيس</p>
              <h2>{unitContent.metadata.unit_title}</h2>
              <span className="map-root__connector" aria-hidden="true" />
            </div>
            <div className="map-branches" role="list" aria-label="فروع الخريطة">
              {branches.map((branch, index) => (
                <article className={`map-branch${selectedBranch === index ? ' map-branch--selected' : ''}`} role="listitem" key={branch.title}>
                  <button
                    className="map-branch__button"
                    type="button"
                    aria-pressed={selectedBranch === index}
                    aria-describedby={`branch-summary-${index}`}
                    onClick={() => setSelectedBranch(index)}
                  >
                    <span className="map-branch__index"><bdi>{String(index + 1).padStart(2, '0')}</bdi></span>
                    <span className="map-branch__title">{branch.title}</span>
                    <span className="map-branch__chevron" aria-hidden="true">{selectedBranch === index ? '−' : '+'}</span>
                  </button>
                  <p id={`branch-summary-${index}`} className="map-branch__summary">{branch.sub_items[0]}</p>
                </article>
              ))}
            </div>
          </div>

          {activeBranch && (
            <section className="map-detail" aria-live="polite" aria-labelledby="map-detail-title">
              <div className="map-detail__heading">
                <span className="map-detail__badge"><bdi>{String(selectedBranch + 1).padStart(2, '0')}</bdi></span>
                <div>
                  <p className="eyebrow">عناصر الفرع</p>
                  <h2 id="map-detail-title">{activeBranch.title}</h2>
                </div>
              </div>
              <ul className="map-detail__items">
                {activeBranch.sub_items.map((item) => (
                  <li key={item}><span aria-hidden="true">◇</span>{item}</li>
                ))}
              </ul>
              <Link className="button button--navy" to={branchDestinations[selectedBranch] ?? '/learn'}>
                {destinationLabels[selectedBranch] ?? 'انتقل إلى الدرس'} <span aria-hidden="true">←</span>
              </Link>
            </section>
          )}

          <p className="map-access-note">
            <span aria-hidden="true">ⓘ</span> الخريطة مكتوبة كنص وأزرار قابلة للتشغيل بلوحة المفاتيح؛ لا يعتمد التفاعل على رسم أو لون وحده.
          </p>
        </section>
      )}

      {/* Lightbox Modal */}
      {activeLightboxMap && (
        <div
          className="map-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={activeLightboxMap.title}
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveLightboxIndex(null);
          }}
        >
          <div className="map-lightbox__dialog">
            <header className="map-lightbox__header">
              <div className="map-lightbox__title">
                <span className="map-lightbox__badge">{activeLightboxMap.badge}</span>
                <h3>{activeLightboxMap.title}</h3>
              </div>
              <div className="map-lightbox__controls">
                <div className="zoom-controls">
                  <button
                    type="button"
                    className="zoom-btn"
                    onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 1))}
                    disabled={zoomLevel <= 1}
                    aria-label="تصغير"
                    title="تصغير (-)"
                  >
                    −
                  </button>
                  <span className="zoom-value">{Math.round(zoomLevel * 100)}%</span>
                  <button
                    type="button"
                    className="zoom-btn"
                    onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 2.5))}
                    disabled={zoomLevel >= 2.5}
                    aria-label="تكبير"
                    title="تكبير (+)"
                  >
                    +
                  </button>
                  {zoomLevel !== 1 && (
                    <button
                      type="button"
                      className="zoom-reset-btn"
                      onClick={() => setZoomLevel(1)}
                      title="إعادة ضبط الحجم (0)"
                    >
                      إعادة ضبط
                    </button>
                  )}
                </div>
                <a
                  href={activeLightboxMap.imageSrc}
                  download={activeLightboxMap.fileName}
                  className="button button--outline button--small lightbox-download"
                  title="تحميل بجودة كاملة"
                >
                  تحميل 📥
                </a>
                <button
                  type="button"
                  className="map-lightbox__close"
                  onClick={() => setActiveLightboxIndex(null)}
                  aria-label="إغلاق المعاينة"
                  title="إغلاق (Esc)"
                >
                  ✕
                </button>
              </div>
            </header>

            <div className="map-lightbox__body">
              <div
                className="map-lightbox__canvas"
                style={{
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: 'center center',
                  cursor: zoomLevel > 1 ? 'grab' : 'zoom-in',
                }}
                onClick={() => {
                  if (zoomLevel === 1) setZoomLevel(1.6);
                  else if (zoomLevel > 1.8) setZoomLevel(1);
                  else setZoomLevel((z) => Math.min(z + 0.5, 2.5));
                }}
              >
                <img src={activeLightboxMap.imageSrc} alt={activeLightboxMap.title} />
              </div>
            </div>

            <footer className="map-lightbox__footer">
              <button
                type="button"
                className="button button--outline button--small"
                onClick={() => {
                  setActiveLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : visualMaps.length - 1));
                  setZoomLevel(1);
                }}
              >
                ← الخريطة السابقة
              </button>
              <span className="map-lightbox__indicator">
                خريطة <bdi>{(activeLightboxIndex ?? 0) + 1}</bdi> من <bdi>{visualMaps.length}</bdi>
              </span>
              <button
                type="button"
                className="button button--outline button--small"
                onClick={() => {
                  setActiveLightboxIndex((prev) => (prev !== null && prev < visualMaps.length - 1 ? prev + 1 : 0));
                  setZoomLevel(1);
                }}
              >
                الخريطة التالية →
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
