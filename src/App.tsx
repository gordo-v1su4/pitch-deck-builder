import React, { useState, useRef, useCallback, useEffect } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cn } from './utils/cn';
import { extractColors, defaultColors } from './utils/colorExtractor';
import { renderBlock } from './components/BlockComponents';
import type { BlockData, ColorPalette } from './types';

gsap.registerPlugin(ScrollTrigger);

type StyleVariant = 'cinematic' | 'bold' | 'minimal' | 'noir' | 'neon';
type PreviewMode = 'html' | 'pdf';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

const STORAGE_KEY = 'pitch-deck-state';

const initialBlocks: BlockData[] = [
  { id: '1', type: 'hero', title: 'PROJECT TITLE', content: 'A CINEMATIC EXPERIENCE', layout: 'A', visible: true },
  { id: '2', type: 'logline', title: 'LOGLINE', content: 'When an ordinary world collides with extraordinary circumstances, one character must face the impossible choice between what they want and what they need.', layout: 'A', visible: true },
  { id: '3', type: 'story', title: 'STORY', content: 'In a world where nothing is as it seems, our protagonist discovers a hidden truth that challenges everything they believed. As the stakes rise, they must navigate treacherous alliances and face their deepest fears.', layout: 'A', visible: true },
  { id: '4', type: 'world', title: 'WORLD & CONCEPT', content: 'The rules are simple yet devastating: every choice has consequences that ripple through time. The technology exists, but at a cost that few are willing to pay.', layout: 'A', visible: true },
  { id: '5', type: 'character', title: 'CHARACTER', content: 'ALEX, 30s, carries the weight of a past they cannot escape. Brilliant yet broken, they hide vulnerability behind sharp wit and calculated distance.', layout: 'A', visible: true },
  { id: '6', type: 'tone', title: 'TONE & STYLE', content: 'Atmospheric and immersive. References: Blade Runner 2049, Arrival, Ex Machina. Muted palette with bursts of visceral color. Slow burns that explode into kinetic sequences.', layout: 'A', visible: true },
  { id: '7', type: 'motif', title: 'VISUAL MOTIFS', content: 'Reflections and mirrors. Water in all its forms. The liminal spaces between light and shadow. Close-ups that reveal more than words ever could.', layout: 'A', visible: true },
  { id: '8', type: 'theme', title: 'THEMES', content: 'What does it mean to be human in an inhuman world? The price of connection. The courage to be vulnerable.', layout: 'A', visible: true },
  { id: '9', type: 'stakes', title: 'STAKES', content: 'If they fail, not only will they lose everything they love—but the very fabric of reality begins to unravel. Personal becomes universal. Intimate becomes epic.', layout: 'A', visible: true },
  { id: '10', type: 'closing', title: 'CLOSING', content: '"In the end, we become what we choose to remember."', layout: 'A', visible: true },
];

const styleVariants: { id: StyleVariant; name: string }[] = [
  { id: 'cinematic', name: 'Cinematic' },
  { id: 'bold', name: 'Bold' },
  { id: 'minimal', name: 'Minimal' },
  { id: 'noir', name: 'Noir' },
  { id: 'neon', name: 'Neon' },
];

// Preset color palettes for each style
const stylePresets: Record<StyleVariant, ColorPalette> = {
  cinematic: {
    primary: '#4a6fa5',
    secondary: '#6b8cae',
    accent: '#d4a574',
    dark: '#0d1117',
    light: '#e8e8e8',
  },
  bold: {
    primary: '#e63946',
    secondary: '#f4a261',
    accent: '#2a9d8f',
    dark: '#1a1a2e',
    light: '#ffffff',
  },
  minimal: {
    primary: '#6c757d',
    secondary: '#adb5bd',
    accent: '#212529',
    dark: '#f8f9fa',
    light: '#212529',
  },
  noir: {
    primary: '#2d2d2d',
    secondary: '#4a4a4a',
    accent: '#c9a227',
    dark: '#0a0a0a',
    light: '#d4d4d4',
  },
  neon: {
    primary: '#00d4ff',
    secondary: '#ff00ff',
    accent: '#39ff14',
    dark: '#0a0014',
    light: '#ffffff',
  },
};

