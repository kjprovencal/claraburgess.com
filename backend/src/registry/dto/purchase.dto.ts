export class CreatePurchaseDto {
  quantity: number;
  buyerName?: string;
  purchaseLocation?: string;
  orderNumber?: string;
  thankYouAddress?: string;
  similarItemDescription?: string;
  giftType: 'purchased' | 'similar' | 'none';
}

export class PurchaseDto {
  id: string;
  registryItemId: string;
  quantity: number;
  buyerName?: string;
  purchaseLocation?: string;
  orderNumber?: string;
  thankYouAddress?: string;
  similarItemDescription?: string;
  giftType: 'purchased' | 'similar' | 'none';
  createdAt: Date;
  updatedAt: Date;
}
