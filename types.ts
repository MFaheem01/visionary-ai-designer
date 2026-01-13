
export interface DesignResult {
  id: string;
  imageUrl: string;
  prompt: string;
  timestamp: number;
  type: DesignType;
}

export enum DesignType {
  LOGO = 'Logo Design',
  WEB_UI = 'Web UI Mockup',
  SOCIAL_POST = 'Social Media Post',
  INTERIOR = 'Interior Concept',
  ARTISTIC = 'Artistic Re-imagining'
}

export interface UploadedImage {
  id: string;
  url: string;
  base64: string;
  mimeType: string;
}

export interface DesignRequest {
  images: UploadedImage[];
  instruction: string;
  designType: DesignType;
  highQuality: boolean;
}
