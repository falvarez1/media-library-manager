import dynamic from 'next/dynamic';
import Link from 'next/link';

// Use dynamic import with SSR disabled to prevent hydration errors
// with Lucide icons and other client-side only dependencies
const App = dynamic(() => import('../components/App'), { ssr: false });

export default function Home() {
  return (
    <>
      <App />
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
