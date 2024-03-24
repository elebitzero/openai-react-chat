// AnchoredHint.tsx
import React, { useContext } from 'react';
import * as RadixTooltip from '@radix-ui/react-tooltip';
import { UserContext } from "../UserContext";
import {LightBulbIcon} from "@heroicons/react/24/outline";

interface AnchoredHintProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
  open: boolean;
  close: () => void; // Function to dismiss the hint
}

const AnchoredHint: React.FC<AnchoredHintProps> = ({ content, children, side = "top", sideOffset = 5, open, close }) => {
  const { userSettings } = useContext(UserContext);
  const arrowClassName =
    userSettings.theme === 'dark'
      ? "dark:text-gray-100"
      : "text-gray-900";

  return (
    <RadixTooltip.Provider delayDuration={0}>
      <RadixTooltip.Root open={open}>
        <RadixTooltip.Trigger asChild>
          {children}
        </RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            className="relative rounded-lg border bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-800 dark:border-gray-300 p-1 shadow-sm transition-opacity max-w-xs"
            side={side}
            sideOffset={sideOffset}
            onPointerDown={close} // Dismiss the tooltip on click
          >
            <span className="flex items-center whitespace-pre-wrap px-2 py-1 text-left font-medium normal-case text-sm">
              <LightBulbIcon className="w-8 h-8" aria-hidden="true"/>
              {content}
            </span>
            <RadixTooltip.Arrow className={arrowClassName} />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
};

export default AnchoredHint;
