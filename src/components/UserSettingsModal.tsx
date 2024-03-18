import React, {useState, useContext, useEffect, useRef} from 'react';
import {XMarkIcon} from "@heroicons/react/24/outline";
import {Theme, UserContext} from '../UserContext';
import ModelSelect from './ModelSelect';
import {EditableField} from "./EditableField";
import './UserSettingsModal.css';
import {OPENAI_DEFAULT_SYSTEM_PROMPT} from "../config";
import ConversationService from "../service/ConversationService";
import {NotificationService} from "../service/NotificationService";
import {useTranslation} from 'react-i18next';
import {Transition} from '@headlessui/react';
import EditableInstructions from './EditableInstructions';
import SpeechSpeedSlider from './SpeechSpeedSlider';

interface UserSettingsModalProps {
  isVisible: boolean;
  onClose: () => void;
  onDeleteAllConversations: () => void;
}

enum Tab {
  GENERAL_TAB = "General",
  INSTRUCTIONS_TAB = "Instructions",
  SPEECH_TAB = "Speech",
  STORAGE_TAB = "Storage",
}

const UserSettingsModal: React.FC<UserSettingsModalProps> = ({isVisible, onClose, onDeleteAllConversations}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const {userSettings, setUserSettings} = useContext(UserContext);
  const [activeTab, setActiveTab] = useState<Tab>(Tab.GENERAL_TAB);

  const [storageUsage, setStorageUsage] = useState<number | undefined>();
  const [storageQuota, setStorageQuota] = useState<number | undefined>();
  const [percentageUsed, setPercentageUsed] = useState<number | undefined>();
  const {t} = useTranslation();
  const editableInstructionsRef = useRef<{ getCurrentValue: () => string }>(null);

  useEffect(() => {
    if (isVisible) {
      setActiveTab(Tab.GENERAL_TAB);
    }
  }, [isVisible]);

  const formatBytesToMB = (bytes?: number) => {
    if (typeof bytes === 'undefined') {
      return;
    }
    const megabytes = bytes / 1024 / 1024;
    return `${megabytes.toFixed(2)} MB`;
  };

  const handleDeleteAllConversations = async () => {
    // Confirmation dialog to prevent accidental deletion
    const isConfirmed = window.confirm('Are you sure you want to delete all conversations? This action cannot be undone.');

    if (isConfirmed) {
      try {
        await ConversationService.deleteAllConversations();
        onDeleteAllConversations();
        NotificationService.handleSuccess("All conversations have been successfully deleted.");
      } catch (error) {
        console.error('Failed to delete all conversations:', error);
        if (error instanceof Error) {
          NotificationService.handleUnexpectedError(error, "Failed to delete all conversations");
        } else {
          // Handle the case where error is not an Error instance
          // Perhaps log this situation or display a generic message
          NotificationService.handleUnexpectedError(new Error('An unknown error occurred'), "Failed to delete all conversations");
        }
      }
    }
  };

  const handleClose = () => {
    const currentInstructions = editableInstructionsRef.current?.getCurrentValue();
    setUserSettings({...userSettings, instructions: currentInstructions || ''});
    onClose();
  };


  useEffect(() => {
    const closeModalOnOutsideClick = (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('mousedown', closeModalOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);

    return () => {
      document.removeEventListener('mousedown', closeModalOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [handleClose]);

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

  const renderStorageInfo = (value?: number | string) => value ?? t('non-applicable');

  return (
    <Transition show={isVisible} as={React.Fragment}>
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 px-4">
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <div ref={dialogRef}
               className="flex flex-col bg-white dark:bg-gray-850 rounded-lg w-full max-w-md mx-auto overflow-hidden"
               style={{minHeight: "640px", minWidth: "43em"}}>
            <div id='user-settings-header' className="flex justify-between items-center border-b border-gray-200 p-4">
              <h1 className="text-lg font-semibold">Settings</h1>
              <button onClick={handleClose}
                      className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100">
                <XMarkIcon className="h-8 w-8" aria-hidden="true"/>
              </button>
            </div>
            <div id='user-settings-content' className="flex flex-1">
              <div className="border-r border-gray-200 flex flex-col">
                <div
                  className={`cursor-pointer p-4 ${activeTab === Tab.GENERAL_TAB ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
                  onClick={() => setActiveTab(Tab.GENERAL_TAB)}>General
                </div>
                <div
                  className={`cursor-pointer p-4 ${activeTab === Tab.INSTRUCTIONS_TAB ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
                  onClick={() => setActiveTab(Tab.INSTRUCTIONS_TAB)}>Instructions
                </div>
                <div
                  className={`cursor-pointer p-4 ${activeTab === Tab.SPEECH_TAB ? 'bg-gray-200 dark:bg-gray-700' : ''}`} // Added new Tab
                  onClick={() => setActiveTab(Tab.SPEECH_TAB)}>Speech
                </div>
                <div
                  className={`cursor-pointer p-4 ${activeTab === Tab.STORAGE_TAB ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
                  onClick={() => setActiveTab(Tab.STORAGE_TAB)}>Storage
                </div>
              </div>
              <div className="flex-1 p-4 flex flex-col">
                <div className={`${activeTab === Tab.GENERAL_TAB ? 'flex flex-col flex-1' : 'hidden'}`}>
                  <div className="border-b border-token-border-light pb-3 last-of-type:border-b-0">
                    <div className="flex items-center justify-between setting-panel">
                      <label htmlFor="theme">Theme</label>
                      <select id='theme' name='theme'
                              className="custom-select dark:custom-select border-gray-300 border rounded p-2
                                dark:bg-gray-800 dark:text-white dark:border-gray-600"
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
                        {userSettings.model ? (
                            <label htmlFor="model">{t('model-header')}</label>
                        ) : (
                            <span>{t('model-header')}</span>
                        )}
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
                <div className={`${activeTab === Tab.INSTRUCTIONS_TAB ? 'flex flex-col flex-1' : 'hidden'}`}>
                  <div
                    className="flex flex-col flex-1 border-b border-token-border-light pb-3 last-of-type:border-b-0">
                    <EditableInstructions
                      ref={editableInstructionsRef}
                      initialValue={userSettings.instructions}
                      placeholder={OPENAI_DEFAULT_SYSTEM_PROMPT}
                      onChange={(text) => {
                        // setUserSettings({...userSettings, instructions: text});
                      }}
                      className="flex flex-col h-full"
                    />
                  </div>
                </div>
                <div className={`${activeTab === Tab.SPEECH_TAB ? 'flex flex-col flex-1' : 'hidden'}`}>
                  <div className="flex flex-col flex-1">
                    <div className="setting-panel flex justify-between">
                      <label htmlFor="speech-model">{t('model-header')}</label>
                      <select id="speech-model"
                              className="custom-select dark:custom-select border-gray-300 border rounded p-2 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                              value={userSettings.speechModel || undefined}
                              onChange={(e) => setUserSettings({...userSettings, speechModel: e.target.value})}>
                        <option value="tts-1">tts-1</option>
                        <option value="tts-1-hd">tts-1-hd</option>
                      </select>
                    </div>
                    <div className="setting-panel flex justify-between">
                      <label htmlFor="voice">{t('voice-header')}</label>
                      <select id="voice"
                              className="custom-select dark:custom-select border-gray-300 border rounded p-2 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                              value={userSettings.speechVoice || undefined}
                              onChange={(e) => setUserSettings({...userSettings, speechVoice: e.target.value})}>
                        <option value="alloy">Alloy</option>
                        <option value="echo">Echo</option>
                        <option value="fable">Fable</option>
                        <option value="onyx">Onyx</option>
                        <option value="nova">Nova</option>
                        <option value="shimmer">Shimmer</option>
                      </select>
                    </div>
                    <div className="setting-panel flex items-center justify-between">
                      {userSettings.speechSpeed ? (
                          <label htmlFor="speed">{t('speed-header')}</label>
                      ) : (
                          <span>{t('speed-header')}</span>
                      )}
                      <EditableField<number | null>
                        readOnly={false}
                        id="speed"
                        label=""
                        value={userSettings.speechSpeed}
                        defaultValue={1.0}
                        defaultValueLabel="1.0"
                        editorComponent={SpeechSpeedSlider}
                        onValueChange={(value: number | null) => setUserSettings({...userSettings, speechSpeed: value})}

                      />
                    </div>
                  </div>
                </div>
                <div className={`${activeTab === Tab.STORAGE_TAB ? 'flex flex-col flex-1' : 'hidden'}`}>
                  <h3 className="text-lg mb-4">Storage</h3>
                  <p>Chats are stored locally in your browser's IndexedDB.</p>
                  <p>Usage: {renderStorageInfo(formatBytesToMB(storageUsage))} of
                    {renderStorageInfo(formatBytesToMB(storageQuota))}
                    ({renderStorageInfo(percentageUsed ? `${percentageUsed.toFixed(2)}%` : undefined)})
                  </p>
                  <button onClick={handleDeleteAllConversations}
                          className="mt-4 py-2 px-4 bg-red-500 text-white rounded hover:bg-red-700">Delete All Chats
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Transition.Child>
      </div>
    </Transition>
  );
};

export default UserSettingsModal;
