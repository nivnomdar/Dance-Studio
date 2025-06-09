export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  features: string[];
  sizes?: string[];
  colors?: string[];
  inStock: boolean;
  rating: number;
  reviews: {
    count: number;
    comments: {
      user: string;
      rating: number;
      comment: string;
      date: string;
    }[];
  };
  isNew?: boolean;
  isBestSeller?: boolean;
} 