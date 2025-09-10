import React, { useState, useRef, useCallback } from 'react';
import { X, Upload, File, Image, Video, Music, FileText, AlertCircle, CheckCircle, Loader } from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete?: (files: File[]) => void;
  currentFolderId?: string | null;
  acceptedTypes?: string[];
}

interface UploadFile {
  file: File;
  id: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
  preview?: string;
}

const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onUploadComplete,
  currentFolderId,
  acceptedTypes = ['image/*', 'video/*', 'audio/*', 'application/pdf', '.doc,.docx,.xls,.xlsx,.ppt,.pptx']
}) => {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  
  const getFileIcon = (file: File) => {
    const type = file.type;
    if (type.startsWith('image/')) return <Image size={20} className="text-blue-500" />;
    if (type.startsWith('video/')) return <Video size={20} className="text-purple-500" />;
    if (type.startsWith('audio/')) return <Music size={20} className="text-green-500" />;
    if (type === 'application/pdf' || type.includes('document')) return <FileText size={20} className="text-red-500" />;
    return <File size={20} className="text-gray-500" />;
  };
  
  
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };
  
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);
  
  const processFiles = (fileList: FileList) => {
    const newFiles: UploadFile[] = Array.from(fileList).map(file => {
      const id = Math.random().toString(36).substr(2, 9);
      let preview: string | undefined = undefined;
      
      // Generate preview for images
      if (file.type.startsWith('image/')) {
        preview = URL.createObjectURL(file);
      }
      
      return {
        file,
        id,
        status: 'pending' as const,
        progress: 0,
        preview
      };
    });
    
    setFiles(prev => [...prev, ...newFiles]);
  };
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const { files } = e.dataTransfer;
    if (files && files.length > 0) {
      processFiles(files);
    }
  }, []);
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };
  
  const removeFile = (id: string) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter(f => f.id !== id);
    });
  };
  
  const uploadFiles = async () => {
    setUploading(true);
    
    // Simulate upload for each file
    for (const uploadFile of files) {
      if (uploadFile.status !== 'pending') continue;
      
      setFiles(prev => prev.map(f => 
        f.id === uploadFile.id 
          ? { ...f, status: 'uploading' as const }
          : f
      ));
      
      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setFiles(prev => prev.map(f => 
          f.id === uploadFile.id 
            ? { ...f, progress }
            : f
        ));
      }
      
      // Mark as complete
      setFiles(prev => prev.map(f => 
        f.id === uploadFile.id 
          ? { ...f, status: 'success' as const, progress: 100 }
          : f
      ));
    }
    
    setUploading(false);
    
    // Call completion handler
    if (onUploadComplete) {
      onUploadComplete(files.map(f => f.file));
    }
    
    // Auto close after successful upload
    setTimeout(() => {
      handleClose();
    }, 1500);
  };
  
  const handleClose = () => {
    // Clean up previews
    files.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    setFiles([]);
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Upload Media</h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
          {/* Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-lg mb-2">Drag and drop files here</p>
            <p className="text-sm text-gray-500 mb-4">or</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Browse Files
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={acceptedTypes.join(',')}
              onChange={handleFileSelect}
              className="hidden"
            />
            <p className="text-xs text-gray-500 mt-4">
              Supported formats: Images, Videos, Audio, Documents
            </p>
          </div>
          
          {/* File List */}
          {files.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold mb-3">Files ({files.length})</h3>
              <div className="space-y-2">
                {files.map((uploadFile) => (
                  <div
                    key={uploadFile.id}
                    className="flex items-center p-3 bg-gray-50 rounded-lg"
                  >
                    {/* Preview or Icon */}
                    <div className="w-10 h-10 mr-3 flex items-center justify-center">
                      {uploadFile.preview ? (
                        <img 
                          src={uploadFile.preview} 
                          alt={uploadFile.file.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                      ) : (
                        getFileIcon(uploadFile.file)
                      )}
                    </div>
                    
                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {uploadFile.file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(uploadFile.file.size)}
                      </p>
                    </div>
                    
                    {/* Progress/Status */}
                    <div className="w-32 mx-3">
                      {uploadFile.status === 'pending' && (
                        <div className="text-xs text-gray-500">Ready</div>
                      )}
                      {uploadFile.status === 'uploading' && (
                        <div>
                          <div className="flex items-center">
                            <Loader size={14} className="animate-spin text-blue-500 mr-2" />
                            <span className="text-xs">{uploadFile.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                            <div 
                              className="bg-blue-500 h-1 rounded-full transition-all"
                              style={{ width: `${uploadFile.progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                      {uploadFile.status === 'success' && (
                        <div className="flex items-center text-green-500">
                          <CheckCircle size={16} className="mr-1" />
                          <span className="text-xs">Uploaded</span>
                        </div>
                      )}
                      {uploadFile.status === 'error' && (
                        <div className="flex items-center text-red-500">
                          <AlertCircle size={16} className="mr-1" />
                          <span className="text-xs">Failed</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Remove Button */}
                    {uploadFile.status === 'pending' && (
                      <button
                        onClick={() => removeFile(uploadFile.id)}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t bg-gray-50">
          <div className="text-sm text-gray-500">
            {currentFolderId && `Uploading to: ${currentFolderId}`}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={uploadFiles}
              disabled={files.length === 0 || uploading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? (
                <span className="flex items-center">
                  <Loader size={16} className="animate-spin mr-2" />
                  Uploading...
                </span>
              ) : (
                `Upload ${files.length} file${files.length !== 1 ? 's' : ''}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;