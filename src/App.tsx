import React, {ChangeEvent, useEffect, useRef, useState} from 'react';
import './App.css';
import {ChatService} from "./service/ChatService";
import Chat from "./components/Chat";
import {ChatCompletion, ChatMessage, MessageType, Role} from "./models/ChatCompletion";
import {SubmitButton} from "./components/SubmitButton";
import {ScrollToBottomButton} from "./components/ScrollToBottomButton";
import {OPENAI_DEFAULT_SYSTEM_PROMPT} from "./config";
import {toast, ToastContainer} from "react-toastify";
import {CustomError} from "./service/CustomError";
import db, {getConversationById} from "./service/ConversationDB";
import Sidebar from "./components/SideBar";
import {conversationsEmitter} from "./service/EventEmitter";
import {OpenSideBarIcon} from "./svg";
import Tooltip from "./components/Tooltip";
import {useLocation} from "react-router-dom";

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


const App = () => {
    const [conversationTitle, setConversationTitle] = useState('Default Title');
    const [showScrollButton, setShowScrollButton] = useState(false);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    const [isNewConversation, setIsNewConversation] = useState<boolean>(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [conversationId, setConversationId] = useState(0);
    const [loading, setLoading] = useState(false);
    const [systemPrompt, setSystemPrompt] = useState('');
    const [text, setText] = useState('');
    const isButtonDisabled = text === '' || loading;
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const currentPath = useCurrentPath();

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
                        setMessages(messages);
                    } else {
                        console.error("Conversation not found.");
                    }
                });
            } else {
                setIsNewConversation(true);
                setConversationId(0);
                setSystemPrompt('');
                // ChatService.setSelectedModelId('');
                setMessages([]);
            }
        };

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

    const handleTextChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        setText(event.target.value);
    };

    const handleAutoResize = (e: React.FormEvent<HTMLTextAreaElement>) => {
        const target = e.currentTarget;
        const MAX_ROWS = 10;
        const maxHeight = parseInt(getComputedStyle(target).lineHeight, MAX_ROWS) * MAX_ROWS;

        // Reset height to auto so that it reduces size when text is removed
        target.style.height = 'auto';

        // Limit the height to 10 rows high
        if (target.scrollHeight <= maxHeight) {
            target.style.height = `${target.scrollHeight}px`;
        } else {
            target.style.height = `${maxHeight}px`;
        }

        // Reset to the original size when cleared
        if (target.value === '') {
            target.style.height = 'auto';
        }
    };

    const handleSystemPromptChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        const newSystemPrompt = event.target.value;
        setSystemPrompt(newSystemPrompt);
    };

    function startConversation() {
        // todo: use AI to generate title from the user message
        const id = Date.now();
        const timestamp = Date.now();
        setConversationId(id);
        let shortenedText = text.substring(0, 25);
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
    }

    const checkForEnterKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter') {
            if (e.shiftKey) {
                return;
            } else {
                if (!loading) {
                    e.preventDefault();
                    const target = e.target as HTMLTextAreaElement;
                    if (isNewConversation) {
                        startConversation();
                    }
                    addMessage(Role.User, MessageType.Normal, text, sendMessage);
                    (e.target as HTMLTextAreaElement).style.height = 'auto'; // Revert back to original size
                }
            }
        }
    };

    const addMessage = (role: Role, messageType: MessageType, content: string, callback?: (callback: ChatMessage[]) => void) => {
        const newMessage: ChatMessage = {role: role, messageType: messageType, content: content};

        setMessages((prevMessages: ChatMessage[]) => {
            const message: ChatMessage = {
                id: prevMessages.length + 1,
                role: role,
                messageType: messageType,
                content: content
            };
            const updatedMessages = [...prevMessages, message];
            return updatedMessages;
        });

        const message: ChatMessage = {
            id: messages.length + 1,
            role: role,
            messageType: messageType,
            content: content
        };
        const updatedMessages = [...messages, message];
        if (callback) {
            callback(updatedMessages);
        }
    };


    function sendMessage(updatedMessages: ChatMessage[]) {
        setLoading(true);
        setText('');
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
            if (prevMessages[prevMessages.length - 1].role == Role.User) {
                isNew = true;
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

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (isNewConversation) {
            startConversation();
        }
        addMessage(Role.User, MessageType.Normal, text, sendMessage);
        if (textAreaRef.current) {
            textAreaRef.current.style.height = 'auto';
        }
    }

    function toggleSidebarCollapse() {
        setIsSidebarCollapsed((prevCollapsed) => !prevCollapsed);
    }

    const scrollToBottom = () => {
        const chatContainer = document.getElementById('chat-container'); // Replace with your chat container's actual ID
        if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    };

    const handleChatScroll = (isAtBottom: boolean) => {
        setShowScrollButton(isAtBottom);
    };

    return (
        <div className="overflow-hidden w-full h-full relative flex z-0">
            <Sidebar isSidebarCollapsed={isSidebarCollapsed}
                     toggleSidebarCollapse={toggleSidebarCollapse}
            />
            <div className="sidebar-button">
                {isSidebarCollapsed && (
                    <Tooltip title="Open sidebar" side="right" sideOffset={10}>
                        <a
                            className="flex px-3 min-h-[44px] py-1 gap-3 transition-colors duration-200 dark:text-black cursor-pointer text-sm rounded-md hover:bg-gray-500/10 h-11 w-11 flex-shrink-0 items-center justify-center bg-white"
                            onClick={toggleSidebarCollapse}>
                            <OpenSideBarIcon></OpenSideBarIcon>
                        </a>
                    </Tooltip>
                )}
            </div>
            <div className="flex h-full max-w-full flex-1 flex-col">
                <ToastContainer/>
                <main
                    className="relative h-full w-full transition-width flex flex-col overflow-hidden items-stretch flex-1">
                    <div className="text-input-with-header chat-pg-instructions flex items-center justify-center m-5">
                        <div className="text-input-header-subheading subheading"
                             style={{ marginLeft: isSidebarCollapsed ? '4em' : '0' }}>System:</div>
                        <div
                            className="text-input-header-wrapper overflow-wrapper text-input flex items-center justify-center w-3/5">
                         <textarea aria-label="Input"
                                   style={{maxHeight: "200px", overflowY: "auto"}}
                                   className="focus:ring-0 focus-visible:ring-0 outline-none shadow-none text-input text-input-lg text-input-full text-input-header-buffer"
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
                    <Chat chatBlocks={messages} onChatScroll={handleChatScroll}/>
                    <div
                        className="absolute bottom-0 left-0 w-full border-t md:border-t-0 dark:border-white/20 md:border-transparent md:dark:border-transparent bg-white dark:bg-gray-800 md:!bg-transparent dark:md:bg-vert-dark-gradient pt-2">
                        {showScrollButton || <ScrollToBottomButton onClick={scrollToBottom}/>}
                        <form onSubmit={handleSubmit}
                              className="stretch mx-2 flex flex-row gap-3 last:mb-2 md:mx-4 md:last:mb-6 lg:mx-auto lg:max-w-2xl xl:max-w-3xl">
                            <div className="relative flex h-full flex-1 md:flex-col">
                                <div
                                    className="flex flex-col w-full py-2 flex-grow md:py-3 md:pl-4 relative border border-black/10 bg-white dark:border-gray-900/50 dark:text-white dark:bg-gray-700 rounded-md shadow-xs">
                                   <textarea
                                       tabIndex={0}
                                       data-id="request-:r4:-1"
                                       ref={textAreaRef}
                                       style={{maxHeight: "200px", overflowY: "auto"}}
                                       rows={1}
                                       placeholder="Send a message..."
                                       className="m-0 w-full resize-none border-0 bg-transparent p-0 pr-7 focus:ring-0 focus-visible:ring-0 outline-none shadow-none dark:bg-transparent pl-2 md:pl-0"
                                       value={text}
                                       onKeyDown={checkForEnterKey}
                                       onChange={handleTextChange}
                                       onInput={handleAutoResize}
                                   ></textarea>
                                    <SubmitButton
                                        disabled={isButtonDisabled}
                                        loading={loading}
                                        style={text !== '' ? {backgroundColor: "rgb(171, 104, 255)"} : {}}
                                        isTextEmpty={text === ''}
                                    />
                                </div>
                            </div>
                        </form>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default App;
