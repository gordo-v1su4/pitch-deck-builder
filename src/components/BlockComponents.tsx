import React, { useState, useRef, useEffect } from 'react';
import type { BlockData, ColorPalette } from '../types';

interface BlockProps {
  block: BlockData;
  colors: ColorPalette;
  referenceImages: string[];
  imageIndex?: number;
  isEditing: boolean;
  onUpdate: (block: BlockData) => void;
}

const EditableText: React.FC<{
  value: string;
  onChange: (value: string) => void;
  isEditing: boolean;
  className?: string;
  multiline?: boolean;
  style?: React.CSSProperties;
}> = ({ value, onChange, isEditing, className = '', multiline = false, style }) => {
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleBlur = () => {
    if (localValue !== value) {
      onChange(localValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setLocalValue(value);
      inputRef.current?.blur();
    } else if (e.key === 'Enter' && !multiline) {
      onChange(localValue);
      inputRef.current?.blur();
    }
  };

  if (!isEditing) {
    return <span className={className} style={style}>{value}</span>;
  }

  if (multiline) {
    return (
      <textarea
        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`${className} bg-black/20 border border-white/30 rounded px-2 py-1 w-full resize-none focus:outline-none focus:border-amber-500/50 focus:bg-black/30 transition-all`}
        style={style}
        rows={3}
      />
    );
  }

  return (
    <input
      ref={inputRef as React.RefObject<HTMLInputElement>}
      type="text"
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={`${className} bg-black/20 border border-white/30 rounded px-2 py-1 w-full focus:outline-none focus:border-amber-500/50 focus:bg-black/30 transition-all`}
      style={style}
    />
  );
};

// HERO BLOCK
export const HeroBlock: React.FC<BlockProps> = ({ block, colors, referenceImages, imageIndex = 0, isEditing, onUpdate }) => {
  const layoutA = block.layout === 'A';
  const image = referenceImages[imageIndex % referenceImages.length] || null;

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        backgroundColor: colors.dark,
        aspectRatio: '16/9',
      }}
    >
      {image && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${image})`,
            opacity: layoutA ? 0.6 : 0.75,
            filter: 'saturate(1.2) contrast(1.1)',
          }}
        />
      )}
      {/* Multiple gradient overlays for depth */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(${layoutA ? '180deg' : '135deg'}, ${colors.dark}f5 0%, ${colors.dark}90 40%, ${colors.dark}40 70%, transparent 100%)`,
        }}
      />
      {/* Cinematic letterbox bars */}
      <div className="absolute top-0 left-0 right-0 h-[8%]" style={{ background: `linear-gradient(180deg, ${colors.dark} 0%, transparent 100%)` }} />
      <div className="absolute bottom-0 left-0 right-0 h-[8%]" style={{ background: `linear-gradient(0deg, ${colors.dark} 0%, transparent 100%)` }} />

      {/* Accent line decorations */}
      <div className="absolute top-[12%] left-[5%] w-[60px] h-[1px]" style={{ backgroundColor: `${colors.accent}60` }} />
      <div className="absolute bottom-[12%] right-[5%] w-[60px] h-[1px]" style={{ backgroundColor: `${colors.accent}60` }} />

      <div className={`relative z-10 h-full flex flex-col ${layoutA ? 'justify-center items-center text-center px-6' : 'justify-end items-start p-8'}`}>
        {/* Small label above title */}
        <span className="text-[8px] tracking-[0.4em] uppercase mb-2" style={{ color: colors.accent }}>
          PRESENTATION
        </span>
        <EditableText
          value={block.title}
          onChange={(val) => onUpdate({ ...block, title: val })}
          isEditing={isEditing}
          className={`font-display tracking-[0.15em] ${layoutA ? 'text-4xl md:text-6xl' : 'text-3xl md:text-5xl'}`}
          style={{ color: colors.light }}
        />
        <EditableText
          value={block.content}
          onChange={(val) => onUpdate({ ...block, content: val })}
          isEditing={isEditing}
          className="text-xs tracking-[0.3em] uppercase mt-4"
          style={{ color: `${colors.light}90` }}
        />
        {/* Decorative line under content */}
        <div className="flex items-center gap-3 mt-6">
          <div className="w-12 h-[1px]" style={{ backgroundColor: colors.accent }} />
          <div className="w-2 h-2" style={{ backgroundColor: colors.accent }} />
          <div className="w-12 h-[1px]" style={{ backgroundColor: colors.accent }} />
        </div>
      </div>
      <div
        className="absolute bottom-0 left-0 right-0 h-[3px]"
        style={{ backgroundColor: colors.accent }}
      />
    </div>
  );
};

