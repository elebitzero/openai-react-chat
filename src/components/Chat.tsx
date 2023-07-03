import React, {useEffect, useState} from 'react';
import ChatBlock from "./ChatBlock";
import ModelSelect from "./ModelSelect";
import {OpenAIModel} from "../models/model";
import {ChatService} from "../service/ChatService";

interface ChatBlockModel {
    id: number;
    content: string;
    role: string;
}

interface Props {
    chatBlocks: ChatBlockModel[];
}

const Chat: React.FC<Props> = ({chatBlocks}) => {
    const [isNewConversation, setIsNewConversation] = useState<boolean>(false);
    const [models, setModels] = useState<OpenAIModel[]>([]);

    useEffect(() => {
        setIsNewConversation(chatBlocks.length === 0);
    }, [chatBlocks]);

    useEffect(() => {
        ChatService.fetchModels()
            .then(fetchedModels => {
                setModels(fetchedModels);
            })
            .catch(error => {
                // Handle the error here
                console.error('Error fetching models:', error);
            });
    }, []);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && isNewConversation) {
            event.preventDefault();
        }
    };

    return (
        <div className="flex-1 overflow-auto">
            <div className="flex flex-col items-center text-sm dark:bg-gray-800">
                <div
                    className="flex w-full items-center justify-center gap-1 border-b border-black/10 bg-gray-50 p-3 text-gray-500 dark:border-gray-900/50 dark:bg-gray-700 dark:text-gray-300">
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
                <div className="w-full h-32 md:h-48 flex-shrink-0"></div>
            </div>
        </div>
    );
};

export default Chat;
