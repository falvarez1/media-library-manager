/**
 * Development Tools Menu Component
 * Provides access to development and testing features
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Settings, 
  Database, 
  Cloud, 
  Bell, 
  BarChart3,
  X,
  ChevronRight
} from 'lucide-react';
import { isUsingMockApi, switchApiMode } from '../services/api';

interface DevToolsMenuProps {
  showNotificationDemo: boolean;
  onToggleNotificationDemo: (show: boolean) => void;
}

export const DevToolsMenu: React.FC<DevToolsMenuProps> = ({
  showNotificationDemo,
  onToggleNotificationDemo
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isMock = isUsingMockApi();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleApiToggle = () => {
    switchApiMode(!isMock);
    setIsOpen(false);
  };

  const handleNotificationToggle = () => {
    onToggleNotificationDemo(!showNotificationDemo);
    setIsOpen(false);
  };

  return (
    <div ref={menuRef} className="fixed bottom-4 right-4 z-50">
      {/* Main action button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center justify-center w-14 h-14 rounded-full shadow-lg 
          transition-all transform hover:scale-110
          ${isOpen 
            ? 'bg-gray-700 hover:bg-gray-800 rotate-45' 
            : 'bg-blue-600 hover:bg-blue-700'
          }
        `}
        title="Development Tools"
      >
        {isOpen ? (
          <X size={24} className="text-white" />
        ) : (
          <Settings 
            size={24} 
            className="text-white" 
            style={{
              animation: 'spin-slow 8s linear infinite'
            }}
          />
        )}
      </button>

      {/* Menu items */}
      {isOpen && (
        <div 
          className="absolute bottom-16 right-0 w-64 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden"
          style={{
            animation: 'slide-up 0.2s ease-out'
          }}>
          <div className="py-2">
            {/* API Mode Toggle */}
            <button
              onClick={handleApiToggle}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {isMock ? (
                  <Database size={20} className="text-yellow-600" />
                ) : (
                  <Cloud size={20} className="text-green-600" />
                )}
                <div className="text-left">
                  <div className="text-sm font-medium text-gray-900">
                    API Mode
                  </div>
                  <div className="text-xs text-gray-500">
                    {isMock ? 'Mock Data' : 'Real Backend'}
                  </div>
                </div>
              </div>
              <div className={`
                w-10 h-5 rounded-full transition-colors relative
                ${!isMock ? 'bg-green-600' : 'bg-yellow-600'}
              `}>
                <div className={`
                  absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform
                  ${!isMock ? 'translate-x-5' : 'translate-x-0.5'}
                `} />
              </div>
            </button>

            {/* Divider */}
            <div className="border-t border-gray-200 my-1" />

            {/* Mock Explorer */}
            <a
              href="/mock-explorer"
              onClick={() => setIsOpen(false)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <BarChart3 size={20} className="text-blue-600" />
                <div className="text-left">
                  <div className="text-sm font-medium text-gray-900">
                    Mock Explorer
                  </div>
                  <div className="text-xs text-gray-500">
                    View & manage mock data
                  </div>
                </div>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </a>

            {/* Notification Demo Toggle */}
            <button
              onClick={handleNotificationToggle}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Bell size={20} className="text-purple-600" />
                <div className="text-left">
                  <div className="text-sm font-medium text-gray-900">
                    Notification Demo
                  </div>
                  <div className="text-xs text-gray-500">
                    {showNotificationDemo ? 'Visible' : 'Hidden'}
                  </div>
                </div>
              </div>
              <div className={`
                w-10 h-5 rounded-full transition-colors relative
                ${showNotificationDemo ? 'bg-purple-600' : 'bg-gray-300'}
              `}>
                <div className={`
                  absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform
                  ${showNotificationDemo ? 'translate-x-5' : 'translate-x-0.5'}
                `} />
              </div>
            </button>
          </div>

          {/* Footer */}
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              Development Tools
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DevToolsMenu;