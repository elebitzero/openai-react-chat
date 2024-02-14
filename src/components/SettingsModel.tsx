import React, { useState, useContext, useEffect } from 'react';
import {XMarkIcon} from "@heroicons/react/24/outline";
import { ThemeContext } from '../ThemeContext';

interface SettingsModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isVisible, onClose }) => {
  const { themePreference, setThemePreference } = useContext(ThemeContext);
  const [themeSelection, setThemeSelection] = useState(themePreference);
  const [activeTab, setActiveTab] = useState<'General' | 'Storage'>('General');

  // Storage estimation state keeps as potentially undefined
  const [storageUsage, setStorageUsage] = useState<number | undefined>();
  const [storageQuota, setStorageQuota] = useState<number | undefined>();
  const [percentageUsed, setPercentageUsed] = useState<number | undefined>();

  const formatBytesToMB = (bytes?: number) => {
    if (typeof bytes === 'undefined') return; // Return undefined if not available
    const megabytes = bytes / 1024 / 1024;
    return `${megabytes.toFixed(2)} MB`;
  };

  useEffect(() => {
    setThemePreference(themeSelection);
  }, [themeSelection, setThemePreference]);

  useEffect(() => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      navigator.storage.estimate().then(({usage, quota}) => {
        setStorageUsage(usage);
        setStorageQuota(quota);
        if (typeof usage !== 'undefined' && typeof quota !== 'undefined') {
          setPercentageUsed(((usage / quota) * 100));
        }
      }).catch(error => {
        console.error('Error getting storage estimate:', error);
      });
    } else {
      console.log('Storage Estimation API is not supported in this browser.');
    }
  }, []);

  if (!isVisible) {
    return null;
  }

  // Helper function to optionally render storage info or 'N/A'
  const renderStorageInfo = (value?: number | string) => value ?? 'N/A';

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-lg w-full max-w-md mx-auto overflow-hidden" style={{minHeight:"250px", minWidth:"500px"}}>
        <div className="flex justify-between items-center border-b border-gray-200 p-4">
          <h1 className="text-lg font-semibold">Settings</h1>
          <button onClick={onClose} className="text-gray-700 hover:text-gray-900">
            <XMarkIcon className="h-8 w-8" aria-hidden="true" />
          </button>
        </div>
        <div className="flex flex-row">
          <div className="border-r border-gray-200">
            <div className={`cursor-pointer p-4 ${activeTab === 'General' ? 'bg-gray-200' : ''}`} onClick={() => setActiveTab('General')}>General</div>
            <div className={`cursor-pointer p-4 ${activeTab === 'Storage' ? 'bg-gray-200' : ''}`} onClick={() => setActiveTab('Storage')}>Storage</div>
          </div>
          <div className="flex-1 p-4">
            <div className={`${activeTab === 'General' ? '' : 'hidden'}`}>
              <h3 className="text-lg mb-4">Theme</h3>
              <select className="border-gray-300 border rounded p-2" value={themeSelection}
                      onChange={(e) => setThemeSelection(e.target.value as 'light' | 'dark' | 'system')}>
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="system">System</option>
              </select>
            </div>
            <div className={`${activeTab === 'Storage' ? '' : 'hidden'}`}>
              <h3 className="text-lg mb-4">Storage</h3>
              <p>Chats are stored locally in your browser's IndexedDB.</p>
              <p>Usage: {renderStorageInfo(formatBytesToMB(storageUsage))} of {renderStorageInfo(formatBytesToMB(storageQuota))} ({renderStorageInfo(percentageUsed ? `${percentageUsed.toFixed(2)}%` : undefined)})
              </p>
              <button className="mt-4 py-2 px-4 bg-red-500 text-white rounded hover:bg-red-700">Delete All Chats
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
