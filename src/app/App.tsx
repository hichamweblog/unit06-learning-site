import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ProgressProvider } from '../context/ProgressProvider';
import { SiteLayout } from './SiteLayout';
import { ErrorBoundary } from '../components/ErrorBoundary';

const HomePage = lazy(() => import('../features/HomePage').then((m) => ({ default: m.HomePage })));
const LearnPage = lazy(() => import('../features/LearnPage').then((m) => ({ default: m.LearnPage })));
const MapPage = lazy(() => import('../features/MapPage').then((m) => ({ default: m.MapPage })));
const ActivitiesPage = lazy(() => import('../features/ActivitiesPage').then((m) => ({ default: m.ActivitiesPage })));
const QuizPage = lazy(() => import('../features/QuizPage').then((m) => ({ default: m.QuizPage })));
const FlashcardsPage = lazy(() => import('../features/FlashcardsPage').then((m) => ({ default: m.FlashcardsPage })));
const BacPage = lazy(() => import('../features/BacPage').then((m) => ({ default: m.BacPage })));
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
                <Route path="/quiz" element={<QuizPage />} />
                <Route path="/flashcards" element={<FlashcardsPage />} />
                <Route path="/bac" element={<BacPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </SiteLayout>
        </ProgressProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

