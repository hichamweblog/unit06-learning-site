import { useEffect, useState, type ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useProgress } from '../context/useProgress';
import { getUnit } from '../data/units/registry';
import { StorageNotice } from '../components/StorageNotice';
import { site, unitPath } from '../lib/site';

function getInitialTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  try {
    return localStorage.getItem('unit06_theme') === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function SiteLayout({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme);
  const [openOnPath, setOpenOnPath] = useState<string | null>(null);
  const location = useLocation();
  const menuOpen = openOnPath === location.pathname;
  const { updateProgress } = useProgress();

  const unitSlug = location.pathname.match(/^\/units\/([a-z0-9-]+)/)?.[1];
  const currentUnit = getUnit(unitSlug);

  const navigation = [
    { to: '/', label: 'الوحدات', end: true },
    ...(currentUnit
      ? [
          { to: unitPath(currentUnit.slug, 'learn'), label: 'الدرس' },
          { to: unitPath(currentUnit.slug, 'map'), label: 'الخرائط' },
          { to: unitPath(currentUnit.slug, 'activities'), label: 'الأنشطة' },
        ]
      : []),
    { to: '/about', label: 'المنهجية' },
  ];

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  function toggleTheme() {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    try {
      localStorage.setItem('unit06_theme', nextTheme);
    } catch {
      // storage unavailable
    }
    document.documentElement.setAttribute('data-theme', nextTheme);
  }

  useEffect(() => {
    if (location.pathname !== '/') updateProgress({ lastRoute: location.pathname });
  }, [location.pathname, updateProgress]);

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">انتقل إلى المحتوى</a>
      <header className="site-header">
        <div className="site-header__inner">
          <Link className="brand" to="/" aria-label={`${site.name}: الصفحة الرئيسية`}>
            <span className="brand__mark" aria-hidden="true">م</span>
            <span className="brand__text">
              <strong>{site.name}</strong>
              <small>{currentUnit ? `الوحدة ${currentUnit.number} · ${currentUnit.shortTitle ?? currentUnit.title}` : site.tagline}</small>
            </span>
          </Link>

          <nav id="primary-navigation" className={`primary-navigation ${menuOpen ? 'primary-navigation--open' : ''}`} aria-label="التنقل الرئيسي">
            {navigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={'end' in item ? item.end : false}
                className={({ isActive }) => `nav-link${isActive ? ' nav-link--active' : ''}`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="site-header__controls">
            <button
              className="theme-toggle"
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'التبديل إلى الوضع النهاري' : 'التبديل إلى الوضع الليلي'}
              title={theme === 'dark' ? 'التبديل إلى الوضع النهاري' : 'التبديل إلى الوضع الليلي'}
            >
              {theme === 'dark' ? (
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                </svg>
              )}
            </button>

            <button
              className="menu-toggle"
              type="button"
              aria-expanded={menuOpen}
              aria-controls="primary-navigation"
              onClick={() => setOpenOnPath((openPath) => (openPath === location.pathname ? null : location.pathname))}
            >
              <span aria-hidden="true">{menuOpen ? '×' : '☰'}</span>
              <span className="sr-only">{menuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}</span>
            </button>
          </div>
        </div>
      </header>

      <StorageNotice />
      <main id="main-content" className="site-main" tabIndex={-1}>{children}</main>

      <footer className="site-footer">
        <div className="site-footer__inner">
          <Link to="/" className="footer-brand">
            {site.name}
            <span>{site.tagline}</span>
          </Link>
          <p>تقدّمك محفوظ على هذا الجهاز فقط، ولا تُرسل إجاباتك إلى أي جهة.</p>
        </div>
        <div className="site-footer__bottom">
          <Link to="/about">المنهجية والمصادر</Link>
          <span>·</span>
          <span>تعلّم، تدرّب، وراجع بطاقات الوحدة.</span>
        </div>
      </footer>
    </div>
  );
}
