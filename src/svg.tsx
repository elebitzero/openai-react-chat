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

export const CloseSideBarIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => (
    <svg
        stroke="currentColor"
        fill="none"
        strokeWidth="2"
        viewBox="0 0 24 24"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="icon-sm"
        height="1em"
        width="1em"
        xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="2" y="2" width="20" height="20" rx="2" ry="2"></rect>
      <line x1="9" y1="2" x2="9" y2="22"></line>
    </svg>
);

export const OpenSideBarIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => (
    <svg
        stroke="currentColor"
        fill="none"
        strokeWidth="2"
        viewBox="0 0 24 24"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="icon-sm"
        height="1em"
        width="1em"
        xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="2" y="2" width="20" height="20" rx="2" ry="2"></rect>
      <line x1="9" y1="2" x2="9" y2="22"></line>
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
