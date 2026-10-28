import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app/App';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'activated' && navigator.serviceWorker.controller) {
                // Show a non-intrusive update notification
                const notice = document.createElement('div');
                notice.className = 'sw-update-notice';
                notice.setAttribute('role', 'status');
                notice.innerHTML = '<span>تحديث جديد متاح.</span><button onclick="location.reload()">تحديث</button>';
                document.body.appendChild(notice);
              }
            });
          }
        });
      })
      .catch(() => {
        // Core content remains available online if service-worker registration is blocked.
      });
  });
}

