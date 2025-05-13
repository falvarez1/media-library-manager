# Data Source Configuration

This document explains the data source configuration system in Media Library Manager, which allows switching between real API calls and mock data for development, testing, and production environments.

## Overview

Media Library Manager provides a flexible data source switching mechanism that enables developers to:

- Toggle between real API endpoints and the built-in mock data system
- Configure API connection parameters
- Customize mock data behavior including response delays and error simulation
- Persist configuration preferences across sessions

The data source configuration is designed to be flexible and can be managed through multiple methods to suit different workflows and environments.

## Configuration Options

### Core Options

| Option | Description | Default Value |
|--------|-------------|---------------|
| `useRealApi` | Whether to use real API endpoints (`true`) or mock data (`false`) | `false` in development, `true` in production |
| `apiBaseUrl` | Base URL for API requests when using real API | `https://api.medialibrary.example.com/v1` |

### Mock Data Options

These options control the behavior of the mock data system when `useRealApi` is set to `false`:

| Option | Description | Default Value |
|--------|-------------|---------------|
| `mock.delay.min` | Minimum delay for mock responses (ms) | `200` |
| `mock.delay.max` | Maximum delay for mock responses (ms) | `800` |
| `mock.delay.fixed` | Fixed delay value (overrides min/max when set) | `null` |
| `mock.errorRate` | Rate at which mock API calls randomly fail (0-1) | `0.05` (5%) |

### API Connection Options

These options control the behavior when connecting to real API endpoints (`useRealApi` is `true`):

| Option | Description | Default Value |
|--------|-------------|---------------|
| `api.timeout` | Timeout for API requests (ms) | `30000` |
| `api.withCredentials` | Whether to include credentials (cookies) with requests | `true` |

## Configuration Methods

Media Library Manager provides multiple ways to configure the data source:

### 1. Environment Variables

Set environment variables in your `.env` files or deployment environment:

```env
# API Configuration
NEXT_PUBLIC_USE_REAL_API=false
NEXT_PUBLIC_API_URL=https://api.medialibrary.example.com/v1

# Mock Configuration
NEXT_PUBLIC_MOCK_DELAY_MIN=200
NEXT_PUBLIC_MOCK_DELAY_MAX=800
NEXT_PUBLIC_MOCK_DELAY_FIXED=
NEXT_PUBLIC_MOCK_ERROR_RATE=0.05
```

### 2. Next.js Runtime Configuration

The application uses Next.js runtime configuration in `next.config.ts` to provide defaults and make environment variables available client-side:

```javascript
// next.config.ts
const nextConfig = {
  // ...
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
```

### 3. UI Configuration Interface

The application provides a UI for toggling data source settings in the Mock Explorer page (accessible at `/mock-explorer`). This interface allows runtime adjustments to data source settings, with changes persisted to localStorage for a consistent experience across refreshes.

### 4. Programmatic Configuration

For more advanced use cases, you can update configuration programmatically:

```javascript
import config from '../services/config';

// Update and persist configuration
config.updateConfig({
  useRealApi: true,
  apiBaseUrl: 'https://custom-api.example.com/v2',
  mock: {
    delay: {
      min: 100,
      max: 500
    },
    errorRate: 0.1
  }
});
```

## Configuration Precedence

The system follows this precedence order for configuration values:

1. **Local Storage** - Highest priority, used for persisting user preferences
2. **Next.js Runtime Config** - From environment variables
3. **Default Values** - Fallback values defined in the code

## Examples

### Development Mode

Default configuration for local development:

```env
NEXT_PUBLIC_USE_REAL_API=false
NEXT_PUBLIC_MOCK_DELAY_MIN=200
NEXT_PUBLIC_MOCK_DELAY_MAX=800
NEXT_PUBLIC_MOCK_ERROR_RATE=0.05
```

This setup uses mock data with realistic response delays and occasional errors to simulate a production-like environment while developing.

### Testing with Real API

Configuration for testing with a staging API:

```env
NEXT_PUBLIC_USE_REAL_API=true
NEXT_PUBLIC_API_URL=https://api-staging.medialibrary.example.com/v1
```

This connects to a staging API server for integration testing.

### Production Deployment

Typical production configuration:

```env
NEXT_PUBLIC_USE_REAL_API=true
NEXT_PUBLIC_API_URL=https://api.medialibrary.example.com/v1
```

### Quick Local Development

For rapid local development with instant responses:

```env
NEXT_PUBLIC_USE_REAL_API=false
NEXT_PUBLIC_MOCK_DELAY_FIXED=0
NEXT_PUBLIC_MOCK_ERROR_RATE=0
```

This uses mock data with instant responses and no simulated errors.

## Integration with Application Code

The data source configuration is available throughout the application via hooks and direct imports:

### Using the Data Source Hook

```javascript
import { useDataSource } from '../hooks/useApi';

function MyComponent() {
  const { isUsingRealApi, dataSource, apiBaseUrl, config } = useDataSource();
  
  return (
    <div>
      <p>Currently using {dataSource} data</p>
      {isUsingRealApi && <p>Connected to: {apiBaseUrl}</p>}
    </div>
  );
}
```

### Direct Import

```javascript
import config from '../services/config';

// Check current configuration
if (config.useRealApi) {
  // Real API logic
} else {
  // Mock data logic
}
```

