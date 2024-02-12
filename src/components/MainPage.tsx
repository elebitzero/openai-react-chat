import React, {ChangeEvent, useEffect, useRef, useState} from 'react';
import {ChatService} from "../service/ChatService";
import Chat from "./Chat";
import {ChatCompletion, ChatMessage, MessageType, Role} from "../models/ChatCompletion";
import {ScrollToBottomButton} from "./ScrollToBottomButton";
import {OPENAI_DEFAULT_SYSTEM_PROMPT} from "../config";
import {toast, ToastContainer} from "react-toastify";
import {CustomError} from "../service/CustomError";
import db, {getConversationById} from "../service/ConversationDB";
import {conversationsEmitter} from "../service/EventEmitter";
import {OpenSideBarIcon} from "../svg";
import Tooltip from "./Tooltip";
import {useLocation, useNavigate} from "react-router-dom";
import {useTranslation} from 'react-i18next';
import MessageBox, {MessageBoxHandles} from "./MessageBox";

export const updateConversationMessages = async (id: number, updatedMessages: any[]) => {
    const conversation = await db.conversations.get(id);
    if (conversation) {
        conversation.messages = JSON.stringify(updatedMessages);
        await db.conversations.put(conversation);
    }
}

function useCurrentPath() {
    return useLocation().pathname;
}


interface MainPageProps {
    isSidebarCollapsed: boolean;
    toggleSidebarCollapse: () => void;
}


const MainPage: React.FC<MainPageProps> = ({isSidebarCollapsed, toggleSidebarCollapse}) => {
    const { t } = useTranslation();
    const [isNewConversation, setIsNewConversation] = useState<boolean>(false);
    const [conversationId, setConversationId] = useState(0);
    const [systemPrompt, setSystemPrompt] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const currentPath = useCurrentPath();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const [allowAutoScroll, setAllowAutoScroll] = useState(true);
    const messageBoxRef = useRef<MessageBoxHandles>(null);

    useEffect(() => {
        const handleSelectedConversation = (id: string | null) => {
            if (id && id.length > 0) {
                let n = Number(id);
                getConversationById(n).then(conversation => {
                    if (conversation) {
                        setConversationId(conversation.id)
                        setSystemPrompt(conversation.systemPrompt);
                        ChatService.setSelectedModelId(conversation.model);
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
                        console.error("Conversation not found.");
                    }
                });
            } else {
                setIsNewConversation(true);
                setConversationId(0);
                setSystemPrompt('');
                clearTextArea();
                // ChatService.setSelectedModelId('');
                setMessages([]);
            }
            setAllowAutoScroll(true);
            setShowScrollButton(false)
        }
        const itemId = currentPath.split('/c/')[1];
        handleSelectedConversation(itemId)
    }, [currentPath]);

    useEffect(() => {
        setIsNewConversation(messages.length === 0);
        if (conversationId) {
            // Only update if there are messages
            if (messages.length > 0) {
                updateConversationMessages(conversationId, messages);
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

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleSystemPromptChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        const newSystemPrompt = event.target.value;
        setSystemPrompt(newSystemPrompt);
    };


    function startConversation(message: string) {
        // todo: use AI to generate title from the user message
        const id = Date.now();
        const timestamp = Date.now();
        setConversationId(id);
        let shortenedText = message.substring(0, 25);
        const conversation = {
            id: id,
            timestamp: timestamp,
            title: shortenedText,
            model: ChatService.getSelectedModelId(),
            systemPrompt: systemPrompt,
            messages: "[]"
        };
        conversationsEmitter.emit('newConversation', conversation);
        db.conversations.add(conversation);
        navigate(`/c/${conversation.id}`);
    }


    const callApp = (message: string) => {
        if (isNewConversation) {
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


    function sendMessage(updatedMessages: ChatMessage[]) {
        setLoading(true);
        clearTextArea();
        let systemPromptFinal = systemPrompt;
        if (!systemPromptFinal || systemPromptFinal === '') {
            systemPromptFinal = OPENAI_DEFAULT_SYSTEM_PROMPT;
        }
        let messages: ChatMessage[] = [{
            role: Role.System,
            content: systemPromptFinal
        } as ChatMessage, ...updatedMessages];
        ChatService.sendMessageStreamed(messages, ChatService.getSelectedModelId(), handleStreamedResponse)
            .then((response: ChatCompletion) => {
                // nop
            })
            .catch(err => {
                    if (err instanceof CustomError) {
                        const message: string = err.message;
                        setLoading(false);
                        addMessage(Role.Assistant, MessageType.Error, message);
                    } else {
                        toast.error(err.message, {
                            position: "top-center",
                            autoClose: 5000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            theme: "light",
                        });
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
                console.error('prevMessages = '+JSON.stringify(prevMessages));
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
        <div className="overflow-hidden w-full h-full relative flex z-0 dark:bg-gray-900">
            <div className="sidebar-button">
                {isSidebarCollapsed && (
                    <Tooltip title={t('open-sidebar')} side="right" sideOffset={10}>
                        <a
                            className="flex px-3 min-h-[44px] py-1 gap-3 transition-colors duration-200 dark:text-black cursor-pointer text-sm rounded-md hover:bg-gray-500/10 h-11 w-11 flex-shrink-0 items-center justify-center bg-white"
                            onClick={toggleSidebarCollapse}>
                            <OpenSideBarIcon></OpenSideBarIcon>
                        </a>
                    </Tooltip>
                )}
            </div>
            <div className="flex flex-col items-stretch w-full h-full">
                <ToastContainer/>
                <main
                    className="relative h-full w-full transition-width flex flex-col overflow-hidden items-stretch flex-1">
                    {isNewConversation ? (
                        // Render the "System" part for new conversations
                        <div
                            className="text-input-with-header chat-pg-instructions flex items-center justify-center m-5 dark:bg-gray-900">
                            <div className="text-input-header-subheading subheading dark:text-gray-100"
                                 style={{marginLeft: isSidebarCollapsed ? '4em' : '0'}}>{t('system')}
                            </div>
                            <div
                                className="text-input-header-wrapper overflow-wrapper text-input flex items-center justify-center w-3/5">
                                <textarea aria-label="Input"
                                          style={{maxHeight: "200px", overflowY: "auto"}}
                                          className="focus:ring-0 focus-visible:ring-0 outline-none shadow-none text-input text-input-lg text-input-full text-input-header-buffer dark:placeholder-gray-100 dark:text-gray-100 dark:bg-gray-850"
                                          placeholder={OPENAI_DEFAULT_SYSTEM_PROMPT}
                                          value={systemPrompt}
                                          onChange={handleSystemPromptChange}
                                          onInput={(e: React.FormEvent<HTMLTextAreaElement>) => {
                                              const target = e.target as HTMLTextAreaElement;
                                              target.style.height = "auto";
                                              target.style.height = target.scrollHeight + "px";
                                          }}
                                ></textarea>
                            </div>
                        </div>
                    ) : null}
                    {/*<div className="flex-grow">*/}
                    <Chat chatBlocks={messages} onChatScroll={handleUserScroll} allowAutoScroll={allowAutoScroll}/>
                    {/*</div>*/}
                    {/* Absolute container for the ScrollToBottomButton */}
                    {showScrollButton && (
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 mb-10 z-10">
                        <ScrollToBottomButton onClick={scrollToBottom} />
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
