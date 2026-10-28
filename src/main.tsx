import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './styles/editorial.css';
import { LocaleProvider } from './i18n/index.tsx';
import './styles/result-card.css';
import './styles/style.css';
createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LocaleProvider>
      <App />
    </LocaleProvider>
  </React.StrictMode>,
);
