import React, {useEffect, useRef, useState} from 'react';
import {useLocation} from 'react-router-dom';
import {MagnifyingGlassIcon} from "@heroicons/react/24/outline";
import ConversationService, {
  Conversation,
  ConversationChangeEvent,
  conversationsEmitter
} from "../service/ConversationService";
import {iconProps} from "../svg";
import {useTranslation} from "react-i18next";
import ConversationListItem from './ConversationListItem';

function useCurrentPath() {
  return useLocation().pathname;
}

const ConversationList: React.FC = () => {
  const {t} = useTranslation();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchInputValue, setSearchInputValue] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const currentPath = useCurrentPath();
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [showSearchOptions, setShowSearchOptions] = useState(false);
  const [conversationsWithMarkers, setConversationsWithMarkers] = useState<Conversation[]>([]);


  useEffect(() => {
    loadConversations();
    conversationsEmitter.on('conversationChangeEvent', handleConversationChange);

    return () => {
      conversationsEmitter.off('conversationChangeEvent', handleConversationChange);
    };

  }, []);


  useEffect(() => {
    const handleSelectedConversation = (id: string | null) => {
      if (id && id.length > 0) {
        let n = Number(id);
        ConversationService.getConversationById(n)
          .then(conversation => {
            if (conversation) {
              setSelectedId(conversation.id);
            } else {
              console.error("Conversation not found.");
            }
          });
      } else {
        setSelectedId(null);
      }
    };

    const itemId = currentPath.split('/c/')[1];
    handleSelectedConversation(itemId)
  }, [currentPath]);

  useEffect(() => {
    const sortedConversations = [...conversations].sort((a, b) => b.timestamp - a.timestamp);  // Sort by timestamp if not already sorted
    setConversationsWithMarkers(insertTimeMarkers(sortedConversations));
  }, [conversations]);

  const getHeaderFromTimestamp = (timestamp: number) => {
    const today = new Date();
    const date = new Date(timestamp);

    const diffTime = Math.abs(today.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return t('today');
    }
    if (diffDays === 2) {
      return t('yesterday');
    }
    if (diffDays <= 7) {
      return t('previous-7-days');
    }
    if (diffDays <= 30) {
      return t('previous-30-days');
    }

    return date.toLocaleString(navigator.language, {month: 'long'});
  };

  const insertTimeMarkers = (conversations: Conversation[]) => {
    let lastHeader = "";
    const withMarkers: Conversation[] = [];
    conversations.forEach((convo, index) => {
      const currentHeader = getHeaderFromTimestamp(convo.timestamp);
      if (currentHeader !== lastHeader) {
        withMarkers.push({
          id: 0,
          gid: 0,
          messages: "",
          model: "",
          systemPrompt: "",
          timestamp: 0,
          marker: true,
          title: currentHeader
        });
        lastHeader = currentHeader;
      }
      withMarkers.push(convo);
    });
    return withMarkers;
  };


  const loadConversations = async () => {
    ConversationService.loadRecentConversationsTitleOnly().then(conversations => {
      setConversations(conversations);
    }).catch(error => {
      console.error("Error loading conversations:", error);
    });
  };

  const handleConversationChange = (event: ConversationChangeEvent) => {

    if (event.action === 'add') {
      const conversation = event.conversation!;
      setSelectedId(conversation.id);
      setConversations(prevConversations => [conversation, ...prevConversations]);

      if (scrollContainerRef.current) {
        if ("scrollTop" in scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = 0;
        }
      }
    } else if (event.action === 'edit') {
      if (event.id === 0) {
        console.error("invali state, cannot edit id = 0");
      } else {
        setConversations(prevConversations => prevConversations.map(conv => {
          if (conv.id === event.id && event.conversation) {
            return event.conversation;
          }
          return conv;
        }));
      }
    } else if (event.action === 'delete') {
      if (event.id === 0) {
        loadConversations();
      } else {
        setConversations(prevConversations => prevConversations.filter(conv => conv.id !== event.id));
      }
    }
  };


  const handleSearch = async (searchString: string) => {
    if (!searchString || searchString.trim() === '') {
      loadConversations();
      return;
    }
    searchString = searchString.trim();
    // Check if searchString starts with 'in:convo'
    if (searchString.toLowerCase().startsWith('in:convo')) {
      const actualSearchString = searchString.substring('in:convo'.length).trim();
      if (actualSearchString === '') {
        // Handle the case where there might be no actual search term provided after 'in:convo'
        setConversations([]); // or however you wish to handle this case.
        return;
      }
      try {
        const foundConversations = await ConversationService.searchWithinConversations(actualSearchString);
        // Assuming you do NOT want to modify the messages in this case, as you're searching within them
        setConversations(foundConversations);
      } catch (error) {
        console.error("Error during search within conversations:", error);
      }
    } else {
      // Original search logic for searching by conversation title
      try {
        const foundConversations = await ConversationService.searchConversationsByTitle(searchString);
        const modifiedConversations = foundConversations.map(conversation => ({
          ...conversation,
          messages: "[]" // Assuming overwriting messages or handling differently was intentional
        }));
        setConversations(modifiedConversations);
      } catch (error) {
        console.error("Error during title search:", error);
      }
    }
  };

  /*
    interface SearchOptionsPopdownProps {
      onSelect: (value: string) => void;
    }

    const SearchOptionsPopdown: React.FC<SearchOptionsPopdownProps> = ({onSelect}) => {
      return (
        <div className="absolute w-full z-20 bg-white dark:text-gray-300 dark:bg-gray-700 shadow-lg rounded-md p-4"
             style={{top: '100%'}}>
          <div className="text-sm font-medium">SEARCH OPTIONS</div>
          <ul>
            <li
              className="cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 p-1 rounded flex justify-between items-center"
              onClick={() => onSelect('in:message ')}
            >
              <span>in:message</span> <span className="ml-auto">+</span>
            </li>
          </ul>
        </div>
      );
    };*/

  const ConversationListItemMemo = React.memo(ConversationListItem);

  return (
    <div className="conversation-list-container">
      <div id="conversation-search" className="flex flex-row items-center mb-2 relative">
        <input
          id="searchInput"
          className="flex-grow rounded-md border dark:text-gray-100 dark:bg-gray-850 dark:border-white/20 px-2 py-1"
          type="text"
          autoComplete="off"
          placeholder={t('search')}
          value={searchInputValue}
          onFocus={() => setShowSearchOptions(true)}
          onBlur={() => setTimeout(() => setShowSearchOptions(false), 200)} // Delay to allow click event to fire on the options
          onChange={(e) => setSearchInputValue(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSearch(searchInputValue);
              setShowSearchOptions(false);
            }
          }}
        />
        <button
          className="ml-2 rounded-md border dark:border-white/20 p-1"
          onClick={() => {
            handleSearch(searchInputValue);
            setShowSearchOptions(false);
          }}
        >
          <MagnifyingGlassIcon style={{color: "#FFFFFF"}} {...iconProps} />
        </button>
        {/* {
                    showSearchOptions && (
                      <SearchOptionsPopdown
                        onSelect={(value) => {
                          setSearchInputValue(prev => prev + value);
                          setShowSearchOptions(false); // Optionally, keep it open
                        }}/>
                    )
      }*/}
      </div>
      <div id="conversation-list" ref={scrollContainerRef}
           className="flex-col flex-1 transition-opacity duration-500 -mr-2 pr-2 overflow-y-auto">
        <div className="flex flex-col gap-2 pb-2 dark:text-gray-100 text-gray-800 text-sm">
          <div className="relative overflow-x-hidden" style={{height: "auto", opacity: 1}}>
            <ol>
              {
                conversationsWithMarkers.map((convo, index) => {
                  if ("marker" in convo) {
                    return (
                      <li key={`marker-${index}`}
                          className="sticky top-0 z-[16]">
                        <h3
                          className="h-9 pb-2 pt-3 px-3 text-xs text-gray-500 font-medium text-ellipsis overflow-hidden bg-gray-50 dark:bg-gray-900">
                          {convo.title}
                        </h3>
                      </li>
                    );
                  } else {
                    return (
                      <ConversationListItemMemo
                        key={convo.id}
                        convo={convo}
                        isSelected={selectedId === convo.id}
                        loadConversations={loadConversations}
                        setSelectedId={setSelectedId}
                      />
                    );
                  }
                })}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationList;