// LOGLINE BLOCK
export const LoglineBlock: React.FC<BlockProps> = ({ block, colors, isEditing, onUpdate }) => {
  const layoutA = block.layout === 'A';

  return (
    <div
      className="flex flex-col justify-center relative overflow-hidden"
      style={{
        backgroundColor: layoutA ? colors.dark : `${colors.primary}08`,
        aspectRatio: '16/9',
        padding: '5%',
      }}
    >
      {/* Large quote marks decoration */}
      <div
        className="absolute top-[10%] left-[5%] font-display text-[120px] leading-none opacity-[0.04] select-none"
        style={{ color: colors.accent }}
      >
        "
      </div>
      <div
        className="absolute bottom-[5%] right-[5%] font-display text-[120px] leading-none opacity-[0.04] select-none rotate-180"
        style={{ color: colors.accent }}
      >
        "
      </div>

      {/* Vertical accent bar */}
      <div
        className="absolute left-0 top-[20%] bottom-[20%] w-[3px]"
        style={{ backgroundColor: colors.accent }}
      />

      <div className="relative z-10 pl-8">
        <h3
          className="font-headline text-[10px] tracking-[0.25em] uppercase mb-6 flex items-center gap-3"
          style={{ color: colors.accent }}
        >
          <span className="w-8 h-[1px]" style={{ backgroundColor: colors.accent }} />
          {block.title}
        </h3>
        <EditableText
          value={block.content}
          onChange={(val) => onUpdate({ ...block, content: val })}
          isEditing={isEditing}
          multiline
          className={`font-body ${layoutA ? 'text-xl' : 'text-2xl font-light'} leading-relaxed italic`}
          style={{ color: `${colors.light}e0` }}
        />
        {/* Bottom accent */}
        <div className="flex items-center gap-2 mt-8">
          <div className="w-6 h-[2px]" style={{ backgroundColor: colors.secondary }} />
          <div className="w-3 h-[2px]" style={{ backgroundColor: colors.accent }} />
        </div>
      </div>
    </div>
  );
};

