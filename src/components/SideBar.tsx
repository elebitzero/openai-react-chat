import React, {useEffect, useState} from 'react';
import db, {Conversation} from "../service/ConversationDB";
import {conversationSelectedEmitter, conversationsEmitter} from '../service/EventEmitter';
import {ChatBubbleLeftIcon, CheckIcon, PencilSquareIcon, PlusIcon, TrashIcon, XMarkIcon} from "@heroicons/react/24/outline";
import {CloseSideBarIcon, iconProps} from "../svg";
import Tooltip from "./Tooltip";

interface SidebarProps {
    isSidebarCollapsed: boolean;
    toggleSidebarCollapse: () => void;
}
const Sidebar: React.FC<SidebarProps> = ({ isSidebarCollapsed, toggleSidebarCollapse }) => {

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [conversationsWithMarkers, setConversationsWithMarkers] = useState<Conversation[]>([]);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editedTitle, setEditedTitle] = useState("");
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

    useEffect(() => {
        const sortedConversations = [...conversations].sort((a, b) => b.timestamp - a.timestamp);  // Sort by timestamp if not already sorted
        setConversationsWithMarkers(insertTimeMarkers(sortedConversations));
    }, [conversations]);

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

    const selectConversation = (conversation: Conversation) => {
        if (isEditingTitle) {
            // If in edit mode, cancel edit mode and select the new conversation
            setIsEditingTitle(false);
            setEditedTitle(''); // Clear editedTitle
            setSelectedId(conversation.id);
            conversationSelectedEmitter.emit('selectConversation', conversation.id);
        } else {
            // If not in edit mode, simply select the conversation
            setSelectedId(conversation.id);
            conversationSelectedEmitter.emit('selectConversation', conversation.id);
        }
    }

    const getHeaderFromTimestamp = (timestamp: number) => {
        const today = new Date();
        const date = new Date(timestamp);

        const diffTime = Math.abs(today.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return 'Today';
        if (diffDays === 2) return 'Yesterday';
        if (diffDays <= 7) return 'Previous 7 Days';
        if (diffDays <= 30) return 'Previous 30 Days';

        return date.toLocaleString('default', { month: 'long' });
    };

    const handleTitleInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, conversation : Conversation) => {
        if (e.key === 'Enter') {
            // Save the edited title when Enter key is pressed
            saveEditedTitle(conversation);
        }
    };

    const saveEditedTitle = (conversation: Conversation) => {
        db.conversations
            .update(conversation.id, { title: editedTitle })
            .then((updatedCount: number) => {
                if (updatedCount > 0) {
                    // Update the conversation title in the state
                    const updatedConversations = conversations.map((c) => {
                        if (c.id === conversation.id) {
                            return { ...c, title: editedTitle };
                        }
                        return c;
                    });
                    setConversations(updatedConversations);
                    setIsEditingTitle(false); // Exit edit mode
                } else {
                    // Handle the case where the update in the database fails
                    console.error('Failed to update conversation title in the database.');
                }
            })
            .catch((error: Error) => {
                console.error('Error updating conversation title in the database:', error);
            });
    };

    const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>, conversation : Conversation) => {
        // Check if the blur event was not caused by pressing the Enter key
        if (!e.relatedTarget) {
            // If in edit mode and the input loses focus, cancel the edit
            setEditedTitle(conversation.title);
            setIsEditingTitle(false);
        }
    };

    const handleContextMenu = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        setIsEditingTitle(false);
    };

    const insertTimeMarkers = (conversations: Conversation[]) => {
        let lastHeader = "";
        const withMarkers: Conversation[] = [];
        conversations.forEach((convo, index) => {
            const currentHeader = getHeaderFromTimestamp(convo.timestamp);
            if (currentHeader !== lastHeader) {
                withMarkers.push({id: 0, messages: "", model: "", systemPrompt: "", timestamp: 0, marker: true, title: currentHeader });
                lastHeader = currentHeader;
            }
            withMarkers.push(convo);
        });
        return withMarkers;
    };

    const toggleEditMode = (convo: Conversation) => {
        if (!isEditingTitle) {
            // Entering edit mode, initialize editedTitle with convo.title
            setEditedTitle(convo.title);
        } else {
            // Exiting edit mode, clear editedTitle
            setEditedTitle('');
        }
        setIsEditingTitle(!isEditingTitle);
    };

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
                                    <Tooltip title="Close sidebar" side="right">
                                        <a
                                            className="flex px-3 min-h-[44px] py-1 gap-3 transition-colors duration-200 dark:text-white cursor-pointer text-sm rounded-md border dark:border-white/20 hover:bg-gray-500/10 h-11 w-11 flex-shrink-0 items-center justify-center bg-white dark:bg-transparent"
                                            onClick={toggleSidebarCollapse}>
                                            <CloseSideBarIcon></CloseSideBarIcon>
                                        </a>
                                    </Tooltip>
                                </div>

                                <div
                                    className="flex-col flex-1 transition-opacity duration-500 -mr-2 pr-2 overflow-y-auto">
                                    <div className="flex flex-col gap-2 pb-2 dark:text-gray-100 text-gray-800 text-sm">
                                        <div>
                                        <span>
                                            <div className="relative" data-projection-id="3"
                                                 style={{height: "auto", opacity: 1}}>
                                                <ol>
                                                    {
                                                        conversationsWithMarkers.map((convo, index) => {
                                                            if ("marker" in convo) {
                                                                return (
                                                                    <li key={`marker-${index}`} className="sticky top-0 z-[16]">
                                                                        <h3 className="h-9 pb-2 pt-3 px-3 text-xs text-gray-500 font-medium text-ellipsis overflow-hidden bg-gray-50 dark:bg-gray-900">
                                                                            {convo.title}
                                                                        </h3>
                                                                    </li>
                                                                );
                                                            } else {
                                                                if (convo.id === selectedId) {
                                                                    return (
                                                                        <li key={convo.id} className="relative z-[15]"
                                                                            data-projection-id="5"
                                                                            style={{opacity: 1, height: "auto"}}>
                                                                            <a
                                                                                className={`flex py-3 px-3 items-center gap-3 relative rounded-md hover:bg-gray-100 cursor-pointer break-all bg-gray-100 dark:bg-gray-800 pr-14 dark:hover:bg-gray-800 group`}
                                                                            >
                                                                                <ChatBubbleLeftIcon {...iconProps} />
                                                                                {isEditingTitle ? (
                                                                                    <div className={"flex items-center gap-3"}>
                                                                                        <input
                                                                                            type="text"
                                                                                            className={'dark:bg-gray-800 dark:text-gray-100'}
                                                                                            value={editedTitle}
                                                                                            onChange={(e) => setEditedTitle(e.target.value)}
                                                                                            onKeyDown={(e) => handleTitleInputKeyPress(e,convo)}
                                                                                            autoFocus={true}
                                                                                            maxLength={30}
                                                                                            style={{width: "142px"}}
                                                                                            onBlur={(e) => {
                                                                                                if (isEditingTitle) {
                                                                                                    handleInputBlur(e,convo);
                                                                                                }
                                                                                            }}
                                                                                        />
                                                                                    </div>
                                                                                ) : (
                                                                                    <div className="flex-1 text-ellipsis max-h-5 overflow-hidden break-all relative">
                                                                                        {convo.title}
                                                                                        <div className="absolute inset-y-0 right-0 w-8 z-10 bg-gradient-to-l dark:from-gray-800 from-gray-100"></div>
                                                                                    </div>
                                                                                )}
                                                                                <div className="absolute flex right-1 z-10 dark:text-gray-300 text-gray-800">
                                                                                    {isEditingTitle ? (
                                                                                        <>
                                                                                            <button
                                                                                                onClick={() => {saveEditedTitle(convo)}}
                                                                                                className={`p-1 hover:text-white`}
                                                                                                onContextMenu={handleContextMenu}
                                                                                            >
                                                                                                <CheckIcon {...iconProps} />
                                                                                            </button>
                                                                                            <button
                                                                                                onClick={() => {
                                                                                                    setIsEditingTitle(false); // Exit edit mode without saving
                                                                                                    setEditedTitle(""); // Clear the edited title
                                                                                                }}
                                                                                                className={`p-1 hover:text-white`}
                                                                                            >
                                                                                                <XMarkIcon {...iconProps} />
                                                                                            </button>
                                                                                        </>
                                                                                    ) : (
                                                                                        <>
                                                                                            <button
                                                                                                onClick={() => toggleEditMode(convo)}
                                                                                                className={`p-1 hover:text-white`}
                                                                                            >
                                                                                                <PencilSquareIcon {...iconProps} />
                                                                                            </button>
                                                                                            <button
                                                                                                onClick={() => deleteConversation(convo.id)}
                                                                                                className="p-1 hover:text-white"
                                                                                            >
                                                                                                <TrashIcon {...iconProps} />
                                                                                            </button>
                                                                                        </>
                                                                                    )}
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
