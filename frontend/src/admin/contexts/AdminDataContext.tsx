import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { apiService, clearSessionCache } from '../../lib/api';

interface AdminData {
  overview: any;
  classes: any[];
  registrations: any[];
  sessions: any[];
  session_classes: any[];
  products: any[];
  categories: any[];
  orders: any[];
  messages: any[];
  calendar: any;
  profiles: any[];
  lastFetchTime: number;
}

interface AdminDataContextType {
  data: AdminData;
  isLoading: boolean;
  error: string | null;
  fetchOverview: () => Promise<void>;
  fetchClasses: (forceRefresh?: boolean) => Promise<void>;
  fetchShop: (forceRefresh?: boolean) => Promise<void>;
  fetchContact: (forceRefresh?: boolean) => Promise<void>;
  fetchCalendar: () => Promise<void>;
  fetchProfiles: (search?: string) => Promise<any[]>;
  clearCache: () => void;
  resetRateLimit: () => void;
  isFetching: boolean;
}

const AdminDataContext = createContext<AdminDataContextType | undefined>(undefined);

export const useAdminData = () => {
  const context = useContext(AdminDataContext);
  if (!context) {
    throw new Error('useAdminData must be used within an AdminDataProvider');
  }
  return context;
};

interface AdminDataProviderProps {
  children: React.ReactNode;
}

