import { MotionConfig } from 'motion/react';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import { App } from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import './styles.css';

const Router = import.meta.env.VITE_ROUTER_MODE === 'hash' ? HashRouter : BrowserRouter;

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Router>
        <MotionConfig reducedMotion="user">
          <App />
        </MotionConfig>
      </Router>
    </ErrorBoundary>
  </React.StrictMode>,
);
