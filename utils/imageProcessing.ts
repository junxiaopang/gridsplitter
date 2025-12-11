import { CropArea, SliceData } from '../types';

export const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
  });
};

export const getCroppedImg = async (
  imageSrc: string,
  pixelCrop: CropArea
): Promise<string> => {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return canvas.toDataURL('image/png');
};

export const generateSlices = async (
  imageSrc: string,
  rows: number,
  cols: number
): Promise<SliceData[]> => {
  const image = await loadImage(imageSrc);
  const slices: SliceData[] = [];
  const { width, height } = image;
  
  const sliceWidth = width / cols;
  const sliceHeight = height / rows;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) continue;

      canvas.width = sliceWidth;
      canvas.height = sliceHeight;

      ctx.drawImage(
        image,
        c * sliceWidth,
        r * sliceHeight,
        sliceWidth,
        sliceHeight,
        0,
        0,
        sliceWidth,
        sliceHeight
      );

      const dataUrl = canvas.toDataURL('image/png');
      slices.push({
        id: `slice-${r}-${c}-${Date.now()}`,
        originalUrl: dataUrl,
        previewUrl: dataUrl,
        isModified: false
      });
    }
  }

  return slices;
};

export const padImageToSquare = async (imageSrc: string): Promise<string> => {
  const image = await loadImage(imageSrc);
  if (image.width === 0 || image.height === 0) return imageSrc;

  const size = Math.max(image.width, image.height);
  
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) throw new Error('No context');

  // Center image with integer coordinates
  const x = Math.round((size - image.width) / 2);
  const y = Math.round((size - image.height) / 2);
  
  ctx.drawImage(image, x, y);
  
  return canvas.toDataURL('image/png');
};

export const downloadImage = (dataUrl: string, filename: string) => {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Use Remove.bg API for high quality AI background removal
export const removeImageBackgroundAPI = async (imageSrc: string, apiKey: string): Promise<string> => {
  // 1. Convert Base64/URL to Blob
  const base64Response = await fetch(imageSrc);
  const blob = await base64Response.blob();

  // 2. Prepare FormData
  const formData = new FormData();
  formData.append('image_file', blob);
  formData.append('size', 'auto');

  // 3. Call Remove.bg API
  const response = await fetch('https://api.remove.bg/v1.0/removebg', {
    method: 'POST',
    headers: {
      'X-Api-Key': apiKey,
    },
    body: formData,
  });

  if (!response.ok) {
    if (response.status === 403) {
        throw new Error("Invalid API Key");
    }
    if (response.status === 402) {
        throw new Error("Insufficient Credits");
    }
    throw new Error(`API Error: ${response.statusText}`);
  }

  // 4. Convert result blob back to Base64
  const resultBlob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(resultBlob);
  });
};