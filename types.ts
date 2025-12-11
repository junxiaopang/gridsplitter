export interface SliceConfig {
  rows: number;
  cols: number;
}

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PromptTemplate {
  id: string;
  label: string;
  content: string;
}

export interface Brand {
  name: string;
  url: string;
  description: string;
  color: string;
}

export interface SliceData {
  id: string;
  originalUrl: string; // The raw cropped part from original image
  previewUrl: string; // The current visual (edited or original)
  canvasState?: any; // Fabric JSON state
  isModified: boolean;
}

declare global {
  var fabric: any;
}