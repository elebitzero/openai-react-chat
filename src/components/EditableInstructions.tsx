import React, {forwardRef, useEffect, useImperativeHandle, useRef, useState} from 'react';
import {ArrowsPointingOutIcon} from "@heroicons/react/24/outline";
import {iconProps} from "../svg";
import Button from './Button';
import {useTranslation} from 'react-i18next';

interface EditableInstructionsProps {
  initialValue: string;
  placeholder: string;
  className?: string;
  onChange?: (value: string) => void;
}

// Use forwardRef to wrap your component
const EditableInstructions = forwardRef(({
                                           initialValue,
                                           placeholder,
                                           className = '',
                                           onChange,
                                         }: EditableInstructionsProps, ref) => {
  const {t} = useTranslation();
  const textarea1Ref = useRef<HTMLTextAreaElement>(null);
  const textarea2Ref = useRef<HTMLTextAreaElement>(null);
  const currentValueRef = useRef<string>(initialValue);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsModalOpen(false);
        event.stopPropagation();
        event.preventDefault();
      }
    };

    if (isModalOpen) {
      // When the modal is opened and textarea2 is mounted, update its value and focus
      if (textarea2Ref.current) {
        textarea2Ref.current.value = currentValueRef.current;
        textarea2Ref.current.focus();
      }
      document.addEventListener('keydown', handleKeyDown, true);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isModalOpen]);


  // Use useImperativeHandle to expose specific properties to the parent
  useImperativeHandle(ref, () => ({
    getCurrentValue: () => currentValueRef.current,
  }));

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    currentValueRef.current = newValue; // Update the current value

    // Directly update the other textarea to stay in sync
    if (e.target === textarea1Ref.current && textarea2Ref.current) {
      textarea2Ref.current.value = newValue;
    } else if (e.target === textarea2Ref.current && textarea1Ref.current) {
      textarea1Ref.current.value = newValue;
    }

    if (onChange) {
      onChange(newValue);
    }
  };


  const toggleModal = (): void => {
    if (isModalOpen && textarea2Ref.current) {
      handleChange({
        target: textarea2Ref.current
      } as React.ChangeEvent<HTMLTextAreaElement>);
    }
    setIsModalOpen(!isModalOpen);
  };

  return (
      <div className={`relative ${className}`}>
      <textarea
          ref={textarea1Ref}
          id="instructions"
          name="instructions"
          defaultValue={initialValue}
          placeholder={placeholder}
          onChange={handleChange}
          className="resize-none overflow-y-auto w-full shadow appearance-none py-2 px-3 text-gray-700
                    dark:text-gray-300 dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline
                    border border-gray-300 dark:border-gray-600 flex-1"
          spellCheck={false}
      ></textarea>
        <button
            onClick={toggleModal}
            className="absolute right-2 bottom-2 p-2 rounded-full bg-gray-200 dark:bg-gray-800"
            aria-label="Expand"
        >
          <span><ArrowsPointingOutIcon {...iconProps}/></span>
        </button>

        {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
              <div className="bg-white dark:bg-gray-800 w-4/5 h-4/5 p-4 rounded-lg shadow-lg flex flex-col">
            <textarea
                ref={textarea2Ref}
                id="instructions-fullscreen"
                name="instructions-fullscreen"
                className="flex-1 resize-none w-full p-2 border border-gray-300 dark:border-gray-600 dark:text-gray-300 dark:bg-gray-700"
                defaultValue={currentValueRef.current}
                onChange={handleChange}
                spellCheck={false}
            ></textarea>
                <div className="flex justify-end space-x-4 px-8 mt-4">
                  <Button
                      onClick={toggleModal}
                      variant="secondary"
                      className="mr-2"
                  >
                    {t('close-button')}
                  </Button>
                </div>
              </div>
            </div>
        )}
      </div>
  );
});

export default EditableInstructions;