// Toast component
const ToastContainer: React.FC<{ toasts: Toast[]; onDismiss: (id: number) => void }> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "px-4 py-2.5 flex items-center gap-2 min-w-64 animate-slide-up cursor-pointer border-l-2",
            toast.type === 'success' && "bg-[#0c0c0c] text-emerald-400 border-l-emerald-500",
            toast.type === 'error' && "bg-[#0c0c0c] text-red-400 border-l-red-500",
            toast.type === 'info' && "bg-[#0c0c0c] text-white/70 border-l-amber-500"
          )}
          onClick={() => onDismiss(toast.id)}
        >
          <span className="text-[12px]">{toast.message}</span>
        </div>
      ))}
    </div>
  );
};

export function App() {
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [colors, setColors] = useState<ColorPalette>(stylePresets.cinematic);
  const [editingColor, setEditingColor] = useState<keyof ColorPalette | null>(null);
  const [blocks, setBlocks] = useState<BlockData[]>(initialBlocks);
  const [isEditing, setIsEditing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [draggedBlock, setDraggedBlock] = useState<string | null>(null);
  const [dragOverBlock, setDragOverBlock] = useState<string | null>(null);
  const [styleVariant, setStyleVariant] = useState<StyleVariant>('cinematic');
  const [previewMode, setPreviewMode] = useState<PreviewMode>('html');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const htmlPreviewRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);

  // Toast helper
  const showToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Apply style preset when variant changes - always applies colors
  const applyStylePreset = useCallback((variant: StyleVariant) => {
    setStyleVariant(variant);
    setColors(stylePresets[variant]);
    showToast(`${variant.charAt(0).toUpperCase() + variant.slice(1)} style applied`, 'info');
  }, [showToast]);

  // Load saved state on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const state = JSON.parse(saved);
        if (state.blocks) setBlocks(state.blocks);
        if (state.colors) setColors(state.colors);
        if (state.styleVariant) setStyleVariant(state.styleVariant);
        // Support both old single image and new array format
        if (state.referenceImages) {
          setReferenceImages(state.referenceImages);
        } else if (state.referenceImage) {
          setReferenceImages([state.referenceImage]);
        }
        showToast('Previous session restored', 'info');
      }
    } catch (e) {
      console.error('Failed to load saved state:', e);
    }
  }, []);

  // Auto-save when state changes
  useEffect(() => {
    const saveState = () => {
      try {
        const state = {
          blocks,
          colors,
          styleVariant,
          referenceImages,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        setHasUnsavedChanges(false);
      } catch (e) {
        console.error('Failed to save state:', e);
      }
    };

    const timeoutId = setTimeout(saveState, 1000);
    setHasUnsavedChanges(true);
    return () => clearTimeout(timeoutId);
  }, [blocks, colors, styleVariant, referenceImages]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if already at max images
    if (referenceImages.length >= 4) {
      showToast('Maximum 4 images allowed', 'error');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('Please upload a valid image file', 'error');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      showToast('Image too large (max 10MB)', 'error');
      return;
    }

    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const imageUrl = event.target?.result as string;
      const newImages = [...referenceImages, imageUrl];
      setReferenceImages(newImages);
      setActiveImageIndex(newImages.length - 1);

      try {
        const extractedColors = await extractColors(imageUrl);
        setColors(extractedColors);
        showToast('Image added & colors extracted', 'success');
      } catch (error) {
        console.error('Failed to extract colors:', error);
        showToast('Image added but could not extract colors', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
      setIsLoading(false);
      showToast('Failed to read image file', 'error');
    };
    reader.readAsDataURL(file);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [showToast, referenceImages]);

  const removeImage = useCallback((index: number) => {
    setReferenceImages(prev => {
      const newImages = prev.filter((_, i) => i !== index);
      // Adjust active index if needed
      if (activeImageIndex >= newImages.length) {
        setActiveImageIndex(Math.max(0, newImages.length - 1));
      }
      return newImages;
    });
    showToast('Image removed', 'info');
  }, [activeImageIndex, showToast]);

  const extractColorsFromImage = useCallback(async (index: number) => {
    const imageUrl = referenceImages[index];
    if (!imageUrl) return;

    setIsLoading(true);
    try {
      const extractedColors = await extractColors(imageUrl);
      setColors(extractedColors);
      showToast('Colors extracted', 'success');
    } catch (error) {
      showToast('Could not extract colors', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [referenceImages, showToast]);

  const handleColorChange = useCallback((colorKey: keyof ColorPalette, value: string) => {
    setColors(prev => ({ ...prev, [colorKey]: value }));
  }, []);

  const handleBlockUpdate = useCallback((updatedBlock: BlockData) => {
    setBlocks(prev => prev.map(b => b.id === updatedBlock.id ? updatedBlock : b));
  }, []);

  const toggleBlockLayout = useCallback((blockId: string) => {
    setBlocks(prev => prev.map(b =>
      b.id === blockId ? { ...b, layout: b.layout === 'A' ? 'B' : 'A' } : b
    ));
  }, []);

  const toggleBlockVisibility = useCallback((blockId: string) => {
    setBlocks(prev => prev.map(b =>
      b.id === blockId ? { ...b, visible: !b.visible } : b
    ));
  }, []);

  const setAllLayouts = useCallback((layout: 'A' | 'B') => {
    setBlocks(prev => prev.map(b => ({ ...b, layout })));
    showToast(`All blocks set to Layout ${layout}`, 'success');
  }, [showToast]);

  const handleDragStart = useCallback((blockId: string) => {
    setDraggedBlock(blockId);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, blockId: string) => {
    e.preventDefault();
    if (blockId !== draggedBlock) {
      setDragOverBlock(blockId);
    }
  }, [draggedBlock]);

  const handleDrop = useCallback((targetBlockId: string) => {
    if (!draggedBlock || draggedBlock === targetBlockId) return;

    setBlocks(prev => {
      const draggedIndex = prev.findIndex(b => b.id === draggedBlock);
      const targetIndex = prev.findIndex(b => b.id === targetBlockId);

      const newBlocks = [...prev];
      const [removed] = newBlocks.splice(draggedIndex, 1);
      newBlocks.splice(targetIndex, 0, removed);

      return newBlocks;
    });

    setDraggedBlock(null);
    setDragOverBlock(null);
  }, [draggedBlock]);

  const handleDragEnd = useCallback(() => {
    setDraggedBlock(null);
    setDragOverBlock(null);
  }, []);

  const resetToDefaults = useCallback(() => {
    setBlocks(initialBlocks);
    setColors(defaultColors);
    setStyleVariant('cinematic');
    setReferenceImages([]);
    setActiveImageIndex(0);
    localStorage.removeItem(STORAGE_KEY);
    showToast('Reset to defaults', 'info');
  }, [showToast]);

  const exportToPDF = useCallback(async () => {
    if (!previewRef.current) return;

    // Switch to PDF mode temporarily to ensure all slides are visible
    const previousMode = previewMode;
    setPreviewMode('pdf');

    setIsExporting(true);
    showToast('Generating PDF...', 'info');

    // Wait for mode switch and GSAP cleanup
    await new Promise(resolve => setTimeout(resolve, 200));

    try {
      const element = previewRef.current;

      // Ensure all slides are fully visible for export
      const slides = element.querySelectorAll('.slide-block');
      slides.forEach((slide) => {
        (slide as HTMLElement).style.opacity = '1';
        (slide as HTMLElement).style.transform = 'none';
      });

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: colors.dark,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save('pitch-deck.pdf');
      showToast('PDF exported successfully', 'success');
    } catch (error) {
      console.error('Failed to export PDF:', error);
      showToast('Failed to export PDF', 'error');
    } finally {
      setIsExporting(false);
      setPreviewMode(previousMode);
    }
  }, [colors.dark, showToast, previewMode]);

  const exportToImage = useCallback(async () => {
    if (!previewRef.current) return;

    setIsExporting(true);
    showToast('Generating image...', 'info');

    try {
      const element = previewRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: colors.dark,
        logging: false,
      });

      const link = document.createElement('a');
      link.download = 'pitch-deck.png';
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
      showToast('Image exported successfully', 'success');
    } catch (error) {
      console.error('Failed to export image:', error);
      showToast('Failed to export image', 'error');
    } finally {
      setIsExporting(false);
    }
  }, [colors.dark, showToast]);

  const visibleBlocks = blocks.filter(b => b.visible);

  // GSAP scroll animations for HTML preview
  useEffect(() => {
    if (previewMode !== 'html') {
      // Kill any existing triggers when switching away from HTML mode
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      return;
    }

    // Small delay to ensure DOM is ready
    const timeout = setTimeout(() => {
      const container = htmlPreviewRef.current;
      if (!container) return;

      const slides = container.querySelectorAll('.slide-block');
      if (!slides.length) return;

      // Reset all slides to visible first (for PDF mode compatibility)
      slides.forEach((slide) => {
        gsap.set(slide, { opacity: 1, y: 0, scale: 1 });
      });

      // Apply scroll animations
      slides.forEach((slide) => {
        gsap.fromTo(slide,
          {
            opacity: 0,
            y: 60,
            scale: 0.97,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: slide,
              start: 'top 85%',
              end: 'top 20%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });
    }, 150);

    return () => {
      clearTimeout(timeout);
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [previewMode, blocks, visibleBlocks.length]);

  // Get style-specific classes
  const getStyleClasses = () => {
    switch (styleVariant) {
      case 'bold':
        return 'saturate-125 contrast-105';
      case 'minimal':
        return 'saturate-75';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#0c0c0c] border border-white/10 hover:border-white/20 transition-colors"
      >
        {sidebarOpen ? (
          <svg className="w-5 h-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Sidebar Controls */}
      <div className={cn(
        "w-72 bg-[#0c0c0c] border-r border-white/8 flex flex-col h-screen fixed lg:sticky top-0 z-40 transition-transform duration-200",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="p-4 border-b border-white/8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
            </div>
            <div>
              <h1 className="font-display text-xl tracking-wide text-white">PITCH DECK</h1>
              <p className="text-[9px] text-white/40 tracking-[0.2em] uppercase">Builder</p>
            </div>
          </div>
        </div>

        {/* Image Upload - Multiple Images */}
        <div className="p-4 sidebar-section">
          <div className="flex items-center justify-between mb-3">
            <label className="text-[10px] text-white/50 uppercase tracking-[0.15em]">Images</label>
            <span className="text-[10px] text-white/30">{referenceImages.length}/4</span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />

          {/* Image Grid */}
          <div className="grid grid-cols-2 gap-1.5">
            {[0, 1, 2, 3].map((index) => {
              const image = referenceImages[index];
              const isActive = index === activeImageIndex && image;

              return (
                <div
                  key={index}
                  className={cn(
                    "image-slot aspect-square border relative overflow-hidden cursor-pointer",
                    image
                      ? isActive
                        ? "border-amber-500"
                        : "border-white/10 hover:border-white/20"
                      : "image-slot-empty border-dashed border-white/10"
                  )}
                  onClick={() => {
                    if (image) {
                      setActiveImageIndex(index);
                    } else if (referenceImages.length < 4) {
                      fileInputRef.current?.click();
                    }
                  }}
                >
                  {image ? (
                    <div className="group absolute inset-0">
                      <img src={image} alt={`Reference ${index + 1}`} className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors" />

                      {/* Active indicator */}
                      {isActive && (
                        <div className="absolute top-1 left-1 w-2 h-2 bg-amber-500" />
                      )}

                      {/* Hover actions */}
                      <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            extractColorsFromImage(index);
                          }}
                          className="w-7 h-7 bg-white/20 flex items-center justify-center hover:bg-amber-500 transition-colors text-white"
                          title="Extract colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage(index);
                          }}
                          className="w-7 h-7 bg-white/20 flex items-center justify-center hover:bg-red-500 transition-colors text-white"
                          title="Remove"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {isLoading && (
            <div className="flex items-center gap-2 py-2 mt-2">
              <div className="w-3 h-3 border border-amber-500/50 border-t-amber-500 animate-spin" />
              <span className="text-[10px] text-white/50">Processing...</span>
            </div>
          )}
        </div>

        {/* Color Palette - Editable */}
        <div className="p-4 sidebar-section">
          <label className="text-[10px] text-white/50 uppercase tracking-[0.15em] mb-3 block">Colors</label>
          <input
            ref={colorInputRef}
            type="color"
            className="sr-only"
            onChange={(e) => {
              if (editingColor) {
                handleColorChange(editingColor, e.target.value);
              }
            }}
            onBlur={() => setEditingColor(null)}
          />
          <div className="flex gap-1.5">
            {(Object.entries(colors) as [keyof ColorPalette, string][]).map(([key, color]) => (
              <div key={key} className="flex flex-col items-center flex-1">
                <button
                  className={cn(
                    "color-swatch w-full aspect-square cursor-pointer relative border",
                    editingColor === key
                      ? "border-white"
                      : "border-transparent hover:border-white/30"
                  )}
                  style={{ backgroundColor: color }}
                  title={`${key}: ${color}`}
                  onClick={() => {
                    setEditingColor(key);
                    if (colorInputRef.current) {
                      colorInputRef.current.value = color;
                      colorInputRef.current.click();
                    }
                  }}
                />
                <span className="text-[8px] text-white/30 mt-1.5 uppercase tracking-wide">{key.slice(0, 3)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Style Variant */}
        <div className="p-4 sidebar-section">
          <label className="text-[10px] text-white/50 uppercase tracking-[0.15em] mb-3 block">Style</label>
          <div className="flex gap-1">
            {styleVariants.map((variant) => (
              <button
                key={variant.id}
                onClick={() => applyStylePreset(variant.id)}
                className={cn(
                  "flex-1 py-2 text-[11px] transition-colors border",
                  styleVariant === variant.id
                    ? "bg-amber-500 border-amber-500 text-black font-medium"
                    : "bg-transparent border-white/10 text-white/50 hover:border-white/20 hover:text-white/70"
                )}
              >
                {variant.name}
              </button>
            ))}
          </div>
        </div>

        {/* Layout Toggle */}
        <div className="p-4 sidebar-section">
          <label className="text-[10px] text-white/50 uppercase tracking-[0.15em] mb-3 block">Layout</label>
          <div className="flex gap-1">
            <button
              onClick={() => setAllLayouts('A')}
              className="flex-1 py-2 text-[11px] bg-transparent border border-white/10 text-white/50 hover:border-white/20 hover:text-white/70 transition-colors"
            >
              All A
            </button>
            <button
              onClick={() => setAllLayouts('B')}
              className="flex-1 py-2 text-[11px] bg-transparent border border-white/10 text-white/50 hover:border-white/20 hover:text-white/70 transition-colors"
            >
              All B
            </button>
          </div>
        </div>

        {/* Block Controls */}
        <div className="flex-1 overflow-auto p-4">
          <div className="flex items-center justify-between mb-3">
            <label className="text-[10px] text-white/50 uppercase tracking-[0.15em]">Blocks</label>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={cn(
                "text-[10px] px-2 py-1 transition-colors",
                isEditing
                  ? "bg-amber-500 text-black"
                  : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70"
              )}
            >
              {isEditing ? "Done" : "Edit"}
            </button>
          </div>

          <div className="space-y-0.5">
            {blocks.map((block) => (
              <div
                key={block.id}
                draggable
                onDragStart={() => handleDragStart(block.id)}
                onDragOver={(e) => handleDragOver(e, block.id)}
                onDrop={() => handleDrop(block.id)}
                onDragEnd={handleDragEnd}
                className={cn(
                  "p-2.5 border-l-2 transition-all cursor-grab active:cursor-grabbing group",
                  block.visible
                    ? "bg-white/2 border-l-amber-500/50 hover:bg-white/4"
                    : "bg-transparent border-l-white/10 opacity-40 hover:opacity-60",
                  dragOverBlock === block.id && "border-l-amber-500 bg-amber-500/10",
                  draggedBlock === block.id && "opacity-20"
                )}
              >
                <div className="flex items-center gap-2">
                  <div className="flex flex-col gap-[2px] opacity-30 group-hover:opacity-50">
                    <div className="w-2.5 h-[1.5px] bg-white" />
                    <div className="w-2.5 h-[1.5px] bg-white" />
                    <div className="w-2.5 h-[1.5px] bg-white" />
                  </div>
                  <span className={cn(
                    "text-[10px] flex-1 truncate uppercase tracking-wide",
                    block.visible ? "text-white/70" : "text-white/40"
                  )}>
                    {block.title}
                  </span>
                  <button
                    onClick={() => toggleBlockLayout(block.id)}
                    className="text-[9px] w-5 h-5 flex items-center justify-center bg-white/5 text-white/50 hover:bg-white/10 hover:text-white font-mono"
                  >
                    {block.layout}
                  </button>
                  <button
                    onClick={() => toggleBlockVisibility(block.id)}
                    className={cn(
                      "w-5 h-5 flex items-center justify-center transition-colors",
                      block.visible
                        ? "text-amber-500 hover:text-amber-400"
                        : "text-white/20 hover:text-white/40"
                    )}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Export Buttons */}
        <div className="p-4 border-t border-white/8">
          <button
            onClick={exportToPDF}
            disabled={isExporting}
            className={cn(
              "w-full py-3 font-headline text-sm tracking-wider uppercase transition-colors",
              isExporting
                ? "bg-white/10 text-white/50 cursor-wait"
                : "bg-amber-500 text-black font-medium hover:bg-amber-400"
            )}
          >
            {isExporting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-black/30 border-t-black animate-spin" />
                Generating...
              </span>
            ) : (
              "Export PDF"
            )}
          </button>

          <div className="flex gap-1 mt-2">
            <button
              onClick={exportToImage}
              disabled={isExporting}
              className="flex-1 py-2 text-[11px] uppercase tracking-wide bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70 transition-colors border border-white/8"
            >
              PNG
            </button>
            <button
              onClick={resetToDefaults}
              className="py-2 px-3 text-[11px] bg-white/5 text-white/40 hover:bg-red-500/20 hover:text-red-400 transition-colors border border-white/8"
              title="Reset"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Preview Area */}
      <div className={cn(
        "flex-1 p-4 lg:p-6 overflow-auto transition-all bg-[#080808]",
        sidebarOpen ? "lg:ml-0" : "ml-0"
      )}>
        <div className="max-w-2xl mx-auto">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-0.5 h-4 bg-amber-500" />
                <h2 className="text-[10px] text-white/40 uppercase tracking-[0.2em]">Preview</h2>
              </div>
              {/* Preview Mode Toggle */}
              <div className="flex border border-white/10">
                <button
                  onClick={() => setPreviewMode('html')}
                  className={cn(
                    "px-3 py-1.5 text-[10px] uppercase tracking-wider transition-colors",
                    previewMode === 'html'
                      ? "bg-amber-500 text-black font-medium"
                      : "text-white/50 hover:text-white/70 hover:bg-white/5"
                  )}
                >
                  HTML
                </button>
                <button
                  onClick={() => setPreviewMode('pdf')}
                  className={cn(
                    "px-3 py-1.5 text-[10px] uppercase tracking-wider transition-colors",
                    previewMode === 'pdf'
                      ? "bg-amber-500 text-black font-medium"
                      : "text-white/50 hover:text-white/70 hover:bg-white/5"
                  )}
                >
                  PDF
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {hasUnsavedChanges && (
                <span className="text-[9px] text-white/40 flex items-center gap-1.5">
                  <span className="w-1 h-1 bg-amber-500 animate-pulse" />
                  Saving
                </span>
              )}
              <span className="text-[9px] text-white/30">
                {visibleBlocks.length} blocks
              </span>
            </div>
          </div>

          {/* Pitch Deck Preview */}
          <div
            ref={(el) => {
              // Always set previewRef for PDF export
              (previewRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
              // Also set htmlPreviewRef for GSAP animations
              if (previewMode === 'html') {
                (htmlPreviewRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
              }
            }}
            className={cn(
              "overflow-hidden border border-white/8",
              getStyleClasses()
            )}
            style={{ backgroundColor: colors.dark }}
          >
            {visibleBlocks.map((block) => (
              <div
                key={block.id}
                className={cn(
                  "slide-block",
                  previewMode === 'html' && "will-change-transform"
                )}
                style={{
                  opacity: previewMode === 'pdf' ? 1 : undefined,
                }}
              >
                {renderBlock(block, colors, referenceImages, isEditing, handleBlockUpdate)}
              </div>
            ))}

            {visibleBlocks.length === 0 && (
              <div className="p-16 text-center">
                <p className="text-white/30 text-sm">No blocks visible</p>
                <p className="text-[11px] text-white/20 mt-1">Enable blocks in the sidebar</p>
              </div>
            )}
          </div>

          {/* PDF Export info banner */}
          {previewMode === 'pdf' && (
            <div className="mt-3 p-3 bg-white/3 border border-white/8 text-center">
              <p className="text-[10px] text-white/50">
                PDF mode — Use the Export PDF button in the sidebar to download
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