// STORY BLOCK
export const StoryBlock: React.FC<BlockProps> = ({ block, colors, referenceImages, imageIndex = 1, isEditing, onUpdate }) => {
  const layoutA = block.layout === 'A';
  const image = referenceImages[imageIndex % referenceImages.length] || null;

  return (
    <div
      className={`flex ${layoutA ? 'flex-row' : 'flex-col'} relative overflow-hidden`}
      style={{
        backgroundColor: colors.dark,
        aspectRatio: '16/9',
      }}
    >
      {image && layoutA && (
        <div
          className="w-[45%] bg-cover bg-center relative"
          style={{
            backgroundImage: `url(${image})`,
            filter: 'saturate(1.1) contrast(1.1)',
          }}
        >
          {/* Diagonal slice effect */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(105deg, transparent 0%, transparent 70%, ${colors.dark} 70%, ${colors.dark} 100%)`,
            }}
          />
          {/* Colored accent overlay */}
          <div
            className="absolute inset-0 mix-blend-soft-light opacity-30"
            style={{ backgroundColor: colors.primary }}
          />
        </div>
      )}

      {/* Grid pattern overlay for non-image layout */}
      {!image && (
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(${colors.secondary} 1px, transparent 1px), linear-gradient(90deg, ${colors.secondary} 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
      )}

      <div className={`flex flex-col justify-center relative z-10 ${layoutA ? 'w-[55%]' : 'w-full'}`} style={{ padding: '5%' }}>
        {/* Section number */}
        <span
          className="font-display text-[80px] absolute top-[5%] right-[5%] opacity-[0.04] select-none"
          style={{ color: colors.accent }}
        >
          02
        </span>

        <h3
          className="font-headline text-[10px] tracking-[0.25em] uppercase mb-6 flex items-center gap-3"
          style={{ color: colors.accent }}
        >
          <span className="w-10 h-[1px]" style={{ backgroundColor: colors.accent }} />
          {block.title}
        </h3>
        <EditableText
          value={block.content}
          onChange={(val) => onUpdate({ ...block, content: val })}
          isEditing={isEditing}
          multiline
          className="font-body text-base leading-[1.8]"
          style={{ color: `${colors.light}d0` }}
        />
        {/* Decorative corner */}
        <div className="absolute bottom-[5%] right-[5%] w-12 h-12">
          <div className="absolute bottom-0 right-0 w-full h-[1px]" style={{ backgroundColor: `${colors.accent}40` }} />
          <div className="absolute bottom-0 right-0 w-[1px] h-full" style={{ backgroundColor: `${colors.accent}40` }} />
        </div>
      </div>
    </div>
  );
};

// WORLD/CONCEPT BLOCK
export const WorldBlock: React.FC<BlockProps> = ({ block, colors, isEditing, onUpdate }) => {
  const layoutA = block.layout === 'A';

  return (
    <div
      className="relative overflow-hidden flex flex-col justify-center"
      style={{
        backgroundColor: colors.dark,
        aspectRatio: '16/9',
        padding: '5%',
      }}
    >
      {/* Geometric background pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, ${colors.primary} 0%, transparent 50%), radial-gradient(circle at 80% 50%, ${colors.secondary} 0%, transparent 50%)`,
        }}
      />

      {/* Corner frame decoration */}
      <div className="absolute top-[5%] left-[5%] w-20 h-20">
        <div className="absolute top-0 left-0 w-full h-[1px]" style={{ backgroundColor: `${colors.accent}30` }} />
        <div className="absolute top-0 left-0 w-[1px] h-full" style={{ backgroundColor: `${colors.accent}30` }} />
      </div>
      <div className="absolute bottom-[5%] right-[5%] w-20 h-20">
        <div className="absolute bottom-0 right-0 w-full h-[1px]" style={{ backgroundColor: `${colors.accent}30` }} />
        <div className="absolute bottom-0 right-0 w-[1px] h-full" style={{ backgroundColor: `${colors.accent}30` }} />
      </div>

      {/* Left accent bar */}
      <div
        className="absolute left-0 top-[15%] bottom-[15%] w-[3px]"
        style={{ backgroundColor: colors.accent }}
      />

      <div className="relative z-10 pl-8">
        <span
          className="font-display text-[80px] absolute top-[-20%] right-[5%] opacity-[0.04] select-none"
          style={{ color: colors.secondary }}
        >
          03
        </span>

        <h3
          className="font-headline text-[10px] tracking-[0.25em] uppercase mb-6 flex items-center gap-3"
          style={{ color: colors.secondary }}
        >
          <span className="w-8 h-[2px]" style={{ backgroundColor: colors.secondary }} />
          {block.title}
        </h3>
        <EditableText
          value={block.content}
          onChange={(val) => onUpdate({ ...block, content: val })}
          isEditing={isEditing}
          multiline
          className={`font-body ${layoutA ? 'text-base' : 'text-lg font-light'} leading-[1.8]`}
          style={{ color: `${colors.light}d0` }}
        />
      </div>
    </div>
  );
};

// CHARACTER BLOCK
export const CharacterBlock: React.FC<BlockProps> = ({ block, colors, referenceImages, imageIndex = 2, isEditing, onUpdate }) => {
  const layoutA = block.layout === 'A';
  const image = referenceImages[imageIndex % referenceImages.length] || null;

  return (
    <div
      className="relative overflow-hidden"
      style={{
        backgroundColor: colors.dark,
        aspectRatio: '16/9',
      }}
    >
      {image && (
        <div
          className={`absolute ${layoutA ? 'right-0 top-0 bottom-0 w-[50%]' : 'inset-0'} bg-cover bg-center`}
          style={{
            backgroundImage: `url(${image})`,
            opacity: layoutA ? 0.9 : 0.3,
            filter: 'contrast(1.15) saturate(1.1)',
          }}
        />
      )}
      <div
        className={`absolute ${layoutA ? 'left-0 w-[70%]' : 'inset-0'}`}
        style={{
          background: `linear-gradient(${layoutA ? '90deg' : '0deg'}, ${colors.dark} ${layoutA ? '60%' : '0%'}, transparent 100%)`,
        }}
      />

      {/* Decorative lines */}
      <div className="absolute top-[5%] left-[5%] right-[5%] h-[1px]" style={{ background: `linear-gradient(90deg, ${colors.accent}40 0%, transparent 100%)` }} />
      <div className="absolute bottom-[5%] left-[5%] right-[5%] h-[1px]" style={{ background: `linear-gradient(90deg, ${colors.accent}40 0%, transparent 100%)` }} />

      {/* Character silhouette placeholder when no image */}
      {!image && (
        <div className="absolute right-[10%] top-[15%] bottom-[15%] w-[30%] opacity-[0.03]" style={{ backgroundColor: colors.primary }} />
      )}

      <div className={`relative z-10 h-full flex flex-col justify-center ${layoutA ? 'w-[60%]' : 'w-full'}`} style={{ padding: '5%' }}>
        <span
          className="font-display text-[80px] absolute top-[5%] left-[5%] opacity-[0.04] select-none"
          style={{ color: colors.accent }}
        >
          04
        </span>

        <h3
          className="font-headline text-[10px] tracking-[0.25em] uppercase mb-5 flex items-center gap-3"
          style={{ color: colors.accent }}
        >
          <span className="w-10 h-[2px]" style={{ backgroundColor: colors.accent }} />
          {block.title}
        </h3>
        <EditableText
          value={block.content}
          onChange={(val) => onUpdate({ ...block, content: val })}
          isEditing={isEditing}
          multiline
          className="font-body text-base leading-[1.8]"
          style={{ color: `${colors.light}e0` }}
        />
        {/* Accent underline */}
        <div className="flex gap-1 mt-6">
          <div className="w-16 h-[2px]" style={{ backgroundColor: colors.accent }} />
          <div className="w-4 h-[2px]" style={{ backgroundColor: colors.secondary }} />
        </div>
      </div>
    </div>
  );
};

// TONE/STYLE BLOCK
export const ToneBlock: React.FC<BlockProps> = ({ block, colors, isEditing, onUpdate }) => {
  const layoutA = block.layout === 'A';

  return (
    <div
      className="relative overflow-hidden flex flex-col justify-center"
      style={{
        backgroundColor: colors.dark,
        aspectRatio: '16/9',
        padding: '5%',
      }}
    >
      {/* Color gradient background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: `linear-gradient(135deg, ${colors.primary}30 0%, transparent 40%, ${colors.secondary}20 60%, transparent 100%)`,
        }}
      />

      {/* Scan lines effect */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, ${colors.light} 0px, ${colors.light} 1px, transparent 1px, transparent 3px)`,
        }}
      />

      <div className="relative z-10">
        <span
          className="font-display text-[80px] absolute top-[-10%] right-[5%] opacity-[0.04] select-none"
          style={{ color: colors.accent }}
        >
          05
        </span>

        <h3
          className="font-headline text-[10px] tracking-[0.25em] uppercase mb-6 flex items-center gap-3"
          style={{ color: colors.accent }}
        >
          <span className="w-10 h-[1px]" style={{ backgroundColor: colors.accent }} />
          {block.title}
        </h3>

        {/* Color palette display - more prominent */}
        <div className={`flex gap-2 mb-6 ${layoutA ? 'flex-row' : 'flex-wrap'}`}>
          {[
            { color: colors.primary, label: 'PRI' },
            { color: colors.secondary, label: 'SEC' },
            { color: colors.accent, label: 'ACC' },
            { color: colors.dark, label: 'DRK' },
            { color: colors.light, label: 'LGT' },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center">
              <div
                className="w-12 h-12 mb-1"
                style={{
                  backgroundColor: item.color,
                  boxShadow: `0 0 0 1px ${colors.light}10`,
                }}
              />
              <span className="text-[7px] tracking-[0.15em] opacity-40" style={{ color: colors.light }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>

        <EditableText
          value={block.content}
          onChange={(val) => onUpdate({ ...block, content: val })}
          isEditing={isEditing}
          multiline
          className="font-body text-base leading-[1.8]"
          style={{ color: `${colors.light}c0` }}
        />
      </div>
    </div>
  );
};

// MOTIF BLOCK
export const MotifBlock: React.FC<BlockProps> = ({ block, colors, isEditing, onUpdate }) => {
  const layoutA = block.layout === 'A';

  return (
    <div
      className="relative overflow-hidden flex flex-col justify-center"
      style={{
        backgroundColor: colors.dark,
        aspectRatio: '16/9',
        padding: '5%',
      }}
    >
      {/* Multiple geometric patterns */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `repeating-linear-gradient(${layoutA ? '45deg' : '-45deg'}, ${colors.accent}, ${colors.accent} 1px, transparent 1px, transparent 20px)`,
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `repeating-linear-gradient(${layoutA ? '-45deg' : '45deg'}, ${colors.secondary}, ${colors.secondary} 1px, transparent 1px, transparent 40px)`,
        }}
      />

      {/* Floating geometric shapes */}
      <div
        className="absolute top-[10%] right-[10%] w-20 h-20 rotate-45 opacity-[0.05]"
        style={{ border: `1px solid ${colors.accent}` }}
      />
      <div
        className="absolute bottom-[15%] left-[8%] w-16 h-16 rotate-12 opacity-[0.04]"
        style={{ border: `1px solid ${colors.secondary}` }}
      />
      <div
        className="absolute top-[40%] right-[25%] w-8 h-8 opacity-[0.08]"
        style={{ backgroundColor: colors.accent }}
      />

      <div className="relative z-10">
        <span
          className="font-display text-[80px] absolute top-[-15%] right-[5%] opacity-[0.04] select-none"
          style={{ color: colors.secondary }}
        >
          06
        </span>

        <h3
          className="font-headline text-[10px] tracking-[0.25em] uppercase mb-6 flex items-center gap-3"
          style={{ color: colors.secondary }}
        >
          <span className="w-10 h-[1px]" style={{ backgroundColor: colors.secondary }} />
          {block.title}
        </h3>
        <EditableText
          value={block.content}
          onChange={(val) => onUpdate({ ...block, content: val })}
          isEditing={isEditing}
          multiline
          className="font-body text-base leading-[1.8]"
          style={{ color: `${colors.light}d0` }}
        />
        {/* Bottom accent */}
        <div className="flex items-center gap-2 mt-8">
          <div className="w-3 h-3" style={{ backgroundColor: colors.accent }} />
          <div className="w-8 h-[1px]" style={{ backgroundColor: colors.secondary }} />
        </div>
      </div>
    </div>
  );
};

// THEME BLOCK
export const ThemeBlock: React.FC<BlockProps> = ({ block, colors, isEditing, onUpdate }) => {
  const layoutA = block.layout === 'A';

  return (
    <div
      className={`${layoutA ? 'text-left' : 'text-center'} relative overflow-hidden flex flex-col justify-center`}
      style={{
        backgroundColor: colors.dark,
        aspectRatio: '16/9',
        padding: '5%',
      }}
    >
      {/* Subtle radial gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at ${layoutA ? '20% 50%' : '50% 50%'}, ${colors.accent}08 0%, transparent 60%)`,
        }}
      />

      {/* Top and bottom borders */}
      <div className="absolute top-0 left-[5%] right-[5%] h-[1px]" style={{ background: `linear-gradient(90deg, transparent, ${colors.accent}30, transparent)` }} />
      <div className="absolute bottom-0 left-[5%] right-[5%] h-[1px]" style={{ background: `linear-gradient(90deg, transparent, ${colors.accent}30, transparent)` }} />

      <div className="relative z-10">
        <span
          className="font-display text-[80px] absolute top-[-15%] right-[5%] opacity-[0.04] select-none"
          style={{ color: colors.accent }}
        >
          07
        </span>

        <h3
          className={`font-headline text-[10px] tracking-[0.25em] uppercase mb-6 flex items-center gap-3 ${layoutA ? '' : 'justify-center'}`}
          style={{ color: colors.accent }}
        >
          {layoutA ? (
            <>
              <span className="w-10 h-[2px]" style={{ backgroundColor: colors.accent }} />
              {block.title}
            </>
          ) : (
            <>
              <span className="w-12 h-[1px]" style={{ backgroundColor: colors.accent }} />
              {block.title}
              <span className="w-12 h-[1px]" style={{ backgroundColor: colors.accent }} />
            </>
          )}
        </h3>
        <EditableText
          value={block.content}
          onChange={(val) => onUpdate({ ...block, content: val })}
          isEditing={isEditing}
          multiline
          className={`font-headline ${layoutA ? 'text-xl' : 'text-2xl'} tracking-wide leading-relaxed`}
          style={{ color: `${colors.light}e0` }}
        />
        {/* Decorative element */}
        <div className={`flex items-center gap-2 mt-8 ${layoutA ? '' : 'justify-center'}`}>
          <div className="w-2 h-2" style={{ backgroundColor: colors.accent }} />
          <div className="w-2 h-2 opacity-60" style={{ backgroundColor: colors.secondary }} />
          <div className="w-2 h-2 opacity-30" style={{ backgroundColor: colors.primary }} />
        </div>
      </div>
    </div>
  );
};

