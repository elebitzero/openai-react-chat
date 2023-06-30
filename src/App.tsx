import React, {ChangeEvent, useContext, useEffect, useState} from 'react';
import './App.css';
import {iconProps, SubmitChatIcon,} from "./svg";
import {OpenAIModel} from "./models/model";
import {ThemeContext} from "./ThemeContext";
import {ChatService} from "./service/ChatService";
import Chat from "./components/Chat";
import {ChatCompletion, ChatMessage} from "./models/ChatCompletion";
import {ArrowPathIcon} from "@heroicons/react/24/outline";
import {SubmitButton} from "./components/SubmitButton";

interface ChatMessageBlock extends ChatMessage {
    id: number;
}


const App = () => {
    const [loading, setLoading] = useState(false);
    const [models, setModels] = useState<OpenAIModel[]>([]);
    const [selectedModel, setSelectedModel] = useState(models[0]);
    const [systemPrompt, setSystemPrompt] = useState('');
    const [text, setText] = useState('');
    const isButtonDisabled = text === '' || loading;
    const {darkTheme, toggleTheme} = useContext(ThemeContext);
    const themeClass = darkTheme ? 'dark' : '';
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [messageBlocks, setMessageBlocks] = useState<ChatMessageBlock[]>([]);

    const handleTextChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        setText(event.target.value);
    };

    const handleSystemPromptChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        setSystemPrompt(event.target.value);
    };

    useEffect(() => {
        const getModels = async () => {
            const fetchedModels = await ChatService.fetchModels();
            setModels(fetchedModels);
        };

        getModels().catch((error) => {
            console.error('Error fetching models:', error);
        });
    }, []);

    useEffect(() => {
        setSelectedModel(models[0]);
    }, [models]);

    const checkForEnterKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter') {
            if (e.shiftKey) {
                return;
            } else {
                if (!loading) {
                    e.preventDefault();
                    addMessage('user', text, sendMessage);
                }
            }
        }
    };

    const addMessage = (role: string, content: string, callback?: (callback: ChatMessage[]) => void) => {
        const newMessage = {role, content};
        const updatedMessages = [...messages, newMessage];

        setMessages(updatedMessages);
        setMessageBlocks((prevChatBlocks: ChatMessageBlock[]) => {
            const newChatBlock = {id: prevChatBlocks.length + 1, role, content};
            return [...prevChatBlocks, newChatBlock];
        });

        if (callback) {
            callback(updatedMessages);
        }
    };


    function sendMessage(updatedMessages: ChatMessage[]) {
        setLoading(true);
        setText('');
        let systemPromptFinal = systemPrompt;
        if (!systemPromptFinal || systemPromptFinal === '') {
            systemPromptFinal = 'You are a helpful assistant.';
        }
        let messages = [{role: 'system', content: systemPromptFinal}, ...updatedMessages];
        ChatService.sendMessage(messages)
            .then((response: ChatCompletion) => {
                let message = response.choices[0].message;
                setLoading(false);
                addMessage(message.role, message.content);
            })
            .catch(error => {
                // Handle the error here
                console.error('Error sending message:', error);
            });
    }

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        addMessage('user', text, sendMessage);
    }

    return (
        <div className="flex h-full max-w-full flex-1 flex-col">
            <main
                className="relative h-full w-full transition-width flex flex-col overflow-hidden items-stretch flex-1">
                <div className="text-input-with-header chat-pg-instructions flex items-center justify-center">
                    <div className="text-input-header-subheading subheading">System</div>
                    <div
                        className="text-input-header-wrapper overflow-wrapper text-input flex items-center justify-center w-3/5">
                         <textarea aria-label="Input"
                                   style={{maxHeight: "200px", overflowY: "hidden"}}
                                   className="focus:ring-0 focus-visible:ring-0 outline-none shadow-none text-input text-input-lg text-input-full text-input-header-buffer"
                                   placeholder="You are a helpful assistant."
                                   value={systemPrompt}
                                   onChange={handleSystemPromptChange}
                                   onInput={(e) => {
                                       const target = e.target as HTMLTextAreaElement;
                                       target.style.height = "auto";
                                       target.style.height = target.scrollHeight + "px";
                                   }}
                         ></textarea>
                    </div>
                </div>
                <Chat chatBlocks={messageBlocks} models={models}/>
                <div
                    className="absolute bottom-0 left-0 w-full border-t md:border-t-0 dark:border-white/20 md:border-transparent md:dark:border-transparent md:bg-vert-light-gradient bg-white dark:bg-gray-800 md:!bg-transparent dark:md:bg-vert-dark-gradient pt-2">
                    <form onSubmit={handleSubmit}
                          className="stretch mx-2 flex flex-row gap-3 last:mb-2 md:mx-4 md:last:mb-6 lg:mx-auto lg:max-w-2xl xl:max-w-3xl">
                        <div className="relative flex h-full flex-1 md:flex-col">
                            <div className="flex ml-1 md:w-full md:m-auto md:mb-2 gap-0 md:gap-2 justify-center">
                                <button className="btn relative btn-neutral border-0 md:border">
                                    <div className="flex w-full items-center justify-center gap-2">
                                        <ArrowPathIcon {...iconProps}/>Regenerate response
                                    </div>
                                </button>
                            </div>
                            <div
                                className="flex flex-col w-full py-2 flex-grow md:py-3 md:pl-4 relative border border-black/10 bg-white dark:border-gray-900/50 dark:text-white dark:bg-gray-700 rounded-md">
                                   <textarea
                                       tabIndex={0}
                                       data-id="request-:r4:-1"
                                       style={{maxHeight: "200px", overflowY: "hidden"}}
                                       rows={1}
                                       placeholder="Send a message..."
                                       className="m-0 w-full resize-none border-0 bg-transparent p-0 pr-7 focus:ring-0 focus-visible:ring-0 outline-none shadow-none dark:bg-transparent pl-2 md:pl-0"
                                       value={text}
                                       onKeyDown={checkForEnterKey}
                                       onChange={handleTextChange}
                                       onInput={(e) => {
                                           const target = e.target as HTMLTextAreaElement;
                                           target.style.height = "auto";
                                           target.style.height = target.scrollHeight + "px";
                                       }}
                                   ></textarea>
                                <SubmitButton disabled={isButtonDisabled} loading={loading}/>
                            </div>
                        </div>
                    </form>
                    <div
                        className="px-3 pt-2 pb-3 text-center text-xs text-black/50 dark:text-white/50 md:px-4 md:pt-3 md:pb-6">
                        <span>
                          <a href="https://help.openai.com/en/articles/6825453-chatgpt-release-notes" target="_blank"
                             rel="noreferrer"
                             className="underline">ChatGPT Mar 23 Version</a>.
                        </span>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default App;
