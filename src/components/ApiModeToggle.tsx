/**
 * API Mode Toggle Component
 * Allows users to switch between mock and real API
 */

import React from 'react';
import { Database, Cloud } from 'lucide-react';
import { isUsingMockApi, switchApiMode } from '../services/api';

export const ApiModeToggle: React.FC = () => {
  const isMock = isUsingMockApi();
  
  const handleToggle = () => {
    const confirmMessage = isMock 
      ? 'Switch to real backend API? The page will reload.'
      : 'Switch to mock data? The page will reload.';
      
    if (confirm(confirmMessage)) {
      switchApiMode(!isMock);
    }
  };
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={handleToggle}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg transition-all ${
          isMock 
            ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
            : 'bg-green-500 hover:bg-green-600 text-white'
        }`}
        title={isMock ? 'Using Mock Data' : 'Using Real Backend'}
      >
        {isMock ? (
          <>
            <Database size={18} />
            <span className="text-sm font-medium">Mock Data</span>
          </>
        ) : (
          <>
            <Cloud size={18} />
            <span className="text-sm font-medium">Real Backend</span>
          </>
        )}
      </button>
    </div>
  );
};

export default ApiModeToggle;