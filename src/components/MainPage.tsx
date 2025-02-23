import React, {useContext, useEffect, useRef, useState} from 'react';
import {ChatService} from "../service/ChatService";
import Chat from "./Chat";
import {ChatCompletion, ChatMessage, MessageType, Role} from "../models/ChatCompletion";
import {ScrollToBottomButton} from "./ScrollToBottomButton";
import {OPENAI_DEFAULT_SYSTEM_PROMPT} from "../config";
import {CustomError} from "../service/CustomError";
import {useLocation, useNavigate, useParams} from "react-router-dom";
import {useTranslation} from 'react-i18next';
import ReactDOM from 'react-dom/client';
import MessageBox, {MessageBoxHandles} from "./MessageBox";
import {
  CONVERSATION_NOT_FOUND,
  DEFAULT_INSTRUCTIONS,
  DEFAULT_MODEL,
  MAX_TITLE_LENGTH,
  SNIPPET_MARKERS
} from "../constants/appConstants";
import {ChatSettings} from '../models/ChatSettings';
import chatSettingsDB, {chatSettingsEmitter, updateShowInSidebar} from '../service/ChatSettingsDB';
import ChatSettingDropdownMenu from "./ChatSettingDropdownMenu";
import ConversationService, {Conversation} from '../service/ConversationService';
import {UserContext} from '../UserContext';
import {NotificationService} from '../service/NotificationService';
import CustomChatSplash from './CustomChatSplash';
import {FileDataRef} from '../models/FileData';
import {OpenAIModel} from '../models/model';
import {ArrowUturnDownIcon} from '@heroicons/react/24/outline';

