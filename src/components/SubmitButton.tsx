// SubmitButton.tsx
import React from 'react';
import { PaperAirplaneIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/outline';
import './SubmitButton.css';

interface SubmitButtonProps {
    loading: boolean;
    disabled: boolean;
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({ loading, disabled }) => {
    return (
        <button
            type="submit"
            disabled={loading || disabled}
            className="absolute p-1 rounded-md text-gray-500 bottom-1.5 md:bottom-2.5 hover:bg-gray-100 enabled:dark:hover:text-gray-400 dark:hover:bg-gray-900 disabled:hover:bg-transparent dark:disabled:hover:bg-transparent right-1 md:right-2 disabled:opacity-40"
        >
            {loading ? (
                <EllipsisHorizontalIcon className="animate-ellipsis-pulse"  width={24} height={24} />
            ) : (
                <PaperAirplaneIcon width={24} height={24} />
            )}
        </button>
    );
};
