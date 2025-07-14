import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';

interface AdminData {
  overview: any;
  classes: any[];
  registrations: any[];
  products: any[];
  orders: any[];
  messages: any[];
  calendar: any;
  lastFetchTime: number;
}

interface AdminDataContextType {
  data: AdminData;
  isLoading: boolean;
  error: string | null;
  fetchOverview: () => Promise<void>;
  fetchClasses: () => Promise<void>;
  fetchShop: () => Promise<void>;
  fetchContact: () => Promise<void>;
  fetchCalendar: () => Promise<void>;
  clearCache: () => void;
  isFetching: boolean;
}

const AdminDataContext = createContext<AdminDataContextType | undefined>(undefined);

export const useAdminData = () => {
  const context = useContext(AdminDataContext);
  if (!context) {
    throw new Error('useAdminData must be used within AdminDataProvider');
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
    products: [],
    orders: [],
    messages: [],
    calendar: null,
    lastFetchTime: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isFetchingRef = useRef(false);

  // בדיקה אם הנתונים עדכניים (פחות מ-5 דקות)
  const isDataFresh = () => {
    return Date.now() - data.lastFetchTime < 5 * 60 * 1000; // 5 דקות
  };

  // טעינת סקירה כללית
  const fetchOverview = async () => {
    if (!session || isFetchingRef.current) return;
    
    // אם הנתונים עדכניים, אל תטען שוב
    if (data.overview && isDataFresh()) {
      return;
    }

    isFetchingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/classes/admin/overview`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const overviewData = await response.json();
      setData(prev => ({
        ...prev,
        overview: overviewData,
        lastFetchTime: Date.now()
      }));
    } catch (error) {
      console.error('Error fetching overview:', error);
      setError('שגיאה בטעינת נתונים');
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  };

  // טעינת נתוני שיעורים
  const fetchClasses = async () => {
    if (!session || isFetchingRef.current) return;
    
    // אם הנתונים עדכניים, אל תטען שוב
    if (data.classes.length > 0 && isDataFresh()) {
      return;
    }

    isFetchingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const [classesResponse, registrationsResponse] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_BASE_URL}/classes`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          }
        }),
        fetch(`${import.meta.env.VITE_API_BASE_URL}/registrations`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          }
        })
      ]);

      const classes = classesResponse.ok ? await classesResponse.json() : [];
      const registrations = registrationsResponse.ok ? await registrationsResponse.json() : [];

      setData(prev => ({
        ...prev,
        classes,
        registrations,
        lastFetchTime: Date.now()
      }));
    } catch (error) {
      console.error('Error fetching classes data:', error);
      setError('שגיאה בטעינת נתונים');
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  };

  // טעינת נתוני חנות
  const fetchShop = async () => {
    if (!session || isFetchingRef.current) return;
    
    // אם הנתונים עדכניים, אל תטען שוב
    if (data.products.length > 0 && isDataFresh()) {
      return;
    }

    isFetchingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const [productsResponse, ordersResponse] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_BASE_URL}/shop/products`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          }
        }),
        fetch(`${import.meta.env.VITE_API_BASE_URL}/orders`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          }
        })
      ]);

      const products = productsResponse.ok ? await productsResponse.json() : [];
      const orders = ordersResponse.ok ? await ordersResponse.json() : [];

      setData(prev => ({
        ...prev,
        products,
        orders,
        lastFetchTime: Date.now()
      }));
    } catch (error) {
      console.error('Error fetching shop data:', error);
      setError('שגיאה בטעינת נתונים');
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  };

  // טעינת נתוני צור קשר
  const fetchContact = async () => {
    if (!session || isFetchingRef.current) return;
    
    // אם הנתונים עדכניים, אל תטען שוב
    if (data.messages.length > 0 && isDataFresh()) {
      return;
    }

    isFetchingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/contact`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        const messages = await response.json();
        setData(prev => ({
          ...prev,
          messages,
          lastFetchTime: Date.now()
        }));
      }
    } catch (error) {
      console.error('Error fetching contact data:', error);
      setError('שגיאה בטעינת נתונים');
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  };

  // טעינת נתוני לוח שנה
  const fetchCalendar = async () => {
    if (!session || isFetchingRef.current) return;
    
    // אם הנתונים עדכניים, אל תטען שוב
    if (data.calendar && isDataFresh()) {
      return;
    }

    isFetchingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/classes/admin/calendar`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const calendarData = await response.json();
      setData(prev => ({
        ...prev,
        calendar: calendarData,
        lastFetchTime: Date.now()
      }));
    } catch (error) {
      console.error('Error fetching calendar data:', error);
      setError('שגיאה בטעינת נתוני לוח שנה');
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  };

  // ניקוי cache
  const clearCache = () => {
    setData({
      overview: null,
      classes: [],
      registrations: [],
      products: [],
      orders: [],
      messages: [],
      calendar: null,
      lastFetchTime: 0
    });
  };

  // רענון נתונים כל 5 דקות
  useEffect(() => {
    if (!session) return;

    const interval = setInterval(() => {
      // רענן רק אם יש נתונים קיימים
      if (data.overview || data.classes.length > 0 || data.products.length > 0 || data.messages.length > 0) {
        fetchOverview();
        fetchClasses();
        fetchShop();
        fetchContact();
      }
    }, 5 * 60 * 1000); // 5 דקות

    return () => clearInterval(interval);
  }, [session, data.lastFetchTime]);

  // ניקוי cache כשהמשתמש מתחלף
  useEffect(() => {
    clearCache();
  }, [session?.user?.id]);

  const value: AdminDataContextType = {
    data,
    isLoading,
    error,
    fetchOverview,
    fetchClasses,
    fetchShop,
    fetchContact,
    fetchCalendar,
    clearCache,
    isFetching: isFetchingRef.current
  };

  return (
    <AdminDataContext.Provider value={value}>
      {children}
    </AdminDataContext.Provider>
  );
}; 