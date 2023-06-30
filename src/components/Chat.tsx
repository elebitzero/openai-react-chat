import React, { useEffect, useState } from 'react';
import ChatBlock from "./ChatBlock";
import ModelSelect from "./ModelSelect";
import {OpenAIModel} from "../models/model";

interface ChatBlockModel {
    id: number;
    content: string;
    role: string;
}

interface Props {
    chatBlocks: ChatBlockModel[];
    models: OpenAIModel[];
}

const Chat: React.FC<Props> = ({ chatBlocks, models }) => {
  const [isNewConversation, setIsNewConversation] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<OpenAIModel | null>(null);

  useEffect(() => {
    setIsNewConversation(chatBlocks.length === 0);
  }, [chatBlocks]);
    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && isNewConversation) {
            event.preventDefault();
            setSelectedModel(models[0]); // Set the initial model here
        }
    };

  return (
    <div className="flex-1 overflow-hidden">
      <div className="flex flex-col items-center text-sm dark:bg-gray-800">
        <div className="flex w-full items-center justify-center gap-1 border-b border-black/10 bg-gray-50 p-3 text-gray-500 dark:border-gray-900/50 dark:bg-gray-700 dark:text-gray-300">
            Model: {isNewConversation ? 'Default (GPT-3.5)' : (selectedModel ? selectedModel.id : 'None selected')}
            {isNewConversation && (
                <ModelSelect
                    models={models}
                    onModelSelect={(model) => setSelectedModel(model)}
                    selectedModel={selectedModel}
              />
          )}
        </div>
        {chatBlocks.map((block) => (
          <ChatBlock key={`chat-block-${block.id}`} block={block} />
        ))}
        <div className="w-full h-32 md:h-48 flex-shrink-0"></div>
      </div>
    </div>
  );
};

export default Chat;
