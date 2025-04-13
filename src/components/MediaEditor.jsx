import { useState } from 'react';
import { 
  X, 
  Sliders, 
  Crop, 
  Layers, 
  Edit, 
  RefreshCw, 
  Minus, 
  Plus, 
  RotateCcw, 
  RotateCw, 
  MoveHorizontal, 
  MoveVertical, 
  Save,
  Loader
} from 'lucide-react';
import { useMediaItem } from '../hooks/useMockApi';

const MediaEditor = ({ mediaId, onClose, onSave }) => {
  // Fetch the media item by ID using our hooks
  const { data: item, loading, error } = useMediaItem(mediaId);
  
  // Editor state
  const [editorTab, setEditorTab] = useState('adjust'); // 'adjust', 'crop', 'filters', 'annotate'
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [exposure, setExposure] = useState(0);
  const [highlights, setHighlights] = useState(0);
  const [shadows, setShadows] = useState(0);
  const [temperature, setTemperature] = useState(0);
  const [tint, setTint] = useState(0);
  const [vibrance, setVibrance] = useState(0);
  const [clarity, setClarity] = useState(0);
  const [sharpness, setSharpness] = useState(0);
  const [noiseReduction, setNoiseReduction] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [aspectRatio, setAspectRatio] = useState('free');
  const [filter, setFilter] = useState('none');
  
  // Mock filters
  const filters = [
    { id: 'none', name: 'None' },
    { id: 'grayscale', name: 'Grayscale' },
    { id: 'sepia', name: 'Sepia' },
    { id: 'vivid', name: 'Vivid' },
    { id: 'muted', name: 'Muted' },
    { id: 'dramatic', name: 'Dramatic' },
    { id: 'vintage', name: 'Vintage' },
    { id: 'cool', name: 'Cool' },
    { id: 'warm', name: 'Warm' }
  ];
  
  // Reset all adjustments
  const resetAdjustments = () => {
    setBrightness(0);
    setContrast(0);
    setSaturation(0);
    setExposure(0);
    setHighlights(0);
    setShadows(0);
    setTemperature(0);
    setTint(0);
    setVibrance(0);
    setClarity(0);
    setSharpness(0);
    setNoiseReduction(0);
  };
  
  // Reset crop & rotation
  const resetCrop = () => {
    setRotation(0);
    setAspectRatio('free');
  };
  
  // Reset filters
  const resetFilters = () => {
    setFilter('none');
  };
  
  // Get filter style
  const getFilterStyle = () => {
    switch(filter) {
      case 'grayscale':
        return { filter: 'grayscale(100%)' };
      case 'sepia':
        return { filter: 'sepia(100%)' };
      case 'vivid':
        return { filter: 'saturate(150%) contrast(110%)' };
      case 'muted':
        return { filter: 'saturate(80%) brightness(95%)' };
      case 'dramatic':
        return { filter: 'contrast(120%) brightness(90%)' };
      case 'vintage':
        return { filter: 'sepia(30%) saturate(80%) brightness(95%)' };
      case 'cool':
        return { filter: 'saturate(90%) hue-rotate(330deg)' };
      case 'warm':
        return { filter: 'saturate(110%) hue-rotate(30deg)' };
      default:
        return {};
    }
  };
  
  // Handle save
  const handleSave = () => {
    // In a real app, we would apply the edits and save the image
    if (onSave) onSave(mediaId);
    onClose();
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-30">
        <div className="bg-white p-8 rounded-lg flex flex-col items-center">
          <Loader size={40} className="text-blue-500 animate-spin mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Loading Media Editor</h3>
          <p className="text-gray-500 mt-2">Please wait while we prepare the editor...</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-30">
        <div className="bg-white p-8 rounded-lg max-w-md">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-500 mb-4">
              <X size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Editor</h3>
            <p className="text-gray-500 mb-6">
              {error.message || "Failed to load the media editor. Please try again."}
            </p>
            <div className="flex space-x-3 justify-center">
              <button 
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                onClick={onClose}
              >
                Close
              </button>
              <button 
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // If no item found
  if (!item) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-30">
      <div className="bg-white w-11/12 h-5/6 rounded-lg flex flex-col overflow-hidden max-w-7xl">
        <div className="border-b border-gray-200 p-4 flex justify-between items-center">
          <h3 className="font-medium flex items-center">
            <Edit size={18} className="mr-2" />
            Image Editor - {item.name}
          </h3>
          <div className="flex space-x-2">
            <button 
              className="px-3 py-1.5 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 flex items-center"
              onClick={handleSave}
            >
              <Save size={16} className="mr-1.5" />
              Save Changes
            </button>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        <div className="flex-1 flex overflow-hidden">
          {/* Editor tabs */}
          <div className="w-16 bg-gray-800 flex flex-col items-center py-4">
            <button 
              className={`p-3 mb-2 rounded ${editorTab === 'adjust' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setEditorTab('adjust')}
              title="Adjustments"
            >
              <Sliders size={20} />
            </button>
            <button 
              className={`p-3 mb-2 rounded ${editorTab === 'crop' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setEditorTab('crop')}
              title="Crop & Rotate"
            >
              <Crop size={20} />
            </button>
            <button 
              className={`p-3 mb-2 rounded ${editorTab === 'filters' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setEditorTab('filters')}
              title="Filters"
            >
              <Layers size={20} />
            </button>
            <button 
              className={`p-3 mb-2 rounded ${editorTab === 'annotate' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setEditorTab('annotate')}
              title="Annotate"
            >
              <Edit size={20} />
            </button>
            
            <div className="mt-auto">
              <button 
                className="p-3 text-gray-400 hover:text-white"
                title="Reset All"
                onClick={() => {
                  resetAdjustments();
                  resetCrop();
                  resetFilters();
                }}
              >
                <RefreshCw size={20} />
              </button>
            </div>
          </div>
          
          {/* Main editor area */}
          <div className="flex-1 flex items-center justify-center bg-gray-100 p-4 relative">
            <div className="relative shadow-xl">
              <img 
                src={item.url} 
                alt="Editing" 
                className="max-w-full max-h-full object-contain"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  filter: `brightness(${100 + brightness}%) contrast(${100 + contrast}%) saturate(${100 + saturation}%)`,
                  ...getFilterStyle()
                }}
              />
              
              {/* Image editor guides would go here (crop handles, etc.) */}
            </div>
            
            {/* Zoom controls */}
            <div className="absolute bottom-4 right-4 bg-white rounded-full p-2 shadow-lg flex items-center">
              <button 
                className="p-1 text-gray-500 hover:text-gray-700"
                onClick={() => setZoom(Math.max(50, zoom - 10))}
              >
                <Minus size={16} />
              </button>
              <span className="mx-2 text-sm font-medium">{zoom}%</span>
              <button 
                className="p-1 text-gray-500 hover:text-gray-700"
                onClick={() => setZoom(Math.min(200, zoom + 10))}
              >
                <Plus size={16} />
              </button>
            </div>
            
            {/* Before/After comparison slider */}
            <div className="absolute bottom-4 left-4 bg-white rounded-full px-3 py-1.5 shadow-lg">
              <button className="text-sm font-medium flex items-center">
                <RefreshCw size={14} className="mr-1.5" />
                Compare Original
              </button>
            </div>
          </div>
          
          {/* Right sidebar tools - content changes based on selected tab */}
          <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
            <div className="p-4">
              {/* Adjustments tab */}
              {editorTab === 'adjust' && (
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-medium">Adjustments</h4>
                      <button 
                        className="text-xs text-blue-600 hover:text-blue-800"
                        onClick={resetAdjustments}
                      >
                        Reset
                      </button>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Brightness</span>
                          <span>{brightness}</span>
                        </div>
                        <input 
                          type="range" 
                          min="-100" 
                          max="100" 
                          value={brightness} 
                          onChange={(e) => setBrightness(parseInt(e.target.value))} 
                          className="w-full"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Contrast</span>
                          <span>{contrast}</span>
                        </div>
                        <input 
                          type="range" 
                          min="-100" 
                          max="100" 
                          value={contrast} 
                          onChange={(e) => setContrast(parseInt(e.target.value))} 
                          className="w-full"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Saturation</span>
                          <span>{saturation}</span>
                        </div>
                        <input 
                          type="range" 
                          min="-100" 
                          max="100" 
                          value={saturation} 
                          onChange={(e) => setSaturation(parseInt(e.target.value))} 
                          className="w-full"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Exposure</span>
                          <span>{exposure}</span>
                        </div>
                        <input 
                          type="range" 
                          min="-100" 
                          max="100" 
                          value={exposure} 
                          onChange={(e) => setExposure(parseInt(e.target.value))} 
                          className="w-full"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Highlights</span>
                          <span>{highlights}</span>
                        </div>
                        <input 
                          type="range" 
                          min="-100" 
                          max="100" 
                          value={highlights} 
                          onChange={(e) => setHighlights(parseInt(e.target.value))} 
                          className="w-full"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Shadows</span>
                          <span>{shadows}</span>
                        </div>
                        <input 
                          type="range" 
                          min="-100" 
                          max="100" 
                          value={shadows} 
                          onChange={(e) => setShadows(parseInt(e.target.value))} 
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Color</h4>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Temperature</span>
                          <span>{temperature}</span>
                        </div>
                        <input 
                          type="range" 
                          min="-100" 
                          max="100" 
                          value={temperature} 
                          onChange={(e) => setTemperature(parseInt(e.target.value))} 
                          className="w-full"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Tint</span>
                          <span>{tint}</span>
                        </div>
                        <input 
                          type="range" 
                          min="-100" 
                          max="100" 
                          value={tint} 
                          onChange={(e) => setTint(parseInt(e.target.value))} 
                          className="w-full"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Vibrance</span>
                          <span>{vibrance}</span>
                        </div>
                        <input 
                          type="range" 
                          min="-100" 
                          max="100" 
                          value={vibrance} 
                          onChange={(e) => setVibrance(parseInt(e.target.value))} 
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Effects</h4>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Clarity</span>
                          <span>{clarity}</span>
                        </div>
                        <input 
                          type="range" 
                          min="-100" 
                          max="100" 
                          value={clarity} 
                          onChange={(e) => setClarity(parseInt(e.target.value))} 
                          className="w-full"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Sharpness</span>
                          <span>{sharpness}</span>
                        </div>
                        <input 
                          type="range" 
                          min="-100" 
                          max="100" 
                          value={sharpness} 
                          onChange={(e) => setSharpness(parseInt(e.target.value))} 
                          className="w-full"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Noise Reduction</span>
                          <span>{noiseReduction}</span>
                        </div>
                        <input 
                          type="range" 
                          min="-100" 
                          max="100" 
                          value={noiseReduction} 
                          onChange={(e) => setNoiseReduction(parseInt(e.target.value))} 
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Crop & Rotate tab */}
              {editorTab === 'crop' && (
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-medium">Crop & Rotate</h4>
                      <button 
                        className="text-xs text-blue-600 hover:text-blue-800"
                        onClick={resetCrop}
                      >
                        Reset
                      </button>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Rotation</span>
                          <span>{rotation}°</span>
                        </div>
                        <input 
                          type="range" 
                          min="-180" 
                          max="180" 
                          value={rotation} 
                          onChange={(e) => setRotation(parseInt(e.target.value))} 
                          className="w-full"
                        />
                      </div>
                      
                      <div className="flex justify-center space-x-2 py-2">
                        <button 
                          className="p-2 border border-gray-200 rounded hover:bg-gray-50" 
                          title="Rotate Left"
                          onClick={() => setRotation((rotation - 90) % 360)}
                        >
                          <RotateCcw size={18} />
                        </button>
                        <button 
                          className="p-2 border border-gray-200 rounded hover:bg-gray-50" 
                          title="Rotate Right"
                          onClick={() => setRotation((rotation + 90) % 360)}
                        >
                          <RotateCw size={18} />
                        </button>
                        <button 
                          className="p-2 border border-gray-200 rounded hover:bg-gray-50" 
                          title="Flip Horizontal"
                        >
                          <MoveHorizontal size={18} />
                        </button>
                        <button 
                          className="p-2 border border-gray-200 rounded hover:bg-gray-50" 
                          title="Flip Vertical"
                        >
                          <MoveVertical size={18} />
                        </button>
                      </div>
                      
                      <div className="pt-4">
                        <h4 className="text-sm font-medium mb-2">Aspect Ratio</h4>
                        <div className="grid grid-cols-3 gap-2">
                          <button 
                            className={`p-2 border ${aspectRatio === 'free' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-200'} rounded hover:bg-gray-50 text-sm text-center`}
                            onClick={() => setAspectRatio('free')}
                          >
                            Free
                          </button>
                          <button 
                            className={`p-2 border ${aspectRatio === '1:1' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-200'} rounded hover:bg-gray-50 text-sm text-center`}
                            onClick={() => setAspectRatio('1:1')}
                          >
                            1:1
                          </button>
                          <button 
                            className={`p-2 border ${aspectRatio === '4:3' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-200'} rounded hover:bg-gray-50 text-sm text-center`}
                            onClick={() => setAspectRatio('4:3')}
                          >
                            4:3
                          </button>
                          <button 
                            className={`p-2 border ${aspectRatio === '16:9' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-200'} rounded hover:bg-gray-50 text-sm text-center`}
                            onClick={() => setAspectRatio('16:9')}
                          >
                            16:9
                          </button>
                          <button 
                            className={`p-2 border ${aspectRatio === '3:2' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-200'} rounded hover:bg-gray-50 text-sm text-center`}
                            onClick={() => setAspectRatio('3:2')}
                          >
                            3:2
                          </button>
                          <button 
                            className={`p-2 border ${aspectRatio === '2:3' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-200'} rounded hover:bg-gray-50 text-sm text-center`}
                            onClick={() => setAspectRatio('2:3')}
                          >
                            2:3
                          </button>
                        </div>
                      </div>
                      
                      <div className="pt-4">
                        <h4 className="text-sm font-medium mb-2">Custom Size</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs text-gray-500 block mb-1">Width (px)</label>
                            <input type="number" className="w-full p-2 border border-gray-300 rounded-md text-sm" defaultValue="800" min="1" />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 block mb-1">Height (px)</label>
                            <input type="number" className="w-full p-2 border border-gray-300 rounded-md text-sm" defaultValue="600" min="1" />
                          </div>
                        </div>
                        <div className="mt-2">
                          <label className="flex items-center text-sm">
                            <input type="checkbox" className="mr-2" defaultChecked={true} />
                            Maintain aspect ratio
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Filters tab */}
              {editorTab === 'filters' && (
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-medium">Filters</h4>
                      <button 
                        className="text-xs text-blue-600 hover:text-blue-800"
                        onClick={resetFilters}
                      >
                        Reset
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      {filters.map(f => (
                        <button 
                          key={f.id}
                          className={`aspect-square border overflow-hidden ${filter === f.id ? 'ring-2 ring-blue-500' : 'hover:ring-1 hover:ring-gray-300'} rounded`}
                          onClick={() => setFilter(f.id)}
                        >
                          <div className="h-full flex flex-col">
                            <div className="h-3/4 overflow-hidden flex items-center justify-center bg-gray-100">
                              <div 
                                className="w-full h-full bg-center bg-no-repeat bg-cover"
                                style={{
                                  backgroundImage: `url(${item.url})`,
                                  ...(f.id !== 'none' ? {
                                    filter: f.id === 'grayscale' ? 'grayscale(100%)' :
                                           f.id === 'sepia' ? 'sepia(100%)' :
                                           f.id === 'vivid' ? 'saturate(150%) contrast(110%)' :
                                           f.id === 'muted' ? 'saturate(80%) brightness(95%)' :
                                           f.id === 'dramatic' ? 'contrast(120%) brightness(90%)' :
                                           f.id === 'vintage' ? 'sepia(30%) saturate(80%) brightness(95%)' :
                                           f.id === 'cool' ? 'saturate(90%) hue-rotate(330deg)' :
                                           f.id === 'warm' ? 'saturate(110%) hue-rotate(30deg)' : ''
                                  } : {})
                                }}
                              ></div>
                            </div>
                            <div className="h-1/4 flex items-center justify-center text-xs bg-white">
                              {f.name}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                    
                    {filter !== 'none' && (
                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Intensity</span>
                          <span>100%</span>
                        </div>
                        <input type="range" min="0" max="100" defaultValue="100" className="w-full" />
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Annotate tab */}
              {editorTab === 'annotate' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Annotations</h4>
                    <p className="text-sm text-gray-500 mb-4">
                      Add text, shapes, and drawings to your image.
                    </p>
                    
                    <div className="space-y-4">
                      <button className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 flex items-center justify-center">
                        <span className="mr-2">Add Text</span>
                        <span className="font-bold">T</span>
                      </button>
                      
                      <button className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 flex items-center justify-center">
                        <span className="mr-2">Add Arrow</span>
                        <span>→</span>
                      </button>
                      
                      <button className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 flex items-center justify-center">
                        <span className="mr-2">Add Shape</span>
                        <span>◻</span>
                      </button>
                      
                      <button className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 flex items-center justify-center">
                        <span className="mr-2">Free Draw</span>
                        <Edit size={16} />
                      </button>
                    </div>
                    
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Color</h4>
                      <div className="flex flex-wrap gap-2">
                        {['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#000000', '#FFFFFF'].map(color => (
                          <button 
                            key={color}
                            className="w-8 h-8 rounded-full border border-gray-300 overflow-hidden"
                            style={{ backgroundColor: color }}
                          ></button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Thickness</h4>
                      <input type="range" min="1" max="20" defaultValue="4" className="w-full" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaEditor;
