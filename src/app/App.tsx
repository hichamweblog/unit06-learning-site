import { type ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { ProgressProvider } from '../context/ProgressProvider';
import { UnitProvider } from '../context/UnitProvider';
import { SiteLayout } from './SiteLayout';
import { SeoManager } from './SeoManager';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { defaultUnit } from '../data/units/registry';
import { PlatformHomePage } from '../features/PlatformHomePage';
import { UnitHomePage } from '../features/UnitHomePage';
import { LearnPage } from '../features/LearnPage';
import { MapPage } from '../features/MapPage';
import { ActivitiesPage } from '../features/ActivitiesPage';
import { QuizPage } from '../features/QuizPage';
import { FlashcardsPage } from '../features/FlashcardsPage';
import { BacPage } from '../features/BacPage';
import { AboutPage } from '../features/AboutPage';
import { NotFoundPage } from '../features/NotFoundPage';

/** يحوّل الروابط القديمة (`/learn`) إلى مسار الوحدة الجديد مع الحفاظ على الاستعلام */
function LegacyRedirect({ page, tab }: { page: 'learn' | 'map' | 'activities'; tab?: string }) {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  if (tab) params.set('tab', tab);
  const query = params.toString();
  return (
    <Navigate
      to={`/units/${defaultUnit?.slug ?? 'unit-06'}/${page}${query ? `?${query}` : ''}`}
      replace
    />
  );
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PlatformHomePage />} />
      <Route path="/about" element={<AboutPage />} />

      <Route path="/units/:slug" element={<UnitProvider><UnitHomePage /></UnitProvider>} />
      <Route path="/units/:slug/learn" element={<UnitProvider><LearnPage /></UnitProvider>} />
      <Route path="/units/:slug/map" element={<UnitProvider><MapPage /></UnitProvider>} />
      <Route path="/units/:slug/activities" element={<UnitProvider><ActivitiesPage /></UnitProvider>} />
      <Route path="/units/:slug/quiz" element={<UnitProvider><QuizPage /></UnitProvider>} />
      <Route path="/units/:slug/flashcards" element={<UnitProvider><FlashcardsPage /></UnitProvider>} />
      <Route path="/units/:slug/bac" element={<UnitProvider><BacPage /></UnitProvider>} />

      <Route path="/learn" element={<LegacyRedirect page="learn" />} />
      <Route path="/map" element={<LegacyRedirect page="map" />} />
      <Route path="/activities" element={<LegacyRedirect page="activities" />} />
      <Route path="/quiz" element={<LegacyRedirect page="activities" tab="quiz" />} />
      <Route path="/flashcards" element={<LegacyRedirect page="activities" tab="flashcards" />} />
      <Route path="/bac" element={<LegacyRedirect page="activities" tab="bac" />} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

/** كل المزوّدات المشتركة بين المتصفح والخادم (تُستخدم أيضًا في توليد الصفحات الثابتة) */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <ProgressProvider>
        <SeoManager />
        <SiteLayout>{children}</SiteLayout>
      </ProgressProvider>
    </ErrorBoundary>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AppProviders>
        <AppRoutes />
      </AppProviders>
    </BrowserRouter>
  );
}
