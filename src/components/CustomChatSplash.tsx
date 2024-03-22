import React from 'react';
import {ChatSettings} from '../models/ChatSettings';
import CubeIcon from "@heroicons/react/24/outline/CubeIcon";

interface CustomChatSplashProps {
  chatSettings: ChatSettings;
  className?: string;
}

const CustomChatSplash: React.FC<CustomChatSplashProps> = ({chatSettings, className,}) => {

  return (
      <div className={`flex h-full flex-col items-center justify-center ${className}`}>
        <div className="relative">
          <div className="mb-3 h-20 w-20">
            <div className="bg-white overflow-hidden rounded-full">
              {(chatSettings.icon && chatSettings.icon.data) ? (
                  <img src={chatSettings.icon.data} alt="" className="h-full w-full"/>
              ) : (
                  <CubeIcon className="h-full w-full text-gray-900 dark:text-gray-200"/>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="text-center text-2xl font-medium">{chatSettings.name}</div>
          <div
              className="max-w-md text-center text-sm font-normal">{chatSettings.description}</div>
        </div>
      </div>
  );
};

export default CustomChatSplash;
