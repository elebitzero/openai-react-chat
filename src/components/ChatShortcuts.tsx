import React, {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import chatSettingsDB from '../service/ChatSettingsDB';
import {ChatSettings} from '../models/ChatSettings';
import {chatSettingsEmitter} from '../service/EventEmitter';

const ChatShortcuts: React.FC = () => {
  const [chatSettings, setChatSettings] = useState<ChatSettings[]>([]);

  const loadChatSettings = async () => {
    const filteredAndSortedChatSettings = await chatSettingsDB.chatSettings
      .where('showInSidebar').equals(1)
      .sortBy('name');
    setChatSettings(filteredAndSortedChatSettings);
  };

  const onDatabaseUpdate = (data: any) => {
    loadChatSettings();
  };

  useEffect(() => {
    chatSettingsEmitter.on('chatSettingsChanged', onDatabaseUpdate);
    loadChatSettings();
    return () => {
      chatSettingsEmitter.off('chatSettingsChanged', onDatabaseUpdate);
    };
  }, []);

  return (
    <div>
      {chatSettings.map((setting) => (
        <Link to={`/g/${setting.id}`} key={setting.id}
              className="flex py-3 px-3 items-center gap-3 relative rounded-md cursor-pointer break-all hover:bg-gray-100 dark:hover:bg-gray-800">
          {setting.icon?.data && <img src={setting.icon.data} alt="" className="bg-gray-100 dark:bg-gray-400" style={{width: 24, height: 24}}/>}
          <span
            className="flex-1 overflow-hidden whitespace-nowrap overflow-ellipsis max-h-5 break-all relative dark:text-gray-100 text-gray-800">
      {setting.name}
    </span>
        </Link>
      ))}
    </div>
  );
};

export default ChatShortcuts;