export const AdminDataProvider: React.FC<AdminDataProviderProps> = ({ children }) => {
  const { session } = useAuth();
  const [data, setData] = useState<AdminData>({
    overview: null,
    classes: [],
    registrations: [],
    sessions: [],
    session_classes: [],
    products: [],
    categories: [],
    orders: [],
    messages: [],
    calendar: null,
    profiles: [],
    lastFetchTime: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  
  // Refs to prevent multiple simultaneous requests
  const isFetchingRef = useRef(false);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastRequestTimeRef = useRef<number>(0);
  const requestCountRef = useRef<number>(0);
  const dataRef = useRef(data);
  const lastUserIdRef = useRef<string | null>(null);
  const globalHasInitializedRef = useRef<boolean>(false); // Global flag to prevent multiple initializations
  // removed unused debounceTimeoutRef to avoid linter warnings
  const fetchFunctionsRef = useRef<{
    fetchOverview: () => Promise<void>;
    fetchClasses: () => Promise<void>;
    fetchShop: () => Promise<void>;
    fetchContact: () => Promise<void>;
    fetchProfiles: (search?: string) => Promise<any[]>;
  } | null>(null);

  // Update ref when data changes
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // Initialize lastUserIdRef on first load
  useEffect(() => {
    if (!lastUserIdRef.current && session?.user?.id) {
      lastUserIdRef.current = session.user.id;
    }
  }, [session?.user?.id]);

  // Log when data changes (only when it actually changes)
  useEffect(() => {
    // Data loaded successfully
  }, [data]);

  // Rate limiting: max 20 requests per minute (יותר נדיב)
  const isRateLimited = () => {
    const now = Date.now();
    const oneMinute = 60 * 1000;
    
    if (now - lastRequestTimeRef.current > oneMinute) {
      requestCountRef.current = 0;
      lastRequestTimeRef.current = now;
    }
    
    if (requestCountRef.current >= 20) { // הגדלתי מ-10 ל-20
      return true;
    }
    
    requestCountRef.current++;
    return false;
  };

  // Reset rate limiting
  const resetRateLimit = () => {
    requestCountRef.current = 0;
    lastRequestTimeRef.current = 0;
    setError(null);
  };

  // Check if data is fresh (less than 5 minutes old)
  const isDataFresh = () => {
    const isFresh = Date.now() - dataRef.current.lastFetchTime < 5 * 60 * 1000; // 5 minutes
    return isFresh;
  };

  // (unused) retryWithBackoff removed to avoid linter warnings

  // טעינת נתוני שיעורים
  const fetchClasses = useCallback(async (forceRefresh = false) => {
    if (!session) {
      return;
    }
    if (isRateLimited()) {
      setError('יותר מדי בקשות. אנא המתן דקה ונסה שוב, או לחצי על "איפוס הגבלה".');
      return;
    }
    if (!forceRefresh && dataRef.current.classes.length > 0 && isDataFresh()) {
      return;
    }

    isFetchingRef.current = true;
    setIsFetching(true);
    setIsLoading(true);
    setError(null);
    
    try {
      const [classes, registrations, sessions, session_classes] = await Promise.all([
        apiService.admin.getClasses().catch(error => {
          console.error('fetchClasses: Error fetching classes:', error);
          return [];
        }),
        apiService.admin.getRegistrations().catch(error => {
          console.error('fetchClasses: Error fetching registrations:', error);
          return [];
        }),
        apiService.admin.getSessions().catch(error => {
          console.error('fetchClasses: Error fetching sessions:', error);
          return [];
        }),
        apiService.sessions.getSessionClasses().catch(error => {
          console.error('fetchClasses: Error fetching session classes:', error);
          return [];
        })
      ]);
      
      // ודא שתמיד מחזירים מבנה מלא
      setData(prev => {
        const newData = {
          ...prev,
          classes: classes || [],
          registrations: registrations || [],
          sessions: sessions || [],
          session_classes: session_classes || [],
          lastFetchTime: Date.now()
        };
        return newData;
      });
      globalHasInitializedRef.current = true; // Mark as initialized
      setError(null);
    } catch (error) {
      console.error('fetchClasses: General error:', error);
      setError(error instanceof Error ? error.message : 'שגיאה בטעינת נתונים');
    } finally {
      setIsLoading(false);
      setIsFetching(false);
      isFetchingRef.current = false;
    }
  }, [session]);

  // (unused) debouncedFetchClasses removed to avoid linter warnings

  // טעינת נתוני חנות
  const fetchShop = useCallback(async (forceRefresh: boolean = false) => {
    if (!session || isFetchingRef.current) {
      return;
    }
    if (isRateLimited()) {
      setError('יותר מדי בקשות. אנא המתן דקה ונסה שוב, או לחצי על "איפוס הגבלה".');
      return;
    }
    if (!forceRefresh && dataRef.current.products.length > 0 && isDataFresh()) {
      return;
    }

    isFetchingRef.current = true;
    setIsFetching(true);
    setIsLoading(true);
    setError(null);
    
    try {
      const [categories, products] = await Promise.all([
        apiService.shop.getCategoriesAdmin(),
        apiService.shop.getProducts()
      ]);
      setData(prev => ({
        ...prev,
        categories: categories || [],
        products: products || [],
        orders: prev.orders || [],
        lastFetchTime: Date.now()
      }));
      setError(null);
    } catch (error) {
      console.error('fetchShop: Error:', error);
      setError(error instanceof Error ? error.message : 'שגיאה בטעינת נתונים');
    } finally {
      setIsLoading(false);
      setIsFetching(false);
      isFetchingRef.current = false;
    }
  }, [session]);

  // טעינת נתוני צור קשר
  const fetchContact = useCallback(async (forceRefresh: boolean = false) => {
    if (!session || isFetchingRef.current) {
      return;
    }
    if (isRateLimited()) {
      setError('יותר מדי בקשות. אנא המתן דקה ונסה שוב, או לחצי על "איפוס הגבלה".');
      return;
    }
    if (!forceRefresh && dataRef.current.messages.length > 0 && isDataFresh()) {
      return;
    }

    isFetchingRef.current = true;
    setIsFetching(true);
    setIsLoading(true);
    setError(null);
    
    try {
      const messages = await apiService.contact.getMessages();
      setData(prev => ({
        ...prev,
        messages: messages || [],
        lastFetchTime: Date.now()
      }));
      setError(null);
    } catch (error) {
      console.error('fetchContact: Error:', error);
      setError(error instanceof Error ? error.message : 'שגיאה בטעינת נתונים');
    } finally {
      setIsLoading(false);
      setIsFetching(false);
      isFetchingRef.current = false;
    }
  }, [session]);

  // טעינת נתוני לוח שנה
  const fetchCalendar = useCallback(async () => {
    if (!session || isFetchingRef.current) return;
    if (isRateLimited()) {
      setError('יותר מדי בקשות. אנא המתן דקה ונסה שוב, או לחצי על "איפוס הגבלה".');
      return;
    }
    if (dataRef.current.calendar && isDataFresh()) return;

    isFetchingRef.current = true;
    setIsFetching(true);
    setIsLoading(true);
    setError(null);
    try {
      const calendar = await apiService.admin.getCalendar();
      setData(prev => ({
        ...prev,
        calendar: calendar || {},
        lastFetchTime: Date.now()
      }));
      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'שגיאה בטעינת נתונים');
    } finally {
      setIsLoading(false);
      setIsFetching(false);
      isFetchingRef.current = false;
    }
  }, [session]);

  // טעינת נתוני משתמשים
  const fetchProfiles = useCallback(async (search?: string) => {
    if (!session || isFetchingRef.current) return [];
    if (isRateLimited()) {
      setError('יותר מדי בקשות. אנא המתן דקה ונסה שוב, או לחצי על "איפוס הגבלה".');
      return [];
    }
    // Only use cache if no search term is provided
    if (!search && dataRef.current.profiles && isDataFresh()) return dataRef.current.profiles;

    isFetchingRef.current = true;
    setIsFetching(true);
    setIsLoading(true);
    setError(null);
    try {
      const profiles = await apiService.admin.getProfiles(search);
      if (!search) {
        setData(prev => ({
          ...prev,
          profiles: profiles || [],
          lastFetchTime: Date.now()
        }));
      }
      setError(null);
      return profiles || [];
    } catch (error) {
      console.error('fetchProfiles: Error:', error);
      setError(error instanceof Error ? error.message : 'שגיאה בטעינת נתונים');
      return [];
    } finally {
      setIsLoading(false);
      setIsFetching(false);
      isFetchingRef.current = false;
    }
  }, [session]);

  // טעינת נתוני סקירה כללית
  const fetchOverview = useCallback(async () => {
    if (!session) {
      return;
    }
    if (isRateLimited()) {
      setError('יותר מדי בקשות. אנא המתן דקה ונסה שוב, או לחצי על "איפוס הגבלה".');
      return;
    }
    if (dataRef.current.overview && isDataFresh()) {
      return;
    }

    isFetchingRef.current = true;
    setIsFetching(true);
    setIsLoading(true);
    setError(null);
    
    try {
      const overview = await apiService.admin.getOverview().catch(error => {
        console.error('fetchOverview: Error fetching overview:', error);
        return { totalClasses: 0, totalRegistrations: 0, totalSessions: 0 };
      });
      

      
      // ודא שתמיד מחזירים מבנה מלא
      setData(prev => {
        const newData = {
          ...prev,
          overview: overview || {},
          lastFetchTime: Date.now()
        };
        return newData;
      });
      setError(null);
    } catch (error) {
      console.error('fetchOverview: General error:', error);
      setError(error instanceof Error ? error.message : 'שגיאה בטעינת נתונים');
    } finally {
      setIsLoading(false);
      setIsFetching(false);
      isFetchingRef.current = false;
    }
  }, [session]);

  // ניקוי cache
  const clearCache = () => {
    setData({
      overview: null,
      classes: [],
      registrations: [],
      sessions: [],
      session_classes: [],
      products: [],
      categories: [],
      orders: [],
      messages: [],
      calendar: null,
      profiles: [],
      lastFetchTime: 0
    });
    // אפס את כל ה-refs כדי לאפשר טעינה מחדש רק אם זה החלפת משתמש
    const currentUserId = session?.user?.id;
    if (currentUserId !== lastUserIdRef.current) {
      isFetchingRef.current = false;
      requestCountRef.current = 0;
      lastRequestTimeRef.current = 0;
      globalHasInitializedRef.current = false; // Reset global flag only on user change
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
        fetchTimeoutRef.current = null;
      }
    }
  };

  // Update fetch functions ref when they change
  useEffect(() => {
    fetchFunctionsRef.current = {
      fetchOverview,
      fetchClasses,
      fetchShop,
      fetchContact,
      fetchProfiles
    };
      }, [fetchOverview, fetchClasses, fetchShop, fetchContact, fetchProfiles]);

  // טעינת נתונים ראשונית כשהדשבורד נטען
  useEffect(() => {
    if (!session) {
      return;
    }
    // טען נתונים רק אם אין נתונים קיימים
    if (!globalHasInitializedRef.current && fetchFunctionsRef.current) {
      globalHasInitializedRef.current = true;
      // טען נתונים עם timeout כדי למנוע blocking
      setTimeout(() => {
        if (fetchFunctionsRef.current) {
          fetchFunctionsRef.current.fetchOverview();
          fetchFunctionsRef.current.fetchClasses();
          fetchFunctionsRef.current.fetchShop();
          fetchFunctionsRef.current.fetchContact();
          // קריאה לאתחול ראשוני בלבד, לא חיפוש
          fetchProfiles();
        }
      }, 100);
    }
  }, [session, fetchProfiles]);

  // רענון נתונים כל 5 דקות
  useEffect(() => {
    if (!session) return;

    const interval = setInterval(() => {
      // רענן רק אם יש נתונים קיימים
      if (dataRef.current.overview || dataRef.current.classes.length > 0 || dataRef.current.products.length > 0 || dataRef.current.messages.length > 0) {
        fetchOverview();
        fetchClasses();
        fetchShop();
        fetchContact();
      }
    }, 5 * 60 * 1000); // 5 דקות

    return () => clearInterval(interval);
  }, [session, fetchOverview, fetchClasses, fetchShop, fetchContact]);

  // ניקוי cache כשהמשתמש מתחלף
  useEffect(() => {
    const currentUserId = session?.user?.id;
    if (currentUserId !== lastUserIdRef.current) {
      clearCache();
      clearSessionCache(); // נקה גם את session cache
      lastUserIdRef.current = currentUserId || null;
    }
  }, [session?.user?.id]);

  // Listen for refresh admin data event
  useEffect(() => {
    const handleRefreshAdminData = () => {
      fetchClasses(true); // Force refresh
    };

    window.addEventListener('refreshAdminData', handleRefreshAdminData);
    
    return () => {
      window.removeEventListener('refreshAdminData', handleRefreshAdminData);
    };
  }, [fetchClasses]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, []);

  const value: AdminDataContextType = {
    data,
    isLoading,
    error,
    fetchOverview,
    fetchClasses, // Use regular version for direct calls
    fetchShop,
    fetchContact,
    fetchCalendar,
    fetchProfiles,
    clearCache,
    resetRateLimit,
    isFetching: isFetching
  };

  return (
    <AdminDataContext.Provider value={value}>
      {children}
    </AdminDataContext.Provider>
  );
};