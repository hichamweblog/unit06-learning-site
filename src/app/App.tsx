import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ProgressProvider } from '../context/ProgressProvider';
import { SiteLayout } from './SiteLayout';
import { ErrorBoundary } from '../components/ErrorBoundary';

const HomePage = lazy(() => import('../features/HomePage').then((m) => ({ default: m.HomePage })));
const LearnPage = lazy(() => import('../features/LearnPage').then((m) => ({ default: m.LearnPage })));
const MapPage = lazy(() => import('../features/MapPage').then((m) => ({ default: m.MapPage })));
const ActivitiesPage = lazy(() => import('../features/ActivitiesPage').then((m) => ({ default: m.ActivitiesPage })));
const NotFoundPage = lazy(() => import('../features/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

function LoadingFallback() {
  return (
    <div className="loading-fallback" role="status">
      <div className="loading-fallback__spinner" />
      <p>جارٍ التحميل…</p>
    </div>
  );
}

export function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ProgressProvider>
          <SiteLayout>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/learn" element={<LearnPage />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="/activities" element={<ActivitiesPage />} />
                <Route path="/quiz" element={<Navigate to="/activities?tab=quiz" replace />} />
                <Route path="/flashcards" element={<Navigate to="/activities?tab=flashcards" replace />} />
                <Route path="/bac" element={<Navigate to="/activities?tab=bac" replace />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </SiteLayout>
        </ProgressProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

