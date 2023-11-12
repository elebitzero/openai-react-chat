import React, { useState } from 'react';

const BEGIN_SNIPPET: string = '----BEGIN-SNIPPET----';
const END_SNIPPET: string = '----END-SNIPPET----';

interface FoldableTextSectionProps {
    content: string;
}

const FoldableTextSection: React.FC<FoldableTextSectionProps> = ({ content }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
    };

    const contentStyles: React.CSSProperties = {
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        maxHeight: isExpanded ? 'none' : '4.5em', // Sets max height to show first 3 lines based on line height of 1.5em
        overflow: 'hidden',
    };

    const buttonStyles: React.CSSProperties = {
        marginTop: '1em',
        cursor: 'pointer',
        textDecoration: 'underline',
    };

    return (
        <div>
            <div style={contentStyles}>{content}</div>
            <button onClick={toggleExpanded} style={buttonStyles}>
                {isExpanded ? 'Collapse' : 'Expand'}
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
        inputText.split(BEGIN_SNIPPET).forEach((section, index) => {
            if (index === 0 && !section.includes(END_SNIPPET)) {
                sections.push(<div key={`text-${index}`} style={preformattedTextStyles}>{section}</div>);
                return;
            }

            const endSnippetIndex = section.indexOf(END_SNIPPET);
            if (endSnippetIndex !== -1) {
                const snippet = section.substring(0, endSnippetIndex);
                sections.push(
                    <FoldableTextSection key={`foldable-${index}`} content={snippet} />
                );

                const remainingText = section.substring(endSnippetIndex + END_SNIPPET.length);
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
