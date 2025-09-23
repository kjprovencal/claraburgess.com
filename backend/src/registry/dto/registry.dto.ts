export class CreateRegistryItemDto {
  name: string;
  price: number;
  quantity?: number;
  category: string;
  order?: number;
  url?: string;
}

export class UpdateRegistryItemDto {
  name?: string;
  price?: number;
  quantity?: number;
  category?: string;
  order?: number;
  purchased?: boolean;
  url?: string;
}

export class RegistryItemWithPreviewDto {
  id: string;
  name: string;
  quantity: number;
  category: string;
  order: number;
  purchased: boolean;
  url?: string;
  // Cached preview data
  imageUrl?: string;
  title?: string;
  description?: string;
  siteName?: string;
  price?: number;
  availability?: string;
  previewCacheExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
}
