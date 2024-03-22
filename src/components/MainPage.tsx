import React, {useContext, useEffect, useRef, useState} from 'react';
import {ChatService} from "../service/ChatService";
import Chat from "./Chat";
import {ChatCompletion, ChatMessage, MessageType, Role} from "../models/ChatCompletion";
import {ScrollToBottomButton} from "./ScrollToBottomButton";
import {OPENAI_DEFAULT_SYSTEM_PROMPT} from "../config";
import {CustomError} from "../service/CustomError";
import {useLocation, useNavigate, useParams} from "react-router-dom";
import {useTranslation} from 'react-i18next';
import MessageBox, {MessageBoxHandles} from "./MessageBox";
import {CONVERSATION_NOT_FOUND, DEFAULT_INSTRUCTIONS, MAX_TITLE_LENGTH} from "../constants/appConstants";
import {ChatSettings} from '../models/ChatSettings';
import chatSettingsDB, {chatSettingsEmitter, updateShowInSidebar} from '../service/ChatSettingsDB';
import ChatSettingDropdownMenu from "./ChatSettingDropdownMenu";
import ConversationService, {Conversation} from '../service/ConversationService';
import {UserContext} from '../UserContext';
import {NotificationService} from '../service/NotificationService';
import CustomChatSplash from './CustomChatSplash';

export const updateConversationMessages = async (id: number, updatedMessages: any[]) => {
  const conversation = await ConversationService.getConversationById(id);
  if (conversation) {
    conversation.messages = JSON.stringify(updatedMessages);
    await ConversationService.updateConversation(conversation);
  }
}

function getFirstValidString(...args: (string | undefined | null)[]): string {
  for (const arg of args) {
    if (arg !== null && arg !== undefined && arg.trim() !== '') {
      return arg;
    }
  }
  return '';
}

function useCurrentPath() {
  return useLocation().pathname;
}

interface MainPageProps {
  className: string;
  isSidebarCollapsed: boolean;
  toggleSidebarCollapse: () => void;
}

