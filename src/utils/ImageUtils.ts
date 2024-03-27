export const preprocessImage = async (file: File, callback: (base64Data: string, file: File) => void) => {
  if (!file) return;

  const imageBitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const maxLongerDimension = 2000;
  const maxSmallerDimension = 768;

  const originalWidth = imageBitmap.width;
  const originalHeight = imageBitmap.height;

  // Log original size
  // console.log(`Original Image Size: ${originalWidth}x${originalHeight}`);

  // Determine the longer and smaller dimensions
  const isWidthLonger = originalWidth >= originalHeight;
  const longerDimension = isWidthLonger ? originalWidth : originalHeight;
  const smallerDimension = isWidthLonger ? originalHeight : originalWidth;

  // Calculate the scaling factor
  const longerDimensionScale = longerDimension > maxLongerDimension ? maxLongerDimension / longerDimension : 1;
  const smallerDimensionScale = smallerDimension > maxSmallerDimension ? maxSmallerDimension / smallerDimension : 1;

  // Choose the smaller scaling factor to ensure both dimensions are within limits
  const scaleFactor = Math.min(longerDimensionScale, smallerDimensionScale);

  // Calculate new dimensions and round them down to the nearest integer
  const newWidth = Math.floor(originalWidth * scaleFactor);
  const newHeight = Math.floor(originalHeight * scaleFactor);

  // Ensure canvas dimensions are set correctly for the aspect ratio
  canvas.width = newWidth;
  canvas.height = newHeight;

  // Draw the image to the canvas with new dimensions
  ctx?.drawImage(imageBitmap, 0, 0, newWidth, newHeight);

  // Log new size
  // console.log(`Resized Image Size: ${newWidth}x${newHeight}`);

  canvas.toBlob((blob) => {
    if (!blob) return;
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const base64Data = loadEvent.target?.result as string;
      callback(base64Data, file);
    };
    reader.readAsDataURL(blob);
  }, file.type);
};
