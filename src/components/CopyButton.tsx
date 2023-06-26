import React, { useState, useEffect } from "react";
import { CheckIcon, ClipboardIcon } from "@heroicons/react/24/outline";
import { iconProps } from "../svg";

export enum CopyButtonMode {
    Normal = "normal",
    Compact = "compact",
}

interface CopyButtonProps {
    text: string;
    mode?: CopyButtonMode;
}

const CopyButton = ({ text, mode = CopyButtonMode.Normal }: CopyButtonProps) => {
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
        <button className="flex ml-auto gap-2" onClick={handleCopyClick}>
            {isCopied ? (
                <>
                    <CheckIcon {...iconProps} />
                    {mode === CopyButtonMode.Normal ? <span>Copied!</span> : null}
                </>
            ) : (
                <>
                    <ClipboardIcon {...iconProps} />
                    {mode === CopyButtonMode.Normal ? <span>Copy code</span> : null}
                </>
            )}
        </button>
    );
};

export default CopyButton;
