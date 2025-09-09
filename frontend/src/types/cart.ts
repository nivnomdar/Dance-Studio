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
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
}

export interface CartProviderProps {
  children: React.ReactNode;
} 