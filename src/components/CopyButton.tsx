import React, {useEffect, useState} from "react";
import {CheckIcon, ClipboardIcon} from "@heroicons/react/24/outline";
import {iconProps} from "../svg";
import {useTranslation} from 'react-i18next';
import "./Button.css"

export enum CopyButtonMode {
  Normal = "normal",
  Compact = "compact",
}

interface CopyButtonProps {
  text: string;
  mode?: CopyButtonMode;
  className?: string;
}

const CopyButton = ({text, mode = CopyButtonMode.Normal, className = ''}: CopyButtonProps) => {
  const {t} = useTranslation();
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    if (isCopied) {
      timeoutId = setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isCopied]);

  const handleCopyClick = () => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);

    if (mode === CopyButtonMode.Compact) {
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    }
  };

  return (
      <button
          className={`chat-action-button text-gray-400 inline-flex items-center justify-center p-2 ml-auto gap-2 ${className}`}
          onClick={handleCopyClick}>
        {isCopied ? (
            <>
              <CheckIcon {...iconProps} />
              {mode === CopyButtonMode.Normal ? <span>{t('copied')}</span> : null}
            </>
        ) : (
            <>
              <ClipboardIcon {...iconProps} />
              {mode === CopyButtonMode.Normal ? <span>{t('copy-code')}</span> : null}
            </>
        )}
      </button>

  );
};

export default CopyButton;