function getFirstValidString(...args: (string | undefined | null)[]): string {
  for (const arg of args) {
    if (arg !== null && arg !== undefined && arg.trim() !== '') {
      return arg;
    }
  }
  return '';
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
  const [model, setModel] = useState<OpenAIModel | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const {id, gid} = useParams<{ id?: string, gid?: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [allowAutoScroll, setAllowAutoScroll] = useState(true);
  const messageBoxRef = useRef<MessageBoxHandles>(null);
  const chatSettingsRef = useRef(chatSettings);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    chatSettingsEmitter.on('chatSettingsChanged', chatSettingsListener);

    const button = createButton();
    buttonRef.current = button;

    document.addEventListener('selectionchange', handleSelectionChange);

    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      chatSettingsEmitter.off('chatSettingsChanged', chatSettingsListener);
    };
  }, []);

  useEffect(() => {
    chatSettingsRef.current = chatSettings;
  }, [chatSettings]);

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
    if (location.state?.reset) {
      messageBoxRef.current?.reset();
      messageBoxRef.current?.focusTextarea();
    }
  }, [location.state]);

  useEffect(() => {
    if (messages.length === 0) {
      setConversation(null);
    }
    if (conversation && conversation.id) {
      // Only update if there are messages
      if (messages.length > 0) {
        ConversationService.updateConversation(conversation, messages);
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
      fetchModelById(userSettings.model).then(setModel);
    }

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (userSettings.model) {
      fetchModelById(userSettings.model).then(setModel);
    }
  }, [userSettings]);

  const fetchModelById = async (modelId: string): Promise<OpenAIModel | null> => {
    try {
      const fetchedModel = await ChatService.getModelById(modelId);
      return fetchedModel;
    } catch (error) {
      console.error('Failed to fetch model:', error);
      if (error instanceof Error) {
        NotificationService.handleUnexpectedError(error, 'Failed to fetch model.');
      }
      return null;
    }
  };

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
      if (settings) {
        if (settings.model === null) {
          setModel(null);
        } else {
          fetchModelById(settings.model).then(setModel);
        }
      }
    } catch (error) {
      console.error('Failed to fetch chat settings:', error);
    }
  };

  const newConversation = () => {
    setConversation(null);
    setShowScrollButton(false);
    clearInputArea();
    setMessages([]);
    messageBoxRef.current?.focusTextarea();
  };

  const handleSelectedConversation = (id: string | null) => {
    if (id && id.length > 0) {
      let n = Number(id);
      ConversationService.getConversationById(n)
        .then(conversation => {
          if (conversation) {
            setConversation(conversation);
            clearInputArea();
            ConversationService.getChatMessages(conversation).then((msgs: ChatMessage[]) => {
              if (msgs.length === 0) {
                console.warn('possible state problem');
              } else {
                setMessages(msgs);
              }
            });
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
    setShowScrollButton(false);
    messageBoxRef.current?.focusTextarea();
  };

  function getTitle(message: string): string {
    let title = message.trimStart(); // Remove leading newlines
    let firstNewLineIndex = title.indexOf('\n');
    if (firstNewLineIndex === -1) {
      firstNewLineIndex = title.length;
    }
    return title.substring(0, Math.min(firstNewLineIndex, MAX_TITLE_LENGTH));
  }

  function startConversation(message: string, fileDataRef: FileDataRef[]) {
    const id = Date.now();
    const timestamp = Date.now();
    let shortenedText = getTitle(message);
    let instructions = getFirstValidString(
      chatSettings?.instructions,
      userSettings.instructions,
      OPENAI_DEFAULT_SYSTEM_PROMPT,
      DEFAULT_INSTRUCTIONS
    );
    const conversation: Conversation = {
      id: id,
      gid: getEffectiveChatSettings().id,
      timestamp: timestamp,
      title: shortenedText,
      model: model?.id || DEFAULT_MODEL,
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
    if (value === null) {
      setModel(null);
    } else {
      fetchModelById(value).then(setModel);
    }
  };

  const callApp = (message: string, fileDataRef: FileDataRef[]) => {
    if (!conversation) {
      startConversation(message, fileDataRef);
    }
    setAllowAutoScroll(true);
    addMessage(Role.User, MessageType.Normal, message, fileDataRef, sendMessage);
  };

  const addMessage = (
    role: Role,
    messageType: MessageType,
    message: string,
    fileDataRef: FileDataRef[],
    callback?: (callback: ChatMessage[]) => void
  ) => {
    let content: string = message;

    setMessages((prevMessages: ChatMessage[]) => {
      const newMsg: ChatMessage = {
        id: prevMessages.length + 1,
        role: role,
        messageType: messageType,
        content: content,
        fileDataRef: fileDataRef,
      };
      return [...prevMessages, newMsg];
    });

    const newMessage: ChatMessage = {
      id: messages.length + 1,
      role: role,
      messageType: messageType,
      content: content,
      fileDataRef: fileDataRef,
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
        model: model?.id || DEFAULT_MODEL
      };
    }
    return effectiveSettings;
  }

  function sendMessage(updatedMessages: ChatMessage[]) {
    setLoading(true);
    clearInputArea();
    let systemPrompt = getFirstValidString(
      conversation?.systemPrompt,
      chatSettings?.instructions,
      userSettings.instructions,
      OPENAI_DEFAULT_SYSTEM_PROMPT,
      DEFAULT_INSTRUCTIONS
    );
    let messages: ChatMessage[] = [
      {
        role: Role.System,
        content: systemPrompt
      } as ChatMessage,
      ...updatedMessages
    ];

    let effectiveSettings = getEffectiveChatSettings();

    ChatService.sendMessageStreamed(effectiveSettings, messages, handleStreamedResponse)
      .then((response: ChatCompletion) => {
        // no-op
      })
      .catch(err => {
        if (err instanceof CustomError) {
          const message: string = err.message;
          setLoading(false);
          addMessage(Role.Assistant, MessageType.Error, message, []);
        } else {
          NotificationService.handleUnexpectedError(err, 'Failed to send message to openai.');
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }

  function handleStreamedResponse(content: string, fileDataRef: FileDataRef[]) {
    setMessages(prevMessages => {
      let isNew: boolean = false;
      try {
        if (prevMessages.length === 0) {
          console.error('prevMessages should not be empty in handleStreamedResponse.');
          return [];
        }
        if (prevMessages[prevMessages.length - 1].role === Role.User) {
          isNew = true;
        }
      } catch (e) {
        console.error('Error getting the role');
        console.error('prevMessages = ' + JSON.stringify(prevMessages));
        console.error(e);
      }

      if (isNew) {
        const message: ChatMessage = {
          id: prevMessages.length + 1,
          role: Role.Assistant,
          messageType: MessageType.Normal,
          content: content,
          fileDataRef: fileDataRef,
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
    const chatContainer = document.getElementById('chat-container');
    if (chatContainer) {
      chatContainer.scroll({
        top: chatContainer.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  const clearInputArea = () => {
    messageBoxRef.current?.clearInputValue();
  };

  const handleUserScroll = (isAtBottom: boolean) => {
    setAllowAutoScroll(isAtBottom);
    setShowScrollButton(!isAtBottom);
  };

  // ------------------------------
  // Export Chat logic
  // ------------------------------
  const handleExportConversation = () => {
    if (!conversation) {
      NotificationService.handleError("No conversation to export");
      return;
    }
    const exportData = {
      conversation,
      messages
    };
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // Create a temporary link to download the JSON
    const link = document.createElement('a');
    link.href = url;
    link.download = `conversation-${conversation.id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ------------------------------
  // Import Chat logic
  // ------------------------------
  const handleImportConversation = async () => {
    try {
      // create a hidden file input
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'application/json';

      fileInput.onchange = async () => {
        if (!fileInput.files || fileInput.files.length === 0) {
          return;
        }
        const file = fileInput.files[0];
        const text = await file.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch (err) {
          NotificationService.handleError("Invalid JSON file");
          return;
        }
        if (!data.conversation || !data.messages) {
          NotificationService.handleError("JSON must contain { conversation, messages }");
          return;
        }
        // We'll create a brand new conversation ID, so we avoid collisions
        const newId = Date.now();
        const newConv: Conversation = {
          ...data.conversation,
          id: newId,
          timestamp: Date.now() // override to 'now'
        };
        // add to Dexie
        await ConversationService.addConversation(newConv);
        // then store messages
        await ConversationService.updateConversation(newConv, data.messages);
        NotificationService.handleSuccess("Imported conversation successfully");

        // redirect user to new conversation
        navigate(`/c/${newId}`);
      };

      fileInput.click();
    } catch (error) {
      console.error(error);
      NotificationService.handleUnexpectedError(error as Error, "Failed to import conversation");
    }
  };

  // ---------------------------------
  // The code below handles highlight => quote
  // ---------------------------------
  const createButton = () => {
    const button = document.createElement('button');
    button.className = 'px-2 py-1 bg-gray-100 text-black dark:text-black dark:bg-gray-200 border border-gray-200 dark:border-gray-800 rounded-md shadow-md hover:bg-gray-200 dark:hover:bg-gray-100 focus:outline-hidden';

    const iconContainer = document.createElement('div');
    iconContainer.className = 'h-5 w-5';

    const root = ReactDOM.createRoot(iconContainer);
    root.render(<ArrowUturnDownIcon/>);

    button.appendChild(iconContainer);
    // Stop propagation for mousedown and mouseup to avoid affecting other event listeners
    button.addEventListener('mousedown', event => event.stopPropagation());
    button.addEventListener('mouseup', event => event.stopPropagation());
    button.addEventListener('click', handleQuoteSelectedText);
    return button;
  };

  const handleSelectionChange = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim() === '') {
      if (buttonRef.current && buttonRef.current.parentNode) {
        buttonRef.current.parentNode.removeChild(buttonRef.current);
        buttonRef.current = null;
      }
    }
  };

  const handleMouseUp = (event: React.MouseEvent<HTMLDivElement>) => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim() !== '') {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      // Remove the existing button if it exists
      if (buttonRef.current && buttonRef.current.parentNode) {
        buttonRef.current.parentNode.removeChild(buttonRef.current);
      }

      const newButton = createButton();
      const buttonHeight = 30;
      const buttonWidth = newButton.offsetWidth;

      const chatContainer = document.getElementById('chat-container1');
      if (chatContainer) {
        const containerRect = chatContainer.getBoundingClientRect();
        newButton.style.position = 'absolute';
        newButton.style.left = `${rect.left - containerRect.left + (rect.width / 2) - (buttonWidth / 2)}px`;
        newButton.style.top = `${rect.top - containerRect.top - buttonHeight}px`;
        newButton.style.display = 'inline-block';
        newButton.style.verticalAlign = 'middle';
        newButton.style.zIndex = '1000';

        chatContainer.appendChild(newButton);
        buttonRef.current = newButton;
      }
    }
  };

  const handleQuoteSelectedText = () => {
    const selection = window.getSelection();
    if (selection) {
      const selectedText = selection.toString();
      const modifiedText = `Assistant wrote:\n${SNIPPET_MARKERS.begin}\n${selectedText}\n${SNIPPET_MARKERS.end}\n`;
      messageBoxRef.current?.pasteText(modifiedText);
      messageBoxRef.current?.focusTextarea();
    }
  };
  // ---------------------------------

  return (
    <div className={`${className} overflow-hidden w-full h-full relative flex z-0 dark:bg-gray-900`}>
      <div className="flex flex-col items-stretch w-full h-full">
        <main
          className="relative h-full transition-width flex flex-col overflow-hidden items-stretch flex-1"
          onMouseUp={handleMouseUp}
        >
          {gid ? (
            <div
              className={`inline-block absolute top-0 left-0 z-50 ${
                isSidebarCollapsed ? 'sidebar-collapsed-margin' : 'sidebar-expanded-margin'
              }`}
            >
              <ChatSettingDropdownMenu chatSetting={chatSettings} />
            </div>
          ) : null}

          {/* Add "Export/Import" buttons if we have a conversation or whenever you like */}
          <div className="absolute top-2 right-2 z-50 flex gap-2">
            <button
              onClick={handleImportConversation}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              {t('Import Chat')}
            </button>
            {conversation && (
              <button
                onClick={handleExportConversation}
                className="px-4 py-2 mr-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                {t('Export Chat')}
              </button>
            )}
          </div>

          {!conversation && chatSettings ? (
            <CustomChatSplash className=" -translate-y-[10%] " chatSettings={chatSettings} />
          ) : null}
          <Chat
            chatBlocks={messages}
            onChatScroll={handleUserScroll}
            conversation={conversation}
            model={model?.id || DEFAULT_MODEL}
            onModelChange={handleModelChange}
            allowAutoScroll={allowAutoScroll}
            loading={loading}
          />
          {showScrollButton && (
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 mb-10 z-10">
              <ScrollToBottomButton onClick={scrollToBottom} />
            </div>
          )}
          <MessageBox
            ref={messageBoxRef}
            callApp={callApp}
            loading={loading}
            setLoading={setLoading}
            allowImageAttachment={
              model === null || model?.image_support || false
                ? 'yes'
                : !conversation
                ? 'warn'
                : 'no'
            }
          />
        </main>
      </div>
    </div>
  );
};

export default MainPage;