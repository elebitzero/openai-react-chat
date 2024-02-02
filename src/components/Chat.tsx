import React, {useEffect, useRef, useState} from 'react';
import ChatBlock from "./ChatBlock";
import ModelSelect from "./ModelSelect";
import {OpenAIModel} from "../models/model";
import {ChatService} from "../service/ChatService";
import {OPENAI_MODEL_LIST} from "../config";
import {toast} from "react-toastify";
import {ChatMessage} from "../models/ChatCompletion";
import {useTranslation} from 'react-i18next';

interface Props {
    chatBlocks: ChatMessage[];
    onChatScroll: (isAtBottom : boolean) => void;
    allowAutoScroll: boolean;
}

const Chat: React.FC<Props> = ({chatBlocks, onChatScroll, allowAutoScroll}) => {
    const { t } = useTranslation();
    const [isNewConversation, setIsNewConversation] = useState<boolean>(false);
    const [models, setModels] = useState<OpenAIModel[]>([]);
    const [error, setError] = useState<string | null>(null);
    const chatDivRef = useRef<HTMLDivElement>(null);

    useEffect(() => {

        if (OPENAI_MODEL_LIST && OPENAI_MODEL_LIST.length > 0) {
            setModels(OPENAI_MODEL_LIST.map(id => {
                    return {
                        id: id,
                        object: 'model',
                        context_window: 0,
                        owned_by: 'not-set',
                        permission: []
                    } as OpenAIModel;
                })
            );
        } else {
            ChatService.fetchModels()
                .then(fetchedModels => {
                    setModels(fetchedModels);
                })
                .catch(err => {
                    if (err && err.message) {
                        setError(err.message);
                    } else {
                        setError('Error fetching model list');
                    }
                });
        }
    }, []);

    useEffect(() => {
        setIsNewConversation(chatBlocks.length === 0);
        if (chatDivRef.current && allowAutoScroll) {
            chatDivRef.current.scrollTop = chatDivRef.current.scrollHeight;
        }
    }, [chatBlocks]);

    useEffect(() => {
        toast.error(error, {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
        });
    }, [error])

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
            <div className="flex flex-col items-center text-sm dark:bg-gray-800">
                <div
                    className={`flex w-full items-center justify-center gap-1 p-3 text-gray-500 dark:border-gray-900/50 dark:bg-gray-700 dark:text-gray-300 ${!isNewConversation ? 'border-b border-black/10' : ''}`}>
                    <div className="flex items-center flex-row gap-1">
                        <span>{t('model')} {isNewConversation ? '' : ChatService.getSelectedModelId()}</span>
                        <span className="flex-grow">
                          <div style={{display: isNewConversation ? 'block' : 'none', width: '50ch'}}>
                            <ModelSelect models={models}/>
                          </div>
                      </span>
                    </div>
                </div>
                {chatBlocks.map((block) => (
                    <ChatBlock key={`chat-block-${block.id}`} block={block}/>
                ))}
                <div className="w-full h-24 flex-shrink-0"></div>
            </div>
        </div>
    );
};

export default Chat;
