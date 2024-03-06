import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon } from '@heroicons/react/24/outline';
import ChatSettingsList from './ChatSettingsList';
import chatSettingsDB from '../service/ChatSettingsDB';
import { ChatSettings } from '../models/ChatSettings';
import {useTranslation} from 'react-i18next';

const ExploreCustomChats: React.FC = () => {
  const [exampleChats, setExampleChats] = useState<ChatSettings[]>([]);
  const [myChats, setMyChats] = useState<ChatSettings[]>([]);
  const navigate = useNavigate();
  const {t} = useTranslation();

  useEffect(() => {
    const fetchChatSettings = async () => {
      const allChatSettings = await chatSettingsDB.chatSettings.orderBy('name').toArray();
      setExampleChats(allChatSettings.filter(chat => chat.author === 'system'));
      setMyChats(allChatSettings.filter(chat => chat.author === 'user'));
    };

    fetchChatSettings();
  }, []);

  return (
    <div className="flex justify-center items-center h-screen gap-4 md:gap-6 md:max-w-2xl lg:max-w-3xl xl:max-w-4xl 2xl:max-w-5xl 3xl:max-w-6xl 4xl:max-w7xl p-4 lg:px-0 m-auto transform translate-y-[-30%]">
      <div className="w-full">
        <h2 className="text-xl font-bold mb-2">{t('example-chats')}</h2>
        <ChatSettingsList chatSettings={exampleChats}/>
        <h2 className="text-xl font-bold mt-8 mb-2">{t('my-chats')}</h2>
        <button
          className="flex items-center gap-2 p-2 mb-4 w-full text-left border border-transparent rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          onClick={() => navigate('/custom/editor')}
        >
          <div
            className="flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center rounded-full border border-dashed border-token-border-light bg-gray-100 dark:bg-gray-900 ">
            <PlusIcon className="w-5 h-5 text-black dark:text-white"/>
          </div>
          <div>
            <div className="font-medium">Create a Custom Chat</div>
            <div className="text-sm text-gray-600">Customize Chat Settings for a specific purpose.</div>
          </div>
        </button>
        <ChatSettingsList chatSettings={myChats}/>
      </div>
    </div>
  );
};

export default ExploreCustomChats;
