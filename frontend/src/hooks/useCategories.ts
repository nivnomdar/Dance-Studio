import { useState, useEffect, useCallback, useRef } from 'react';
import { apiService } from '../lib/api';

interface UseCategoriesOptions {
  skip?: boolean;
}

interface UseCategoriesReturn {
  categories: any[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Global cache for categories
const categoriesCache = new Map<string, { data: any[]; timestamp: number; ttl: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

export const useCategories = (options: UseCategoriesOptions = {}): UseCategoriesReturn => {
  const { skip = false } = options;
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const cacheKey = 'categories';

  const getCachedCategories = useCallback(() => {
    const cached = categoriesCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    return null;
  }, []);

  const setCachedCategories = useCallback((data: any[]) => {
    categoriesCache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      ttl: CACHE_TTL
    });
  }, []);

  const fetchCategories = useCallback(async () => {
    if (skip) return;

    // Check cache first
    const cached = getCachedCategories();
    if (cached) {
      setCategories(cached);
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
      const data = await apiService.shop.getCategories();
      
      // Check if request was cancelled
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      const categoriesArray = Array.isArray(data) ? data : [];
      setCategories(categoriesArray);
      setCachedCategories(categoriesArray);
    } catch (err) {
      // Check if request was cancelled
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch categories';
      setError(errorMessage);
      console.error('useCategories error:', err);
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setLoading(false);
      }
    }
  }, [skip, getCachedCategories, setCachedCategories]);

  const refetch = useCallback(async () => {
    // Clear cache for this key
    categoriesCache.delete(cacheKey);
    await fetchCategories();
  }, [cacheKey, fetchCategories]);

  useEffect(() => {
    fetchCategories();

    return () => {
      // Cleanup: abort any pending request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    refetch
  };
};
