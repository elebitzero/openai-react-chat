import React, { useState, useCallback, useEffect } from 'react';
import {createPortal} from 'react-dom';
import { NoSymbolIcon,XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { FileDataRef } from '../models/FileData';
import {useTranslation} from "react-i18next";
import Tooltip from './Tooltip';
import './FileDataPreview.css';
import {IMAGE_MAX_ZOOM} from "../constants/appConstants";

interface Props {
  fileDataRef: FileDataRef[];
  removeFileData?: (index: number, file: FileDataRef) => void;
  readOnly?: boolean;
  allowImageAttachment?: boolean
}

const FileDataPreview: React.FC<Props> = ({
                                            fileDataRef,
                                            removeFileData,
                                            readOnly = false,
                                            allowImageAttachment = true
                                          }) => {
  const {t} = useTranslation();
  const [viewedFileIndex, setViewedFileIndex] = useState<number | null>(null);
  const [imageStyle, setImageStyle] = useState<React.CSSProperties>({});

  const determineAndSetImageStyle = (imgElement: HTMLImageElement) => {
    const naturalWidth = imgElement.naturalWidth;
    const naturalHeight = imgElement.naturalHeight;
    const maxWidth = window.innerWidth * 0.8; // 80vw
    const maxHeight = window.innerHeight * 0.8; // 80vh
    const maxZoomFactor = IMAGE_MAX_ZOOM;

    let width = naturalWidth;
    let height = naturalHeight;

    // Calculate the zoom factor needed to fit the image within 80vw or 80vh
    const widthZoomFactor = maxWidth / naturalWidth;
    const heightZoomFactor = maxHeight / naturalHeight;
    const zoomFactor = Math.min(widthZoomFactor, heightZoomFactor, maxZoomFactor);

    width = naturalWidth * zoomFactor;
    height = naturalHeight * zoomFactor;

    setImageStyle({width: `${width}px`, height: `${height}px`});
  };

  const handleRemoveFile = (event: React.MouseEvent<HTMLButtonElement>, index: number, fileRef: FileDataRef) => {
    event.preventDefault();
    event.stopPropagation();
    if (removeFileData) {
      removeFileData(index, fileRef);
    }
  };

  const toggleViewFile = (index: number) => {
    if (viewedFileIndex === index) {
      setImageStyle({});
      setViewedFileIndex(null);
    } else {
      setViewedFileIndex(index);
    }
  };

  const handleNextPrev = (direction: "next" | "prev") => {
    if (direction === "next" && viewedFileIndex !== null) {
      const nextIndex = viewedFileIndex + 1 < fileDataRef.length ? viewedFileIndex + 1 : 0;
      toggleViewFile(nextIndex);
    } else if (direction === "prev" && viewedFileIndex !== null) {
      const prevIndex = viewedFileIndex - 1 >= 0 ? viewedFileIndex - 1 : fileDataRef.length - 1;
      toggleViewFile(prevIndex);
    }
  };

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'ArrowRight') {
      handleNextPrev("next");
    } else if (event.key === 'ArrowLeft') {
      handleNextPrev("prev");
    } else if (event.key === 'Escape') {
      // Close the full view when Escape is pressed
      setViewedFileIndex(null);
    }
  }, [viewedFileIndex, fileDataRef.length]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const renderFileData = (fileRef: FileDataRef, index: number) => (
    <div key={index} className="file-data-tile group relative inline-block text-sm text-token-text-primary">
      <div className="relative overflow-hidden rounded-xl border border-token-border-light">
        <div className="h-14 w-14">
          <button
            type="button"
            aria-haspopup="dialog"
            aria-expanded="false"
            className="h-full w-full focus:outline-none"
            onClick={() =>  fileRef.fileData && toggleViewFile(index)}
          >
            <span
              className="flex items-center h-full w-full justify-center bg-gray-100 dark:bg-gray-900 bg-cover bg-center text-white"
              style={{backgroundImage: `url("${fileRef.fileData?.data}")`}}
            >
               {!allowImageAttachment && (
                 <Tooltip title={t('model-does-not-support-images')} side={'top'} sideOffset={25}>
                   <span>
                       <NoSymbolIcon className="icon-sm absolute" width="48" height="48" style={{
                         color: 'rgba(255, 0, 0, 0.75)',
                         right: '50%',
                         top: '50%',
                         transform: 'translate(50%, -50%)'
                       }}/>
                     </span>
                 </Tooltip>
               )}
            </span>
          </button>
        </div>
      </div>
      {!readOnly && (
        <Tooltip title="Remove file" side="top" sideOffset={0}>
          <button
            name="remove-file"
            onClick={(e) => handleRemoveFile(e, index, fileRef)}
            className="remove-file-button absolute right-1 top-1 -translate-y-1/2 translate-x-1/2 rounded-full border p-0.5 md:opacity-0 dark:bg-black bg-white"
          >
            <XMarkIcon className="icon-sm" width="24" height="24"/>
          </button>
        </Tooltip>
      )}
    </div>
  );

  const renderFullViewFile = () => viewedFileIndex !== null && createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={() => setViewedFileIndex(null)}
      style={{backgroundColor: 'rgba(0, 0, 0, 0.5)'}}
    >
      <div className="relative">
        {viewedFileIndex > 0 && (
          <button
            className="absolute top-1/2 left-4 -translate-y-1/2 flex items-center justify-center bg-white bg-opacity-50 rounded-full shadow-lg border border-black"
            style={{width: '48px', height: '48px'}} // Adjust size as needed
            onClick={(e) => {
              e.stopPropagation();
              handleNextPrev("prev");
            }}
          >
            <ChevronLeftIcon className="h-6 w-6 text-black"/>
          </button>
        )}
        <img
          src={fileDataRef[viewedFileIndex]?.fileData?.data ?? undefined}
          onLoad={(e) => determineAndSetImageStyle(e.currentTarget)}
          style={{
            ...imageStyle,
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.5)'
          }}
          alt="Full view"
        />
        {viewedFileIndex < fileDataRef.length - 1 && (
          <button
            className="absolute top-1/2 right-4 -translate-y-1/2 flex items-center justify-center bg-white bg-opacity-50 rounded-full shadow-lg border border-black"
            style={{width: '48px', height: '48px'}} // Adjust size as needed
            onClick={(e) => {
              e.stopPropagation();
              handleNextPrev("next");
            }}
          >
            <ChevronRightIcon className="h-6 w-6 text-black"/>
          </button>

        )}
      </div>
    </div>,
    document.body
  );

  return (
    <div className="m-2 flex flex-wrap gap-2 px-2.5 md:pl-0 md:pr-4">
      {fileDataRef.map(renderFileData)}
      {renderFullViewFile()}
    </div>
  );
};

export default FileDataPreview;
