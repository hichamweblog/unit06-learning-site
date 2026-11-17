import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import { AppProviders, AppRoutes } from './app/App';

/** يُستخدم أثناء البناء فقط لتوليد HTML ثابت لكل مسار (prerender). */
export function render(url: string): string {
  return renderToString(
    <StrictMode>
      <StaticRouter location={url}>
        <AppProviders>
          <AppRoutes />
        </AppProviders>
      </StaticRouter>
    </StrictMode>,
  );
}
