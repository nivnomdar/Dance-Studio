import Cookies from 'js-cookie';

/**
 * Cookie Manager - מערכת ניהול Cookies בצד Frontend
 * תואם לדרישות החוק הישראלי והתקנים הבינלאומיים
 */

export interface CookieOptions {
  expires?: number | Date;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

export interface CookieData {
  value: string;
  options: CookieOptions;
}

export class FrontendCookieManager {
  private static instance: FrontendCookieManager;
  private readonly defaultOptions: CookieOptions;

  private constructor() {
    this.defaultOptions = {
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: 7 // 7 ימים ברירת מחדל
    };
  }

  public static getInstance(): FrontendCookieManager {
    if (!FrontendCookieManager.instance) {
      FrontendCookieManager.instance = new FrontendCookieManager();
    }
    return FrontendCookieManager.instance;
  }

  /**
   * הגדרת Cookie עם אפשרויות מותאמות אישית
   */
  public setCookie(
    name: string,
    value: string,
    customOptions?: Partial<CookieOptions>
  ): void {
    const options: CookieOptions = {
      ...this.defaultOptions,
      ...customOptions
    };

    // הגדרת Expires אם יש maxAge
    if (typeof options.expires === 'number') {
      options.expires = options.expires;
    }

    Cookies.set(name, value, options);
  }

  /**
   * הגדרת Session Cookie (זמן קצר)
   */
  public setSessionCookie(
    name: string,
    value: string,
    maxAge: number = 24 * 60 * 60 // 24 שעות
  ): void {
    this.setCookie(name, value, {
      expires: maxAge / (24 * 60 * 60), // המרה לימים
      sameSite: 'strict'
    });
  }

  /**
   * הגדרת Auth Cookie (זמן ארוך)
   */
  public setAuthCookie(
    name: string,
    value: string,
    maxAge: number = 7 * 24 * 60 * 60 // שבוע
  ): void {
    this.setCookie(name, value, {
      expires: maxAge / (24 * 60 * 60), // המרה לימים
      sameSite: 'strict'
    });
  }

  /**
   * הגדרת Cache Cookie (זמן קצר מאוד)
   */
  public setCacheCookie(
    name: string,
    value: string,
    maxAge: number = 5 * 60 // 5 דקות
  ): void {
    this.setCookie(name, value, {
      expires: maxAge / (24 * 60 * 60), // המרה לימים
      sameSite: 'lax'
    });
  }

  /**
   * קבלת Cookie
   */
  public getCookie(name: string): string | undefined {
    return Cookies.get(name);
  }

  /**
   * קבלת Cookie עם JSON parsing
   */
  public getCookieJSON<T>(name: string): T | null {
    try {
      const value = this.getCookie(name);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.warn(`Failed to parse cookie ${name}:`, error);
      return null;
    }
  }

  /**
   * בדיקה אם Cookie קיים
   */
  public hasCookie(name: string): boolean {
    return !!this.getCookie(name);
  }

  /**
   * מחיקת Cookie
   */
  public removeCookie(name: string, path: string = '/'): void {
    Cookies.remove(name, { path });
  }

  /**
   * מחיקת כל ה-Cookies של האפליקציה
   */
  public clearAllCookies(): void {
    const cookieNames = [
      'ladances-profile-cache',
      'ladances-cart-cache',
      'ladances-classes-cache',
      'ladances-sessions-cache',
      'ladances-profile-creating',
      'ladances-classes-count'
    ];

    cookieNames.forEach(name => {
      this.removeCookie(name);
    });
  }

  /**
   * מחיקת Cookies לא הכרחיים בלבד
   */
  public clearNonEssentialCookies(): void {
    const nonEssentialCookies = [
      'ladances-profile-cache',
      'ladances-cart-cache',
      'ladances-classes-cache',
      'ladances-sessions-cache'
    ];

    nonEssentialCookies.forEach(name => {
      this.removeCookie(name);
    });
  }

  /**
   * מחיקת Cookies הכרחיים (session, auth)
   */
  public clearEssentialCookies(): void {
    const essentialCookies = [
      'ladances-profile-creating',
      'ladances-classes-count'
    ];

    essentialCookies.forEach(name => {
      this.removeCookie(name);
    });
  }

  /**
   * קבלת כל ה-Cookies
   */
  public getAllCookies(): Record<string, string> {
    return Cookies.get();
  }

