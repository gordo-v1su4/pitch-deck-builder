export interface BlockData {
  id: string;
  type: BlockType;
  title: string;
  content: string;
  layout: 'A' | 'B';
  visible: boolean;
}

export type BlockType = 
  | 'hero'
  | 'logline'
  | 'story'
  | 'world'
  | 'character'
  | 'tone'
  | 'motif'
  | 'theme'
  | 'stakes'
  | 'closing';

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  dark: string;
  light: string;
}

export interface PitchDeckState {
  projectTitle: string;
  referenceImages: string[];
  colors: ColorPalette;
  blocks: BlockData[];
}
