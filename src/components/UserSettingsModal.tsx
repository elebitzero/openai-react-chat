import React, { useState, useContext, useEffect } from 'react';
import {XMarkIcon} from "@heroicons/react/24/outline";
import {Theme, UserContext } from '../UserContext';
import ModelSelect from './ModelSelect';
import {EditableField} from "./EditableField";
import './UserSettingsModal.css';
import {OPENAI_DEFAULT_SYSTEM_PROMPT} from "../config";

interface UserSettingsModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const UserSettingsModal: React.FC<UserSettingsModalProps> = ({ isVisible, onClose }) => {
  const { userSettings, setUserSettings } = useContext(UserContext);
  const [activeTab, setActiveTab] = useState<'General' | 'Storage' | 'Instructions'>('General');

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
      <div className="flex flex-col bg-white dark:bg-gray-850 rounded-lg w-full max-w-md mx-auto overflow-hidden" style={{minHeight:"640px", minWidth:"43em"}}>
        <div id='user-settings-header' className="flex justify-between items-center border-b border-gray-200 p-4">
          <h1 className="text-lg font-semibold">Settings</h1>
          <button onClick={onClose} className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100">
            <XMarkIcon className="h-8 w-8" aria-hidden="true" />
          </button>
        </div>
        <div id='user-settings-content' className="flex flex-1">
          <div className="border-r border-gray-200 flex flex-col">
            <div className={`cursor-pointer p-4 ${activeTab === 'General' ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
                 onClick={() => setActiveTab('General')}>General
            </div>
            <div className={`cursor-pointer p-4 ${activeTab === 'Instructions' ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
                 onClick={() => setActiveTab('Instructions')}>Instructions
            </div>
            <div className={`cursor-pointer p-4 ${activeTab === 'Storage' ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
                 onClick={() => setActiveTab('Storage')}>Storage
            </div>
          </div>
          <div className="flex-1 p-4 flex flex-col">
            <div className={`${activeTab === 'General' ? 'flex flex-col flex-1' : 'hidden'}`}>
              <div className="border-b border-token-border-light pb-3 last-of-type:border-b-0">
                <div className="flex items-center justify-between setting-panel">
                  <label htmlFor="theme">Theme</label>
                  <select id='theme' name='theme'
                          className="border-gray-300 border rounded p-2 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                          value={userSettings.userTheme}
                          onChange={(e) => {
                            setUserSettings({...userSettings, userTheme: e.target.value as Theme});
                          }}>
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                    <option value="system">System</option>
                  </select>

                </div>
                <div className="flex items-center justify-between setting-panel">
                  <label htmlFor="model">Model</label>
                  <EditableField<string | null>
                    readOnly={false}
                    id="model"
                    label=""
                    value={userSettings.model}
                    defaultValue={null}
                    defaultValueLabel={'gpt-4-turbo-preview'}
                    editorComponent={(props) =>
                      <ModelSelect value={userSettings.model}
                                   onModelSelect={props.onValueChange}
                                   models={[]} allowNone={true}
                                   allowNoneLabel="Default"/>}
                    onValueChange={(value: string | null) => {
                      setUserSettings({...userSettings, model: value});
                    }}
                  />
                </div>
              </div>
            </div>
            <div className={`${activeTab === 'Instructions' ? 'flex flex-col flex-1' : 'hidden'}`}>
              <div className="flex flex-col flex-1 border-b border-token-border-light pb-3 last-of-type:border-b-0">
                <textarea
                  id="instructions"
                  name="instructions"
                  value={userSettings.instructions}
                  placeholder={OPENAI_DEFAULT_SYSTEM_PROMPT}
                  onChange={(e) => {
                    setUserSettings({...userSettings, instructions: e.target.value});
                  }}
                  className="flex-1 resize-y rounded overflow-y-auto h-72 w-full max-h-[60vh] md:max-h-[calc(100vh-300px)] shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 dark:border-gray-600 dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  spellCheck={false}
                ></textarea>
            </div>
            </div>
            <div className={`${activeTab === 'Storage' ? 'flex flex-col flex-1' : 'hidden'}`}>
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

export default UserSettingsModal;