const MainPage: React.FC<MainPageProps> = ({className, isSidebarCollapsed, toggleSidebarCollapse}) => {
  const {userSettings, setUserSettings} = useContext(UserContext);
  const {t} = useTranslation();
  const [chatSettings, setChatSettings] = useState<ChatSettings | undefined>(undefined);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [model, setModel] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const {id, gid} = useParams<{ id?: string, gid?: string }>();
  const currentPath = useCurrentPath();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [allowAutoScroll, setAllowAutoScroll] = useState(true);
  const messageBoxRef = useRef<MessageBoxHandles>(null);
  const chatSettingsRef = useRef(chatSettings);

  useEffect(() => {
    chatSettingsRef.current = chatSettings;
  }, [chatSettings]);

  useEffect(() => {
    chatSettingsEmitter.on('chatSettingsChanged', chatSettingsListener);
    return () => {
      chatSettingsEmitter.off('chatSettingsChanged', chatSettingsListener);
    };
  }, []);

  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/') {
      newConversation();
    } else {
      if (id) {
        handleSelectedConversation(id);
      } else {
        newConversation();
      }
    }

    if (gid) {
      const gidNumber = Number(gid);
      if (!isNaN(gidNumber)) {
        fetchAndSetChatSettings(gidNumber);
      } else {
        setChatSettings(undefined);
      }
    } else {
      setChatSettings(undefined);
    }
  }, [gid, id, location.pathname]);

  useEffect(() => {
    if (messages.length === 0) {
      setConversation(null);
    }
    if (conversation && conversation.id) {
      // Only update if there are messages
      if (messages.length > 0) {
        updateConversationMessages(conversation.id, messages);
      }
    }
  }, [messages]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        ChatService.cancelStream();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    if (userSettings.model) {
      setModel(userSettings.model);
    }

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (userSettings.model) {
      setModel(userSettings.model);
    }
  }, [userSettings]);

  const chatSettingsListener = (data: { gid?: number }) => {
    const currentChatSettings = chatSettingsRef.current;
    if (data && typeof data === 'object') {
      if (currentChatSettings && currentChatSettings.id === data.gid) {
        fetchAndSetChatSettings(data.gid);
      }
    } else {
      if (currentChatSettings) {
        fetchAndSetChatSettings(currentChatSettings.id);
      }
    }
  };

  const fetchAndSetChatSettings = async (gid: number) => {
    try {
      const settings = await chatSettingsDB.chatSettings.get(gid);
      setChatSettings(settings);
    } catch (error) {
      console.error('Failed to fetch chat settings:', error);
    }
  };

  const newConversation = () => {
    setConversation(null);
    setShowScrollButton(false);
    clearTextArea();
    setMessages([]);
    messageBoxRef.current?.focusTextarea();
  }
  const handleSelectedConversation = (id: string | null) => {
    if (id && id.length > 0) {
      let n = Number(id);
      ConversationService.getConversationById(n)
          .then(conversation => {
            if (conversation) {
              setConversation(conversation);
              const messages: ChatMessage[] = JSON.parse(conversation.messages);
              if (messages.length == 0) {
                // Race condition: the navigate to /c/id and the updating of the messages state
                // are happening at the same time.
                console.warn('possible state problem');
              } else {
                setMessages(messages);
              }
              clearTextArea();
            } else {
              const errorMessage: string = 'Conversation ' + location.pathname + ' not found';
              NotificationService.handleError(errorMessage, CONVERSATION_NOT_FOUND);
              navigate('/');
            }
          });
    } else {
      newConversation();
    }
    setAllowAutoScroll(true);
    setShowScrollButton(false)
    messageBoxRef.current?.focusTextarea();
  }


  function getTitle(message: string): string {
    let title = message.trimStart(); // Remove leading newlines
    let firstNewLineIndex = title.indexOf('\n');
    if (firstNewLineIndex === -1) {
      firstNewLineIndex = title.length;
    }
    return title.substring(0, Math.min(firstNewLineIndex, MAX_TITLE_LENGTH));
  }

  function startConversation(message: string) {
    const id = Date.now();
    const timestamp = Date.now();
    let shortenedText = getTitle(message);
    let instructions = getFirstValidString(chatSettings?.instructions, userSettings.instructions, OPENAI_DEFAULT_SYSTEM_PROMPT, DEFAULT_INSTRUCTIONS);
    const conversation: Conversation = {
      id: id,
      gid: getEffectiveChatSettings().id,
      timestamp: timestamp,
      title: shortenedText,
      model: model,
      systemPrompt: instructions,
      messages: "[]",
    };
    setConversation(conversation);
    ConversationService.addConversation(conversation);
    if (gid) {
      navigate(`/g/${gid}/c/${conversation.id}`);
      updateShowInSidebar(Number(gid), 1);
    } else {
      navigate(`/c/${conversation.id}`);
    }
  }

  const handleModelChange = (value: string | null) => {
    setModel(value);
  };

  const callApp = (message: string) => {
    if (!conversation) {
      startConversation(message);
    }
    setAllowAutoScroll(true);
    addMessage(Role.User, MessageType.Normal, message, sendMessage);
  }

  const addMessage = (role: Role, messageType: MessageType, content: string, callback?: (callback: ChatMessage[]) => void) => {

    setMessages((prevMessages: ChatMessage[]) => {
      const message: ChatMessage = {
        id: prevMessages.length + 1,
        role: role,
        messageType: messageType,
        content: content
      };
      return [...prevMessages, message];
    });

    const newMessage: ChatMessage = {
      id: messages.length + 1,
      role: role,
      messageType: messageType,
      content: content
    };
    const updatedMessages = [...messages, newMessage];
    if (callback) {
      callback(updatedMessages);
    }
  };

  function getEffectiveChatSettings(): ChatSettings {
    let effectiveSettings = chatSettings;
    if (!effectiveSettings) {
      effectiveSettings = {
        id: 0,
        author: 'system',
        name: 'default',
        model: model
      }
    }
    return effectiveSettings;
  }

  function sendMessage(updatedMessages: ChatMessage[]) {
    setLoading(true);
    clearTextArea();
    let systemPrompt = getFirstValidString(conversation?.systemPrompt, chatSettings?.instructions, userSettings.instructions, OPENAI_DEFAULT_SYSTEM_PROMPT, DEFAULT_INSTRUCTIONS);
    let messages: ChatMessage[] = [{
      role: Role.System,
      content: systemPrompt
    } as ChatMessage, ...updatedMessages];

    let effectiveSettings = getEffectiveChatSettings();

    ChatService.sendMessageStreamed(effectiveSettings, messages, handleStreamedResponse)
        .then((response: ChatCompletion) => {
          // nop
        })
        .catch(err => {
              if (err instanceof CustomError) {
                const message: string = err.message;
                setLoading(false);
                addMessage(Role.Assistant, MessageType.Error, message);
              } else {
                NotificationService.handleUnexpectedError(err, 'Failed to send message to openai.');
              }
            }
        ).finally(() => {
      setLoading(false); // Stop loading here, whether successful or not
    });
  }

  function handleStreamedResponse(content: string) {
    setMessages(prevMessages => {
      let isNew: boolean = false;
      try {
        // todo: this shouldn't be necessary
        if (prevMessages.length == 0) {
          console.error('prevMessages should not be empty in handleStreamedResponse.');
          return [];
        }
        if ((prevMessages[prevMessages.length - 1].role == Role.User)) {
          isNew = true;
        }
      } catch (e) {
        console.error('Error getting the role')
        console.error('prevMessages = ' + JSON.stringify(prevMessages));
        console.error(e);
      }

      if (isNew) {
        const message: ChatMessage = {
          id: prevMessages.length + 1,
          role: Role.Assistant,
          messageType: MessageType.Normal,
          content: content
        };
        return [...prevMessages, message];
      } else {
        // Clone the last message and update its content
        const updatedMessage = {
          ...prevMessages[prevMessages.length - 1],
          content: prevMessages[prevMessages.length - 1].content + content
        };

        // Replace the old last message with the updated one
        return [...prevMessages.slice(0, -1), updatedMessage];
      }
    });
  }

  const scrollToBottom = () => {
    const chatContainer = document.getElementById('chat-container'); // Replace with your chat container's actual ID
    if (chatContainer) {
      chatContainer.scroll({
        top: chatContainer.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  const clearTextArea = () => {
    messageBoxRef.current?.clearTextValue();
  };

  const getTextAreaValue = () => {
    const value = messageBoxRef.current?.getTextValue();
  };

  const handleUserScroll = (isAtBottom: boolean) => {
    setAllowAutoScroll(isAtBottom);
    setShowScrollButton(!isAtBottom);
  };

  return (
      <div className={`${className} overflow-hidden w-full h-full relative flex z-0 dark:bg-gray-900`}>
        <div className="flex flex-col items-stretch w-full h-full">
          <main
              className="relative h-full transition-width flex flex-col overflow-hidden items-stretch flex-1">
            {gid ? (
                <div className="inline-block absolute top-0 left-0 z-50">
                  <ChatSettingDropdownMenu chatSetting={chatSettings}/>
                </div>
            ) : null
            }
            {!conversation && chatSettings ? (
                <CustomChatSplash className=" -translate-y-[10%] " chatSettings={chatSettings}/>
            ) : null}
            <Chat chatBlocks={messages} onChatScroll={handleUserScroll} conversation={conversation}
                  model={model}
                  onModelChange={handleModelChange} allowAutoScroll={allowAutoScroll} loading={loading}/>
            {/*</div>*/}
            {/* Absolute container for the ScrollToBottomButton */}
            {showScrollButton && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 mb-10 z-10">
                  <ScrollToBottomButton onClick={scrollToBottom}/>
                </div>
            )}
            {/* MessageBox remains at the bottom */}
            <MessageBox ref={messageBoxRef} callApp={callApp} loading={loading} setLoading={setLoading}/>
          </main>
        </div>
      </div>
  );
}

export default MainPage;

