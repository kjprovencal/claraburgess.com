export class CreateRegistryItemDto {
  name: string;
  price: number;
  quantity?: number;
  category: string;
  order?: number;
  url?: string;
  imageUrl?: string;
}

export class UpdateRegistryItemDto {
  name?: string;
  price?: number;
  quantity?: number;
  category?: string;
  order?: number;
  purchased?: boolean;
  url?: string;
  imageUrl?: string;
}
