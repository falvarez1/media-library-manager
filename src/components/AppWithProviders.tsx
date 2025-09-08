'use client';

import React from 'react';
import { AppProviders } from '../contexts';
import App from './App';

/**
 * App component wrapped with all context providers
 * This ensures providers and App component are loaded together
 */
export const AppWithProviders: React.FC = () => {
  return (
    <AppProviders>
      <App />
    </AppProviders>
  );
};

export default AppWithProviders;