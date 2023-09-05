import React from 'react';
import {UserCircleIcon} from "@heroicons/react/24/outline";
import {OpenAILogo} from "../svg";
import MarkdownBlock from './MarkdownBlock';
import CopyButton, {CopyButtonMode} from "./CopyButton";
import {ChatMessage, MessageType, Role} from "../models/ChatCompletion";
import {ExclamationCircleIcon} from "@heroicons/react/24/solid";

interface Props {
    block: ChatMessage;
}

const ChatBlock: React.FC<Props> = ({block}) => {
    const errorStyles = block.messageType === MessageType.Error ? { backgroundColor: '#F5E6E6', borderColor: 'red', borderWidth: '1px', borderRadius: '8px', padding: '10px'} : {};

    return (
        <div key={`chat-block-${block.id}`} className="group w-full text-gray-800 dark:text-gray-100 border-b border-black/10 dark:border-gray-900/50" style={block.role === 'assistant' ? { backgroundColor: '#F7F7F8' } : {}}>
            <div className="text-base gap-4 md:gap-6 md:max-w-2xl lg:max-w-xl xl:max-w-3xl p-4 flex lg:px-0 m-auto">
                <div className="w-[30px] flex flex-col relative items-end">
                    <div className="relative flex h-[30px] w-[30px] p-0 rounded-sm items-center justify-center">
                        {/* Main Icon */}
                        {block.role === 'user' ? (
                            <UserCircleIcon width={24} height={24}/>
                        ) : block.role === 'assistant' ? (
                            <OpenAILogo key={`open-ai-logo-${block.id}`}/>
                        ) : null}
                        {/* Decorator Icon */}
                        {block.messageType === MessageType.Error && (
                            <div className="absolute bottom-0 right-0 transform translate-x-33 translate-y-33">
                                <ExclamationCircleIcon className="text-red-500" width={12} height={12} />
                            </div>
                        )}
                    </div>
                </div>
                <div className="relative flex w-[calc(100%-50px)] flex-col gap-1 md:gap-3 lg:w-[calc(100%-115px)]">
                    <div className="flex flex-grow flex-col gap-3" style={errorStyles}>
                        <div
                            className="min-h-[20px] flex flex-col items-start gap-4">
                            <div className="markdown prose w-full break-words dark:prose-invert light">
                                <MarkdownBlock markdown={block.content}
                                               role={block.role}/>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end lg:block">
                        <div className="text-gray-400 flex self-end lg:self-center justify-center mt-2 lg:absolute lg:top-0 lg:translate-x-full lg:right-0 lg:mt-0 lg:pl-2 visible ml-auto">
                            <CopyButton mode={CopyButtonMode.Compact}
                                        text={block.content}/>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ChatBlock;
