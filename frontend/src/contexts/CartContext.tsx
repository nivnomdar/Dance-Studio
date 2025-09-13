import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Product } from '../types/product';
import { CartItem, CartContextType, CartProviderProps } from '../types/cart';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import {
  setDataWithTimestamp,
  getDataWithTimestamp,
  // hasCookie // No longer used, can be removed if not used elsewhere
} from '../utils/cookieManager';

const CartContext = createContext<CartContextType | undefined>(undefined);

// Original delays from the base code
const DEBOUNCE_DELAY = 5000; // milliseconds to wait after last cart change before attempting to save
const RATE_LIMIT_DELAY = 10000; // minimum milliseconds between actual save calls to Supabase

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { user, loading: authLoading, session } = useAuth(); // Destructure directly
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveTimeRef = useRef<number>(0);
  const isSavingRef = useRef<boolean>(false);
  // const isMounted = useRef<boolean>(true); // Remove this ref

  // useEffect(() => {
  //   isMounted.current = true;
  //   return () => { isMounted.current = false; };
  // }, []);

  // Load cart from Supabase user metadata on mount
  useEffect(() => {
    // Don't load cart if auth is not ready or user is not available
    if (authLoading || !user) {
      return;
    }

    const loadCart = async () => {
      // 
      if (user) {
        // נסה לטעון מהמשתמש המחובר
        const userCart = user.user_metadata?.cart;
        if (userCart) {
          try {
            const parsedCart = JSON.parse(userCart);
            if (Array.isArray(parsedCart)) {
              setCartItems(parsedCart);
              // 
            } else {
              console.warn('User cart is not an array, resetting to empty array');
              setCartItems([]);
            }
          } catch (error) {
            console.error('Error loading cart from user metadata:', error);
            setCartItems([]);
          }
        } else {
          // 
          setCartItems([]);
        }
      } else {
        // אם אין משתמש, נסה לטעון מ-cookies (זמני)
        const sessionCart = getDataWithTimestamp<CartItem[]>('temp_cart', 24 * 60 * 60 * 1000); // 24 שעות
        if (sessionCart && Array.isArray(sessionCart)) {
          setCartItems(sessionCart);
          // 
        } else {
          // 
          setCartItems([]);
        }
      }
    };

    loadCart();
  }, [user, authLoading, session]); // Add authLoading to dependencies

  // Save cart to Supabase user metadata with throttling and debouncing
  useEffect(() => {
    // Don't save cart if auth is not ready or user is not available
    if (authLoading || !user) {
      return;
    }

    const saveCart = async () => {
      // 
      if (!user) {
        // 
        setDataWithTimestamp('temp_cart', cartItems, 24 * 60 * 60 * 1000); // 24 שעות
        return;
      }

      // Check if we're already saving
      if (isSavingRef.current) {
        // 
        return;
      }

      // Check rate limiting
      const now = Date.now();
      const timeSinceLastSave = now - lastSaveTimeRef.current;
      if (timeSinceLastSave < RATE_LIMIT_DELAY) {
        // 
        return;
      }

      isSavingRef.current = true;
      lastSaveTimeRef.current = now; // Update last save time immediately before starting the request
      // 

      try {
        const { error } = await supabase.auth.updateUser({
          data: { cart: JSON.stringify(cartItems) }
        });
        if (error) {
          console.error('Error saving cart to user metadata:', error);
          // If rate limited, wait longer before next save
          if (error.message?.includes('rate limit') || error.message?.includes('429')) {
            // 
            // Double the rate limit delay if hit, up to a max
            lastSaveTimeRef.current = now + RATE_LIMIT_DELAY; // Revert to original delay logic
          }
        } else {
          // 
        }
      } catch (error) {
        console.error('Error updating user metadata:', error);
        if (error instanceof Error && (error.message?.includes('rate limit') || error.message?.includes('429'))) {
          // 
          lastSaveTimeRef.current = now + RATE_LIMIT_DELAY; // Revert to original delay logic
        }
      } finally {
        // if (isMounted.current) { // Removed isMounted check
          isSavingRef.current = false;
        // }
      }
    };

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce the save operation
    saveTimeoutRef.current = setTimeout(saveCart, DEBOUNCE_DELAY);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [cartItems, user, authLoading, session]); // Add authLoading to dependencies

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
    if (authLoading) { // Don't run if auth is still loading
      return;
    }
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
              // if (isMounted.current) { // Removed isMounted check
                await supabase.auth.updateUser({
                  data: { cart: JSON.stringify(sessionCart) }
                });
                // 
              // }
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
  }, [clearCart, user, session, authLoading]); // Add authLoading to dependencies

  const cartCount = Array.isArray(cartItems) ? cartItems.reduce((total, item) => total + item.quantity, 0) : 0;

  // Helper to generate a unique key for a cart item based on its unique attributes
  const getCartItemKey = (productId: number, size?: string, color?: string, heel_height?: string, sole_type?: string, materials?: string) => {
    return `${productId}-${size || 'no-size'}-${color || 'no-color'}-${heel_height || 'no-heel'}-${sole_type || 'no-sole'}-${materials || 'no-materials'}`;
  };

  const addToCart = (product: Product, quantity: number, size?: string, color?: string, heel_height?: string, sole_type?: string, materials?: string) => {
    setCartItems(prev => {
      const currentItems = Array.isArray(prev) ? prev : [];
      // Find existing item using a comprehensive key
      const newItemKey = getCartItemKey(product.id, size, color, heel_height, sole_type, materials);
      const existingItem = currentItems.find(item => 
        getCartItemKey(item.product.id, item.size, item.color, item.heel_height, item.sole_type, item.materials) === newItemKey
      );

      if (existingItem) {
        // Update existing item quantity
        return currentItems.map(item => {
          const itemKey = getCartItemKey(item.product.id, item.size, item.color, item.heel_height, item.sole_type, item.materials);
          return itemKey === newItemKey
            ? { ...item, quantity: item.quantity + quantity }
            : item;
        });
      } else {
        // Add new item with a key
        return [...currentItems, { product, quantity, size, color, heel_height, sole_type, materials }];
      }
    });
  };

  const removeFromCart = (itemKeyToRemove: string) => {
    setCartItems(prev => {
      const currentItems = Array.isArray(prev) ? prev : [];
      return currentItems.filter(item => getCartItemKey(item.product.id, item.size, item.color, item.heel_height, item.sole_type, item.materials) !== itemKeyToRemove);
    });
  };

  const updateQuantity = (itemKeyToUpdate: string, quantity: number) => {
    setCartItems(prev => {
      const currentItems = Array.isArray(prev) ? prev : [];
      
      if (quantity <= 0) {
        return currentItems.filter(item => getCartItemKey(item.product.id, item.size, item.color, item.heel_height, item.sole_type, item.materials) !== itemKeyToUpdate);
      }

      return currentItems.map(item => {
        const itemKey = getCartItemKey(item.product.id, item.size, item.color, item.heel_height, item.sole_type, item.materials);
        return itemKey === itemKeyToUpdate
          ? { ...item, quantity }
          : item;
      });
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
    getCartItemKey,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}; 