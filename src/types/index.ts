export type PostFormat = '4:5' | '1:1' | '9:16' | '16:9';

export interface FormatDimensions {
  width: number;
  height: number;
  label: string;
  recommendedFor: string;
}

export const FORMAT_SPECS: Record<PostFormat, FormatDimensions> = {
  '4:5': {
    width: 1080,
    height: 1350,
    label: '4:5 Vertical Feed',
    recommendedFor: 'Instagram Feed, Facebook',
  },
  '1:1': {
    width: 1080,
    height: 1080,
    label: '1:1 Quadrado',
    recommendedFor: 'Instagram, LinkedIn, Feed padrão',
  },
  '9:16': {
    width: 1080,
    height: 1920,
    label: '9:16 Stories / Reels',
    recommendedFor: 'Reels, TikTok, Stories, Shorts',
  },
  '16:9': {
    width: 1920,
    height: 1080,
    label: '16:9 Horizontal',
    recommendedFor: 'YouTube, Web, Notícias Horizontais',
  },
};

export interface BrandConfig {
  pageName: string;
  logoUrl?: string; // base64 or object URL
  instagram: string;
  facebook: string;
  website: string;
  phone: string;
  email: string;
  primaryColor: string;
  secondaryColor: string;
  footerText: string;
  additionalInfo: string;
  footerEnabled: boolean;
  showLogo: boolean;
}

export interface ContentData {
  category: string;
  title: string;
  subtitle: string;
  date: string;
  location: string;
  sourceOrExtra: string;
  urgenteBadge?: boolean;
  liveBadge?: boolean;
}

export type TemplateLayout =
  | 'editorial-bottom'
  | 'breaking-urgent'
  | 'modern-card'
  | 'quote-interview'
  | 'sports-bold'
  | 'split-half'
  | 'minimal-banner'
  | 'headline-dark';

export interface TemplateStyle {
  layout: TemplateLayout;
  titleFont?: string;
  titleAlign?: 'left' | 'center' | 'right';
  titleColor?: string;
  titleSizeMultiplier?: number;
  overlayType: 'gradient-bottom' | 'gradient-full' | 'solid-bar' | 'card-floating' | 'framed' | 'none';
  overlayOpacity: number;
  badgeStyle: 'filled' | 'outline' | 'pill' | 'banner';
  badgeColor?: string;
  footerStyle: 'clean-line' | 'dark-bar' | 'brand-bar' | 'floating-pill';
  accentColor?: string;
  animation?: {
    type: 'fade' | 'slide-up' | 'zoom-in' | 'ticker';
    duration: number; // in seconds
  };
}

export interface Template {
  id: string;
  name: string;
  category: string;
  supportedFormats: PostFormat[];
  description: string;
  thumbnailGradient: string;
  style: TemplateStyle;
}

export interface Project {
  id: string;
  name: string;
  type: 'image' | 'video';
  templateId: string;
  format: PostFormat;
  mediaUrl?: string;
  mediaFileName?: string;
  mediaType?: 'image' | 'video';
  content: ContentData;
  brand: BrandConfig;
  thumbnailUrl?: string;
  createdAt: number;
  updatedAt: number;
}
