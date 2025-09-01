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
  const auth = useAuth();
  const user = auth?.user;
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveTimeRef = useRef<number>(0);
  const isSavingRef = useRef<boolean>(false);
  // const isMounted = useRef<boolean>(true); // Remove this ref

  // useEffect(() => {
  //   isMounted.current = true;
  //   return () => { isMounted.current = false; };
  // }, []);

  // If auth is not ready, show children without cart functionality
  if (!auth) {
    return <>{children}</>;
  }

  // Load cart from Supabase user metadata on mount
  useEffect(() => {
    // Don't load cart if auth is not ready
    if (!auth) { // || !isMounted.current // Removed isMounted check
      return;
    }

    const loadCart = async () => {
      // console.log('CartContext: Attempting to load cart'); // Remove log
      if (user) {
        // נסה לטעון מהמשתמש המחובר
        const userCart = user.user_metadata?.cart;
        if (userCart) {
          try {
            const parsedCart = JSON.parse(userCart);
            if (Array.isArray(parsedCart)) {
              setCartItems(parsedCart);
              // console.log('CartContext: Loaded cart from user metadata.', parsedCart); // Remove log
            } else {
              console.warn('User cart is not an array, resetting to empty array');
              setCartItems([]);
            }
          } catch (error) {
            console.error('Error loading cart from user metadata:', error);
            setCartItems([]);
          }
        } else {
          // console.log('CartContext: No cart found in user metadata.'); // Remove log
          setCartItems([]);
        }
      } else {
        // אם אין משתמש, נסה לטעון מ-cookies (זמני)
        const sessionCart = getDataWithTimestamp<CartItem[]>('temp_cart', 24 * 60 * 60 * 1000); // 24 שעות
        if (sessionCart && Array.isArray(sessionCart)) {
          setCartItems(sessionCart);
          // console.log('CartContext: Loaded cart from cookies.', sessionCart); // Remove log
        } else {
          // console.log('CartContext: No cart found in cookies.'); // Remove log
          setCartItems([]);
        }
      }
    };

    loadCart();
  }, [user, auth]); // Removed isMounted from dependency array

  // Save cart to Supabase user metadata with throttling and debouncing
  useEffect(() => {
    // Don't save cart if auth is not ready
    if (!auth) { // || !isMounted.current // Removed isMounted check
      return;
    }

    const saveCart = async () => {
      // console.log('CartContext: saveCart triggered.'); // Remove log
      if (!user) {
        // console.log('CartContext: No user, saving cart to cookies.'); // Remove log
        setDataWithTimestamp('temp_cart', cartItems, 24 * 60 * 60 * 1000); // 24 שעות
        return;
      }

      // Check if we're already saving
      if (isSavingRef.current) {
        // console.log('CartContext: Already saving, skipping.'); // Remove log
        return;
      }

      // Check rate limiting
      const now = Date.now();
      const timeSinceLastSave = now - lastSaveTimeRef.current;
      if (timeSinceLastSave < RATE_LIMIT_DELAY) {
        // console.log(`CartContext: Rate limited. Last save ${timeSinceLastSave}ms ago. Skipping.`); // Remove log
        return;
      }

      isSavingRef.current = true;
      lastSaveTimeRef.current = now; // Update last save time immediately before starting the request
      // console.log('CartContext: Performing actual cart save to Supabase.'); // Remove log

      try {
        const { error } = await supabase.auth.updateUser({
          data: { cart: JSON.stringify(cartItems) }
        });
        if (error) {
          console.error('Error saving cart to user metadata:', error);
          // If rate limited, wait longer before next save
          if (error.message?.includes('rate limit') || error.message?.includes('429')) {
            // console.warn('CartContext: Supabase rate limit hit. Extending next save delay.'); // Remove log
            // Double the rate limit delay if hit, up to a max
            lastSaveTimeRef.current = now + RATE_LIMIT_DELAY; // Revert to original delay logic
          }
        } else {
          // console.log('CartContext: Cart saved successfully to user metadata.'); // Remove log
        }
      } catch (error) {
        console.error('Error updating user metadata:', error);
        if (error instanceof Error && (error.message?.includes('rate limit') || error.message?.includes('429'))) {
          // console.warn('CartContext: Supabase rate limit hit (catch). Extending next save delay.'); // Remove log
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
  }, [cartItems, user, auth]); // Removed isMounted from dependency array

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
              // if (isMounted.current) { // Removed isMounted check
                await supabase.auth.updateUser({
                  data: { cart: JSON.stringify(sessionCart) }
                });
                // console.log('CartContext: Cart saved after sign in from cookies to user metadata.'); // Remove log
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
  }, [clearCart]); // Removed isMounted from dependency array

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