import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { apiService, clearSessionCache } from '../lib/api';

interface AdminData {
  overview: any;
  classes: any[];
  registrations: any[];
  sessions: any[];
  session_classes: any[];
  products: any[];
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
  fetchShop: () => Promise<void>;
  fetchContact: () => Promise<void>;
  fetchCalendar: () => Promise<void>;
  fetchProfiles: () => Promise<void>;
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
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Debounce timeout
  const fetchFunctionsRef = useRef<{
    fetchOverview: () => Promise<void>;
    fetchClasses: () => Promise<void>;
    fetchShop: () => Promise<void>;
    fetchContact: () => Promise<void>;
    fetchProfiles: () => Promise<void>;
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

  // Retry logic with exponential backoff
  const retryWithBackoff = useCallback(async (fetchFunction: () => Promise<any>, maxRetries: number = 3) => {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const result = await fetchFunction();
        if (attempt > 0) {
          setError(`הנתונים נטענו בהצלחה לאחר ${attempt + 1} ניסיונות!`);
          setTimeout(() => setError(null), 3000); // Clear success message after 3 seconds
        }
        return result;
      } catch (error: any) {
        if (error.message.includes('429') && attempt < maxRetries - 1) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff: 1s, 2s, 4s
          setError(`השרת עמוס, מנסה שוב בעוד ${delay/1000} שניות... (ניסיון ${attempt + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        throw error;
      }
    }
  }, []);

  // טעינת נתוני שיעורים
  const fetchClasses = useCallback(async (forceRefresh = false) => {
    if (!session) {
      console.log('fetchClasses: No session available');
      return;
    }
    if (isRateLimited()) {
      setError('יותר מדי בקשות. אנא המתן דקה ונסה שוב, או לחצי על "איפוס הגבלה".');
      return;
    }
    if (!forceRefresh && dataRef.current.classes.length > 0 && isDataFresh()) {
      console.log('fetchClasses: Using cached data');
      return;
    }

    console.log('fetchClasses: Starting to fetch data...');
    isFetchingRef.current = true;
    setIsFetching(true);
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('fetchClasses: Making API calls...');
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
      
      console.log('fetchClasses: API calls completed:', {
        classes: classes?.length || 0,
        registrations: registrations?.length || 0,
        sessions: sessions?.length || 0,
        session_classes: session_classes?.length || 0
      });
      
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

  // Debounced version of fetchClasses
  const debouncedFetchClasses = useCallback(async () => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(async () => {
      await fetchClasses();
    }, 300); // 300ms debounce
  }, [fetchClasses]);

  // טעינת נתוני חנות
  const fetchShop = useCallback(async () => {
    if (!session || isFetchingRef.current) {
      console.log('fetchShop: No session or already fetching');
      return;
    }
    if (isRateLimited()) {
      setError('יותר מדי בקשות. אנא המתן דקה ונסה שוב, או לחצי על "איפוס הגבלה".');
      return;
    }
    if (dataRef.current.products.length > 0 && isDataFresh()) {
      console.log('fetchShop: Using cached data');
      return;
    }

    console.log('fetchShop: Starting to fetch shop data...');
    isFetchingRef.current = true;
    setIsFetching(true);
    setIsLoading(true);
    setError(null);
    
    try {
      // אין כרגע apiService.shop, נחזיר מערכים ריקים
      console.log('fetchShop: Setting empty shop data');
      setData(prev => ({
        ...prev,
        products: [],
        orders: [],
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
  const fetchContact = useCallback(async () => {
    if (!session || isFetchingRef.current) {
      console.log('fetchContact: No session or already fetching');
      return;
    }
    if (isRateLimited()) {
      setError('יותר מדי בקשות. אנא המתן דקה ונסה שוב, או לחצי על "איפוס הגבלה".');
      return;
    }
    if (dataRef.current.messages.length > 0 && isDataFresh()) {
      console.log('fetchContact: Using cached data');
      return;
    }

    console.log('fetchContact: Starting to fetch contact data...');
    isFetchingRef.current = true;
    setIsFetching(true);
    setIsLoading(true);
    setError(null);
    
    try {
      // אין כרגע apiService.contact, נחזיר מערך ריק
      console.log('fetchContact: Setting empty contact data');
      setData(prev => ({
        ...prev,
        messages: [],
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
  const fetchProfiles = useCallback(async () => {
    if (!session || isFetchingRef.current) return;
    if (isRateLimited()) {
      setError('יותר מדי בקשות. אנא המתן דקה ונסה שוב, או לחצי על "איפוס הגבלה".');
      return;
    }
    if (dataRef.current.profiles && isDataFresh()) return;

    isFetchingRef.current = true;
    setIsFetching(true);
    setIsLoading(true);
    setError(null);
    try {
      const profiles = await apiService.admin.getProfiles();
      setData(prev => ({
        ...prev,
        profiles: profiles || [],
        lastFetchTime: Date.now()
      }));
      setError(null);
    } catch (error) {
      console.error('fetchProfiles: Error:', error);
      setError(error instanceof Error ? error.message : 'שגיאה בטעינת נתונים');
    } finally {
      setIsLoading(false);
      setIsFetching(false);
      isFetchingRef.current = false;
    }
  }, [session]);

  // טעינת נתוני סקירה כללית
  const fetchOverview = useCallback(async () => {
    if (!session) {
      console.log('fetchOverview: No session available');
      return;
    }
    if (isRateLimited()) {
      setError('יותר מדי בקשות. אנא המתן דקה ונסה שוב, או לחצי על "איפוס הגבלה".');
      return;
    }
    if (dataRef.current.overview && isDataFresh()) {
      console.log('fetchOverview: Using cached data');
      return;
    }

    console.log('fetchOverview: Starting to fetch overview...');
    isFetchingRef.current = true;
    setIsFetching(true);
    setIsLoading(true);
    setError(null);
    
    try {
      const overview = await apiService.admin.getOverview().catch(error => {
        console.error('fetchOverview: Error fetching overview:', error);
        return { totalClasses: 0, totalRegistrations: 0, totalSessions: 0 };
      });
      
      console.log('fetchOverview: Overview data received:', overview);
      
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
    console.log('AdminDataContext: useEffect triggered', {
      session: !!session,
      globalHasInitialized: globalHasInitializedRef.current,
      fetchFunctionsRef: !!fetchFunctionsRef.current
    });
    
    if (!session) {
      console.log('AdminDataContext: No session, returning');
      return;
    }
    
    // טען נתונים רק אם אין נתונים קיימים
    if (!globalHasInitializedRef.current && fetchFunctionsRef.current) {
      console.log('AdminDataContext: Starting initial data fetch');
      globalHasInitializedRef.current = true;
      
      // טען נתונים עם timeout כדי למנוע blocking
      setTimeout(() => {
        if (fetchFunctionsRef.current) {
          console.log('AdminDataContext: Executing fetch functions');
          fetchFunctionsRef.current.fetchOverview();
          fetchFunctionsRef.current.fetchClasses();
          fetchFunctionsRef.current.fetchShop();
          fetchFunctionsRef.current.fetchContact();
          fetchFunctionsRef.current.fetchProfiles();
        }
      }, 100);
    } else {
      console.log('AdminDataContext: Skipping initial fetch', {
        globalHasInitialized: globalHasInitializedRef.current,
        fetchFunctionsRef: !!fetchFunctionsRef.current
      });
    }
  }, [session]);

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