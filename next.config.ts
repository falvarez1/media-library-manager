import type { NextConfig } from "next";

/**
 * Next.js configuration
 * Includes data source configuration options for controlling API vs mock data
 */
const nextConfig: NextConfig = {
  /* Core Next.js options */
  reactStrictMode: true,
  
  /* Environment variable defaults based on environment */
  env: {
    // API configuration
    NEXT_PUBLIC_USE_REAL_API: process.env.NEXT_PUBLIC_USE_REAL_API || (process.env.NODE_ENV === 'production' ? 'true' : 'false'),
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://api.medialibrary.example.com/v1',
    
    // Mock configuration
    NEXT_PUBLIC_MOCK_DELAY_MIN: process.env.NEXT_PUBLIC_MOCK_DELAY_MIN || '200',
    NEXT_PUBLIC_MOCK_DELAY_MAX: process.env.NEXT_PUBLIC_MOCK_DELAY_MAX || '800',
    NEXT_PUBLIC_MOCK_DELAY_FIXED: process.env.NEXT_PUBLIC_MOCK_DELAY_FIXED || '',
    NEXT_PUBLIC_MOCK_ERROR_RATE: process.env.NEXT_PUBLIC_MOCK_ERROR_RATE || '0.05',
  },
  
  /* Make config available on client-side */
  publicRuntimeConfig: {
    apiConfig: {
      useRealApi: process.env.NEXT_PUBLIC_USE_REAL_API === 'true',
      apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://api.medialibrary.example.com/v1',
    },
    mockConfig: {
      delayMin: parseInt(process.env.NEXT_PUBLIC_MOCK_DELAY_MIN || '200', 10),
      delayMax: parseInt(process.env.NEXT_PUBLIC_MOCK_DELAY_MAX || '800', 10),
      delayFixed: process.env.NEXT_PUBLIC_MOCK_DELAY_FIXED ?
        parseInt(process.env.NEXT_PUBLIC_MOCK_DELAY_FIXED, 10) : null,
      errorRate: parseFloat(process.env.NEXT_PUBLIC_MOCK_ERROR_RATE || '0.05'),
    }
  }
};

export default nextConfig;
