// Tooltip.tsx
import React from 'react';
import * as RadixTooltip from '@radix-ui/react-tooltip';

interface TooltipProps {
    title: string;
    children: React.ReactNode; // Explicitly adding children
    side: "top" | "right" | "bottom" | "left";
}

const Tooltip: React.FC<TooltipProps> = ({title, children, side}) => {
    return (
        <RadixTooltip.Provider delayDuration={400}>
            <RadixTooltip.Root>
                <RadixTooltip.Trigger asChild>
                    {children}
                </RadixTooltip.Trigger>
                <RadixTooltip.Portal>
                    <RadixTooltip.Content
                        className="relative rounded-lg border border-black/10 bg-black p-1 shadow-xs transition-opacity max-w-xs"
                        side={side}
                        sideOffset={10}
                    >
            <span
                className="flex items-center whitespace-pre-wrap px-2 py-1 text-center font-medium normal-case text-white text-sm">
              {title}
            </span>
                        <RadixTooltip.Arrow
                            className="relative top-[-3px] h-2 w-2 rotate-45 transform border-r border-b border-black/10 bg-black shadow-xs"/>
                    </RadixTooltip.Content>
                </RadixTooltip.Portal>
            </RadixTooltip.Root>
        </RadixTooltip.Provider>
    );
};

export default Tooltip;
