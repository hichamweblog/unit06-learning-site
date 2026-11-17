import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { unitPath } from '../lib/site';
import { useUnit } from '../context/useUnit';
import { PageHeading } from '../components/PageHeading';

export function MapPage() {
  const unit = useUnit();
  const branches = unit.mindMap.branches;
  const visualMaps = unit.gallery.map((item) => ({
    id: item.id,
    title: item.title,
    badge: item.badge ?? '',
    imageSrc: item.src,
    fileName: item.fileName ?? item.id,
  }));
  const destinations = branches.map((branch) => {
    const index = branch.sectionId ? unit.sectionIds.indexOf(branch.sectionId) : -1;
    return `${unitPath(unit.slug, 'learn')}?section=${index >= 0 ? index : 0}`;
  });
  const destinationLabels = branches.map((branch) => `افتح محور ${branch.title}`);
  const [viewMode, setViewMode] = useState<'visual' | 'interactive'>('visual');
  const [currentMapIndex, setCurrentMapIndex] = useState(0);
  const [selectedBranch, setSelectedBranch] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const currentMap = visualMaps[currentMapIndex] ?? visualMaps[0]!;
  const activeBranch = branches[selectedBranch];
  const hasGallery = visualMaps.length > 0;
  const effectiveView = hasGallery ? viewMode : 'interactive';

  const handlePrev = useCallback(() => {
    setCurrentMapIndex((prev) => (prev > 0 ? prev - 1 : visualMaps.length - 1));
    setZoomLevel(1);
  }, [visualMaps.length]);

  const handleNext = useCallback(() => {
    setCurrentMapIndex((prev) => (prev < visualMaps.length - 1 ? prev + 1 : 0));
    setZoomLevel(1);
  }, [visualMaps.length]);

  function handleTouchStart(e: React.TouchEvent) {
    const touch = e.touches[0];
    if (touch) setTouchStartX(touch.clientX);
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX === null) return;
    const touch = e.changedTouches[0];
    if (!touch) return;
    const touchEndX = touch.clientX;
    const diff = touchStartX - touchEndX;
    // In RTL: swipe left (diff > 50) means next, swipe right (diff < -50) means prev
    if (diff > 50) {
      handleNext();
    } else if (diff < -50) {
      handlePrev();
    }
    setTouchStartX(null);
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (viewMode !== 'visual') return;
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
        setZoomLevel(1);
      } else if (e.key === 'ArrowRight') {
        handlePrev();
      } else if (e.key === 'ArrowLeft') {
        handleNext();
      } else if (isFullscreen && (e.key === '+' || e.key === '=')) {
        setZoomLevel((z) => Math.min(z + 0.25, 2.5));
      } else if (isFullscreen && e.key === '-') {
        setZoomLevel((z) => Math.max(z - 0.25, 1));
      } else if (isFullscreen && e.key === '0') {
        setZoomLevel(1);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, isFullscreen, handleNext, handlePrev]);

  return (
    <div className="page-wrap inner-page map-page">
      <PageHeading
        eyebrow="الذاكرة البصرية والمفاهيمية"
        title="الخرائط الذهنية"
        description="استحضر محاور الوحدة وروابطها عبر الخرائط المصوّرة مع إمكانية التمرير والتكبير والتحميل، أو تصفح الخريطة التفاعلية."
      />

      {hasGallery && (
      <nav className="map-view-switcher" aria-label="أنماط عرض الخرائط">
        <button
          type="button"
          className={`map-view-switcher__btn ${viewMode === 'visual' ? 'map-view-switcher__btn--active' : ''}`}
          onClick={() => setViewMode('visual')}
          aria-pressed={viewMode === 'visual'}
        >
          <span>الخرائط المصوّرة</span>
        </button>
        <button
          type="button"
          className={`map-view-switcher__btn ${viewMode === 'interactive' ? 'map-view-switcher__btn--active' : ''}`}
          onClick={() => setViewMode('interactive')}
          aria-pressed={viewMode === 'interactive'}
        >
          <span>الخريطة التفاعلية</span>
        </button>
      </nav>
      )}

      {effectiveView === 'visual' && currentMap ? (
        <section className="visual-maps-section" aria-label="الخرائط المصورة">
          {/* Main Visual Map Viewer / Slider */}
          <div className="map-viewer-container">
            <header className="map-viewer-header">
              <div className="map-viewer-title">
                <span className="map-viewer-badge">{currentMap.badge}</span>
                <h3>{currentMap.title}</h3>
              </div>
              <div className="map-viewer-actions">
                <button
                  type="button"
                  className="button button--small button--outline"
                  onClick={() => {
                    setIsFullscreen(true);
                    setZoomLevel(1);
                  }}
                >
                  ملء الشاشة
                </button>
                <a
                  href={currentMap.imageSrc}
                  download={currentMap.fileName}
                  className="button button--small button--navy"
                  title="تحميل بجودة كاملة"
                >
                  تحميل الخريطة
                </a>
              </div>
            </header>

            <div
              className="map-viewer-stage"
              onClick={() => {
                setIsFullscreen(true);
                setZoomLevel(1);
              }}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setIsFullscreen(true);
                }
              }}
              aria-label={`تكبير ${currentMap.title}`}
            >
              <button
                type="button"
                className="map-stage-nav-btn map-stage-nav-btn--prev"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                aria-label="الخريطة السابقة"
                title="الخريطة السابقة"
              >
                ›
              </button>

              <img src={currentMap.imageSrc} alt={currentMap.title} />

              <button
                type="button"
                className="map-stage-nav-btn map-stage-nav-btn--next"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                aria-label="الخريطة التالية"
                title="الخريطة التالية"
              >
                ‹
              </button>

              <div className="stage-overlay">
                <span className="stage-overlay-text">انقر للتكبير بكامل الشاشة</span>
              </div>
            </div>

            <footer className="map-viewer-footer">
              <button
                type="button"
                className="button button--outline button--small"
                onClick={handlePrev}
                aria-label="الخريطة السابقة"
              >
                الخريطة السابقة
              </button>

              <div className="map-viewer-center-ctrls">
                <div className="map-viewer-dots" role="tablist" aria-label="اختيار الخريطة">
                  {visualMaps.map((map, idx) => (
                    <button
                      key={map.id}
                      type="button"
                      role="tab"
                      aria-selected={idx === currentMapIndex}
                      aria-label={map.title}
                      className={`map-viewer-dot ${idx === currentMapIndex ? 'map-viewer-dot--active' : ''}`}
                      onClick={() => {
                        setCurrentMapIndex(idx);
                        setZoomLevel(1);
                      }}
                    />
                  ))}
                </div>
                <span className="map-viewer-counter">
                  خريطة <bdi>{currentMapIndex + 1}</bdi> من <bdi>{visualMaps.length}</bdi>
                </span>
              </div>

              <button
                type="button"
                className="button button--outline button--small"
                onClick={handleNext}
                aria-label="الخريطة التالية"
              >
                الخريطة التالية
              </button>
            </footer>
          </div>
        </section>
      ) : (
        <section className="interactive-map-section" aria-label="الخريطة المفاهيمية التفاعلية">
          <div className="map-canvas">
            <div className="map-root">
              <p className="eyebrow">الموضوع الرئيس</p>
              <h2>{unit.title}</h2>
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
                  <p id={`branch-summary-${index}`} className="map-branch__summary">{branch.items[0]}</p>
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
                {activeBranch.items.map((item) => (
                  <li key={item}><span aria-hidden="true">◇</span>{item}</li>
                ))}
              </ul>
              <Link className="button button--navy" to={destinations[selectedBranch] ?? unitPath(unit.slug, 'learn')}>
                {destinationLabels[selectedBranch] ?? 'انتقل إلى الدرس'} <span aria-hidden="true">←</span>
              </Link>
            </section>
          )}

          <p className="map-access-note">
            الخريطة مكتوبة كنص وأزرار قابلة للتشغيل بلوحة المفاتيح؛ لا يعتمد التفاعل على رسم أو لون وحده.
          </p>
        </section>
      )}

      {/* Fullscreen Lightbox Modal */}
      {isFullscreen && (
        <div
          className="map-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={currentMap.title}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsFullscreen(false);
          }}
        >
          <div className="map-lightbox__dialog">
            <header className="map-lightbox__header">
              <div className="map-lightbox__title">
                <span className="map-lightbox__badge">{currentMap.badge}</span>
                <h3>{currentMap.title}</h3>
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
                  href={currentMap.imageSrc}
                  download={currentMap.fileName}
                  className="button button--outline button--small lightbox-download"
                  title="تحميل بجودة كاملة"
                >
                  تحميل الخريطة
                </a>
                <button
                  type="button"
                  className="map-lightbox__close"
                  onClick={() => setIsFullscreen(false)}
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
                <img src={currentMap.imageSrc} alt={currentMap.title} />
              </div>
            </div>

            <footer className="map-lightbox__footer">
              <button
                type="button"
                className="button button--outline button--small"
                onClick={handlePrev}
                aria-label="الخريطة السابقة"
              >
                ← الخريطة السابقة
              </button>
              <span className="map-lightbox__indicator">
                خريطة <bdi>{currentMapIndex + 1}</bdi> من <bdi>{visualMaps.length}</bdi>
              </span>
              <button
                type="button"
                className="button button--outline button--small"
                onClick={handleNext}
                aria-label="الخريطة التالية"
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
