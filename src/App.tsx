import React, {ChangeEvent, useEffect, useState} from 'react';
import './App.css';
import {ChatService} from "./service/ChatService";
import Chat from "./components/Chat";
import {ChatCompletion, ChatMessage} from "./models/ChatCompletion";
import {SubmitButton} from "./components/SubmitButton";
import {OPENAI_DEFAULT_SYSTEM_PROMPT} from "./config";
import {toast, ToastContainer} from "react-toastify";

interface ChatMessageBlock extends ChatMessage {
    id: number;
}


const App = () => {
    const [placeholderTokens, setPlaceholderTokens] = useState(0);
    const [loading, setLoading] = useState(false);
    const [systemPrompt, setSystemPrompt] = useState('');
    const [systemPromptTokens, setSystemPromptTokens] = useState(0);
    const [prevSystemPromptTokens, setPrevSystemPromptTokens] = useState(0);
    const [text, setText] = useState('');
    const isButtonDisabled = text === '' || loading;
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [messageBlocks, setMessageBlocks] = useState<ChatMessageBlock[]>([]);
    const [tokenCount, setTokenCount] = useState(0);
    const [prevTextTokens, setPrevTextTokens] = useState(0);

    useEffect(() => {
        const tokens = calculateTokens({
            role: 'system',
            content: OPENAI_DEFAULT_SYSTEM_PROMPT
        });
        setPlaceholderTokens(tokens);
        setSystemPromptTokens(tokens);
    }, []);

    useEffect(() => {
        // Calculate tokens for the new text input
        const textTokens = calculateTokens({ role: 'user', content: text });

        // Update the tokenCount with the text input tokens
        setTokenCount(prevTokenCount => prevTokenCount - prevTextTokens + textTokens);

        // Update the previous text tokens
        setPrevTextTokens(textTokens);
    }, [text, prevTextTokens]);
    const handleTextChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        setText(event.target.value);
    };

    const handleSystemPromptChange = (event: ChangeEvent<HTMLTextAreaElement>) => {

        const newSystemPrompt = event.target.value;
        setPrevSystemPromptTokens(systemPromptTokens); // Set prevSystemPromptTokens before updating systemPromptTokens
        setSystemPrompt(newSystemPrompt);

        if (newSystemPrompt === '') {
            // Prompt is empty, so use placeholder tokens
            setSystemPromptTokens(placeholderTokens);
        } else {
            // Calculate tokens for the new system prompt
            const newSystemPromptTokens = calculateTokens({ role: 'system', content: newSystemPrompt });
            // Update the system prompt tokens
            setSystemPromptTokens(newSystemPromptTokens);
        }
    };

    // useEffect to update the tokenCount whenever the system prompt tokens change
    useEffect(() => {
        setTokenCount(prevTokenCount => prevTokenCount - prevSystemPromptTokens + systemPromptTokens);
    }, [systemPromptTokens, prevSystemPromptTokens]);



    const checkForEnterKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter') {
            if (e.shiftKey) {
                return;
            } else {
                if (!loading) {
                    e.preventDefault();
                    addMessage('user', text, sendMessage);
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = "auto";
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
        const messageTokens = calculateTokens(newMessage);
        // Update the tokenCount by accumulating the tokens
        setTokenCount(prevTokenCount => prevTokenCount + messageTokens);
    };


    function sendMessage(updatedMessages: ChatMessage[]) {
        setLoading(true);
        setText('');
        let systemPromptFinal = systemPrompt;
        if (!systemPromptFinal || systemPromptFinal === '') {
            systemPromptFinal = OPENAI_DEFAULT_SYSTEM_PROMPT;
        }
        let messages = [{role: 'system', content: systemPromptFinal}, ...updatedMessages];
        ChatService.sendMessage(messages, ChatService.getSelectedModelId())
            .then((response: ChatCompletion) => {
                let message = response.choices[0].message;
                setLoading(false);
                addMessage(message.role, message.content);
            })
            .catch(error => {
                console.log('calling toast with '+error);
                toast.error(error.message, {
                    position: "top-center",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                });
            });
    }

    const calculateTokens = (message: ChatMessage): number => {
        let tokens = 0;

        // Calculate tokens for the message content
        const messageTokens = message.content.match(/\b\w+\b|\S/g);
        tokens += messageTokens?.length ?? 0;

        return tokens;
    };

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        addMessage('user', text, sendMessage);
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
                                   onInput={(e) => {
                                       const target = e.target as HTMLTextAreaElement;
                                       target.style.height = "auto";
                                       target.style.height = target.scrollHeight + "px";
                                   }}
                         ></textarea>
                    </div>
                </div>
                <Chat chatBlocks={messageBlocks}/>
                <div
                    className="absolute bottom-0 left-0 w-full border-t md:border-t-0 dark:border-white/20 md:border-transparent md:dark:border-transparent bg-white dark:bg-gray-800 md:!bg-transparent dark:md:bg-vert-dark-gradient pt-2">
                    <form onSubmit={handleSubmit}
                          className="stretch mx-2 flex flex-row gap-3 last:mb-2 md:mx-4 md:last:mb-6 lg:mx-auto lg:max-w-2xl xl:max-w-3xl">
                        <div className="relative flex h-full flex-1 md:flex-col">
                            {/*       <div className="flex ml-1 md:w-full md:m-auto md:mb-2 gap-0 md:gap-2 justify-center">
                                <button className="btn relative btn-neutral border-0 md:border">
                                    <div className="flex w-full items-center justify-center gap-2">
                                        <ArrowPathIcon {...iconProps}/>Regenerate response
                                    </div>
                                </button>
                            </div>*/}
                            <div className="flex justify-end px-2 py-1 text-gray-500 text-sm">
                                <span>Tokens used: {tokenCount}</span>
                            </div>
                            <div
                                className="flex flex-col w-full py-2 flex-grow md:py-3 md:pl-4 relative border border-black/10 bg-white dark:border-gray-900/50 dark:text-white dark:bg-gray-700 rounded-md shadow-xs">
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
                </div>
            </main>
        </div>
    );
}

export default App;
