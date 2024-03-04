import React, {useEffect, useRef, useState, useContext} from 'react';
import ChatBlock from "./ChatBlock";
import ModelSelect from "./ModelSelect";
import {OpenAIModel} from "../models/model";
import {ChatService} from "../service/ChatService";
import {ChatMessage} from "../models/ChatCompletion";
import {useTranslation} from 'react-i18next';
import Tooltip from "./Tooltip";
import {Conversation} from "../service/ConversationService";
import {OPENAI_DEFAULT_SYSTEM_PROMPT} from "../config";
import {DEFAULT_INSTRUCTIONS} from "../constants/appConstants";
import { UserContext } from '../UserContext';
import {InformationCircleIcon, PaperAirplaneIcon} from "@heroicons/react/24/outline";
import { NotificationService } from '../service/NotificationService';

interface Props {
    chatBlocks: ChatMessage[];
    onChatScroll: (isAtBottom : boolean) => void;
    allowAutoScroll: boolean;
    model: string | null;
    onModelChange: (value: string | null) => void;
    conversation: Conversation | null;
    loading: boolean;
}

const Chat: React.FC<Props> = ({chatBlocks, onChatScroll, allowAutoScroll, model,
                                   onModelChange, conversation, loading}) => {
    const { userSettings, setUserSettings } = useContext(UserContext);
    const { t } = useTranslation();
    const [models, setModels] = useState<OpenAIModel[]>([]);
    const chatDivRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        ChatService.getModels()
          .then(models => {
              setModels(models);
          })
          .catch(err => {
              NotificationService.handleUnexpectedError(err,'Failed to get list of models');
          });

    }, []);

    useEffect(() => {
        if (chatDivRef.current && allowAutoScroll) {
            chatDivRef.current.scrollTop = chatDivRef.current.scrollHeight;
        }
    }, [chatBlocks]);

    useEffect(() => {
        const chatContainer = chatDivRef.current;
        if (chatContainer) {
            const isAtBottom =
              chatContainer.scrollHeight - chatContainer.scrollTop ===
              chatContainer.clientHeight;

            // Initially hide the button if chat is at the bottom
            onChatScroll(isAtBottom);
        }
    }, []);

    const findModelById = (id: string | null): OpenAIModel | undefined => {
        return models.find(model => model.id === id);
    };

    const formatContextWindow = (context_window: number | undefined) => {
        if (context_window) {
            return Math.round(context_window / 1000) + 'k';
        }
        return '?k';
    }

    const handleScroll = () => {
        if (chatDivRef.current) {
            const scrollThreshold = 20;
            const isAtBottom =
              chatDivRef.current.scrollHeight -
              chatDivRef.current.scrollTop <=
              chatDivRef.current.clientHeight + scrollThreshold;

            // Notify parent component about the auto-scroll status
            onChatScroll(isAtBottom);

            // Disable auto-scroll if the user scrolls up
            if (!isAtBottom) {
                onChatScroll(false);
            }
        }
    };

    return (
      <div className="flex-1 overflow-auto" ref={chatDivRef} id={'chat-container'} onScroll={handleScroll}>
          <div className="flex flex-col items-center text-sm dark:bg-gray-900">
              <div
                className={`flex w-full items-center justify-center gap-1 p-3 text-gray-500 dark:border-gray-900/50 dark:bg-gray-900 dark:text-gray-300 ${!(conversation === null) ? 'border-b border-black/10' : ''}`}>
                  <div className="flex items-center flex-row gap-1">
                      {!conversation ? '' : (
                          <Tooltip title={conversation.systemPrompt ?? userSettings.instructions ?? OPENAI_DEFAULT_SYSTEM_PROMPT ?? DEFAULT_INSTRUCTIONS} side="bottom" sideOffset={10}>
                              <span style={{marginLeft: '10px', fontSize: '0.85rem', color: '#6b7280'}}>
                                 <InformationCircleIcon width={20} height={20} stroke={'currentColor'}/>
                              </span>
                          </Tooltip>
                        )}
                        <span style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            {t('model')}
                            {!conversation ? '' : (
                              <span>

                                  <span style={{marginLeft:'0.25em'}}>{conversation.model}</span>
                                  <Tooltip title={t('context-window')} side="bottom" sideOffset={10}>
                                      <span style={{marginLeft: '10px', fontSize: '0.85rem', color: '#6b7280'}}>
                                        {formatContextWindow(findModelById(conversation.model)?.context_window)}
                                      </span>
                                  </Tooltip>
                                     <Tooltip title={t('knowledge-cutoff')} side="bottom" sideOffset={10}>
                                      <span style={{marginLeft: '10px', fontSize: '0.85rem', color: '#6b7280'}}>
                                        {findModelById(conversation.model)?.knowledge_cutoff}
                                      </span>
                                  </Tooltip>
                              </span>
                            )
                            }
                        </span>

                      <span className="flex-grow">
                          <div style={{display: !conversation ? 'block' : 'none', width: '50ch'}}>
                            <ModelSelect value={model} onModelSelect={onModelChange} models={models}/>
                          </div>
                      </span>
                  </div>
              </div>
              {chatBlocks.map((block, index) => (
                <ChatBlock key={`chat-block-${block.id}`} block={block} loading={index === chatBlocks.length - 1 && loading}/>
              ))}
              <div className="w-full h-24 flex-shrink-0"></div>
          </div>
      </div>
    );
};

export default Chat;
