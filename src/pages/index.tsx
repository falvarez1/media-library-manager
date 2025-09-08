// import dynamic from 'next/dynamic';
import Link from 'next/link';
import AppWithProviders from '../components/AppWithProviders';

// TEMPORARY: Testing without dynamic import to diagnose context issue
// const AppWithProviders = dynamic(() => import('../components/AppWithProviders'), { 
//   ssr: false,
//   loading: () => <div className="flex items-center justify-center h-screen">Loading...</div>
// });

export default function Home() {
  return (
    <>
      <AppWithProviders />
      {process.env.NODE_ENV === 'development' && (
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 1000
          }}
        >
          <Link href="/mock-explorer"            
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px 15px',
                backgroundColor: '#3B82F6',
                color: 'white',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 'bold',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
            >
            <span style={{ marginRight: '8px' }}>📊</span>
            Mock Explorer          
          </Link>
        </div>
      )}
    </>
  );
}
