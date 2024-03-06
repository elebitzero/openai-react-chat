import React, {ChangeEvent, KeyboardEvent, useEffect, useRef, useState} from 'react';
import {
    ArrowPathRoundedSquareIcon,
    CheckIcon,
    ClipboardIcon, PencilSquareIcon,
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
    const [isEdit, setIsEdit] = useState(false);
    const [editedBlockContent, setEditedBlockContent] = useState('');
    const contentRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [savedHeight, setSavedHeight] = useState<string | null>(null);

    const errorStyles = block.messageType === MessageType.Error ? {
        backgroundColor: '#F5E6E6',
        borderColor: 'red',
        borderWidth: '1px',
        borderRadius: '8px',
        padding: '10px'
    } : {};


    useEffect(() => {
        if(isEdit){
            textareaRef.current?.focus();
            textareaRef.current?.setSelectionRange(0, 0);
        }
    }, [isEdit]);


    const handleRegenerate = () => {
    }

    const handleEdit = () => {
        if (contentRef.current) {
            setSavedHeight(`${contentRef.current.offsetHeight}px`);
        }
        setIsEdit(true);
        setEditedBlockContent(block.content);
    }
    const handleEditSave = () => {
        // todo: notify main to change content block
        setIsEdit(false);
    }

    const handleEditCancel = () => {
        setIsEdit(false);
    }

    const checkForSpecialKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        const isEnter = (e.key === 'Enter');
        const isEscape = (e.key === 'Escape');

        if (isEnter) {
            e.preventDefault();
            handleEditSave();
        } else if (isEscape) {
            e.preventDefault();
            handleEditCancel();
        }
    };

    const handleTextChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        setEditedBlockContent(event.target.value);
    };

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
                          {isEdit ? (
                              <textarea
                                spellCheck={false}
                                tabIndex={0}
                                ref={textareaRef}
                                style={{ height: savedHeight ?? undefined , lineHeight: '1.33', fontSize: '1rem'}}
                                className="border border-black/10 bg-white dark:border-gray-900/50 dark:bg-gray-700 w-full m-0 p-0 pr-7 pl-2 md:pl-0 resize-none bg-transparent dark:bg-transparent  focus:ring-0 focus-visible:ring-0 outline-none shadow-none"
                                onChange={handleTextChange}
                                onKeyDown={checkForSpecialKey}
                                value={editedBlockContent}
                              ></textarea>
                            )
                            : (
                              <div ref={contentRef}  className="markdown prose w-full break-words dark:prose-invert light">
                                  {block.role === 'user' ? (
                                    <UserContentBlock text={block.content}/>
                                  ) : (
                                    <MarkdownBlock markdown={block.content} role={block.role} loading={loading}/>
                                  )}
                              </div>)}

                      </div>
                  </div>
                  <div style={{marginRight: "-1em"}}
                       className="flex flex-col justify-end items-center space-y-2 lg:items-end lg:ml-8 lg:absolute lg:translate-x-4 lg:top-0 lg:right-0">
                      <div className="copy-button text-gray-400 visible">
                          <CopyButton mode={CopyButtonMode.Compact} text={block.content}/>
                      </div>
            {/*          {block.role === 'assistant' && (
                        <div className="regenerate-button text-gray-400 visible">
                            <button className="flex gap-2" onClick={handleRegenerate}>
                                <ArrowPathRoundedSquareIcon {...iconProps}/>
                            </button>
                        </div>
                      )}
                      <div className="regenerate-button text-gray-400 visible">
                          <button className="flex gap-2" onClick={handleEdit}>
                              <PencilSquareIcon {...iconProps}/>
                          </button>
                      </div>*/}
                  </div>

              </div>
          </div>
      </div>
    );
};

export default ChatBlock;
