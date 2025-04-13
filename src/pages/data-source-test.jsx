import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { 
  useApi, 
  useDataSource, 
  useMedia, 
  useFolders, 
  useCollections,
  useTags 
} from '../hooks/useApi';
import DataSourceConfig from '../components/DataSourceConfig';
import DataSourceIndicator from '../components/DataSourceIndicator';
import config from '../services/config';

export default function DataSourceTestPage() {
  const [activeTest, setActiveTest] = useState('read');
  const [selectedEntity, setSelectedEntity] = useState('media');
  const [testResult, setTestResult] = useState(null);
  const [errorSimulation, setErrorSimulation] = useState({
    enabled: false,
    rate: 0.5,
    originalRate: 0
  });
  
  const { isUsingRealApi, dataSource } = useDataSource();
  
  // Track original error rate to restore it later
  useEffect(() => {
    setErrorSimulation(prev => ({
      ...prev,
      originalRate: config.mock.errorRate
    }));
  }, []);

  // Enable/disable error simulation
  useEffect(() => {
    if (errorSimulation.enabled) {
      config.updateConfig({
        mock: {
          errorRate: errorSimulation.rate
        }
      });
    } else {
      config.updateConfig({
        mock: {
          errorRate: errorSimulation.originalRate
        }
      });
    }
  }, [errorSimulation.enabled, errorSimulation.rate]);

  const handleTestChange = (test) => {
    setActiveTest(test);
    setTestResult(null);
  };

  const handleEntityChange = (entity) => {
    setSelectedEntity(entity);
    setTestResult(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800">Data Source Test</h1>
          <p className="text-gray-500 mt-1">
            Test and verify the data management system implementation
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Data Source Indicator */}
        <div className="mb-6">
          <DataSourceIndicator />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Configuration */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-medium text-gray-800">Test Configuration</h2>
              </div>
              <div className="p-4">
                {/* Test Type Selector */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Test Type</label>
                  <div className="flex flex-col space-y-2">
                    <TestButton 
                      label="Read Operations" 
                      isActive={activeTest === 'read'} 
                      onClick={() => handleTestChange('read')} 
                    />
                    <TestButton 
                      label="Create Operations" 
                      isActive={activeTest === 'create'} 
                      onClick={() => handleTestChange('create')} 
                    />
                    <TestButton 
                      label="Update Operations" 
                      isActive={activeTest === 'update'} 
                      onClick={() => handleTestChange('update')} 
                    />
                    <TestButton 
                      label="Delete Operations" 
                      isActive={activeTest === 'delete'} 
                      onClick={() => handleTestChange('delete')} 
                    />
                    <TestButton 
                      label="Loading States" 
                      isActive={activeTest === 'loading'} 
                      onClick={() => handleTestChange('loading')} 
                    />
                    <TestButton 
                      label="Error Handling" 
                      isActive={activeTest === 'error'} 
                      onClick={() => handleTestChange('error')} 
                    />
                  </div>
                </div>

                {/* Entity Type Selector */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Entity Type</label>
                  <div className="flex flex-col space-y-2">
                    <TestButton 
                      label="Media" 
                      isActive={selectedEntity === 'media'} 
                      onClick={() => handleEntityChange('media')} 
                    />
                    <TestButton 
                      label="Folders" 
                      isActive={selectedEntity === 'folders'} 
                      onClick={() => handleEntityChange('folders')} 
                    />
                    <TestButton 
                      label="Collections" 
                      isActive={selectedEntity === 'collections'} 
                      onClick={() => handleEntityChange('collections')} 
                    />
                    <TestButton 
                      label="Tags" 
                      isActive={selectedEntity === 'tags'} 
                      onClick={() => handleEntityChange('tags')} 
                    />
                  </div>
                </div>
                
                {/* Error Simulation Controls */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="errorSimulation" className="block text-sm font-medium text-gray-700">
                      Error Simulation
                    </label>
                    <div className="relative inline-block w-10 mr-2 align-middle select-none">
                      <input 
                        type="checkbox" 
                        id="errorSimulation"
                        checked={errorSimulation.enabled}
                        onChange={(e) => setErrorSimulation(prev => ({
                          ...prev,
                          enabled: e.target.checked
                        }))}
                        className="sr-only"
                      />
                      <div className={`block h-6 rounded-full w-12 cursor-pointer ${errorSimulation.enabled ? 'bg-red-400' : 'bg-gray-300'}`}></div>
                      <div className={`absolute left-1 top-1 bg-white border-2 rounded-full h-4 w-4 transition-transform transform ${errorSimulation.enabled ? 'translate-x-6 border-red-400' : 'border-gray-300'}`}></div>
                    </div>
                  </div>
                  <div className={errorSimulation.enabled ? '' : 'opacity-50'}>
                    <label htmlFor="errorRate" className="block text-xs font-medium text-gray-700">
                      Error Rate ({Math.round(errorSimulation.rate * 100)}%)
                    </label>
                    <input
                      type="range"
                      id="errorRate"
                      value={errorSimulation.rate}
                      onChange={(e) => setErrorSimulation(prev => ({
                        ...prev,
                        rate: parseFloat(e.target.value)
                      }))}
                      disabled={!errorSimulation.enabled}
                      min="0"
                      max="1"
                      step="0.1"
                      className="mt-1 block w-full"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Controls how often the mock API will return errors
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Data Source Configuration */}
            <div className="mb-6">
              <DataSourceConfig />
            </div>
          </div>

          {/* Right Column - Test Results */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="font-medium text-gray-800">
                  {getTestTitle(activeTest, selectedEntity)}
                </h2>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  isUsingRealApi ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {dataSource} API
                </span>
              </div>
              <div className="p-4">
                <TestPanel 
                  testType={activeTest} 
                  entityType={selectedEntity}
                  onResult={setTestResult}
                />
              </div>
            </div>

            {/* Test Results Display */}
            {testResult && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="font-medium text-gray-800">Test Results</h2>
                </div>
                <div className="p-4">
                  <pre className="bg-gray-50 p-4 rounded overflow-auto max-h-96 text-sm">
                    {JSON.stringify(testResult, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// Helper function to get the test title
function getTestTitle(testType, entityType) {
  const testLabels = {
    read: 'Read',
    create: 'Create',
    update: 'Update',
    delete: 'Delete',
    loading: 'Loading States',
    error: 'Error Handling'
  };
  
  const entityLabels = {
    media: 'Media',
    folders: 'Folders',
    collections: 'Collections',
    tags: 'Tags'
  };
  
  return `${testLabels[testType]} ${entityLabels[entityType]}`;
}

// Test button component
function TestButton({ label, isActive, onClick }) {
  return (
    <button 
      className={`px-4 py-2 rounded text-sm font-medium ${
        isActive 
          ? 'bg-blue-100 text-blue-700 border border-blue-200' 
          : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

// Test panel component
function TestPanel({ testType, entityType, onResult }) {
  switch(testType) {
    case 'read':
      return <ReadTest entityType={entityType} onResult={onResult} />;
    case 'create':
      return <CreateTest entityType={entityType} onResult={onResult} />;
    case 'update':
      return <UpdateTest entityType={entityType} onResult={onResult} />;
    case 'delete':
      return <DeleteTest entityType={entityType} onResult={onResult} />;
    case 'loading':
      return <LoadingTest entityType={entityType} onResult={onResult} />;
    case 'error':
      return <ErrorTest entityType={entityType} onResult={onResult} />;
    default:
      return <div>Select a test type</div>;
  }
}

// Read Test Component
function ReadTest({ entityType, onResult }) {
  const [params, setParams] = useState({ page: 1, pageSize: 5 });
  
  let { data, loading, error, refetch } = useEmptyState();
  
  switch(entityType) {
    case 'media':
      ({ data, loading, error, refetch } = useMedia(params));
      break;
    case 'folders':
      ({ data, loading, error, refetch } = useFolders());
      break;
    case 'collections':
      ({ data, loading, error, refetch } = useCollections(params));
      break;
    case 'tags':
      ({ data, loading, error, refetch } = useTags());
      break;
  }
  
  useEffect(() => {
    if (data && !loading) {
      onResult(data);
    }
  }, [data, loading, onResult]);
  
  const handleRefetch = () => {
    refetch();
  };
  
  const handleChangePage = (newPage) => {
    setParams(prev => ({ ...prev, page: newPage }));
  };
  
  return (
    <div>
      <div className="mb-4">
        <p className="text-gray-700 mb-2">
          Fetching {entityType} data from {loading ? 'API...' : 'API'}
        </p>
        
        {loading && (
          <div className="flex items-center text-blue-600">
            <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading data...
          </div>
        )}
        
        {error && (
          <div className="text-red-600 mb-2">
            Error: {error.message || JSON.stringify(error)}
          </div>
        )}
      </div>
      
      {(entityType === 'media' || entityType === 'collections') && (
        <div className="flex items-center space-x-2 mb-4">
          <button 
            className="px-3 py-1 bg-gray-100 rounded border border-gray-300 text-sm disabled:opacity-50"
            onClick={() => handleChangePage(Math.max(1, params.page - 1))}
            disabled={params.page <= 1 || loading}
          >
            Previous
          </button>
          <span className="text-sm text-gray-700">Page {params.page}</span>
          <button 
            className="px-3 py-1 bg-gray-100 rounded border border-gray-300 text-sm disabled:opacity-50"
            onClick={() => handleChangePage(params.page + 1)}
            disabled={loading}
          >
            Next
          </button>
        </div>
      )}
      
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
        onClick={handleRefetch}
        disabled={loading}
      >
        Refresh Data
      </button>
    </div>
  );
}

// Create Test Component
function CreateTest({ entityType, onResult }) {
  const [formValues, setFormValues] = useState(() => getInitialFormValues(entityType));
  const [creating, setCreating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    
    try {
      let response;
      const api = (await import('../services')).default;
      
      switch(entityType) {
        case 'media':
          response = await api.media.createMedia(formValues);
          break;
        case 'folders':
          response = await api.folders.createFolder(formValues);
          break;
        case 'collections':
          response = await api.collections.createCollection(formValues);
          break;
        case 'tags':
          response = await api.tags.createTag(formValues);
          break;
      }
      
      setResult(response.data);
      onResult(response.data);
    } catch (err) {
      setError(err);
      onResult({ error: err.message || 'Creation failed' });
    } finally {
      setCreating(false);
    }
  };
  
  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {Object.entries(formValues).map(([key, value]) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={key}>
              {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
            </label>
            <input
              id={key}
              name={key}
              type="text"
              value={value}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              disabled={creating}
            />
          </div>
        ))}
        
        {error && (
          <div className="text-red-600">
            Error: {error.message || JSON.stringify(error)}
          </div>
        )}
        
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
          disabled={creating}
        >
          {creating ? 'Creating...' : `Create ${entityType.slice(0, -1)}`}
        </button>
      </form>
    </div>
  );
}

// Update Test Component
function UpdateTest({ entityType, onResult }) {
  const [id, setId] = useState('');
  const [formValues, setFormValues] = useState({});
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [item, setItem] = useState(null);
  const [error, setError] = useState(null);
  
  const fetchItem = async () => {
    if (!id.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      let response;
      const api = (await import('../services')).default;
      
      switch(entityType) {
        case 'media':
          response = await api.media.getMediaById(id);
          break;
        case 'folders':
          response = await api.folders.getFolderById(id);
          break;
        case 'collections':
          response = await api.collections.getCollectionById(id);
          break;
        case 'tags':
          response = await api.tags.getTagById(id);
          break;
      }
      
      setItem(response.data);
      
      // Extract editable fields
      const editableFields = getEditableFields(entityType, response.data);
      setFormValues(editableFields);
      
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError(null);
    
    try {
      let response;
      const api = (await import('../services')).default;
      
      switch(entityType) {
        case 'media':
          response = await api.media.updateMedia(id, formValues);
          break;
        case 'folders':
          response = await api.folders.updateFolder(id, formValues);
          break;
        case 'collections':
          response = await api.collections.updateCollection(id, formValues);
          break;
        case 'tags':
          response = await api.tags.updateTag(id, formValues);
          break;
      }
      
      onResult(response.data);
    } catch (err) {
      setError(err);
      onResult({ error: err.message || 'Update failed' });
    } finally {
      setUpdating(false);
    }
  };
  
  return (
    <div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="itemId">
          {entityType.slice(0, -1)} ID
        </label>
        <div className="flex space-x-2">
          <input
            id="itemId"
            type="text"
            value={id}
            onChange={(e) => setId(e.target.value)}
            className="flex-1 p-2 border border-gray-300 rounded-md"
            placeholder={`Enter ${entityType.slice(0, -1)} ID`}
            disabled={loading || updating}
          />
          <button
            type="button"
            onClick={fetchItem}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors disabled:opacity-50"
            disabled={!id.trim() || loading || updating}
          >
            {loading ? 'Loading...' : 'Fetch'}
          </button>
        </div>
      </div>
      
      {error && (
        <div className="text-red-600 mb-4">
          Error: {error.message || JSON.stringify(error)}
        </div>
      )}
      
      {item && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {Object.entries(formValues).map(([key, value]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={key}>
                {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
              </label>
              <input
                id={key}
                name={key}
                type="text"
                value={value}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                disabled={updating}
              />
            </div>
          ))}
          
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
            disabled={updating}
          >
            {updating ? 'Updating...' : `Update ${entityType.slice(0, -1)}`}
          </button>
        </form>
      )}
    </div>
  );
}

// Delete Test Component
function DeleteTest({ entityType, onResult }) {
  const [id, setId] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  const handleDelete = async () => {
    if (!id.trim()) return;
    
    if (!confirm(`Are you sure you want to delete this ${entityType.slice(0, -1)}?`)) {
      return;
    }
    
    setDeleting(true);
    setError(null);
    
    try {
      let response;
      const api = (await import('../services')).default;
      
      switch(entityType) {
        case 'media':
          response = await api.media.deleteMedia(id);
          break;
        case 'folders':
          response = await api.folders.deleteFolder(id);
          break;
        case 'collections':
          response = await api.collections.deleteCollection(id);
          break;
        case 'tags':
          response = await api.tags.deleteTag(id);
          break;
      }
      
      setResult(response.data);
      onResult(response.data);
    } catch (err) {
      setError(err);
      onResult({ error: err.message || 'Deletion failed' });
    } finally {
      setDeleting(false);
    }
  };
  
  return (
    <div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="deleteItemId">
          {entityType.slice(0, -1)} ID to Delete
        </label>
        <div className="flex space-x-2">
          <input
            id="deleteItemId"
            type="text"
            value={id}
            onChange={(e) => setId(e.target.value)}
            className="flex-1 p-2 border border-gray-300 rounded-md"
            placeholder={`Enter ${entityType.slice(0, -1)} ID`}
            disabled={deleting}
          />
          <button
            type="button"
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50"
            disabled={!id.trim() || deleting}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
      
      {error && (
        <div className="text-red-600 mb-4">
          Error: {error.message || JSON.stringify(error)}
        </div>
      )}
      
      {result && (
        <div className="p-4 bg-green-50 text-green-800 rounded-md border border-green-200">
          {entityType.slice(0, -1)} successfully deleted
        </div>
      )}
    </div>
  );
}

// Loading Test Component
function LoadingTest({ entityType, onResult }) {
  const [simulateDelay, setSimulateDelay] = useState(true);
  const [delayTime, setDelayTime] = useState(2000);
  
  // Custom hook to fetch with adjustable delay
  const useDelayedFetch = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const fetchWithDelay = async () => {
      setLoading(true);
      setError(null);
      setData(null);
      
      if (simulateDelay) {
        await new Promise(resolve => setTimeout(resolve, delayTime));
      }
      
      try {
        const api = (await import('../services')).default;
        let response;
        
        switch(entityType) {
          case 'media':
            response = await api.media.getMedia();
            break;
          case 'folders':
            response = await api.folders.getFolders();
            break;
          case 'collections':
            response = await api.collections.getCollections();
            break;
          case 'tags':
            response = await api.tags.getTags();
            break;
        }
        
        setData(response.data);
        onResult(response.data);
      } catch (err) {
        setError(err);
        onResult({ error: err.message || 'Fetch failed' });
      } finally {
        setLoading(false);
      }
    };
    
    return { data, loading, error, fetchWithDelay };
  };
  
  const { data, loading, error, fetchWithDelay } = useDelayedFetch();
  
  return (
    <div>
      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <input
            type="checkbox"
            id="simulateDelay"
            checked={simulateDelay}
            onChange={(e) => setSimulateDelay(e.target.checked)}
            className="h-4 w-4 text-blue-600 rounded"
          />
          <label htmlFor="simulateDelay" className="text-sm text-gray-700">
            Simulate loading delay
          </label>
        </div>
        
        {simulateDelay && (
          <div className="flex items-center space-x-2 mb-4">
            <input
              type="range"
              min="500"
              max="5000"
              step="500"
              value={delayTime}
              onChange={(e) => setDelayTime(parseInt(e.target.value))}
              className="w-1/2"
            />
            <span className="text-sm text-gray-700">{delayTime}ms</span>
          </div>
        )}
        
        <button
          onClick={fetchWithDelay}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
          disabled={loading}
        >
          Fetch {entityType}
        </button>
      </div>
      
      <div className="mb-4">
        <h3 className="font-medium text-gray-800 mb-2">Loading States</h3>
        
        {/* Different loading state examples */}
        <div className="space-y-4">
          <div className={`p-4 rounded-md border ${loading ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
            <h4 className="font-medium text-gray-800 mb-2">Spinner Example</h4>
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <svg className="animate-spin h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : (
              data ? <div className="text-green-600">Data loaded</div> : <div>No data</div>
            )}
          </div>
          
          <div className={`p-4 rounded-md border ${loading ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
            <h4 className="font-medium text-gray-800 mb-2">Skeleton Example</h4>
            {loading ? (
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-4/6"></div>
              </div>
            ) : (
              data ? <div className="text-green-600">Data loaded</div> : <div>No data</div>
            )}
          </div>
          
          <div className={`p-4 rounded-md border ${loading ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
            <h4 className="font-medium text-gray-800 mb-2">Progress Bar Example</h4>
            {loading ? (
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full animate-[progress_2s_ease-in-out_infinite]"></div>
              </div>
            ) : (
              data ? <div className="text-green-600">Data loaded</div> : <div>No data</div>
            )}
          </div>
        </div>
      </div>
      
      {error && (
        <div className="text-red-600 mb-4">
          Error: {error.message || JSON.stringify(error)}
        </div>
      )}
    </div>
  );
}

// Error Test Component
function ErrorTest({ entityType, onResult }) {
  const [errorType, setErrorType] = useState('network');
  const { dataSource } = useDataSource();
  
  const simulateError = async () => {
    try {
      let error;
      
      switch(errorType) {
        case 'network':
          error = new Error('Network connection failed');
          error.name = 'NetworkError';
          throw error;
        
        case 'timeout':
          error = new Error('Request timed out after 30 seconds');
          error.name = 'TimeoutError';
          throw error;
          
        case 'validation':
          error = new Error('Validation failed: Required fields missing');
          error.name = 'ValidationError';
          error.details = { fields: ['name', 'type'] };
          throw error;
          
        case 'auth':
          error = new Error('Authentication failed: Invalid or expired token');
          error.name = 'AuthenticationError';
          error.status = 401;
          throw error;
          
        case 'permission':
          error = new Error('Permission denied: Insufficient privileges');
          error.name = 'PermissionError';
          error.status = 403;
          throw error;
          
        case 'notfound':
          error = new Error(`${entityType.slice(0, -1)} not found`);
          error.name = 'NotFoundError';
          error.status = 404;
          throw error;
          
        case 'server':
          error = new Error('Internal server error');
          error.name = 'ServerError';
          error.status = 500;
          throw error;
      }
    } catch (err) {
      onResult({ error: { message: err.message, name: err.name, ...err } });
      return err;
    }
  };
  
  // Function to get an appropriate error handling component
  const getErrorComponent = (errorType) => {
    switch(errorType) {
      case 'network':
        return (
          <div className="p-4 bg-red-50 rounded-md border border-red-200 text-red-800">
            <div className="flex items-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Network Error</span>
            </div>
            <p>Unable to connect to the server. Please check your internet connection and try again.</p>
            <button className="mt-2 px-3 py-1 bg-red-100 text-red-800 rounded-md border border-red-300 text-sm hover:bg-red-200">
              Retry
            </button>
          </div>
        );
        
      case 'timeout':
        return (
          <div className="p-4 bg-orange-50 rounded-md border border-orange-200 text-orange-800">
            <div className="flex items-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Request Timeout</span>
            </div>
            <p>The server is taking too long to respond. Please try again later.</p>
            <button className="mt-2 px-3 py-1 bg-orange-100 text-orange-800 rounded-md border border-orange-300 text-sm hover:bg-orange-200">
              Try Again
            </button>
          </div>
        );
        
      case 'validation':
        return (
          <div className="p-4 bg-yellow-50 rounded-md border border-yellow-200 text-yellow-800">
            <div className="flex items-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Validation Error</span>
            </div>
            <p>Please correct the following fields:</p>
            <ul className="list-disc list-inside mt-1 ml-2 text-sm">
              <li>Name is required</li>
              <li>Type is required</li>
            </ul>
          </div>
        );
        
      case 'auth':
        return (
          <div className="p-4 bg-red-50 rounded-md border border-red-200 text-red-800">
            <div className="flex items-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Authentication Error (401)</span>
            </div>
            <p>Your session has expired. Please log in again to continue.</p>
            <button className="mt-2 px-3 py-1 bg-red-100 text-red-800 rounded-md border border-red-300 text-sm hover:bg-red-200">
              Log In
            </button>
          </div>
        );
        
      case 'permission':
        return (
          <div className="p-4 bg-red-50 rounded-md border border-red-200 text-red-800">
            <div className="flex items-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Permission Denied (403)</span>
            </div>
            <p>You don't have permission to perform this action. Please contact an administrator.</p>
          </div>
        );
        
      case 'notfound':
        return (
          <div className="p-4 bg-gray-50 rounded-md border border-gray-200 text-gray-800">
            <div className="flex items-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Not Found (404)</span>
            </div>
            <p>The requested {entityType.slice(0, -1)} could not be found.</p>
            <button className="mt-2 px-3 py-1 bg-gray-100 text-gray-800 rounded-md border border-gray-300 text-sm hover:bg-gray-200">
              Go Back
            </button>
          </div>
        );
        
      case 'server':
        return (
          <div className="p-4 bg-red-50 rounded-md border border-red-200 text-red-800">
            <div className="flex items-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Server Error (500)</span>
            </div>
            <p>Something went wrong on our end. Please try again later.</p>
            <div className="mt-2 p-2 bg-red-100 rounded text-xs font-mono overflow-auto max-h-20">
              Error: Internal server error
              <br />
              at processRequest (/server/api/handlers.js:42:12)
              <br />
              at async /server/api/routes.js:24:9
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div>
      <div className="mb-4">
        <p className="text-gray-700 mb-2">
          Test error handling for {entityType} with the {dataSource} API
        </p>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Error Type</label>
          <select
            value={errorType}
            onChange={(e) => setErrorType(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="network">Network Error</option>
            <option value="timeout">Timeout Error</option>
            <option value="validation">Validation Error</option>
            <option value="auth">Authentication Error (401)</option>
            <option value="permission">Permission Error (403)</option>
            <option value="notfound">Not Found Error (404)</option>
            <option value="server">Server Error (500)</option>
          </select>
        </div>
        
        <button
          onClick={simulateError}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Simulate Error
        </button>
      </div>
      
      <div className="mb-4">
        <h3 className="font-medium text-gray-800 mb-2">Error Handling Example</h3>
        {getErrorComponent(errorType)}
      </div>
    </div>
  );
}

// Helper function to return empty state
function useEmptyState() {
  return { data: null, loading: false, error: null, refetch: () => {} };
}

// Helper function to get initial form values based on entity type
function getInitialFormValues(entityType) {
  switch(entityType) {
    case 'media':
      return {
        name: 'New Media Item',
        type: 'image',
        status: 'active',
        path: '/uploads/media/'
      };
    case 'folders':
      return {
        name: 'New Folder',
        path: '/media/',
        color: '#3b82f6'
      };
    case 'collections':
      return {
        name: 'New Collection',
        description: 'A new collection',
        color: '#10b981',
        isShared: 'false'
      };
    case 'tags':
      return {
        name: 'new-tag',
        color: '#f59e0b'
      };
    default:
      return {};
  }
}

// Helper function to extract editable fields from an entity
function getEditableFields(entityType, item) {
  if (!item) return {};
  
  const commonFields = ['name', 'description', 'color'];
  const entitySpecificFields = {
    media: ['status', 'path', 'type'],
    folders: ['path'],
    collections: ['isShared'],
    tags: []
  };
  
  const fields = [...commonFields, ...(entitySpecificFields[entityType] || [])];
  
  return Object.fromEntries(
    Object.entries(item).filter(([key]) => fields.includes(key))
  );
}