import React, { useEffect, useRef, useState } from 'react';
import { Icons } from './Icon';
import { useApp } from '../contexts/AppContext';
import { SliceData } from '../types';
import { removeImageBackgroundAPI, downloadImage } from '../utils/imageProcessing';

// Fabric is loaded globally via script tag in index.html to avoid ESM compatibility issues with v5
// declare var fabric: any; // Already in types.ts

interface SliceEditorProps {
  slice: SliceData;
  onSave: (updatedSlice: SliceData) => void;
  onClose: () => void;
}

export const SliceEditor: React.FC<SliceEditorProps> = ({ slice, onSave, onClose }) => {
  const { t, removeBgApiKey } = useApp();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvas = useRef<any>(null); // Fabric canvas instance
  const containerRef = useRef<HTMLDivElement>(null);

  const [activeTool, setActiveTool] = useState<'move'>('move');
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize Fabric Canvas
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    // Canvas size (1:1 square)
    const size = 500;
    
    // Create fabric canvas
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: size,
      height: size,
      backgroundColor: null, // Transparent background to let checkerboard show through
    });
    
    fabricCanvas.current = canvas;

    // Load initial state
    if (slice.canvasState) {
      canvas.loadFromJSON(slice.canvasState, () => {
        canvas.renderAll();
      });
    } else {
      // New canvas: load image centered
      // Fabric 5.3.0 uses callback pattern
      fabric.Image.fromURL(slice.previewUrl, (img: any) => {
        if (!img) return;
        
        // Scale image to fit within canvas with padding
        const padding = 20;
        const scale = Math.min(
          (size - padding * 2) / img.width,
          (size - padding * 2) / img.height
        );

        img.set({
          scaleX: scale,
          scaleY: scale,
          left: size / 2,
          top: size / 2,
          originX: 'center',
          originY: 'center',
          cornerColor: '#6366f1',
          borderColor: '#6366f1',
          transparentCorners: false,
        });

        canvas.add(img);
        canvas.setActiveObject(img);
      }, { crossOrigin: 'anonymous' });
    }

    return () => {
      canvas.dispose();
    };
  }, []);

  // Tool Switching Effect: Removed as we only have 'move' mode now
  
  const handleAddText = () => {
    if (!fabricCanvas.current) return;
    const canvas = fabricCanvas.current;
    const text = new fabric.IText(t('tool_add_text'), {
      left: canvas.width! / 2,
      top: canvas.height! / 2,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Inter',
      fill: '#333',
      fontSize: 40
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    setActiveTool('move');
  };

  const handleRemoveBg = async () => {
    if (!fabricCanvas.current) return;
    
    if (!removeBgApiKey) {
      alert(t('error_apikey'));
      return;
    }

    const canvas = fabricCanvas.current;
    const activeObj = canvas.getActiveObject();

    // Check if an image is selected
    if (activeObj && activeObj.type === 'image') {
      setIsProcessing(true);
      try {
        // Get the source of the image
        const src = activeObj.getSrc();
        // Call API
        const noBgSrc = await removeImageBackgroundAPI(src, removeBgApiKey);
        
        // Replace image
        activeObj.setSrc(noBgSrc, () => {
          canvas.renderAll();
          setIsProcessing(false);
        });
      } catch (e: any) {
        console.error(e);
        alert(`Failed: ${e.message}`);
        setIsProcessing(false);
      }
    } else {
      alert("Please select an image object first.");
    }
  };

  const handleReset = () => {
    if (!fabricCanvas.current) return;
    const canvas = fabricCanvas.current;
    canvas.clear();
    // Keep background transparent on reset
    canvas.setBackgroundColor(null, canvas.renderAll.bind(canvas));
    
    // Reload original
    fabric.Image.fromURL(slice.originalUrl, (img: any) => {
      const size = canvas.width!;
      const padding = 20;
      const scale = Math.min(
        (size - padding * 2) / img.width,
        (size - padding * 2) / img.height
      );
      img.set({
        scaleX: scale,
        scaleY: scale,
        left: size / 2,
        top: size / 2,
        originX: 'center',
        originY: 'center'
      });
      canvas.add(img);
      canvas.setActiveObject(img);
    }, { crossOrigin: 'anonymous' });
  };

  const handleSave = () => {
    if (!fabricCanvas.current) return;
    const canvas = fabricCanvas.current;
    
    // Export state and image
    const jsonState = canvas.toJSON();
    // Export to PNG with transparency
    const dataUrl = canvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 1
    });

    onSave({
      ...slice,
      canvasState: jsonState,
      previewUrl: dataUrl,
      isModified: true
    });
    onClose();
  };

  const handleDownloadSingle = () => {
      if (!fabricCanvas.current) return;
      const dataUrl = fabricCanvas.current.toDataURL({ format: 'png', multiplier: 2 }); // Higher res download
      downloadImage(dataUrl, `edited_${slice.id}.png`);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800">
        
        {/* Header */}
        <div className="h-16 px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 z-10">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Icons.Wand2 className="w-5 h-5 text-indigo-500" />
            {t('editor_title')}
          </h3>
          <div className="flex gap-2">
             <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors">
               <Icons.X className="w-5 h-5" />
             </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar Tools */}
          <div className="w-20 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col items-center py-4 gap-4 z-10">
            <ToolButton 
              icon={<Icons.Move className="w-5 h-5" />} 
              active={activeTool === 'move'} 
              onClick={() => setActiveTool('move')}
              label={t('tool_move')}
            />

            <div className="w-8 h-px bg-slate-200 dark:bg-slate-700 my-1" />
            <ToolButton 
              icon={<Icons.Type className="w-5 h-5" />} 
              active={false}
              onClick={handleAddText}
              label={t('tool_text')}
            />
            {/* <ToolButton 
              icon={isProcessing ? <Icons.Loader2 className="w-5 h-5 animate-spin" /> : <Icons.Wand2 className="w-5 h-5" />} 
              active={false}
              onClick={handleRemoveBg}
              label={t('tool_remove_bg')}
              disabled={isProcessing}
            /> */}
             <div className="w-8 h-px bg-slate-200 dark:bg-slate-700 my-1" />
            <ToolButton 
              icon={<Icons.RotateCcw className="w-5 h-5" />} 
              active={false}
              onClick={handleReset}
              label={t('editor_reset')}
            />
          </div>

          {/* Canvas Area */}
          <div className="flex-1 bg-slate-200 dark:bg-black/50 overflow-auto flex items-center justify-center p-8 relative">
             <div 
                className="shadow-2xl shadow-black/20" 
                ref={containerRef}
                style={{
                    backgroundSize: '20px 20px',
                    backgroundPosition: '0 0, 10px 10px',
                    // Transparent Checkerboard Pattern
                    backgroundImage: 'linear-gradient(45deg, #e5e7eb 25%, transparent 25%, transparent 75%, #e5e7eb 75%, #e5e7eb), linear-gradient(45deg, #e5e7eb 25%, transparent 25%, transparent 75%, #e5e7eb 75%, #e5e7eb)',
                    backgroundColor: '#fff'
                }}
             >
               <canvas ref={canvasRef} />
             </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="h-16 px-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between z-10">
           <button 
             onClick={handleDownloadSingle}
             className="text-sm font-medium text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
           >
             <Icons.Download className="w-4 h-4" />
             Download PNG
           </button>
           
           <div className="flex gap-3">
             <button 
               onClick={onClose}
               className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-sm font-medium transition-colors"
             >
               {t('crop_cancel')}
             </button>
             <button 
               onClick={handleSave}
               className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-colors"
             >
               <Icons.Save className="w-4 h-4" />
               {t('editor_save')}
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};

const ToolButton = ({ icon, active, onClick, label, disabled }: any) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all group relative ${
      active 
        ? 'bg-indigo-600 text-white shadow-md' 
        : 'bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-600'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    title={label}
  >
    {icon}
    {/* Tooltip */}
    <span className="absolute left-14 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
      {label}
    </span>
  </button>
);