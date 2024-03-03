import React from 'react';
import {
    ArrowPathRoundedSquareIcon,
    CheckIcon,
    ClipboardIcon,
    SparklesIcon,
    UserCircleIcon
} from "@heroicons/react/24/outline";
import MarkdownBlock from './MarkdownBlock';
import CopyButton, {CopyButtonMode} from "./CopyButton";
import {ChatMessage, MessageType} from "../models/ChatCompletion";
import {ExclamationCircleIcon} from "@heroicons/react/24/solid";
import UserContentBlock from "./UserContentBlock";
import {iconProps} from "../svg";

interface Props {
    block: ChatMessage;
    loading: boolean;
}

const ChatBlock: React.FC<Props> = ({block, loading}) => {
    const errorStyles = block.messageType === MessageType.Error ? {
        backgroundColor: '#F5E6E6',
        borderColor: 'red',
        borderWidth: '1px',
        borderRadius: '8px',
        padding: '10px'
    } : {};

    const handleRegenerate = () => {
        console.log('regenerate');
    }


    return (
      <div key={`chat-block-${block.id}`}
           className={`group w-full text-gray-800 dark:text-gray-100 border-b border-black/10 dark:border-gray-900/50
            ${block.role === 'assistant' ? 'bg-custom-gray dark:bg-gray-900' : 'bg-white dark:bg-gray-850'}`}>
          <div className="text-base gap-4 md:gap-6 md:max-w-2xl lg:max-w-3xl xl:max-w-4xl 2xl:max-w-5xl 3xl:max-w-6xl 4xl:max-w7xl p-4 flex lg:px-0 m-auto">
              <div className="w-[30px] flex flex-col relative items-end">
                  <div className="relative flex h-[30px] w-[30px] p-0 rounded-sm items-center justify-center">
                      {/* Main Icon */}
                      {block.role === 'user' ? (
                        <UserCircleIcon width={24} height={24}/>
                      ) : block.role === 'assistant' ? (
                        <SparklesIcon key={`open-ai-logo-${block.id}`}/>
                      ) : null}
                      {/* Decorator Icon */}
                      {block.messageType === MessageType.Error && (
                        <div className="absolute bottom-0 right-0 transform translate-x-33 translate-y-33">
                            <ExclamationCircleIcon className="text-red-500" width={12} height={12}/>
                        </div>
                      )}
                  </div>
              </div>
              <div className="relative flex w-[calc(100%-50px)] flex-col gap-1 md:gap-3 lg:w-[calc(100%-115px)]">
                  <div className="flex flex-grow flex-col gap-3" style={errorStyles}>
                      <div
                        className="min-h-[20px] flex flex-col items-start gap-4">
                          <div className="markdown prose w-full break-words dark:prose-invert light">
                              {block.role === 'user' ? (
                                <UserContentBlock text={block.content}/>
                              ) : (
                                <MarkdownBlock markdown={block.content} role={block.role} loading={loading}/>
                              )}
                          </div>
                      </div>
                  </div>
                  <div className="flex flex-col justify-end items-center space-y-2 lg:items-end lg:ml-8 lg:absolute lg:translate-x-4 lg:top-0 lg:right-0">
                      <div className="copy-button text-gray-400 visible">
                          <CopyButton mode={CopyButtonMode.Compact} text={block.content}/>
                      </div>
                    {/*{block.role === 'assistant' && (
                      <div className="regenerate-button text-gray-400 visible">
                        <button className="flex gap-2" onClick={handleRegenerate}>
                          <ArrowPathRoundedSquareIcon {...iconProps}/>
                        </button>
                      </div>
                    )}*/}
                  </div>

              </div>
          </div>
      </div>
    );
};

export default ChatBlock;
