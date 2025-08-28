import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Product } from '../types/product';
import { CartItem, CartContextType, CartProviderProps } from '../types/cart';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { 
  setDataWithTimestamp, 
  getDataWithTimestamp, 
  hasCookie 
} from '../utils/cookieManager';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const auth = useAuth();
  const user = auth?.user;
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveTimeRef = useRef<number>(0);
  const isSavingRef = useRef<boolean>(false);

  // If auth is not ready, show children without cart functionality
  if (!auth) {
    return <>{children}</>;
  }

  // Load cart from Supabase user metadata on mount
  useEffect(() => {
    // Don't load cart if auth is not ready
    if (!auth) {
      return;
    }

    const loadCart = async () => {
      if (user) {
        // נסה לטעון מהמשתמש המחובר
        const userCart = user.user_metadata?.cart;
        if (userCart) {
          try {
            const parsedCart = JSON.parse(userCart);
            if (Array.isArray(parsedCart)) {
              setCartItems(parsedCart);
            } else {
              console.warn('User cart is not an array, resetting to empty array');
              setCartItems([]);
            }
          } catch (error) {
            console.error('Error loading cart from user metadata:', error);
            setCartItems([]);
          }
        } else {
          setCartItems([]);
        }
      } else {
        // אם אין משתמש, נסה לטעון מ-cookies (זמני)
        const sessionCart = getDataWithTimestamp<CartItem[]>('temp_cart', 24 * 60 * 60 * 1000); // 24 שעות
        if (sessionCart && Array.isArray(sessionCart)) {
          setCartItems(sessionCart);
        } else {
          setCartItems([]);
        }
      }
    };

    loadCart();
  }, [user, auth]);

  // Save cart to Supabase user metadata with throttling and debouncing
  useEffect(() => {
    // Don't save cart if auth is not ready
    if (!auth) {
      return;
    }

    const saveCart = async () => {
      if (!user) {
        // שמירה זמנית ב-cookies
        setDataWithTimestamp('temp_cart', cartItems, 24 * 60 * 60 * 1000); // 24 שעות
        return;
      }

      // Check if we're already saving
      if (isSavingRef.current) {
        return;
      }

      // Check rate limiting - minimum 10 seconds between saves
      const now = Date.now();
      const timeSinceLastSave = now - lastSaveTimeRef.current;
      if (timeSinceLastSave < 10000) {
        return;
      }

      isSavingRef.current = true;
      lastSaveTimeRef.current = now;

      try {
        const { error } = await supabase.auth.updateUser({
          data: { cart: JSON.stringify(cartItems) }
        });
        if (error) {
          console.error('Error saving cart to user metadata:', error);
          // If rate limited, wait longer before next save
          if (error.message?.includes('rate limit') || error.message?.includes('429')) {
            lastSaveTimeRef.current = now + 10000; // Wait 10 seconds
          }
        }
      } catch (error) {
        console.error('Error updating user metadata:', error);
        // If rate limited, wait longer before next save
        if (error instanceof Error && (error.message?.includes('rate limit') || error.message?.includes('429'))) {
          lastSaveTimeRef.current = now + 10000; // Wait 10 seconds
        }
      } finally {
        isSavingRef.current = false;
      }
    };

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce the save operation - wait 5 seconds after last change
    saveTimeoutRef.current = setTimeout(saveCart, 5000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [cartItems, user, auth]);

  const clearCart = useCallback(() => {
    setCartItems([]);
    // ניקוי מה-cookies
    // Note: Cookies will be cleared automatically when expired
    
    // Clear any pending save operations
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
  }, []);

  // האזנה לשינויים ב-auth state כדי לסנכרן את הסל
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        // ניקוי הסל בזמן התנתקות
        clearCart();
      } else if (event === 'SIGNED_IN' && session?.user) {
        // העברת סל מ-cookies ל-user metadata
        const sessionCart = getDataWithTimestamp<CartItem[]>('temp_cart', 24 * 60 * 60 * 1000);
        if (sessionCart) {
          setCartItems(sessionCart);
          
          // שמירה ב-user metadata עם delay למניעת rate limiting
          setTimeout(async () => {
            try {
              await supabase.auth.updateUser({
                data: { cart: JSON.stringify(sessionCart) }
              });
              // Note: Cookies will be cleared automatically when expired
            } catch (error) {
              console.error('Error saving cart after sign in:', error);
              // Keep in cookies if save fails
            }
          }, 10000); // Wait 10 seconds before saving
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [clearCart]);

  const cartCount = Array.isArray(cartItems) ? cartItems.reduce((total, item) => total + item.quantity, 0) : 0;

  const addToCart = (product: Product, quantity: number, size?: string, color?: string) => {
    setCartItems(prev => {
      const currentItems = Array.isArray(prev) ? prev : [];
      const existingItem = currentItems.find(item => 
        item.product.id === product.id && 
        item.size === size && 
        item.color === color
      );

      if (existingItem) {
        // Update existing item quantity
        return currentItems.map(item =>
          item.product.id === product.id && 
          item.size === size && 
          item.color === color
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Add new item
        return [...currentItems, { product, quantity, size, color }];
      }
    });
  };

  const removeFromCart = (productId: number) => {
    setCartItems(prev => {
      const currentItems = Array.isArray(prev) ? prev : [];
      return currentItems.filter(item => item.product.id !== productId);
    });
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems(prev => {
      const currentItems = Array.isArray(prev) ? prev : [];
      return currentItems.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      );
    });
  };

  const getCartTotal = () => {
    return Array.isArray(cartItems) ? cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0) : 0;
  };

  const value: CartContextType = {
    cartItems,
    cartCount,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}; 