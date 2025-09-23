export type RegistryItem = {
  id: string;
  name: string;
  quantity: number;
  category: string;
  order: number;
  purchased: boolean;
  purchasedQuantity: number;
  url?: string;
  imageUrl?: string;
  // Preview data from link scraping
  title?: string;
  description?: string;
  siteName?: string;
  price?: number;
  availability?: string;
  previewCacheExpiry?: string;
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
