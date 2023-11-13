import React, {CSSProperties, useState} from 'react';
import {SNIPPET_MARKERS} from "../constants/appConstants";
import {ChevronDownIcon, ChevronUpIcon} from "@heroicons/react/24/outline";

interface FoldableTextSectionProps {
    content: string;
}

const FoldableTextSection: React.FC<FoldableTextSectionProps> = ({ content }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleSection = () => {
        setIsExpanded(!isExpanded);
    };

    // Define your style constants
    const buttonStyles: CSSProperties  = {
        color: 'var(--primary)',
        cursor: 'pointer',
        userSelect: 'none',
        backgroundColor: 'transparent',
        border: 'none',
        padding: 0,
        display: 'flex',
        alignItems: 'center',
        fontSize: '1rem',
        outline: 'none',
    };

    const iconStyles: CSSProperties  = {
        width: '1em',
        height: '1em',
        marginRight: '0.5em',
    };

    const contentStyles: CSSProperties  = {
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        maxHeight: isExpanded ? 'none' : '4.5em', // Sets max height to show first 3 lines based on line height of 1.5em
        overflow: 'hidden',
    };

    return (
        <div>
            <div style={contentStyles} dangerouslySetInnerHTML={{ __html: content }} />
            <button onClick={toggleSection} style={buttonStyles} aria-expanded={isExpanded}>
                {isExpanded ? (
                    <>
                        <ChevronUpIcon style={iconStyles} />
                        Collapse
                    </>
                ) : (
                    <>
                        <ChevronDownIcon style={iconStyles} />
                        Expand
                    </>
                )}
            </button>
        </div>
    );
};

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
