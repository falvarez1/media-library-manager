import { useDataSource } from '../hooks/useApi';

/**
 * Component that displays the current data source configuration
 * Provides a visual indicator of whether the app is using mock or real data
 */
export default function DataSourceIndicator() {
  const { isUsingRealApi, dataSource, apiBaseUrl, config } = useDataSource();

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className={`p-2 ${isUsingRealApi ? 'bg-green-500' : 'bg-blue-500'}`}>
        <div className="flex justify-between items-center">
          <h3 className="font-medium text-white">
            Data Source: <span className="font-bold">{dataSource.toUpperCase()}</span>
          </h3>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            isUsingRealApi 
              ? 'bg-green-100 text-green-800' 
              : 'bg-blue-100 text-blue-800'
          }`}>
            {isUsingRealApi ? 'REAL API' : 'MOCK DATA'}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        {isUsingRealApi ? (
          <div>
            <div className="mb-2">
              <span className="text-sm text-gray-500">API Base URL:</span>
              <span className="ml-2 text-sm font-medium">{apiBaseUrl}</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-700">
                Using real API endpoints for data requests
              </span>
            </div>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-3 gap-4 mb-2">
              <div>
                <span className="text-xs text-gray-500 block">Delay Range:</span>
                <span className="text-sm font-medium">
                  {config.mock.delay.fixed !== null 
                    ? `${config.mock.delay.fixed}ms (fixed)` 
                    : `${config.mock.delay.min}-${config.mock.delay.max}ms`}
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-500 block">Error Rate:</span>
                <span className="text-sm font-medium">
                  {Math.round(config.mock.errorRate * 100)}%
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-500 block">Mode:</span>
                <span className="text-sm font-medium">
                  Simulated API
                </span>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-700">
                Using mock data system (simulated API responses)
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}