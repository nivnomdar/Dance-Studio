import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Product } from '../types/product';
import { CartItem, CartContextType, CartProviderProps } from '../types/cart';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

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
  const { user } = useAuth();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveTimeRef = useRef<number>(0);
  const isSavingRef = useRef<boolean>(false);

  // Load cart from Supabase user metadata on mount
  useEffect(() => {
    const loadCart = async () => {
      if (user) {
        // נסה לטעון מהמשתמש המחובר
        const userCart = user.user_metadata?.cart;
        if (userCart) {
          try {
            setCartItems(JSON.parse(userCart));
          } catch (error) {
            console.error('Error loading cart from user metadata:', error);
          }
        }
      } else {
        // אם אין משתמש, נסה לטעון מ-session storage (זמני)
        const sessionCart = sessionStorage.getItem('temp_cart');
        if (sessionCart) {
          try {
            setCartItems(JSON.parse(sessionCart));
          } catch (error) {
            console.error('Error loading cart from session storage:', error);
          }
        }
      }
    };

    loadCart();
  }, [user]);

  // Save cart to Supabase user metadata with throttling and debouncing
  useEffect(() => {
    const saveCart = async () => {
      if (!user) {
        // שמירה זמנית ב-session storage
        sessionStorage.setItem('temp_cart', JSON.stringify(cartItems));
        return;
      }

      // Check if we're already saving
      if (isSavingRef.current) {
        return;
      }

      // Check rate limiting - minimum 5 seconds between saves
      const now = Date.now();
      const timeSinceLastSave = now - lastSaveTimeRef.current;
      if (timeSinceLastSave < 5000) {
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

    // Debounce the save operation - wait 3 seconds after last change
    saveTimeoutRef.current = setTimeout(saveCart, 3000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [cartItems, user]);

  const clearCart = useCallback(() => {
    setCartItems([]);
    // ניקוי מה-session storage
    sessionStorage.removeItem('temp_cart');
    
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
        // העברת סל מ-session storage ל-user metadata
        const sessionCart = sessionStorage.getItem('temp_cart');
        if (sessionCart) {
          try {
            const cartData = JSON.parse(sessionCart);
            setCartItems(cartData);
            
            // שמירה ב-user metadata עם delay למניעת rate limiting
            setTimeout(async () => {
              try {
                await supabase.auth.updateUser({
                  data: { cart: sessionCart }
                });
                // ניקוי מ-session storage רק אחרי שמירה מוצלחת
                sessionStorage.removeItem('temp_cart');
              } catch (error) {
                console.error('Error saving cart after sign in:', error);
                // Keep in session storage if save fails
              }
            }, 5000); // Wait 5 seconds before saving
            
          } catch (error) {
            console.error('Error transferring cart from session to user metadata:', error);
          }
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [clearCart]);

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const addToCart = (product: Product, quantity: number, size?: string, color?: string) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => 
        item.product.id === product.id && 
        item.size === size && 
        item.color === color
      );

      if (existingItem) {
        // Update existing item quantity
        return prev.map(item =>
          item.product.id === product.id && 
          item.size === size && 
          item.color === color
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Add new item
        return [...prev, { product, quantity, size, color }];
      }
    });
  };

  const removeFromCart = (productId: number) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems(prev =>
      prev.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
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