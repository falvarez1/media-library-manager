import { useState, useEffect } from 'react';
import { useDataSource } from '../hooks/useApi';
import config from '../services/config';

/**
 * Component for configuring data source options
 * Allows toggling between real and mock API, and configuring related settings
 */
export default function DataSourceConfig() {
  const { isUsingRealApi, apiBaseUrl, dataSource, config: currentConfig } = useDataSource();
  
  // Local state for form values
  const [formValues, setFormValues] = useState({
    useRealApi: isUsingRealApi,
    apiBaseUrl: apiBaseUrl,
    mockDelayMin: currentConfig.mock.delay.min,
    mockDelayMax: currentConfig.mock.delay.max,
    mockDelayFixed: currentConfig.mock.delay.fixed || '',
    mockErrorRate: currentConfig.mock.errorRate,
    saved: false
  });

  // Update form when config changes
  useEffect(() => {
    setFormValues({
      useRealApi: isUsingRealApi,
      apiBaseUrl: apiBaseUrl,
      mockDelayMin: currentConfig.mock.delay.min,
      mockDelayMax: currentConfig.mock.delay.max,
      mockDelayFixed: currentConfig.mock.delay.fixed || '',
      mockErrorRate: currentConfig.mock.errorRate,
      saved: false
    });
  }, [isUsingRealApi, apiBaseUrl, currentConfig]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormValues(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
              type === 'number' ? (value === '' ? '' : Number(value)) : 
              value,
      saved: false
    }));
  };

  // Save configuration
  const handleSave = (e) => {
    e.preventDefault();
    
    // Update configuration
    config.updateConfig({
      useRealApi: formValues.useRealApi,
      apiBaseUrl: formValues.apiBaseUrl,
      mock: {
        delay: {
          min: Number(formValues.mockDelayMin),
          max: Number(formValues.mockDelayMax),
          fixed: formValues.mockDelayFixed === '' ? null : Number(formValues.mockDelayFixed)
        },
        errorRate: Number(formValues.mockErrorRate)
      }
    });
    
    // Show saved message
    setFormValues(prev => ({
      ...prev,
      saved: true
    }));
    
    // Hide saved message after 2 seconds
    setTimeout(() => {
      setFormValues(prev => ({
        ...prev,
        saved: false
      }));
    }, 2000);
  };

  // Reset to defaults
  const handleReset = () => {
    // Determine default values based on environment
    const defaultValues = {
      useRealApi: process.env.NODE_ENV === 'production',
      apiBaseUrl: 'http://localhost:5005',
      mockDelayMin: 200,
      mockDelayMax: 800,
      mockDelayFixed: '',
      mockErrorRate: 0.05
    };
    
    // Update state
    setFormValues({
      ...defaultValues,
      saved: false
    });
    
    // Update config
    config.updateConfig({
      useRealApi: defaultValues.useRealApi,
      apiBaseUrl: defaultValues.apiBaseUrl,
      mock: {
        delay: {
          min: defaultValues.mockDelayMin,
          max: defaultValues.mockDelayMax,
          fixed: null
        },
        errorRate: defaultValues.mockErrorRate
      }
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-medium text-gray-800">Data Source Configuration</h3>
        <div className="flex items-center">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            isUsingRealApi 
              ? 'bg-green-100 text-green-800' 
              : 'bg-blue-100 text-blue-800'
          }`}>
            {dataSource} API
          </span>
        </div>
      </div>
      
      <form onSubmit={handleSave} className="p-4">
        {/* API Source Toggle */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <label htmlFor="useRealApi" className="block text-sm font-medium text-gray-700">Use Real API</label>
            <div className="relative inline-block w-10 mr-2 align-middle select-none">
              <input 
                type="checkbox" 
                name="useRealApi" 
                id="useRealApi"
                checked={formValues.useRealApi}
                onChange={handleChange}
                className="sr-only"
              />
              <div className={`block h-6 rounded-full w-12 cursor-pointer ${formValues.useRealApi ? 'bg-green-400' : 'bg-gray-300'}`}></div>
              <div className={`absolute left-1 top-1 bg-white border-2 rounded-full h-4 w-4 transition-transform transform ${formValues.useRealApi ? 'translate-x-6 border-green-400' : 'border-gray-300'}`}></div>
            </div>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            {formValues.useRealApi 
              ? "Using real API endpoints for data" 
              : "Using mock data system (simulated API)"}
          </p>
        </div>
        
        {/* API Base URL */}
        <div className="mb-4">
          <label htmlFor="apiBaseUrl" className="block text-sm font-medium text-gray-700">
            API Base URL
          </label>
          <input
            type="text"
            name="apiBaseUrl"
            id="apiBaseUrl"
            value={formValues.apiBaseUrl}
            onChange={handleChange}
            disabled={!formValues.useRealApi}
            className={`mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm text-sm ${!formValues.useRealApi ? 'bg-gray-50 text-gray-500' : ''}`}
            placeholder="https://api.example.com/v1"
          />
          <p className="mt-1 text-xs text-gray-500">
            Base URL for API requests when using real API
          </p>
        </div>
        
        {/* Mock Config Section */}
        <div className={`mb-4 ${formValues.useRealApi ? 'opacity-50' : ''}`}>
          <h4 className="font-medium text-gray-700 text-sm mb-2">Mock Data Configuration</h4>
          
          {/* Mock Delay */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
            <div>
              <label htmlFor="mockDelayMin" className="block text-xs font-medium text-gray-700">
                Min Delay (ms)
              </label>
              <input
                type="number"
                name="mockDelayMin"
                id="mockDelayMin"
                value={formValues.mockDelayMin}
                onChange={handleChange}
                disabled={formValues.useRealApi || formValues.mockDelayFixed !== ''}
                min="0"
                className={`mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm text-sm ${(formValues.useRealApi || formValues.mockDelayFixed !== '') ? 'bg-gray-50 text-gray-500' : ''}`}
              />
            </div>
            <div>
              <label htmlFor="mockDelayMax" className="block text-xs font-medium text-gray-700">
                Max Delay (ms)
              </label>
              <input
                type="number"
                name="mockDelayMax"
                id="mockDelayMax"
                value={formValues.mockDelayMax}
                onChange={handleChange}
                disabled={formValues.useRealApi || formValues.mockDelayFixed !== ''}
                min="0"
                className={`mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm text-sm ${(formValues.useRealApi || formValues.mockDelayFixed !== '') ? 'bg-gray-50 text-gray-500' : ''}`}
              />
            </div>
            <div>
              <label htmlFor="mockDelayFixed" className="block text-xs font-medium text-gray-700">
                Fixed Delay (ms)
              </label>
              <input
                type="number"
                name="mockDelayFixed"
                id="mockDelayFixed"
                value={formValues.mockDelayFixed}
                onChange={handleChange}
                disabled={formValues.useRealApi}
                min="0"
                placeholder="Override min/max"
                className={`mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm text-sm ${formValues.useRealApi ? 'bg-gray-50 text-gray-500' : ''}`}
              />
            </div>
          </div>
          
          {/* Error Rate */}
          <div className="mb-3">
            <label htmlFor="mockErrorRate" className="block text-xs font-medium text-gray-700">
              Error Rate ({Math.round(formValues.mockErrorRate * 100)}%)
            </label>
            <input
              type="range"
              name="mockErrorRate"
              id="mockErrorRate"
              value={formValues.mockErrorRate}
              onChange={handleChange}
              disabled={formValues.useRealApi}
              min="0"
              max="1"
              step="0.01"
              className={`mt-1 block w-full ${formValues.useRealApi ? 'opacity-50' : ''}`}
            />
            <p className="mt-1 text-xs text-gray-500">
              Rate at which mock API calls will randomly fail
            </p>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-between items-center mt-6">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Reset to Defaults
          </button>
          
          <div className="flex items-center">
            {formValues.saved && (
              <span className="mr-3 text-green-600 text-sm">Settings saved!</span>
            )}
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}