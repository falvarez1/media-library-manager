import { useState, useEffect } from 'react';
import { useDataSource } from '../hooks/useApi';
import config from '../services/config';
import {
  BaseComponentProps,
  EventHandler,
  ChangeEvent,
  FormEvent
} from '../types';

// ============================================================================
// INTERFACES
// ============================================================================

interface DataSourceFormValues {
  useRealApi: boolean;
  apiBaseUrl: string;
  mockDelayMin: number | string;
  mockDelayMax: number | string;
  mockDelayFixed: number | string;
  mockErrorRate: number;
  saved: boolean;
}

interface DataSourceConfigProps extends BaseComponentProps {}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Component for configuring data source options
 * Allows toggling between real and mock API, and configuring related settings
 */
const DataSourceConfig: React.FC<DataSourceConfigProps> = ({ 
  className, 
  testId 
}) => {
  const { isUsingRealApi, apiBaseUrl, config: currentConfig } = useDataSource();
  
  // Local state for form values
  const [formValues, setFormValues] = useState<DataSourceFormValues>({
    useRealApi: isUsingRealApi,
    apiBaseUrl: apiBaseUrl,
    mockDelayMin: currentConfig.mock?.delay?.min || 100,
    mockDelayMax: currentConfig.mock?.delay?.max || 500,
    mockDelayFixed: currentConfig.mock?.delay?.fixed || '',
    mockErrorRate: currentConfig.mock?.errorRate || 0,
    saved: false
  });

  // Update form when config changes
  useEffect(() => {
    setFormValues({
      useRealApi: isUsingRealApi,
      apiBaseUrl: apiBaseUrl,
      mockDelayMin: currentConfig.mock?.delay?.min || 100,
      mockDelayMax: currentConfig.mock?.delay?.max || 500,
      mockDelayFixed: currentConfig.mock?.delay?.fixed || '',
      mockErrorRate: currentConfig.mock?.errorRate || 0,
      saved: false
    });
  }, [isUsingRealApi, apiBaseUrl, currentConfig]);

  // Handle form input changes
  const handleChange: EventHandler<ChangeEvent<HTMLInputElement>> = (e) => {
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
  const handleSave: EventHandler<FormEvent<HTMLFormElement>> = (e) => {
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
  const handleReset = (): void => {
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
    
    // Update config immediately
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
    <div 
      className={`bg-white rounded-lg shadow overflow-hidden ${className || ''}`}
      data-testid={testId}
    >
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          Data Source Configuration
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Configure whether to use real API or mock data for development
        </p>
      </div>
      
      <form onSubmit={handleSave} className="p-6">
        <div className="space-y-6">
          {/* API Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900">
                Use Real API
              </label>
              <p className="text-sm text-gray-500">
                Toggle between real backend and mock data
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="useRealApi"
                checked={formValues.useRealApi}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* API Base URL */}
          {formValues.useRealApi && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Base URL
              </label>
              <input
                type="url"
                name="apiBaseUrl"
                value={formValues.apiBaseUrl}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="http://localhost:5005"
                required
              />
            </div>
          )}

          {/* Mock Configuration */}
          {!formValues.useRealApi && (
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900">Mock Data Settings</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Delay (ms)
                  </label>
                  <input
                    type="number"
                    name="mockDelayMin"
                    value={formValues.mockDelayMin}
                    onChange={handleChange}
                    min="0"
                    max="5000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Delay (ms)
                  </label>
                  <input
                    type="number"
                    name="mockDelayMax"
                    value={formValues.mockDelayMax}
                    onChange={handleChange}
                    min="0"
                    max="5000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fixed Delay (ms) - Leave empty for random delay
                </label>
                <input
                  type="number"
                  name="mockDelayFixed"
                  value={formValues.mockDelayFixed}
                  onChange={handleChange}
                  min="0"
                  max="5000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Leave empty for random delay"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Error Rate (0-1)
                </label>
                <input
                  type="number"
                  name="mockErrorRate"
                  value={formValues.mockErrorRate}
                  onChange={handleChange}
                  min="0"
                  max="1"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Reset to Defaults
          </button>
          
          <div className="flex items-center space-x-3">
            {formValues.saved && (
              <span className="text-sm text-green-600 flex items-center">
                ✓ Configuration saved
              </span>
            )}
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default DataSourceConfig;