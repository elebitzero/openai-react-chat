import React, {CSSProperties} from 'react';
import {EllipsisHorizontalIcon, PaperAirplaneIcon} from '@heroicons/react/24/outline';
import './SubmitButton.css';
import Tooltip from "./Tooltip";

interface SubmitButtonProps {
    loading: boolean;
    disabled: boolean;
    style?: CSSProperties;
    isTextEmpty: boolean;
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({loading, disabled, style, isTextEmpty}) => {
    const strokeColor = isTextEmpty ? 'currentColor' : 'white';

    return (
        <Tooltip title="Send message" side="top" sideOffset={0}>
            <button
                type="submit"
                disabled={loading || disabled}
                className="absolute p-1 rounded-md bottom-1.5 md:bottom-2.5 hover:bg-gray-100 enabled:dark:hover:text-gray-400 dark:hover:bg-gray-900 disabled:hover:bg-transparent dark:disabled:hover:bg-transparent right-2 md:right-3 disabled:opacity-40"
                style={style}
            >
                {loading ? (
                    <EllipsisHorizontalIcon className="animate-ellipsis-pulse" width={24} height={24}
                                            stroke={strokeColor}/>
                ) : (
                    <PaperAirplaneIcon width={24} height={24} stroke={strokeColor}/>
                )}
            </button>
        </Tooltip>
    );
};
