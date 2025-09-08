import dynamic from 'next/dynamic';
import React from 'react';

const TestContextDebug = dynamic(() => import('../components/TestContextDebug'), { 
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-screen">Loading...</div>
});

export default function TestContextDebugPage() {
  return <TestContextDebug />;
}