import React, {useEffect, useState} from 'react';
import FormLabel from "./FormLabel";
import {useTranslation} from 'react-i18next';

export interface ImageSource {
  data: string | null;
  type: string; // 'svg' | 'raster'
}

interface AvatarFieldEditorProps {
  image: ImageSource;
  onImageChange?: (newImage: ImageSource) => void;
  readOnly?: boolean;
  size?: number;
}

const AvatarFieldEditor: React.FC<AvatarFieldEditorProps> = ({
                                                               image,
                                                               onImageChange,
                                                               readOnly = false,
                                                               size = 120
                                                             }) => {
  const [imageSrc, setImageSrc] = useState<ImageSource>(image);
  const {t} = useTranslation();

  useEffect(() => {
    setImageSrc(image);
  }, [image, readOnly]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly) {
      return;
    }
    const file = event.target.files ? event.target.files[0] : null;
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target!.result as string;
        if (file.type.startsWith('image/svg+xml')) {
          setImageSrc({data: result, type: 'svg'});
          if (onImageChange) {
            onImageChange({data: result, type: 'svg'});
          }
        } else if (file.type.startsWith('image/')) {
          const img = new Image();
          img.src = result;
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;

            const scale = Math.min(img.width / size, img.height / size);
            const scaledWidth = img.width / scale;
            const scaledHeight = img.height / scale;
            const xOffset = (scaledWidth - size) / 2;
            const yOffset = (scaledHeight - size) / 2;

            const ctx = canvas.getContext('2d');
            if (ctx) {
              // Assuming img.width or img.height could be larger, find the smaller dimension
              const minDimension = Math.min(img.width, img.height);

              // Calculate the top left x,y position to start cropping to keep the crop centered
              const sx = (img.width - minDimension) / 2;
              const sy = (img.height - minDimension) / 2;

              // Draw the cropped and resized version of the image on the canvas
              // Here the source crop (sx, sy, minDimension, minDimension) is drawn onto the canvas at full size (size, size)
              ctx.drawImage(img, sx, sy, minDimension, minDimension, 0, 0, size, size);
            }

            const resizedImgDataURL = canvas.toDataURL('image/png');
            setImageSrc({data: resizedImgDataURL, type: 'raster'});
            if (onImageChange) {
              onImageChange({data: resizedImgDataURL, type: 'raster'});
            }
          };
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
      <div className="mb-4">
        <FormLabel readOnly={readOnly} label={t('icon-header')} htmlFor="icon" value={image}></FormLabel>
        <div className="relative flex justify-center items-center">
          {imageSrc.data ? (
              <img
                  src={imageSrc.data}
                  alt="User Avatar"
                  style={{width: `${size}px`, height: `${size}px`, borderRadius: '50%', objectFit: 'cover'}}
              />
          ) : (
              <div
                  style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px dashed gray',
                    borderRadius: '50%'
                  }}
              >
                <svg
                    className="text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{
                      width: `${size * 0.29}px`,
                      height: `${size * 0.29}px`
                    }} // Adjust SVG size relative to the container size
                    xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                </svg>
              </div>
          )}
          {!readOnly && ( // Conditionally render the input based on readOnly status
              <input
                  id="icon"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{
                    position: 'absolute',
                    opacity: 0,
                    width: `${size}px`,
                    height: `${size}px`,
                    cursor: 'pointer'
                  }}
              />
          )}
        </div>
      </div>
  );
};

export default AvatarFieldEditor;
