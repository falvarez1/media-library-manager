'use client';

import React from 'react';
import { AppProviders } from '../contexts/AppProviders';
import App from './App';

/**
 * Bridge component that syncs App.tsx state with context values
 */
const AppBridge: React.FC = () => {
  // Context values are accessed in App component directly

  // Create a modified App component that syncs with contexts
  return (
    <App />
  );
};

/**
 * Root component that provides all contexts and renders the app
 */
export const AppWithContext: React.FC = () => {
  return (
    <AppProviders>
      <AppBridge />
    </AppProviders>
  );
};

export default AppWithContext;