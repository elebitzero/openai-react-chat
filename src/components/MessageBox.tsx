// MessageBox.tsx
import React, {useState, useRef, ChangeEvent, KeyboardEvent, FormEvent, useImperativeHandle, forwardRef} from 'react';
import {MAX_ROWS, SNIPPET_MARKERS} from '../constants/appConstants';
import {SubmitButton} from "./SubmitButton";

interface MessageBoxProps {
    callApp: Function;
    loading: boolean;
    setLoading: (loading: boolean) => void;
}

// Extend the ref type to include the methods you want to expose
export interface MessageBoxHandles {
    clearTextValue: () => void;
    getTextValue: () => string;
    resizeTextArea: () => void;
}



const MessageBox = forwardRef<MessageBoxHandles, MessageBoxProps>(({loading, setLoading, callApp}, ref) => {

    const [isTextEmpty, setIsTextEmpty] = useState(true);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    useImperativeHandle(ref, () => ({
        // Method to clear the textarea
        clearTextValue: () => {
            if (textAreaRef.current) {
                textAreaRef.current.value = '';
                setIsTextEmpty(true);
                if (textAreaRef.current) {
                    textAreaRef.current.style.height = 'auto';
                }
            }
        },
        getTextValue: () => {
            return textAreaRef.current ? textAreaRef.current.value : '';
        },
        resizeTextArea: () => {
            if (textAreaRef.current) {
                textAreaRef.current.style.height = 'auto';
            }
        },
    }));

    const insertTextAtCursorPosition = (textArea: HTMLTextAreaElement, textToInsert: string) => {
        // Insert the text at the current cursor position
        const startPos = textArea.selectionStart || 0;
        const endPos = textArea.selectionEnd || 0;
        textArea.value = textArea.value.substring(0, startPos) +
            textToInsert +
            textArea.value.substring(endPos, textArea.value.length);

        // Move the cursor to the end of the inserted text
        const newCursorPos = startPos + textToInsert.length;
        textArea.selectionStart = newCursorPos;
        textArea.selectionEnd = newCursorPos;

        // Trigger the input event to update React state
        const event = new Event('input', { bubbles: true });
        textArea.dispatchEvent(event);

        // Focus the textarea to ensure the cursor is visible
        textArea.focus();

        // Scroll the textarea to the new cursor position
        setTimeout(() => {
            // Ensure browser performs the scroll after the DOM has been updated
            // Adjust as necessary to ensure the cursor is visible in the textarea
            textArea.scrollTop = textArea.scrollHeight;
        }, 0);
    };


    const handlePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
        // Get the pasted text from the clipboard
        const pastedText = event.clipboardData.getData('text/plain');

        // Count the number of newlines in the pasted text
        const newlineCount = (pastedText.match(/\n/g) || []).length;

        // Check if there are MAX_ROWS or more newlines
        if (newlineCount >= MAX_ROWS) {
            // Prevent the default paste behavior
            event.preventDefault();

            // Add special character string '----SNIPPET----' at the beginning and end
            const modifiedText = `\n${SNIPPET_MARKERS.begin}\n${pastedText}\n${SNIPPET_MARKERS.end}\n`;

            // Insert the modified text at the current cursor position
            if (textAreaRef.current) {
                insertTextAtCursorPosition(textAreaRef.current, modifiedText);
            }
        }
    };

    const checkForSpecialKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        const isUndo = (e.ctrlKey || e.metaKey) && e.key === 'z';
        const isEnter = (e.key === 'Enter');

        if (isEnter) {
            if (e.shiftKey) {
                return;
            } else {
                if (!loading) {
                    e.preventDefault();
                    const textValue = getTextAreaValue();
                    callApp(textValue);
                    (e.target as HTMLTextAreaElement).style.height = 'auto'; // Revert back to original size
                }
            }
        } else if (isUndo) {
            // Capture the target element reference before the asynchronous call
            const textarea = textAreaRef.current;

            // Call handleAutoResize shortly after the undo operation to allow the DOM to update
            setTimeout(() => {
                if (textarea && document.body.contains(textarea)) {
                    // const event = new Event('input', { bubbles: true });
                    // textarea.dispatchEvent(event);
                    // Resize the textarea after undo
                    handleAutoResize({currentTarget: textarea} as React.FormEvent<HTMLTextAreaElement>);
                } else {
                    console.error('textarea && document.body.contains(textarea) is false');
                }
            }, 0);
        }
    };

    const handleTextChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        setIsTextEmpty(event.target.value.trim() === '');
    };

    const handleAutoResize = (e: FormEvent<HTMLTextAreaElement>) => {
        const target = e.currentTarget;
        if (target instanceof HTMLTextAreaElement) {
            const maxHeight = parseInt(getComputedStyle(target).lineHeight || '0', 10) * MAX_ROWS;

            target.style.height = 'auto';
            if (target.scrollHeight <= maxHeight) {
                target.style.height = `${target.scrollHeight}px`;
            } else {
                target.style.height = `${maxHeight}px`;
            }

            if (target.value === '') {
                target.style.height = 'auto';
            }
        } else {
            console.error('target instanceof HTMLTextAreaElement is false');
            console.log(JSON.stringify(target));
        }
    };

    function getTextAreaValue() {
        if (textAreaRef.current) {
            return textAreaRef.current.value
        } else {
            return '';
        }
    }


    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const textValue = getTextAreaValue();
        callApp(textValue);
        if (textAreaRef.current) {
            textAreaRef.current.style.height = 'auto';
        }
    };

    return (
        <div
            className="absolute bottom-0 left-0 w-full border-t md:border-t-0 dark:border-white/20 md:border-transparent md:dark:border-transparent bg-white dark:bg-gray-800 md:!bg-transparent dark:md:bg-vert-dark-gradient pt-2">
            <form onSubmit={handleSubmit}
                  className="stretch mx-2 flex flex-row gap-3 last:mb-2 md:mx-4 md:last:mb-6 lg:mx-auto lg:max-w-2xl xl:max-w-3xl">
                <div className="relative flex h-full flex-1 md:flex-col">
                    <div style={{borderRadius: "1rem"}}
                         className="flex flex-col w-full py-2 flex-grow md:py-3 md:pl-4 relative border border-black/10 bg-white dark:border-gray-900/50 dark:text-white dark:bg-gray-700 shadow-xs">
                        <textarea
                            tabIndex={0}
                            data-id="request-:r4:-1"
                            ref={textAreaRef}
                            style={{maxHeight: "200px", overflowY: "auto"}}
                            rows={1}
                            placeholder="Send a message..."
                            className="m-0 w-full resize-none border-0 bg-transparent p-0 pr-7 focus:ring-0 focus-visible:ring-0 outline-none shadow-none dark:bg-transparent pl-2 md:pl-0"
                            onKeyDown={checkForSpecialKey}
                            onChange={handleTextChange}
                            onInput={handleAutoResize}
                            onPaste={handlePaste}
                        ></textarea>
                        <SubmitButton
                            disabled={isTextEmpty || loading}
                            loading={loading}
                        />
                    </div>
                </div>
            </form>
        </div>
    );
});

export default MessageBox;