  /**
   * בדיקה אם המשתמש הסכים ל-Cookies
   */
  public hasCookieConsent(): boolean {
    const consent = this.getCookie('ladances-cookie-consent');
    return consent === 'true';
  }

  /**
   * בדיקה אם מותר לשמור Cookies לא הכרחיים
   */
  public canSetNonEssentialCookies(): boolean {
    return this.hasCookieConsent();
  }

  /**
   * בדיקת תוקף Cookie
   */
  public isCookieValid(name: string, maxAge: number = 5 * 60 * 1000): boolean {
    try {
      const value = this.getCookie(name);
      if (!value) return false;

      const data = JSON.parse(value);
      if (!data._timestamp) return false;

      const now = Date.now();
      const age = now - data._timestamp;
      
      return age < maxAge;
    } catch (error) {
      return false;
    }
  }

  /**
   * שמירת נתונים עם timestamp
   */
  public setDataWithTimestamp(
    name: string,
    data: any,
    maxAge: number = 5 * 60 * 1000, // 5 דקות
    isEssential: boolean = false // האם זה Cookie הכרחי לפעולת האתר
  ): void {
    // בדיקה שהנתונים תקינים
    if (data === null || data === undefined) {
      console.warn(`Attempting to save null/undefined data for cookie: ${name}`);
      return;
    }

    // אם זה לא Cookie הכרחי, בדוק הסכמה
    if (!isEssential && !this.canSetNonEssentialCookies()) {
      console.log(`Cookie consent required for: ${name}`);
      return;
    }

    const dataWithTimestamp = {
      ...data,
      _timestamp: Date.now()
    };

    this.setCacheCookie(name, JSON.stringify(dataWithTimestamp), maxAge / 1000);
  }

  /**
   * קבלת נתונים עם בדיקת תוקף
   */
  public getDataWithTimestamp<T>(
    name: string,
    maxAge: number = 5 * 60 * 1000
  ): T | null {
    if (!this.isCookieValid(name, maxAge)) {
      this.removeCookie(name);
      return null;
    }

    const data = this.getCookieJSON<any>(name);
    if (!data) {
      return null;
    }

    if (data._timestamp) {
      // הסרת ה-timestamp והחזרת הנתונים המקוריים
      const { _timestamp, ...originalData } = data;
      
      // בדיקה שהאובייקט לא ריק אחרי הסרת ה-timestamp
      if (Object.keys(originalData).length === 0) {
        return null;
      }
      
      return originalData as T;
    }

    // אם אין timestamp, החזר את הנתונים כמו שהם
    return data as T;
  }
}

// יצירת instance יחיד
export const frontendCookieManager = FrontendCookieManager.getInstance();

/**
 * פונקציות עזר מהירות
 */
export const setCookie = (
  name: string,
  value: string,
  options?: Partial<CookieOptions>
) => frontendCookieManager.setCookie(name, value, options);

export const setSessionCookie = (
  name: string,
  value: string,
  maxAge?: number
) => frontendCookieManager.setSessionCookie(name, value, maxAge);

export const setAuthCookie = (
  name: string,
  value: string,
  maxAge?: number
) => frontendCookieManager.setAuthCookie(name, value, maxAge);

export const setCacheCookie = (
  name: string,
  value: string,
  maxAge?: number
) => frontendCookieManager.setCacheCookie(name, value, maxAge);

export const getCookie = (name: string) => frontendCookieManager.getCookie(name);

export const getCookieJSON = <T>(name: string) => frontendCookieManager.getCookieJSON<T>(name);

export const hasCookie = (name: string) => frontendCookieManager.hasCookie(name);

export const removeCookie = (name: string, path?: string) => frontendCookieManager.removeCookie(name, path);

export const clearAllCookies = () => frontendCookieManager.clearAllCookies();

export const setDataWithTimestamp = (
  name: string,
  data: any,
  maxAge?: number
) => frontendCookieManager.setDataWithTimestamp(name, data, maxAge);

export const getDataWithTimestamp = <T>(
  name: string,
  maxAge?: number
) => frontendCookieManager.getDataWithTimestamp<T>(name, maxAge);

export const hasCookieConsent = () => frontendCookieManager.hasCookieConsent();
export const canSetNonEssentialCookies = () => frontendCookieManager.canSetNonEssentialCookies();
export const clearNonEssentialCookies = () => frontendCookieManager.clearNonEssentialCookies();
export const clearEssentialCookies = () => frontendCookieManager.clearEssentialCookies();
