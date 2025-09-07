import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import {
  BaseComponentProps,
  EventHandler,
  MouseEvent
} from '../types';

// ============================================================================
// INTERFACES
// ============================================================================

type ButtonColor = 'red' | 'blue' | 'gray';

interface ConfirmationDialogProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmButtonText?: string;
  confirmButtonColor?: ButtonColor;
}

// ============================================================================
// COMPONENT
// ============================================================================

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirm Action', 
  message = 'Are you sure you want to proceed?',
  confirmButtonText = 'Confirm',
  confirmButtonColor = 'red',
  className,
  testId
}) => {
  const getButtonColorClass = (): string => {
    switch (confirmButtonColor) {
      case 'red':
        return 'bg-red-600 hover:bg-red-700';
      case 'blue':
        return 'bg-blue-600 hover:bg-blue-700';
      default:
        return 'bg-gray-600 hover:bg-gray-700';
    }
  };

  const handleBackdropClick: EventHandler<MouseEvent<HTMLDivElement>> = (e) => {
    e.stopPropagation();
    onClose();
  };

  const handleConfirmClick = (): void => {
    onConfirm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 flex items-center justify-center z-50 ${className || ''}`}
      data-testid={testId}
    >
      <div 
        className="absolute inset-0 bg-black opacity-30" 
        onClick={handleBackdropClick}
      ></div>
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md z-10 relative">
        <div className="flex justify-between items-center border-b border-gray-200 px-4 py-3">
          <h3 className="text-lg font-medium flex items-center">
            <AlertTriangle className="text-yellow-500 mr-2" size={20} />
            {title}
          </h3>
          <button 
            className="text-gray-400 hover:text-gray-500"
            onClick={onClose}
            type="button"
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
              onClick={handleConfirmClick}
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