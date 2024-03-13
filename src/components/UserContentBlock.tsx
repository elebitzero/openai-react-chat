import React, {CSSProperties, useState} from 'react';
import {SNIPPET_MARKERS} from "../constants/appConstants";
import {ChevronDownIcon, ChevronUpIcon} from "@heroicons/react/24/outline";
import {useTranslation} from 'react-i18next';
import FoldableTextSection from './FoldableTextSection';

interface UserContentBlockProps {
    text: string;
}

const UserContentBlock: React.FC<UserContentBlockProps> = ({ text }) => {
    const preformattedTextStyles: React.CSSProperties = {
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
    };

    const processText = (inputText: string): JSX.Element[] => {
        const sections: JSX.Element[] = [];
        inputText.split(SNIPPET_MARKERS.begin).forEach((section, index) => {
            if (index === 0 && !section.includes(SNIPPET_MARKERS.end)) {
                sections.push(<div key={`text-${index}`} style={preformattedTextStyles}>{section}</div>);
                return;
            }

            const endSnippetIndex = section.indexOf(SNIPPET_MARKERS.end);
            if (endSnippetIndex !== -1) {
                const snippet = section.substring(0, endSnippetIndex);
                sections.push(
                    <FoldableTextSection key={`foldable-${index}`} content={snippet} />
                );

                const remainingText = section.substring(endSnippetIndex + SNIPPET_MARKERS.end.length);
                if (remainingText) {
                    sections.push(<div key={`text-after-${index}`} style={preformattedTextStyles}>{remainingText}</div>);
                }
            } else {
                sections.push(<div key={`text-start-${index}`} style={preformattedTextStyles}>{section}</div>);
            }
        });

        return sections;
    };

    const content = processText(text);

    return <div>{content}</div>;
};

export default UserContentBlock;
