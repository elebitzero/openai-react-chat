import React from 'react';
import {useNavigate} from 'react-router-dom';
import {ChatSettings} from '../models/ChatSettings';
import CubeIcon from '@heroicons/react/24/outline/CubeIcon';
import './ExploreCustomChats.css'
import ChatSettingDropdownMenu from './ChatSettingDropdownMenu';

interface ChatSettingsListProps {
  chatSettings: ChatSettings[];
}

const ChatSettingsList: React.FC<ChatSettingsListProps> = ({chatSettings}) => {
  const navigate = useNavigate();

  const navigateToChatSetting = (id: number) => {
    navigate(`/g/${id}`, {state: {reset: Date.now()}});
  };

  return (
      <div className="w-full chat-settings-grid">
        {chatSettings.map((setting) => (
            <div
                key={setting.id}
                onClick={() => navigateToChatSetting(setting.id)}
                className="flex items-center gap-4 cursor-pointer p-3 bg-gray-100 hover:bg-gray-200 rounded-lg dark:bg-gray-700 dark:hover:bg-gray-600 relative"
            >
              <div className="bg-transparent absolute top-0 right-0">
                <ChatSettingDropdownMenu chatSetting={setting} showTitle={false} showDelete={true} alignRight={true}
                                         className="bg-transparent"/>
              </div>
              <div className="h-12 w-12 flex-shrink-0">
                <div className="bg-white overflow-hidden rounded-full">
                  {(setting.icon && setting.icon.data) ? (
                      <img src={setting.icon.data} alt="" className="h-full w-full"/>
                  ) : (
                      <CubeIcon className="h-full w-full text-gray-900"/>
                  )}
                </div>
              </div>
              <div className="overflow-hidden">
                <span
                    className="text-sm font-medium leading-tight line-clamp-2 text-gray-900 dark:text-gray-200">{setting.name}</span>
                <span
                    className="text-xs line-clamp-3 text-gray-600 dark:text-gray-400">{setting.description}</span>
              </div>
            </div>
        ))}
      </div>
  );
};
export default ChatSettingsList;
