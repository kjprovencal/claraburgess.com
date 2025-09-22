export type RegistryItem = {
  id: string;
  name: string;
  imageUrl?: string;
  price: number;
  quantity: number;
  category: string;
  order: number;
  purchased: boolean;
  url?: string;
  linkPreview?: LinkPreviewData;
};

export type LinkPreviewData = {
  title?: string;
  description?: string;
  imageUrl?: string;
  siteName?: string;
  url: string;
  price?: string;
  availability?: string;
};

export type Photo = {
  id: string;
  url: string;
  alt: string;
  caption: string;
  date: string;
  category: string;
  width?: number;
  height?: number;
};
