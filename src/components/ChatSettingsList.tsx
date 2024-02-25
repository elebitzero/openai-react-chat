import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChatSettings } from '../models/ChatSettings';
import CubeIcon from '@heroicons/react/24/outline/CubeIcon';
import './ExploreCustomChats.css'
interface ChatSettingsListProps {
  chatSettings: ChatSettings[];
}

const ChatSettingsList: React.FC<ChatSettingsListProps> = ({ chatSettings }) => {
  const navigate = useNavigate();

  const navigateToChatSetting = (id: number) => {
    navigate(`/g/${id}`);
  };

  return (
    <div className="w-full chat-settings-grid">
      {chatSettings.map((setting) => (
        <div
          key={setting.id}
          onClick={() => navigateToChatSetting(setting.id)}
          className="flex items-center gap-4 overflow-hidden cursor-pointer p-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
        >
          <div className="h-12 w-12 flex-shrink-0">
            <div className="overflow-hidden rounded-full">
              {(setting.icon && setting.icon.data) ? (
                <img src={setting.icon.data} alt="" className="h-full w-full" />
              ) : (
                <CubeIcon className="h-full w-full" />
              )}
            </div>
          </div>
          <div className="overflow-hidden">
            <span className="text-sm font-medium leading-tight line-clamp-2">{setting.name}</span>
            <span className="text-xs line-clamp-3">{setting.description}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatSettingsList;