// STAKES BLOCK
export const StakesBlock: React.FC<BlockProps> = ({ block, colors, isEditing, onUpdate }) => {
  const layoutA = block.layout === 'A';

  return (
    <div
      className="relative overflow-hidden flex flex-col justify-center"
      style={{
        backgroundColor: colors.dark,
        aspectRatio: '16/9',
        padding: '5%',
      }}
    >
      {/* Dramatic gradient overlays */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(${layoutA ? '180deg' : '135deg'}, ${colors.accent}15 0%, transparent 50%)`,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at bottom right, ${colors.primary}10 0%, transparent 60%)`,
        }}
      />

      {/* Danger/intensity indicator bars */}
      <div className="absolute left-0 top-0 bottom-0 w-[4px]" style={{ background: `linear-gradient(180deg, ${colors.accent}, ${colors.accent}40)` }} />
      <div className="absolute right-0 top-0 bottom-0 w-[1px]" style={{ background: `linear-gradient(180deg, transparent, ${colors.accent}30, transparent)` }} />

      {/* Warning stripes decoration */}
      <div
        className="absolute top-0 right-0 w-40 h-full opacity-[0.03]"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, ${colors.accent}, ${colors.accent} 10px, transparent 10px, transparent 20px)`,
        }}
      />

      <div className="relative z-10 pl-6">
        <span
          className="font-display text-[100px] absolute top-[-5%] right-[5%] opacity-[0.05] select-none"
          style={{ color: colors.accent }}
        >
          08
        </span>

        <h3
          className="font-headline text-[10px] tracking-[0.25em] uppercase mb-6 flex items-center gap-3"
          style={{ color: colors.accent }}
        >
          <span className="w-12 h-[2px]" style={{ backgroundColor: colors.accent }} />
          {block.title}
        </h3>
        <EditableText
          value={block.content}
          onChange={(val) => onUpdate({ ...block, content: val })}
          isEditing={isEditing}
          multiline
          className="font-body text-lg leading-[1.8] font-medium"
          style={{ color: `${colors.light}e0` }}
        />
        {/* Urgency indicator */}
        <div className="flex items-center gap-1 mt-8">
          <div className="w-4 h-[3px]" style={{ backgroundColor: colors.accent }} />
          <div className="w-3 h-[3px]" style={{ backgroundColor: colors.accent, opacity: 0.7 }} />
          <div className="w-2 h-[3px]" style={{ backgroundColor: colors.accent, opacity: 0.4 }} />
        </div>
      </div>
    </div>
  );
};

// CLOSING BLOCK
export const ClosingBlock: React.FC<BlockProps> = ({ block, colors, referenceImages, imageIndex = 3, isEditing, onUpdate }) => {
  const layoutA = block.layout === 'A';
  const image = referenceImages[imageIndex % referenceImages.length] || null;

  return (
    <div
      className="relative overflow-hidden"
      style={{
        backgroundColor: colors.dark,
        aspectRatio: '16/9',
      }}
    >
      {image && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${image})`,
            opacity: 0.25,
            filter: 'blur(3px) saturate(0.9)',
          }}
        />
      )}
      {/* Dramatic vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at center, transparent 0%, ${colors.dark}80 50%, ${colors.dark} 100%)`,
        }}
      />

      {/* Cinematic letterbox bars */}
      <div className="absolute top-0 left-0 right-0 h-[10%]" style={{ background: `linear-gradient(180deg, ${colors.dark} 0%, transparent 100%)` }} />
      <div className="absolute bottom-0 left-0 right-0 h-[10%]" style={{ background: `linear-gradient(0deg, ${colors.dark} 0%, transparent 100%)` }} />

      {/* Frame borders */}
      <div className="absolute top-[8%] left-[8%] right-[8%] h-[1px]" style={{ background: `linear-gradient(90deg, transparent, ${colors.accent}20, transparent)` }} />
      <div className="absolute bottom-[8%] left-[8%] right-[8%] h-[1px]" style={{ background: `linear-gradient(90deg, transparent, ${colors.accent}20, transparent)` }} />

      <div className={`relative z-10 h-full flex flex-col justify-center ${layoutA ? 'items-center text-center' : 'items-start text-left'}`} style={{ padding: '8%' }}>
        {/* Closing label */}
        <span className="text-[8px] tracking-[0.4em] uppercase mb-4" style={{ color: `${colors.accent}80` }}>
          CLOSING
        </span>

        {/* Large quotation marks */}
        <div className="relative">
          <span
            className="absolute -left-8 -top-4 font-display text-[60px] leading-none opacity-[0.08] select-none"
            style={{ color: colors.accent }}
          >
            "
          </span>
          <EditableText
            value={block.content}
            onChange={(val) => onUpdate({ ...block, content: val })}
            isEditing={isEditing}
            className={`font-display ${layoutA ? 'text-2xl md:text-4xl' : 'text-xl md:text-3xl'} tracking-[0.05em] italic leading-relaxed`}
            style={{ color: colors.light }}
          />
          <span
            className="absolute -right-8 -bottom-4 font-display text-[60px] leading-none opacity-[0.08] select-none rotate-180"
            style={{ color: colors.accent }}
          >
            "
          </span>
        </div>

        {/* Decorative ending element */}
        <div className="flex items-center gap-3 mt-10">
          <div className="w-12 h-[1px]" style={{ backgroundColor: colors.accent }} />
          <div className="w-3 h-3" style={{ backgroundColor: colors.accent }} />
          <div className="w-12 h-[1px]" style={{ backgroundColor: colors.accent }} />
        </div>

        {/* End mark */}
        <span className="text-[9px] tracking-[0.3em] uppercase mt-6 opacity-40" style={{ color: colors.light }}>
          END
        </span>
      </div>
    </div>
  );
};

// Block renderer
export const renderBlock = (
  block: BlockData,
  colors: ColorPalette,
  referenceImages: string[],
  isEditing: boolean,
  onUpdate: (block: BlockData) => void
): React.ReactNode => {
  const baseProps = { block, colors, referenceImages, isEditing, onUpdate };

  switch (block.type) {
    case 'hero':
      return <HeroBlock {...baseProps} imageIndex={0} />;
    case 'logline':
      return <LoglineBlock {...baseProps} />;
    case 'story':
      return <StoryBlock {...baseProps} imageIndex={1} />;
    case 'world':
      return <WorldBlock {...baseProps} />;
    case 'character':
      return <CharacterBlock {...baseProps} imageIndex={2} />;
    case 'tone':
      return <ToneBlock {...baseProps} />;
    case 'motif':
      return <MotifBlock {...baseProps} />;
    case 'theme':
      return <ThemeBlock {...baseProps} />;
    case 'stakes':
      return <StakesBlock {...baseProps} />;
    case 'closing':
      return <ClosingBlock {...baseProps} imageIndex={3} />;
    default:
      return null;
  }
};
