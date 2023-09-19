import React, {useEffect, useRef, useState} from 'react';
import ChatBlock from "./ChatBlock";
import ModelSelect from "./ModelSelect";
import {OpenAIModel} from "../models/model";
import {ChatService} from "../service/ChatService";
import {OPENAI_MODEL_LIST} from "../config";
import {toast} from "react-toastify";
import {ChatMessage} from "../models/ChatCompletion";

interface Props {
    chatBlocks: ChatMessage[];
}

const Chat: React.FC<Props> = ({chatBlocks }) => {
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
        if (chatDivRef.current) {
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

    return (

        <div className="flex-1 overflow-auto" ref={chatDivRef}>
            <div className="flex flex-col items-center text-sm dark:bg-gray-800">
                <div
                    className="flex w-full items-center justify-center gap-1 border-b border-black/10 p-3 text-gray-500 dark:border-gray-900/50 dark:bg-gray-700 dark:text-gray-300">
                    <div className="flex items-center flex-row gap-1" style={{width: '50ch'}}>
                        <span>Model: {isNewConversation ? '' : ChatService.getSelectedModelId()}</span>
                        <span className="flex-grow">
                          <div style={{display: isNewConversation ? 'block' : 'none'}}>
                            <ModelSelect models={models}/>
                          </div>
                      </span>
                    </div>
                </div>
                {chatBlocks.map((block) => (
                    <ChatBlock key={`chat-block-${block.id}`} block={block}/>
                ))}
                <div className="w-full h-32 flex-shrink-0"></div>
            </div>
        </div>
    );
};

export default Chat;
