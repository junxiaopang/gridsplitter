import React, { useState, useRef } from 'react';
import { Icons } from './Icon';
import { CropArea } from '../types';
import { useApp } from '../contexts/AppContext';

interface ImageCropperProps {
  imageSrc: string;
  rows: number;
  cols: number;
  onCropComplete: (cropArea: CropArea) => void;
  onCancel: () => void;
}

// Define drag actions: move or resize directions
type DragAction = 'move' | 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw' | null;

export const ImageCropper: React.FC<ImageCropperProps> = ({ imageSrc, rows, cols, onCropComplete, onCancel }) => {
  const { t } = useApp();
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<CropArea | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragAction, setDragAction] = useState<DragAction>(null);

  // Initialize crop area when image loads
  const onImageLoad = () => {
    if (imageRef.current && !crop) {
      const { naturalWidth: width, naturalHeight: height } = imageRef.current;
      // Default to 80% center crop
      const w = width * 0.8;
      const h = height * 0.8;
      setCrop({
        x: (width - w) / 2,
        y: (height - h) / 2,
        width: w,
        height: h
      });
    }
  };

  const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);

  const handleMouseDown = (e: React.MouseEvent, action: DragAction) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling to avoid conflicting actions
    setIsDragging(true);
    setDragAction(action);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !crop || !imageRef.current || !dragAction) return;

    e.preventDefault();
    e.stopPropagation();

    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    
    // Get scale factor between natural image size and displayed size
    const bounds = imageRef.current.getBoundingClientRect();
    const scaleX = imageRef.current.naturalWidth / bounds.width;
    const scaleY = imageRef.current.naturalHeight / bounds.height;
    
    // Convert screen delta to image pixel delta
    const imgDx = dx * scaleX;
    const imgDy = dy * scaleY;

    const minSize = 50; 
    const maxWidth = imageRef.current.naturalWidth;
    const maxHeight = imageRef.current.naturalHeight;

    if (dragAction === 'move') {
      const newX = clamp(crop.x + imgDx, 0, maxWidth - crop.width);
      const newY = clamp(crop.y + imgDy, 0, maxHeight - crop.height);
      setCrop({ ...crop, x: newX, y: newY });
    } else {
       let { x, y, width, height } = crop;

       // West (Left)
       if (dragAction.includes('w')) {
          const maxLeft = x + width - minSize;
          let newX = x + imgDx;
          newX = clamp(newX, 0, maxLeft);
          const delta = newX - x;
          x = newX;
          width -= delta;
       }
       
       // East (Right)
       if (dragAction.includes('e')) {
          const maxRight = maxWidth - x;
          let newWidth = width + imgDx;
          newWidth = clamp(newWidth, minSize, maxRight);
          width = newWidth;
       }

       // North (Top)
       if (dragAction.includes('n')) {
          const maxTop = y + height - minSize;
          let newY = y + imgDy;
          newY = clamp(newY, 0, maxTop);
          const delta = newY - y;
          y = newY;
          height -= delta;
       }

       // South (Bottom)
       if (dragAction.includes('s')) {
          const maxBottom = maxHeight - y;
          let newHeight = height + imgDy;
          newHeight = clamp(newHeight, minSize, maxBottom);
          height = newHeight;
       }
       
       setCrop({ x, y, width, height });
    }

    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragAction(null);
  };

  // Calculate style for the overlay box
  const getOverlayStyle = () => {
    if (!crop || !imageRef.current) return {};
    const left = (crop.x / imageRef.current.naturalWidth) * 100;
    const top = (crop.y / imageRef.current.naturalHeight) * 100;
    const width = (crop.width / imageRef.current.naturalWidth) * 100;
    const height = (crop.height / imageRef.current.naturalHeight) * 100;

    return {
      left: `${left}%`,
      top: `${top}%`,
      width: `${width}%`,
      height: `${height}%`
    };
  };

  // Render Handle Helper
  const RenderHandle = ({ pos, cursor, action }: { pos: string, cursor: string, action: DragAction }) => (
    <div 
      className={`absolute w-3 h-3 bg-indigo-500 border border-white z-20 ${pos} ${cursor}`}
      onMouseDown={(e) => handleMouseDown(e, action)}
    />
  );
  
  // Invisible bar for easier edge grabbing
  const RenderEdgeBar = ({ pos, cursor, action, isVertical }: { pos: string, cursor: string, action: DragAction, isVertical: boolean }) => (
    <div 
      className={`absolute ${isVertical ? 'w-4 h-full top-0 -translate-x-1/2' : 'h-4 w-full left-0 -translate-y-1/2'} ${pos} ${cursor} z-10 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity`}
      onMouseDown={(e) => handleMouseDown(e, action)}
    >
      <div className={`${isVertical ? 'h-8 w-1' : 'w-8 h-1'} bg-white/80 rounded-full bg-indigo-500`}></div>
    </div>
  );

  return (
    <div 
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-900/95 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="w-full max-w-5xl flex justify-between items-center mb-4 text-white">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Icons.Scissors className="w-6 h-6 text-indigo-400" />
          {t('crop_title')}
        </h2>
        <div className="flex gap-2">
          <button 
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            {t('crop_cancel')}
          </button>
          <button 
            onClick={() => crop && onCropComplete(crop)}
            className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-colors flex items-center gap-2 shadow-lg shadow-indigo-500/30"
          >
            <Icons.Check className="w-4 h-4" />
            {t('crop_confirm')}
          </button>
        </div>
      </div>

      <div 
        ref={containerRef}
        className="relative max-h-[80vh] overflow-hidden rounded-lg shadow-2xl bg-black border border-slate-700 select-none"
      >
        <img 
          ref={imageRef}
          src={imageSrc} 
          alt="To Crop" 
          className="max-h-[80vh] max-w-full object-contain select-none block"
          onLoad={onImageLoad}
          draggable={false}
        />
        
        {crop && (
          <>
            {/* Dark Overlay around crop area */}
            <div className="absolute inset-0 bg-black/60 pointer-events-none">
              <div 
                style={getOverlayStyle()}
                className="absolute bg-transparent shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] pointer-events-auto box-content"
              >
              </div>
            </div>

            {/* The Crop Box */}
            <div 
              style={getOverlayStyle()}
              className="absolute border border-white/50 pointer-events-auto cursor-move group"
              onMouseDown={(e) => handleMouseDown(e, 'move')}
            >
              {/* Dynamic Grid Lines based on Rows/Cols */}
              <div className="absolute inset-0 flex flex-col pointer-events-none opacity-60">
                 {Array.from({ length: rows }).map((_, i) => (
                    <div 
                      key={`r-${i}`} 
                      className={`flex-1 ${i < rows - 1 ? 'border-b border-indigo-400/50 border-dashed' : ''}`} 
                    />
                 ))}
              </div>
              <div className="absolute inset-0 flex pointer-events-none opacity-60">
                 {Array.from({ length: cols }).map((_, i) => (
                    <div 
                      key={`c-${i}`} 
                      className={`flex-1 ${i < cols - 1 ? 'border-r border-indigo-400/50 border-dashed' : ''}`} 
                    />
                 ))}
              </div>

              {/* Edge Handles (Invisible Hit Areas with visual hints on hover) */}
              <RenderEdgeBar pos="top-0 left-0" cursor="cursor-n-resize" action="n" isVertical={false} />
              <RenderEdgeBar pos="bottom-0 left-0" cursor="cursor-s-resize" action="s" isVertical={false} />
              <RenderEdgeBar pos="left-0 top-0" cursor="cursor-w-resize" action="w" isVertical={true} />
              <RenderEdgeBar pos="right-0 top-0" cursor="cursor-e-resize" action="e" isVertical={true} />

              {/* Corner Handles */}
              <RenderHandle pos="-top-1.5 -left-1.5" cursor="cursor-nw-resize" action="nw" />
              <RenderHandle pos="-top-1.5 -right-1.5" cursor="cursor-ne-resize" action="ne" />
              <RenderHandle pos="-bottom-1.5 -left-1.5" cursor="cursor-sw-resize" action="sw" />
              <RenderHandle pos="-bottom-1.5 -right-1.5" cursor="cursor-se-resize" action="se" />
            </div>
            
            {/* Dimensions Hint */}
            <div 
              className="absolute -top-8 left-0 bg-indigo-600 text-white text-xs px-2 py-1 rounded shadow"
              style={{ left: getOverlayStyle().left, top: `calc(${getOverlayStyle().top} - 32px)` }}
            >
              Grid: {rows}x{cols}
            </div>
          </>
        )}
      </div>
      <p className="mt-4 text-slate-400 text-sm flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-full">
        <Icons.Maximize className="w-4 h-4" />
        {t('crop_hint')}
      </p>
    </div>
  );
};