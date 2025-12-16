export interface StyleOption {
  id: string;
  name: string;
  description: string;
  promptModifier: string;
}

export interface ProductAnalysis {
  productName: string;
  keyFeatures: string[];
  visualDescription: string;
  suggestedStyles: StyleOption[];
}

export type AspectRatio = '1:1' | '16:9' | '9:16' | '3:4' | '4:3';

export interface GeneratedImage {
  id: string;
  url: string;
  styleName: string;
  ratio: AspectRatio;
  timestamp: number;
}

export interface GenerationConfig {
  ratio: AspectRatio;
  count: number;
  selectedStyleId: string | null;
  customPrompt?: string;
}
