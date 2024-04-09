// Tooltip.tsx
import React, {useContext} from 'react';
import * as RadixTooltip from '@radix-ui/react-tooltip';
import {UserContext} from "../UserContext";

interface TooltipProps {
  title: string;
  children: React.ReactNode;
  side: "top" | "right" | "bottom" | "left";
  sideOffset: number;
}

const Tooltip: React.FC<TooltipProps> = ({title, children, side, sideOffset}) => {
  const {userSettings, setUserSettings} = useContext(UserContext);


  return (
      <RadixTooltip.Provider delayDuration={400}>
        <RadixTooltip.Root>
          <RadixTooltip.Trigger asChild>
            {children}
          </RadixTooltip.Trigger>
          <RadixTooltip.Portal>
            <RadixTooltip.Content
                className="relative rounded-lg border bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-800 dark:border-gray-300 p-1 shadow-sm transition-opacity max-w-xs"
                side={side}
                sideOffset={sideOffset}
            >
            <span
                className="flex items-center whitespace-pre-wrap px-2 py-1 text-left font-medium normal-case text-sm">
              {title}
            </span>
            </RadixTooltip.Content>
          </RadixTooltip.Portal>
        </RadixTooltip.Root>
      </RadixTooltip.Provider>
  );
};

export default Tooltip;
