import React from 'react';
import {EllipsisHorizontalIcon, PaperAirplaneIcon} from '@heroicons/react/24/outline';
import './SubmitButton.css';
import Tooltip from "./Tooltip";
import {useTranslation} from 'react-i18next';

interface SubmitButtonProps {
  loading: boolean;
  disabled: boolean;
  name?: string;
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({loading, disabled, name}) => {
  const {t} = useTranslation();
  const strokeColor = disabled ? 'currentColor' : 'white';

  return (
      <Tooltip title={t('send-message')} side="top" sideOffset={0}>
        <button
            name={name}
            type="submit"
            disabled={loading || disabled}
            className="absolute p-1 mr-2 rounded-md text-black dark:text-white enabled:text-white enabled:dark:text-black enabled:bg-black enabled:dark:bg-white disabled:opacity-40"
        >
          {loading ? (
              <EllipsisHorizontalIcon className="animate-ellipsis-pulse" width={24} height={24}
                                      stroke={strokeColor}/>
          ) : (
              <PaperAirplaneIcon width={24} height={24} />
          )}
        </button>
      </Tooltip>
  );
};
