import React, {SVGProps} from 'react';

export interface IconProps {
    className: string;
    height: string;
    width: string;
    stroke: string;
    strokeWidth: string;
    viewBox: string;
    strokeLinecap: 'round' | 'butt' | 'square' | 'inherit';
    strokeLinejoin: 'round' | 'miter' | 'bevel' | 'inherit';
}

export const iconProps: IconProps = {
    className: 'h-4 w-4',
    height: '1em',
    width: '1em',
    stroke: 'currentColor',
    strokeWidth: '2',
    viewBox: '0 0 24 24',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
};
export const OpenAILogo: React.FC<SVGProps<SVGSVGElement>> = (props) => (
    <svg
        data-name="OpenAI Logo"
        width={24}
        height={24}
        viewBox="140 140 520 520"
        {...props}
    >
        <path
            d="M617.24 354a126.36 126.36 0 0 0-10.86-103.79 127.8 127.8 0 0 0-137.65-61.32 126.36 126.36 0 0 0-95.31-42.49 127.81 127.81 0 0 0-121.92 88.49 126.4 126.4 0 0 0-84.5 61.3 127.82 127.82 0 0 0 15.72 149.86 126.36 126.36 0 0 0 10.86 103.79 127.81 127.81 0 0 0 137.65 61.32 126.36 126.36 0 0 0 95.31 42.49 127.81 127.81 0 0 0 121.96-88.54 126.4 126.4 0 0 0 84.5-61.3A127.82 127.82 0 0 0 617.24 354zM426.58 620.49a94.79 94.79 0 0 1-60.85-22c.77-.42 2.12-1.16 3-1.7l101-58.34a16.42 16.42 0 0 0 8.3-14.37V381.69l42.69 24.65a1.52 1.52 0 0 1 .83 1.17v117.92a95.18 95.18 0 0 1-94.97 95.06zm-204.24-87.23a94.74 94.74 0 0 1-11.34-63.7c.75.45 2.06 1.25 3 1.79l101 58.34a16.44 16.44 0 0 0 16.59 0l123.31-71.2v49.3a1.53 1.53 0 0 1-.61 1.31l-102.1 58.95a95.16 95.16 0 0 1-129.85-34.79zm-26.57-220.49a94.71 94.71 0 0 1 49.48-41.68c0 .87-.05 2.41-.05 3.48v116.68a16.41 16.41 0 0 0 8.29 14.36L376.8 476.8l-42.69 24.65a1.53 1.53 0 0 1-1.44.13l-102.11-59a95.16 95.16 0 0 1-34.79-129.81zm350.74 81.62-123.31-71.2 42.69-24.64a1.53 1.53 0 0 1 1.44-.13l102.11 58.95a95.08 95.08 0 0 1-14.69 171.55V408.75a16.4 16.4 0 0 0-8.24-14.36zM589 330.44c-.75-.46-2.06-1.25-3-1.79l-101-58.34a16.46 16.46 0 0 0-16.59 0l-123.31 71.2v-49.3a1.53 1.53 0 0 1 .61-1.31l102.1-58.9A95.07 95.07 0 0 1 589 330.44zm-267.11 87.87-42.7-24.65a1.52 1.52 0 0 1-.83-1.17V274.57a95.07 95.07 0 0 1 155.9-73c-.77.42-2.11 1.16-3 1.7l-101 58.34a16.41 16.41 0 0 0-8.3 14.36zm23.19-50L400 336.59l54.92 31.7v63.42L400 463.41l-54.92-31.7z"
            fill="#202123"
        />
    </svg>
);

export const SubmitChatIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => (
    <svg
        stroke="currentColor"
        fill="none"
        viewBox="0 0 24 24"
        height="1em"
        width="1em"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z"/>
    </svg>
);
