import React, {ChangeEvent, useRef, useState} from 'react';
import './App.css';
import {ChatService} from "./service/ChatService";
import Chat from "./components/Chat";
import {ChatCompletion, ChatMessage, MessageType, Role} from "./models/ChatCompletion";
import {SubmitButton} from "./components/SubmitButton";
import {OPENAI_DEFAULT_SYSTEM_PROMPT} from "./config";
import {toast, ToastContainer} from "react-toastify";
import {CustomError} from "./service/CustomError";

const App = () => {
    const textAreaRef = useRef<HTMLTextAreaElement>(null);  // Create a ref

    const [loading, setLoading] = useState(false);
    const [systemPrompt, setSystemPrompt] = useState('');
    const [text, setText] = useState('');
    const isButtonDisabled = text === '' || loading;
    const [messages, setMessages] = useState<ChatMessage[]>([]);

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

    const checkForEnterKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter') {
            if (e.shiftKey) {
                return;
            } else {
                if (!loading) {
                    e.preventDefault();
                    const target = e.target as HTMLTextAreaElement;
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
            return [...prevMessages, message];
        });

        if (callback) {
            callback([...messages, newMessage]);
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
        ChatService.sendMessage(messages, ChatService.getSelectedModelId())
            .then((response: ChatCompletion) => {
                let message = response.choices[0].message;
                setLoading(false);
                addMessage(message.role, MessageType.Normal, message.content);
            })
            .catch(err => {
                    if (err instanceof CustomError) {
                        const message: string = err.message;
                        setLoading(false);
                        addMessage(Role.Assistant, MessageType.Error, message);
                    } else {
                        console.log('calling toast with ' + err.message);
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
            )
        ;
    }

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        addMessage(Role.User, MessageType.Normal, text, sendMessage);
        if (textAreaRef.current) {
            textAreaRef.current.style.height = 'auto';
        }
    }

    return (
        <div className="flex h-full max-w-full flex-1 flex-col">
            <ToastContainer/>
            <main
                className="relative h-full w-full transition-width flex flex-col overflow-hidden items-stretch flex-1">
                <div className="text-input-with-header chat-pg-instructions flex items-center justify-center m-5">
                    <div className="text-input-header-subheading subheading">System:</div>
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
                <Chat chatBlocks={messages}/>
                <div
                    className="absolute bottom-0 left-0 w-full border-t md:border-t-0 dark:border-white/20 md:border-transparent md:dark:border-transparent bg-white dark:bg-gray-800 md:!bg-transparent dark:md:bg-vert-dark-gradient pt-2">
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
    );
}

export default App;
