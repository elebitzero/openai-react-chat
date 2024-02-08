// MessageBox.tsx
import React, {
    ChangeEvent,
    FormEvent,
    forwardRef,
    KeyboardEvent,
    useCallback,
    useEffect,
    useImperativeHandle,
    useRef,
    useState
} from 'react';
import {MAX_ROWS, SNIPPET_MARKERS} from '../constants/appConstants';
import {SubmitButton} from "./SubmitButton";
import {useTranslation} from 'react-i18next';
import {ChatService} from "../service/ChatService";
import {StopCircleIcon} from "@heroicons/react/24/solid";
import Tooltip from "./Tooltip";
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
    const { t } = useTranslation();
    const [textValue, setTextValue] = useState('');
    const [isTextEmpty, setIsTextEmpty] = useState(true);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    const resizeTimeoutRef = useRef<number | null>(null);

    useImperativeHandle(ref, () => ({
        // Method to clear the textarea
        clearTextValue: () => {
            clearValueAndUndoHistory(textAreaRef)
        },
        getTextValue: () => {
            return textValue;
        },
        resizeTextArea: () => {
            if (textAreaRef.current) {
                textAreaRef.current.style.height = 'auto';
            }
        },
    }));

    // Function to handle auto-resizing of the textarea
    const handleAutoResize = useCallback(() => {
        if (textAreaRef.current) {
            const target = textAreaRef.current;
            const maxHeight = parseInt(getComputedStyle(target).lineHeight || '0', 10) * MAX_ROWS;

            target.style.height = 'auto';
            if (target.scrollHeight <= maxHeight) {
                target.style.height = `${target.scrollHeight}px`;
            } else {
                target.style.height = `${maxHeight}px`;
            }
        }
    }, []);

    // Debounced resize function
    const debouncedResize = useCallback(() => {
        if (resizeTimeoutRef.current !== null) {
            clearTimeout(resizeTimeoutRef.current);
        }
        resizeTimeoutRef.current = window.setTimeout(() => {
            handleAutoResize();
        }, 100); // Adjust the debounce time as needed
    }, []);


    useEffect(() => {
        debouncedResize();

        // After resizing, scroll the textarea to the insertion point (end of the pasted text).
        if (textAreaRef.current) {
            const textarea = textAreaRef.current;
            // Check if the pasted content goes beyond the max height (overflow scenario)
            if (textarea.scrollHeight > textarea.clientHeight) {
                // Scroll to the bottom of the textarea
                textarea.scrollTop = textarea.scrollHeight;
            }
        }

        // Cleanup function to clear the debounce timeout
        return () => {
            if (resizeTimeoutRef.current !== null) {
                clearTimeout(resizeTimeoutRef.current);
            }
        };
    }, [textValue, debouncedResize]);

    function clearValueAndUndoHistory(textAreaRef: React.RefObject<HTMLTextAreaElement>) {
        setTextValue('');
        setIsTextEmpty(true);
        // Clear the current value of the textarea
        if (textAreaRef.current) {
            textAreaRef.current.value = '';
        }
    }

    const insertTextAtCursorPosition = (textToInsert: string) => {
        if (textAreaRef.current) {
            const textArea = textAreaRef.current;
            const startPos = textArea.selectionStart || 0;
            const endPos = textArea.selectionEnd || 0;
            const newTextValue =
                textValue.substring(0, startPos) +
                textToInsert +
                textValue.substring(endPos);

            // Update the state with the new value
            setTextValue(newTextValue);

            // Set the value of the textarea directly
            textArea.value =
                textArea.value.substring(0, startPos) +
                textToInsert +
                textArea.value.substring(endPos);

            // Dispatch a new InputEvent for the insertion of text
            // This event should be undoable
            const inputEvent = new InputEvent('input', {
                bubbles: true,
                cancelable: true,
                inputType: 'insertText',
                data: textToInsert,
            });
            textArea.dispatchEvent(inputEvent);

            // Move the cursor to the end of the inserted text
            const newCursorPos = startPos + textToInsert.length;
            setTimeout(() => {
                textArea.selectionStart = newCursorPos;
                textArea.selectionEnd = newCursorPos;
                // Call handleAutoResize and scroll to the insertion point after the DOM update
                handleAutoResize();
                if (textArea.scrollHeight > textArea.clientHeight) {
                    textArea.scrollTop = textArea.scrollHeight;
                }
            }, 0);
        }
    };

    const handlePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
        // Get the pasted text from the clipboard
        const pastedText = event.clipboardData.getData('text/plain');


        // Check if the pasted text contains the snippet markers
        const containsBeginMarker = pastedText.includes(SNIPPET_MARKERS.begin);
        const containsEndMarker = pastedText.includes(SNIPPET_MARKERS.end);

        // If either marker is found, just allow the default paste behavior
        if (containsBeginMarker || containsEndMarker) {
            return; // Early return if markers are present
        }

        // Count the number of newlines in the pasted text
        const newlineCount = (pastedText.match(/\n/g) || []).length;

        // Check if there are MAX_ROWS or more newlines
        if (newlineCount >= MAX_ROWS) {
            event.preventDefault();
            const modifiedText = `\n${SNIPPET_MARKERS.begin}\n${pastedText}\n${SNIPPET_MARKERS.end}\n`;
            insertTextAtCursorPosition(modifiedText);
        } else {
            // Allow the default paste behavior to occur
            // The textarea value will be updated automatically
        }
    };

    const checkForSpecialKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        const isEnter = (e.key === 'Enter');

        if (isEnter) {
            if (e.shiftKey) {
                return;
            } else {
                if (!loading) {
                    e.preventDefault();
                    callApp(textValue);
                }
            }
        }
    };

    const handleTextChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        setIsTextEmpty(event.target.value.trim() === '');
        setTextValue(event.target.value);
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        callApp(textValue);
        if (textAreaRef.current) {
            textAreaRef.current.style.height = 'auto';
        }
    };
    const handleCancel = () => {
        ChatService.cancelStream();
        setLoading(false);
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
                            placeholder={t('send-a-message')}
                            className="m-0 w-full resize-none border-0 bg-transparent p-0 pr-7 focus:ring-0 focus-visible:ring-0 outline-none shadow-none dark:bg-transparent pl-2 md:pl-0"
                            value={textValue}
                            onKeyDown={checkForSpecialKey}
                            onChange={handleTextChange}
                            onPaste={handlePaste}
                        ></textarea>
                        {loading ? (
                          <Tooltip title={t('cancel-output')} side="top" sideOffset={0}>
                              <button onClick={handleCancel} className="absolute p-1 top-0 right-2">
                                  <StopCircleIcon className="h-9 w-9"/>
                              </button>
                          </Tooltip>
                        ) : (
                          <SubmitButton
                            disabled={isTextEmpty || loading}
                            loading={loading}
                          />
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
});

export default MessageBox;
