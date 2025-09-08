import React, { useState } from 'react';
import { useUIState } from '../contexts/UIStateContext';
import { useNavigation } from '../contexts/NavigationContext';
import { AppProviders } from '../contexts';

function TestContextContent() {
  const { showDetails, setDetailsVisible } = useUIState();
  const { selectedMediaId, setSelectedMediaId } = useNavigation();
  const [localState, setLocalState] = useState(false);

  const handleTestContext = () => {
    console.log('[TestContext] Setting showDetails to true');
    setDetailsVisible(true);
    setSelectedMediaId('test-123');
  };

  const handleTestLocal = () => {
    setLocalState(true);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Context Test Page</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Context State:</h2>
        <p>showDetails: <strong>{String(showDetails)}</strong></p>
        <p>selectedMediaId: <strong>{selectedMediaId || 'null'}</strong></p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Local State (Control):</h2>
        <p>localState: <strong>{String(localState)}</strong></p>
      </div>

      <div>
        <button 
          onClick={handleTestContext}
          style={{ 
            padding: '10px 20px', 
            marginRight: '10px',
            background: '#3B82F6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Test Context Update
        </button>
        
        <button 
          onClick={handleTestLocal}
          style={{ 
            padding: '10px 20px', 
            marginRight: '10px',
            background: '#10B981',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Test Local Update
        </button>

        <button 
          onClick={() => {
            setDetailsVisible(false);
            setSelectedMediaId(null);
            setLocalState(false);
          }}
          style={{ 
            padding: '10px 20px',
            background: '#EF4444',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Reset All
        </button>
      </div>

      {showDetails && (
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          background: '#D1FAE5',
          border: '2px solid #10B981',
          borderRadius: '4px'
        }}>
          <strong>✓ Context is working! Details panel should be visible.</strong>
        </div>
      )}
    </div>
  );
}

export default function TestContext() {
  return (
    <AppProviders>
      <TestContextContent />
    </AppProviders>
  );
}