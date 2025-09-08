'use client';

import React, { useEffect } from 'react';
import { AppProviders } from '../contexts/AppProviders';
import { useUIState } from '../contexts/UIStateContext';
import { useNavigation } from '../contexts/NavigationContext';
import App from './App';

/**
 * Bridge component that syncs App.tsx state with context values
 */
const AppBridge: React.FC = () => {
  const { 
    showSidebar, 
    showDetails, 
    setSidebarVisible, 
    setDetailsVisible 
  } = useUIState();
  
  const { 
    selectedMediaId, 
    setSelectedMediaId 
  } = useNavigation();

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