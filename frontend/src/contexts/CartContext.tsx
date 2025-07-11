import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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

  // Save cart to Supabase user metadata whenever it changes
  useEffect(() => {
    const saveCart = async () => {
      if (user) {
        // שמירה ב-user metadata
        try {
          const { error } = await supabase.auth.updateUser({
            data: { cart: JSON.stringify(cartItems) }
          });
          if (error) {
            console.error('Error saving cart to user metadata:', error);
          }
        } catch (error) {
          console.error('Error updating user metadata:', error);
        }
      } else {
        // שמירה זמנית ב-session storage
        sessionStorage.setItem('temp_cart', JSON.stringify(cartItems));
      }
    };

    saveCart();
  }, [cartItems, user]);

  const clearCart = useCallback(() => {
    setCartItems([]);
    // ניקוי מה-session storage
    sessionStorage.removeItem('temp_cart');
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
            
            // שמירה ב-user metadata
            await supabase.auth.updateUser({
              data: { cart: sessionCart }
            });
            
            // ניקוי מ-session storage
            sessionStorage.removeItem('temp_cart');
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