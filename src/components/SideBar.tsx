import React, {useEffect, useState} from 'react';
import db, {Conversation} from "../service/ConversationDB";
import {conversationSelectedEmitter, conversationsEmitter} from '../service/EventEmitter';
import {ChatBubbleLeftIcon, PencilSquareIcon, PlusIcon, TrashIcon} from "@heroicons/react/24/outline";
import {iconProps} from "../svg";  // Assuming you have this path for the EventEmitter


interface SidebarProps {
    isSidebarCollapsed: boolean;
    toggleSidebarCollapse: () => void;
}
const Sidebar: React.FC<SidebarProps> = ({ isSidebarCollapsed, toggleSidebarCollapse }) => {

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const NUM_INITIAL_CONVERSATIONS = 200;

    useEffect(() => {
        db.conversations
            .orderBy('timestamp')
            .reverse()
            .limit(NUM_INITIAL_CONVERSATIONS)
            .toArray()
            .then(fetchedConversations => {
                const modifiedConversations = fetchedConversations.map(conversation => ({
                    ...conversation,
                    messages: "[]"
                }));
                setConversations(modifiedConversations);
            });

        const handleNewConversation = (conversation: Conversation) => {
            setSelectedId(conversation.id);
            setConversations(prevConversations => [conversation, ...prevConversations]);
        };

        conversationsEmitter.on('newConversation', handleNewConversation);

        // Cleanup: remove the event listener when the component unmounts
        return () => {
            conversationsEmitter.off('newConversation', handleNewConversation);
        };

    }, []);

    const handleNewChat = () => {
        // Emit an event to inform the right panel to reset to the initial state
        conversationSelectedEmitter.emit('selectConversation', null);
    }

    const deleteConversation = (conversationId: number) => {
        // Use the database to delete the conversation by ID
        db.conversations.delete(conversationId);

        // Update the conversations state to remove the deleted conversation
        setConversations((prevConversations) => {
                return prevConversations.filter((conversation) => conversation.id !== conversationId);
            }
        );
        // Reset the selectedId to null
        setSelectedId(null);

        // Emit an event to inform the right panel to reset to the initial state
        conversationSelectedEmitter.emit('selectConversation', null);
    };
    function selectConversation(conversation: Conversation) {
        setSelectedId(conversation.id);
        conversationSelectedEmitter.emit('selectConversation', conversation.id);
    }

    return (
        <div className="sidebar-container">
            <div className="sidebar h-full flex-shrink-0 overflow-x-hidden dark bg-gray-900"
                 style={{width: isSidebarCollapsed ? "0px" : "260px"}}>
                <div className="h-full w-[260px]">
                    <div className="flex h-full min-h-0 flex-col ">
                        <div className="scrollbar-trigger relative h-full w-full flex-1 items-start border-white/20">
                            <h2 style={{
                                position: "absolute",
                                border: "0px",
                                width: "1px",
                                height: "1px",
                                padding: "0px",
                                margin: "-1px",
                                overflow: "hidden",
                                clip: "rect(0px, 0px, 0px, 0px)",
                                whiteSpace: "nowrap",
                                overflowWrap: "normal"
                            }}>
                                Chat history
                            </h2>
                            <nav className="flex h-full w-full flex-col p-2" aria-label="Chat history">
                                <div className="mb-1 flex flex-row gap-2">
                                    <a className="flex px-3 min-h-[44px] py-1 items-center gap-3 transition-colors duration-200 dark:text-white cursor-pointer text-sm rounded-md border dark:border-white/20 hover:bg-gray-500/10 h-11 bg-white dark:bg-transparent flex-grow overflow-hidden"
                                       onClick={() => handleNewChat()}>
                                        <PlusIcon {...iconProps} />
                                        <span className="truncate">New chat</span>
                                    </a>
                                    <span className="" data-state="closed">
                                    <a className="flex px-3 min-h-[44px] py-1 gap-3 transition-colors duration-200 dark:text-white cursor-pointer text-sm rounded-md border dark:border-white/20 hover:bg-gray-500/10 h-11 w-11 flex-shrink-0 items-center justify-center bg-white dark:bg-transparent"
                                       onClick={toggleSidebarCollapse}>
                                        <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24"
                                             strokeLinecap="round" strokeLinejoin="round" className="icon-sm"
                                             height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                            <line x1="9" y1="3" x2="9" y2="21"></line>
                                        </svg>
                                        <span style={{
                                            position: "absolute",
                                            border: "0px",
                                            width: "1px",
                                            height: "1px",
                                            padding: "0px",
                                            margin: "-1px",
                                            overflow: "hidden",
                                            clip: "rect(0px, 0px, 0px, 0px)",
                                            whiteSpace: "nowrap",
                                            overflowWrap: "normal"
                                        }}>
                                            {isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                                        </span>
                                    </a>
                                </span>
                                </div>

                                <div
                                    className="flex-col flex-1 transition-opacity duration-500 -mr-2 pr-2 overflow-y-auto">
                                    <div className="flex flex-col gap-2 pb-2 dark:text-gray-100 text-gray-800 text-sm">
                                        <div>
                                        <span>
                                            <div className="relative" data-projection-id="3"
                                                 style={{height: "auto", opacity: 1}}>
                               {/*                 <div className="sticky top-0 z-[16]" data-projection-id="4"
                                                     style={{opacity: 1}}>
                                                    <h3 className="h-9 pb-2 pt-3 px-3 text-xs text-gray-500 font-medium text-ellipsis overflow-hidden break-all bg-gray-50 dark:bg-gray-900">
                                                        Today
                                                    </h3>
                                                </div>*/}
                                                <ol>
                                                    {
                                                        conversations.map(convo => {
                                                            if (convo.id === selectedId) {
                                                                return (
                                                                    <li key={convo.id} className="relative z-[15]"
                                                                        data-projection-id="5"
                                                                        style={{opacity: 1, height: "auto"}}>
                                                                        <a
                                                                            className="flex py-3 px-3 items-center gap-3 relative rounded-md hover:bg-gray-100 cursor-pointer break-all bg-gray-100 dark:bg-gray-800 pr-14 dark:hover:bg-gray-800 group"
                                                                        >
                                                                            <ChatBubbleLeftIcon {...iconProps} />
                                                                            <div
                                                                                className="flex-1 text-ellipsis max-h-5 overflow-hidden break-all relative">
                                                                                {convo.title}
                                                                                <div
                                                                                    className="absolute inset-y-0 right-0 w-8 z-10 bg-gradient-to-l dark:from-gray-800 from-gray-100"></div>
                                                                            </div>
                                                                            <div
                                                                                className="absolute flex right-1 z-10 dark:text-gray-300 text-gray-800 visible">
                                                                                <button className="p-1 hover:text-white"
                                                                                        style={{visibility: "hidden"}}>
                                                                                    <PencilSquareIcon {...iconProps} />
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => deleteConversation(convo.id)}
                                                                                    className="p-1 hover:text-white">
                                                                                    <TrashIcon {...iconProps} />
                                                                                </button>
                                                                            </div>
                                                                        </a>
                                                                    </li>
                                                                );
                                                            } else {
                                                                return (
                                                                    <li key={convo.id} className="relative z-[15]"
                                                                        data-projection-id="7"
                                                                        style={{opacity: 1, height: "auto"}}>
                                                                        <a
                                                                            onClick={() => selectConversation(convo)}
                                                                            className="flex py-3 px-3 items-center gap-3 relative rounded-md cursor-pointer break-all bg-gray-50 dark:bg-gray-900"
                                                                        >
                                                                            <ChatBubbleLeftIcon {...iconProps} />
                                                                            <div
                                                                                className="flex-1 text-ellipsis max-h-5 overflow-hidden break-all relative">
                                                                                {convo.title}
                                                                                <div
                                                                                    className="absolute inset-y-0 right-0 w-8 z-10 bg-gradient-to-l dark:from-gray-900 from-gray-50 group-hover:from-gray-100 dark:group-hover:from-[#2A2B32]"></div>
                                                                            </div>
                                                                        </a>
                                                                    </li>
                                                                );
                                                            }
                                                        })
                                                    }

                                                </ol>
                                            </div>
                                        </span>
                                        </div>
                                    </div>
                                </div>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Sidebar;
