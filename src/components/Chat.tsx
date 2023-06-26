import React, {useEffect} from 'react';
import ScrollToBottom from 'react-scroll-to-bottom';
import ChatBlock from "./ChatBlock";

interface ChatBlockModel {
    id: number;
    content: string;
    role: string;
}

interface Props {
    chatBlocks: ChatBlockModel[];
}

const Chat: React.FC<Props> = ({chatBlocks}) => {
    const scrollToBottomRef: React.RefObject<typeof ScrollToBottom> = React.createRef()

    useEffect(() => {
        if (scrollToBottomRef?.current) {
            console.log('trying to scroll to bottom')
            // scrollToBottomRef.current.useScrollToBottom();
        }
    }, [chatBlocks, scrollToBottomRef]);

    return (
        <div className="flex-1 overflow-hidden">
            <ScrollToBottom className="h-full dark:bg-gray-800">
                <div className="flex flex-col items-center text-sm dark:bg-gray-800">
                    <div
                        className="flex w-full items-center justify-center gap-1 border-b border-black/10 bg-gray-50 p-3 text-gray-500 dark:border-gray-900/50 dark:bg-gray-700 dark:text-gray-300">
                        Model: Default (GPT-3.5)
                    </div>
                    {chatBlocks.map((block) => (
                        <ChatBlock key={`chat-block-${block.id}`} block={block}/>
                    ))}
                    <div className="w-full h-32 md:h-48 flex-shrink-0"></div>
                </div>
            </ScrollToBottom>
        </div>
    );
};

export default Chat;
