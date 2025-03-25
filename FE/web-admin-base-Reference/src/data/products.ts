export interface products {
    id: number;
    name: string;
    imageUrl: string;
    price: number;
    originalPrice?: number;
    discount?: number;
    isNew?: boolean;
    specialPrice?: boolean;
    rating?: number;
    reviewCount?: number;
  }