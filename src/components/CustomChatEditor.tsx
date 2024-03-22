import React, {useEffect, useState} from "react";
import {useLocation, useNavigate, useParams} from "react-router-dom";
import ChatSettingsForm from "./ChatSettingsForm";
import {ChatSettings} from "../models/ChatSettings";
import chatSettingsDB, {getChatSettingsById} from "../service/ChatSettingsDB";
import Button from "./Button";
import {useTranslation} from 'react-i18next';

const CustomChatEditor: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {id} = useParams();
  const isEditing = Boolean(id);
  const initialChatSettings: ChatSettings = {
    id: isEditing ? parseInt(id!) : Date.now(),
    author: 'user',
    icon: null,
    name: '',
    description: '',
    instructions: 'You are a helpful assistant.',
    model: null,
    seed: null,
    temperature: null,
    top_p: null
  };
  const {t} = useTranslation();
  const [chatSettings, setChatSettings] = useState<ChatSettings>(initialChatSettings);

  useEffect(() => {
    let stateChatSetting = location.state?.initialChatSetting as ChatSettings | undefined;
    if (stateChatSetting) {
      stateChatSetting.id = Date.now();
      setChatSettings(stateChatSetting);
    } else if (isEditing && id) {
      const fetchChatSettings = async () => {
        const existingSettings = await getChatSettingsById(parseInt(id));
        if (existingSettings) {
          setChatSettings(existingSettings);
        }
      };
      fetchChatSettings();
    } else {
      setChatSettings(initialChatSettings);
    }
  }, [id, isEditing, location.state]);

  const handleSave = async () => {
    if (isEditing) {
      await chatSettingsDB.chatSettings.update(chatSettings.id, chatSettings);
    } else {
      await chatSettingsDB.chatSettings.add(chatSettings);
    }
    navigate('/explore');
  };

  const handleCancel = () => {
    navigate('/explore');
  };

  const onChange = (updatedChatSettings: ChatSettings) => {
    setChatSettings(updatedChatSettings);
  };

  return (
      <div className="h-full">
        <ChatSettingsForm chatSettings={chatSettings} onChange={onChange}/>
        <div className="flex justify-end space-x-4 px-8 mt-4 w-full md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto">
          <Button
              onClick={handleSave}
              disabled={!chatSettings.name}
              variant="primary"
          >
            {isEditing ? t('save-button') : t('create-button')}
          </Button>
          <Button
              onClick={handleCancel}
              variant="secondary"
              className="mr-2"
          >
            {t('cancel-button')}
          </Button>
        </div>
      </div>
  );
};

export default CustomChatEditor;
