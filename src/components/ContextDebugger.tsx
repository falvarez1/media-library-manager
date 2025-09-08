'use client';

import React, { useEffect, useRef } from 'react';
import { useUIState } from '../contexts/UIStateContext';

/**
 * Debug component to monitor UIState context changes
 * Only renders in development mode
 */
export const ContextDebugger: React.FC = () => {
  const uiState = useUIState();
  const renderCount = useRef(0);
  const previousShowDetails = useRef(uiState.showDetails);

  useEffect(() => {
    renderCount.current++;
  });

  useEffect(() => {
    if (previousShowDetails.current !== uiState.showDetails) {
      console.log(
        '[ContextDebugger] showDetails changed from',
        previousShowDetails.current,
        'to',
        uiState.showDetails
      );
      previousShowDetails.current = uiState.showDetails;
    }
  }, [uiState.showDetails]);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '80px',
        right: '20px',
        padding: '10px',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        borderRadius: '8px',
        fontSize: '12px',
        fontFamily: 'monospace',
        zIndex: 9999,
        maxWidth: '300px'
      }}
    >
      <div>Render Count: {renderCount.current}</div>
      <div>showDetails: {String(uiState.showDetails)}</div>
      <div>showSidebar: {String(uiState.showSidebar)}</div>
      <div>quickViewItem: {uiState.quickViewItem || 'null'}</div>
      <button
        onClick={() => {
          console.log('[ContextDebugger] Testing setDetailsVisible(true)');
          uiState.setDetailsVisible(true);
        }}
        style={{
          marginTop: '5px',
          padding: '2px 5px',
          fontSize: '11px'
        }}
      >
        Test Show Details
      </button>
      <button
        onClick={() => {
          console.log('[ContextDebugger] Testing setDetailsVisible(false)');
          uiState.setDetailsVisible(false);
        }}
        style={{
          marginTop: '5px',
          marginLeft: '5px',
          padding: '2px 5px',
          fontSize: '11px'
        }}
      >
        Test Hide Details
      </button>
    </div>
  );
};

export default ContextDebugger;