## Troubleshooting

### Common Issues

#### Mock Data Not Loading

If the mock data system isn't working correctly:

1. Check that `useRealApi` is set to `false`
2. Verify that the mock modules are properly imported
3. Look for console errors related to mock data initialization

#### API Connection Problems

If you're having trouble connecting to the real API:

1. Verify that `useRealApi` is set to `true`
2. Check that `apiBaseUrl` is correct and accessible
3. Inspect the Network tab in browser DevTools for API errors
4. Ensure CORS is properly configured on the API server if seeing related errors

#### Configuration Not Persisting

If your configuration changes aren't persisting:

1. Check if localStorage is available in your browser
2. Clear browser cache and localStorage to reset to default values
3. Verify that the `updateConfig` method is being called properly

## Additional Resources

- [Setup Guide](./setup-guide.md) - General application setup information
- [Mock System Documentation](../src/mocks/README.md) - Details about the mock data system
- [Data Source Test Page](http://localhost:3000/data-source-test) - Interactive testing interface for data operations

## Testing Data Source Integration

The Media Library Manager includes a comprehensive test page at `/data-source-test` specifically designed to validate the refactored data management system. This page provides an interactive environment to test both mock and real API integration.

### Test Page Features

- Dynamic switching between mock and real data sources
- Testing all core data operations (read, create, update, delete)
- Simulation of loading states with configurable delays
- Error handling testing with customizable error rates
- Visual indicators for current data source configuration
- Interactive UI controls for testing different entity types

### Accessing the Test Page

The test page is available at:
```
http://localhost:3000/data-source-test
```

### Testing Examples

#### Reading Data

The test page demonstrates how to use the data hooks with proper loading state and error handling:

```jsx
function ReadExample() {
  // Using the data hook for the selected entity type
  const { data, loading, error, refetch } = useMedia({ page: 1, pageSize: 5 });
  
  if (loading) {
    return <div>Loading data...</div>;
  }
  
  if (error) {
    return <div>Error: {error.message}</div>;
  }
  
  return (
    <div>
      <div>Displaying {data.items.length} items</div>
      <button onClick={() => refetch()}>Refresh Data</button>
    </div>
  );
}
```

#### Creating Data

Example of creating new data with error handling:

```jsx
async function createMediaItem(data) {
  try {
    const api = (await import('../services')).default;
    const response = await api.media.createMedia(data);
    return response.data;
  } catch (err) {
    console.error('Creation failed:', err);
    throw err;
  }
}
```

#### Testing Loading States

The test page provides examples of different loading state presentations:

```jsx
function LoadingStateExample({ loading }) {
  return (
    <div>
      {/* Spinner Example */}
      {loading && (
        <div className="flex items-center justify-center">
          <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}
      
      {/* Skeleton Example */}
      {loading && (
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
        </div>
      )}
    </div>
  );
}
```

#### Error Handling

The test page showcases various error handling patterns:

```jsx
function ErrorHandlingExample({ error, retry }) {
  if (!error) return null;
  
  switch (error.name) {
    case 'NetworkError':
      return (
        <div className="p-4 bg-red-50 rounded-md border border-red-200">
          <p>Network error: Check your connection and try again.</p>
          <button onClick={retry}>Retry</button>
        </div>
      );
      
    case 'AuthenticationError':
      return (
        <div className="p-4 bg-red-50 rounded-md border border-red-200">
          <p>Your session has expired. Please log in again.</p>
          <button>Log In</button>
        </div>
      );
      
    default:
      return (
        <div className="p-4 bg-red-50 rounded-md border border-red-200">
          <p>Error: {error.message}</p>
          <button onClick={retry}>Retry</button>
        </div>
      );
  }
}
```

### Testing Best Practices

Based on the test page implementation, here are some best practices for testing data source integration:

1. **Always handle loading states** - Every data operation should properly indicate when it's in progress
2. **Implement comprehensive error handling** - Catch and display errors with appropriate UI feedback
3. **Support data refreshing** - Include mechanisms to retry operations and refresh data
4. **Test both mock and real data sources** - Regularly toggle between sources to ensure consistent behavior
5. **Simulate edge cases** - Use error simulation to test how your UI handles various failure scenarios
6. **Visual indicators** - Provide clear visual feedback about the current data source configuration
7. **Support pagination** - Test data fetching with different page sizes and pagination controls
8. **Verify error recovery** - Ensure components can recover from errors when data becomes available

### Data Source Indicator

The test page includes a reusable `DataSourceIndicator` component that provides visual feedback about the current data source:

```jsx
import { useDataSource } from '../hooks/useApi';

function DataSourceIndicator() {
  const { isUsingRealApi, dataSource } = useDataSource();
  
  return (
    <div className={`p-2 ${isUsingRealApi ? 'bg-green-100' : 'bg-blue-100'}`}>
      <div className="flex justify-between items-center">
        <h3>
          Data Source: <span>{dataSource.toUpperCase()}</span>
        </h3>
        <span>
          {isUsingRealApi ? 'REAL API' : 'MOCK DATA'}
        </span>
      </div>
    </div>
  );
}
```

This component can be integrated into any page to provide users with a clear indication of which data source is currently active.