import React, { useEffect, useState } from 'react';
import ChatSettingsList from './ChatSettingsList';
import chatSettingsDB from '../service/ChatSettingsDB';
import { ChatSettings } from '../models/ChatSettings';

const ExploreCustomChats: React.FC = () => {
  const [allChatSettings, setAllChatSettings] = useState<ChatSettings[]>([]);

  useEffect(() => {
    const fetchChatSettings = async () => {
      const chatSettings = await chatSettingsDB.chatSettings.orderBy('name').toArray();
      setAllChatSettings(chatSettings);
    };

    fetchChatSettings();
  }, []);

  return (
    // TailwindCSS classes for flexbox centering and potentially full height
    <div className="flex justify-center items-center h-screen gap-4 md:gap-6 md:max-w-2xl lg:max-w-3xl xl:max-w-4xl 2xl:max-w-5xl 3xl:max-w-6xl 4xl:max-w7xl p-4 lg:px-0 m-auto transform translate-y-[-30%]">
      <div className="w-full">
        <h2 className="text-xl font-bold mb-2">Example Custom Chats</h2>
        <ChatSettingsList chatSettings={allChatSettings} />
        <h2 className="text-xl font-bold mt-8 mb-2">My Custom Chats</h2>
        <ChatSettingsList chatSettings={allChatSettings} />
      </div>
    </div>
  );
};

export default ExploreCustomChats;
