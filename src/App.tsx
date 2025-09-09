import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AppWithProviders from './components/AppWithProviders';
import MockDataExplorer from './pages/mock-explorer';

function App() {
  return (
    <Routes>
      <Route path="/" element={<AppWithProviders />} />
      <Route path="/mock-explorer" element={<MockDataExplorer />} />
    </Routes>
  );
}

export default App;