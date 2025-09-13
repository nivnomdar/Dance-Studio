import { Product } from './product';

export interface CartItem {
  product: Product;
  quantity: number;
  size?: string;
  color?: string;
  heel_height?: string;
  sole_type?: string;
  materials?: string;
}

export interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  addToCart: (product: Product, quantity: number, size?: string, color?: string, heel_height?: string, sole_type?: string, materials?: string) => void;
  removeFromCart: (itemKey: string) => void;
  updateQuantity: (itemKey: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemKey: (productId: number, size?: string, color?: string, heel_height?: string, sole_type?: string, materials?: string) => string;
}

export interface CartProviderProps {
  children: React.ReactNode;
} 