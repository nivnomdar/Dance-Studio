import { useState, useEffect, useCallback, useRef } from 'react';
import { apiService } from '../lib/api';

interface UseProductsOptions {
  category_id?: string;
  skip?: boolean;
}

interface UseProductsReturn {
  products: any[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Global cache for products
const productsCache = new Map<string, { data: any[]; timestamp: number; ttl: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const useProducts = (options: UseProductsOptions = {}): UseProductsReturn => {
  const { category_id, skip = false } = options;
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const cacheKey = `products${category_id ? `_${category_id}` : ''}`;

  const getCachedProducts = useCallback(() => {
    const cached = productsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    return null;
  }, [cacheKey]);

  const setCachedProducts = useCallback((data: any[]) => {
    productsCache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      ttl: CACHE_TTL
    });
  }, [cacheKey]);

  const fetchProducts = useCallback(async () => {
    if (skip) return;

    // Check cache first
    const cached = getCachedProducts();
    if (cached) {
      setProducts(cached);
      return;
    }

    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const data = await apiService.shop.getProducts({ category_id });
      
      // Check if request was cancelled
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      const productsArray = Array.isArray(data) ? data : [];
      setProducts(productsArray);
      setCachedProducts(productsArray);
    } catch (err) {
      // Check if request was cancelled
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch products';
      setError(errorMessage);
      console.error('useProducts error:', err);
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setLoading(false);
      }
    }
  }, [category_id, skip, getCachedProducts, setCachedProducts]);

  const refetch = useCallback(async () => {
    // Clear cache for this key
    productsCache.delete(cacheKey);
    await fetchProducts();
  }, [cacheKey, fetchProducts]);

  useEffect(() => {
    fetchProducts();

    return () => {
      // Cleanup: abort any pending request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    refetch
  };
};
