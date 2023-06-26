import React from 'react';
import 'highlight.js/styles/github.css';
import ReactMarkdown from 'react-markdown';
import "./MarkdownBlock.css";

import {Light as SyntaxHighlighter} from 'react-syntax-highlighter';
import java from 'react-syntax-highlighter/dist/esm/languages/hljs/java';
import javascript from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import python from 'react-syntax-highlighter/dist/esm/languages/hljs/python';
import typescript from 'react-syntax-highlighter/dist/esm/languages/hljs/typescript';
import CopyButton from "./CopyButton";
import {docco} from "react-syntax-highlighter/dist/esm/styles/hljs";

SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('python', java);

interface ChatBlockProps {
    markdown: string;
    role: string;
}

const MarkdownBlock: React.FC<ChatBlockProps> = ({markdown, role}) => {

    function inlineCodeBlock({value, language}: { value: string; language: string | undefined }) {
        return (
            <code>
                {value}
            </code>
        );
    }

    function codeBlock({node, inline, className, children, ...props}: any) {
        // Note: OpenAI does not always annotate the Markdown code block with the language
        // Note: In this case, we will fall back to plaintext
        const match = /language-(\w+)/.exec(className || '');
        let language: string | undefined = match ? match[1] : 'plaintext';

        const value = String(children).replace(/\n$/, '');

        return inline ? (
            inlineCodeBlock({value: value, language})
        ) : (
            <div className="border-black border rounded-md">
                <div
                    className="flex items-center relative text-gray-200 bg-gray-800 px-4 py-2 text-xs font-sans justify-between rounded-t-md">
                    <span>{language}</span>
                    <CopyButton text={children}/>
                </div>
                <div className="p-4 overflow-y-auto">
                    <SyntaxHighlighter language={language} style={docco}>
                        {value}
                    </SyntaxHighlighter>
                    {/* <code {...props} className={className}>
                        {children}
                    </code>*/}
                </div>
            </div>
        );
    }

    return (
        <ReactMarkdown components={{code: codeBlock}}>
            {markdown}
        </ReactMarkdown>
    );
};

export default MarkdownBlock;
