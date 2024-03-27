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
import {IMAGE_MIME_TYPES, MAX_IMAGE_ATTACHMENTS_PER_MESSAGE, MAX_ROWS, SNIPPET_MARKERS, TEXT_MIME_TYPES} from '../constants/appConstants';
import {SubmitButton} from "./SubmitButton";
import {useTranslation} from 'react-i18next';
import {ChatService} from "../service/ChatService";
import {PaperClipIcon, StopCircleIcon} from "@heroicons/react/24/outline";
import Tooltip from "./Tooltip";
import FileDataPreview from './FileDataPreview';
import { FileData, FileDataRef } from '../models/FileData';
import {ChatMessage} from "../models/ChatCompletion";
import { preprocessImage } from '../utils/ImageUtils';

interface MessageBoxProps {
  callApp: Function;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  allowImageAttachment: string;
}

// Extend the ref type to include the methods you want to expose
export interface MessageBoxHandles {
  clearInputValue: () => void;
  getTextValue: () => string;
  resizeTextArea: () => void;
  focusTextarea: () => void;
}


const MessageBox =
  forwardRef<MessageBoxHandles, MessageBoxProps>(
    ({loading, setLoading, callApp, allowImageAttachment}, ref) => {
  const {t} = useTranslation();
  const [textValue, setTextValue] = useState('');
  const [isTextEmpty, setIsTextEmpty] = useState(true);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const resizeTimeoutRef = useRef<number | null>(null);
  const [fileDataRef, setFileDataRef] = useState<FileDataRef[]>([]);

  useImperativeHandle(ref, () => ({
    // Method to clear the textarea
    clearInputValue: () => {
      clearValueAndUndoHistory(textAreaRef);
    },
    getTextValue: () => {
      return textValue;
    },
    resizeTextArea: () => {
      if (textAreaRef.current) {
        textAreaRef.current.style.height = 'auto';
      }
    },
    focusTextarea: () => {
      if (textAreaRef.current) {
        textAreaRef.current.focus();
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
    setFileDataRef([]);
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

    if (event.clipboardData && event.clipboardData.items) {
      const items = event.clipboardData.items;

      for (const item of items) {
        if (item.type.indexOf("image") === 0 && allowImageAttachment !== 'no') {
          event.preventDefault();

          const file = item.getAsFile();

          if (file) {
            const reader = new FileReader();

            reader.onload = (loadEvent) => {
              if (loadEvent.target !== null) {
                const base64Data = loadEvent.target.result;

                if (typeof base64Data === 'string') {
                  preprocessImage(file, (base64Data, processedFile) => {
                    setFileDataRef((prevData) => [...prevData, {
                      id: 0,
                      fileData : {
                        data: base64Data,
                        type: processedFile.type,
                        source: 'pasted',
                        filename: 'pasted-image',
                      }
                  }]);
                  });
                  if (allowImageAttachment == 'warn') {
                    // todo: could warn user
                  }
                }
              }
            };

            reader.readAsDataURL(file);
          }
        }
      }
    }

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
    if (newlineCount >= MAX_ROWS || pastedText.length > 80 * MAX_ROWS) {
      event.preventDefault();
      const modifiedText = `${SNIPPET_MARKERS.begin}\n${pastedText}\n${SNIPPET_MARKERS.end}\n`;
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
          callApp(textValue,(allowImageAttachment === 'yes') ? fileDataRef : []);
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
    callApp(textValue,(allowImageAttachment === 'yes') ? fileDataRef : []);
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
    }
  };
  const handleCancel = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    ChatService.cancelStream();
    setLoading(false);
  };


  const handleAttachment = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    // Create an input element of type file
    const fileInput = document.createElement('input');
    fileInput.setAttribute('type', 'file');
    fileInput.setAttribute('multiple', '');
    const acceptedMimeTypes = ((allowImageAttachment !== 'no') ? IMAGE_MIME_TYPES : [] ).concat(TEXT_MIME_TYPES).join(',');
    fileInput.setAttribute('accept', acceptedMimeTypes);
    fileInput.click();

    // Event listener for file selection
    fileInput.onchange = (e) => {
      const files = fileInput.files;
      if (files) {
        Array.from(files).forEach((file) => {
          // Check if the file is an image
          if (file.type.startsWith('image/')) {
            if (fileDataRef.length >= MAX_IMAGE_ATTACHMENTS_PER_MESSAGE) {
              return;
            }
            preprocessImage(file, (base64Data, processedFile) => {
              setFileDataRef((prev) => [...prev, {
                id: 0,
                fileData: {
                  data: base64Data,
                  type: processedFile.type,
                  source: 'filename',
                  filename: processedFile.name,
                }
            }]);
              if (allowImageAttachment == 'warn') {
                // todo: could warn user
              }
            });
          }
          // Else, if the file is a text file
          else if (file.type.startsWith('text/')) {
            const reader = new FileReader();

            reader.onloadend = () => {
              const textContent = reader.result as string;
              const formattedText = `File: ${file.name}:\n${SNIPPET_MARKERS.begin}\n${textContent}\n${SNIPPET_MARKERS.end}\n`;
              insertTextAtCursorPosition(formattedText);

              // Focus the textarea and place the cursor at the end of the text
              if (textAreaRef.current) {
                const textArea = textAreaRef.current;
                textArea.focus();

                const newCursorPos = textArea.value.length;

                // Use setTimeout to ensure the operation happens in the next tick after render reflow
                setTimeout(() => {
                  textArea.selectionStart = newCursorPos;
                  textArea.selectionEnd = newCursorPos;
                  handleAutoResize();
                  textArea.scrollTop = textArea.scrollHeight;
                }, 0);
              }
            };
            reader.readAsText(file);
          }
        });
      }
    };
  };


  const handleRemoveFileData = (index: number,fileRef: FileDataRef) => {
    setFileDataRef(fileDataRef.filter((_, i) => i !== index));
  };

  return (
      <div
          className="absolute bottom-0 left-0 w-full border-t md:border-t-0 dark:border-white/20 md:border-transparent md:dark:border-transparent bg-white dark:bg-gray-900 md:!bg-transparent dark:md:bg-vert-dark-gradient pt-2">
        <form onSubmit={handleSubmit}
              className="stretch mx-2 flex flex-row gap-3 last:mb-2 md:mx-4 md:last:mb-6 lg:mx-auto md:max-w-2xl lg:max-w-3xl xl:max-w-4xl 2xl:max-w-5xl 3xl:max-w-6xl 4xl:max-w7xl">
          <div className="relative flex h-full flex-1 md:flex-col">
            <div style={{borderRadius: "1rem"}}
                 className="flex flex-col w-full py-2 flex-grow md:py-3 md:pl-4 relative border border-black/10 bg-white dark:border-gray-900/50 dark:text-white dark:bg-gray-850 shadow-xs">
              {/* FileDataPreview Full Width at the Top */}
              {fileDataRef.length > 0 && (
                <div className="w-full">
                  <FileDataPreview fileDataRef={fileDataRef} removeFileData={handleRemoveFileData} allowImageAttachment={allowImageAttachment == 'yes'}/>
                </div>
              )}
              {/* Container for Textarea and Buttons */}
              <div className="flex items-center w-full relative">
                {/* Attachment Button */}
                <div className="flex items-center justify-start">
                  <button
                    onClick={(e) => handleAttachment(e)}
                    className="p-1">
                    <PaperClipIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Textarea */}
                <textarea
                  id="sendMessageInput"
                  name="message"
                  tabIndex={0}
                  ref={textAreaRef}
                  rows={1}
                  className="flex-auto m-0 resize-none border-0 bg-transparent px-2 py-2 focus:ring-0 focus-visible:ring-0 outline-none shadow-none dark:bg-transparent"
                  placeholder={t('send-a-message')}
                  value={textValue}
                  onKeyDown={checkForSpecialKey}
                  onChange={handleTextChange}
                  onPaste={handlePaste}
                ></textarea>

                {/* Cancel/Submit Button */}
                <div className="flex items-center justify-end">
                  {loading ? (
                    <Tooltip title={t('cancel-output')} side="top" sideOffset={0}>
                      <button
                        onClick={(e) => handleCancel(e)}
                        className="p-1">
                        <StopCircleIcon className="h-6 w-6"/>
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
            </div>
          </div>
        </form>
      </div>
  );
});

export default MessageBox;
