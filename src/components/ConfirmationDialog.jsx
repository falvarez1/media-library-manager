import { AlertTriangle, X } from 'lucide-react';

const ConfirmationDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirm Action', 
  message = 'Are you sure you want to proceed?',
  confirmButtonText = 'Confirm',
  confirmButtonColor = 'red'  // 'red', 'blue', etc.
}) => {
  if (!isOpen) return null;

  const getButtonColorClass = () => {
    switch (confirmButtonColor) {
      case 'red':
        return 'bg-red-600 hover:bg-red-700';
      case 'blue':
        return 'bg-blue-600 hover:bg-blue-700';
      default:
        return 'bg-gray-600 hover:bg-gray-700';
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-30" onClick={onClose}></div>
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md z-10 relative">
        <div className="flex justify-between items-center border-b border-gray-200 px-4 py-3">
          <h3 className="text-lg font-medium flex items-center">
            <AlertTriangle className="text-yellow-500 mr-2" size={20} />
            {title}
          </h3>
          <button 
            className="text-gray-400 hover:text-gray-500"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4">
          <p className="text-gray-700 mb-4">{message}</p>
          
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className={`px-4 py-2 text-sm text-white ${getButtonColorClass()} rounded-md`}
              onClick={() => {
                onConfirm();
                onClose();
              }}
            >
              {confirmButtonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;