import React, {useState} from 'react';
import {createPortal} from 'react-dom';
import {XMarkIcon, NoSymbolIcon} from '@heroicons/react/24/outline';
import {FileData} from '../models/FileData';
import {useTranslation} from "react-i18next";
import Tooltip from './Tooltip';
import './FileDataPreview.css';

interface Props {
  fileData: FileData[];
  removeFileData?: (index: number, file: FileData) => void;
  readOnly?: boolean;
  allowImageAttachment?: boolean
}

const FileDataPreview: React.FC<Props> = ({
                                            fileData,
                                            removeFileData,
                                            readOnly = false,
                                            allowImageAttachment = true
                                          }) => {
  const {t} = useTranslation();
  const [viewedFile, setViewedFile] = useState<FileData | null>(null);
  const [imageStyle, setImageStyle] = useState<React.CSSProperties>({});

  const determineAndSetImageStyle = (imgElement: HTMLImageElement) => {
    const naturalWidth = imgElement.naturalWidth;
    const naturalHeight = imgElement.naturalHeight;

    if (naturalWidth > naturalHeight) {
      // If width is the larger dimension, scale width to 80vw
      setImageStyle({width: '80vw', height: 'auto'});
    } else {
      // If height is the larger dimension or if they are equal, scale height to 80vh
      setImageStyle({height: '80vh', width: 'auto'});
    }
  };

  const handleRemoveFile = (event: React.MouseEvent<HTMLButtonElement>, index: number, file: FileData) => {
    event.preventDefault();
    event.stopPropagation();
    if (removeFileData) {
      removeFileData(index, file);
    }
  };

  const toggleViewFile = (file: FileData) => {
    setViewedFile(viewedFile ? null : file);
  };

  const renderFileData = (file: FileData, index: number) => (
    <div key={index} className="file-data-tile group relative inline-block text-sm text-token-text-primary">
      <div className="relative overflow-hidden rounded-xl border border-token-border-light">
        <div className="h-14 w-14">
          <button
            type="button"
            aria-haspopup="dialog"
            aria-expanded="false"
            className="h-full w-full focus:outline-none"
            onClick={() => toggleViewFile(file)}
          >
            <span
              className="flex items-center h-full w-full justify-center bg-gray-100 dark:bg-gray-900 bg-cover bg-center text-white"
              style={{backgroundImage: `url("${file.data}")`}}
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
            onClick={(e) => handleRemoveFile(e, index, file)}
            className="remove-file-button absolute right-1 top-1 -translate-y-1/2 translate-x-1/2 rounded-full border p-0.5 md:opacity-0 dark:bg-black bg-white"
          >
            <XMarkIcon className="icon-sm" width="24" height="24"/>
          </button>
        </Tooltip>
      )}
    </div>
  );

  const renderFullViewFile = () => viewedFile && createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={() => setViewedFile(null)}
      style={{backgroundColor: 'rgba(0, 0, 0, 0.5)'}}
    >
      <img
        src={viewedFile?.data ?? undefined}
        onLoad={(e) => determineAndSetImageStyle(e.currentTarget)}
        style={{
          ...imageStyle,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.5)'
        }} // Optional: adding a shadow to the image for better visibility
        alt="Full view"
      />
    </div>,
    document.body
  );

  return (
    <div className="m-2 flex flex-wrap gap-2 px-2.5 md:pl-0 md:pr-4">
      {fileData.map(renderFileData)}
      {renderFullViewFile()}
    </div>
  );
};

export default FileDataPreview;
