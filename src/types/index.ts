// src/types/index.ts

export type DesignFormat =
  | 'minimalist' | 'brutalist' | 'flat' | 'glassmorphism'
  | 'neumorphism' | 'retro' | 'organic' | 'skeuomorphic';

export type ContentFormat =
  | 'website' | 'mobile-app' | 'dashboard' | 'landing-page'
  | 'poster' | 'social-media' | 'presentation' | 'ecommerce';

/** A CSS hex color string, e.g. "#ff5500" or "#fff" */
export type HexColor = `#${string}`;

export interface PaletteColor {
  /** Hex color value, e.g. "#ff5500" */
  hex: HexColor;
  /** Known values: 'primary' | 'secondary' | 'accent' | 'background' | 'text'. Extra colors get 'extra-N'. */
  role: string;
}

export interface SuggestedStyles {
  borderRadius: 'sharp' | 'rounded' | 'pill';
  shadows: 'none' | 'subtle' | 'soft' | 'dramatic';
  typography: 'modern' | 'classic' | 'friendly' | 'bold';
}

export interface ExtractedPalette {
  id: string;
  name: string;
  source: {
    type: 'image' | 'url';
    /** Data URL (from canvas.toDataURL) for images, or the original URL string for URL sources */
    thumbnail: string;
  };
  colors: PaletteColor[];
  keywords: string[];
  mood: string;
  suggestedDesignFormats: [DesignFormat, DesignFormat];
  suggestedStyles: SuggestedStyles;
  designFormat: DesignFormat;
  contentFormat: ContentFormat;
  createdAt: number;
}

export interface TemplateRecord {
  category: string;
  templateId: string;
  appliedPalette: string; // palette id
  customizations: Record<string, unknown>;
  generatedCode: string;
}

export interface Project {
  id: string;
  name: string;
  type: 'palette' | 'template';
  palette?: ExtractedPalette;
  template?: TemplateRecord;
  createdAt: number;
  updatedAt: number;
}

export type AppView = 'extract' | 'palette' | 'template' | 'export';

export interface AppState {
  projects: Project[];
  activeProjectId: string | null;
  view: AppView;
}
