'use client';

import React, { useState, useEffect } from 'react';
import { AppProviders } from '../contexts';
import { useUIState } from '../contexts/UIStateContext';

const ContextTester: React.FC = () => {
  const uiState = useUIState();
  const [localState, setLocalState] = useState(false);
  const [renderCount, setRenderCount] = useState(0);

  useEffect(() => {
    setRenderCount(c => c + 1);
  });

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-8">Context State Update Test</h1>
      
      <div className="space-y-6">
        {/* Local State Test */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <h2 className="text-lg font-semibold mb-2">Local State (Control)</h2>
          <p className="mb-2">Local State: <strong>{String(localState)}</strong></p>
          <button
            onClick={() => setLocalState(!localState)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Toggle Local State
          </button>
        </div>

        {/* Context State Test */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <h2 className="text-lg font-semibold mb-2">UIState Context</h2>
          <p className="mb-2">showDetails: <strong className="text-lg">{String(uiState.showDetails)}</strong></p>
          <p className="mb-2">showSidebar: <strong>{String(uiState.showSidebar)}</strong></p>
          <p className="mb-4">Component Render Count: <strong>{renderCount}</strong></p>
          
          <div className="space-x-2">
            <button
              onClick={() => {
                console.log('[TestContextDebug] Calling setDetailsVisible(true)');
                uiState.setDetailsVisible(true);
              }}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Set Details Visible (true)
            </button>
            <button
              onClick={() => {
                console.log('[TestContextDebug] Calling setDetailsVisible(false)');
                uiState.setDetailsVisible(false);
              }}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Set Details Visible (false)
            </button>
            <button
              onClick={() => {
                console.log('[TestContextDebug] Calling toggleDetails()');
                uiState.toggleDetails();
              }}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              Toggle Details
            </button>
          </div>
        </div>

        {/* Direct Dispatch Test */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <h2 className="text-lg font-semibold mb-2">Other Context Actions</h2>
          <div className="space-x-2">
            <button
              onClick={() => uiState.toggleSidebar()}
              className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
            >
              Toggle Sidebar
            </button>
            <button
              onClick={() => uiState.setSidebarTab('collections')}
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              Set Tab to Collections
            </button>
          </div>
        </div>

        {/* Console Instructions */}
        <div className="border rounded-lg p-4 bg-blue-50">
          <h2 className="text-lg font-semibold mb-2">Debug Instructions</h2>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Open browser console (F12)</li>
            <li>Click buttons to test state updates</li>
            <li>Watch for console logs showing dispatch calls</li>
            <li>Verify that showDetails value changes above</li>
            <li>Check if component re-renders (render count increases)</li>
          </ol>
        </div>

        {/* State Snapshot */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <h2 className="text-lg font-semibold mb-2">Full UIState Snapshot</h2>
          <pre className="text-xs bg-gray-800 text-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify({
              showSidebar: uiState.showSidebar,
              sidebarTab: uiState.sidebarTab,
              showDetails: uiState.showDetails,
              quickViewItem: uiState.quickViewItem,
              showImageEditor: uiState.showImageEditor,
              editingMedia: uiState.editingMedia,
              theme: uiState.theme,
              viewMode: uiState.viewMode,
              gridSize: uiState.gridSize
            }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

const TestContextDebug: React.FC = () => {
  return (
    <AppProviders>
      <ContextTester />
    </AppProviders>
  );
};

export default TestContextDebug;