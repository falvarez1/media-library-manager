import dynamic from 'next/dynamic';

// Use dynamic import with SSR disabled to prevent hydration errors
// with Lucide icons and other client-side only dependencies
const App = dynamic(() => import('../components/App'), { ssr: false });

export default function Home() {
  return <App />;
}
