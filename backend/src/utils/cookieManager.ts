import { Response, Request } from 'express';

/**
 * Cookie Manager - מערכת ניהול Cookies מאובטחת ומקצועית
 * תואם לדרישות החוק הישראלי והתקנים הבינלאומיים
 */

export interface CookieOptions {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  maxAge?: number; // בשניות
  expires?: Date;
  path?: string;
  domain?: string;
}

export interface CookieData {
  value: string;
  options: CookieOptions;
}

export class CookieManager {
  private static instance: CookieManager;
  private readonly defaultOptions: CookieOptions;

  private constructor() {
    this.defaultOptions = {
      httpOnly: true, // ברירת מחדל: HttpOnly למניעת XSS
      secure: process.env.NODE_ENV === 'production', // Secure בייצור
      sameSite: 'strict', // מניעת CSRF
      path: '/',
      maxAge: 24 * 60 * 60 // 24 שעות ברירת מחדל
    };
  }

  public static getInstance(): CookieManager {
    if (!CookieManager.instance) {
      CookieManager.instance = new CookieManager();
    }
    return CookieManager.instance;
  }

  /**
   * הגדרת Cookie עם אפשרויות מותאמות אישית
   */
  public setCookie(
    res: Response,
    name: string,
    value: string,
    customOptions?: Partial<CookieOptions>
  ): void {
    const options: CookieOptions = {
      ...this.defaultOptions,
      ...customOptions
    };

    // הגדרת Expires אם יש maxAge
    if (options.maxAge && !options.expires) {
      options.expires = new Date(Date.now() + options.maxAge * 1000);
    }

    // הגדרת SameSite בהתאם ל-Secure
    if (options.secure && options.sameSite === 'none') {
      options.sameSite = 'strict'; // מניעת בעיות אבטחה
    }

    res.cookie(name, value, options);
  }

  /**
   * הגדרת Cookie לא HttpOnly (לגישה מ-JavaScript)
   */
  public setClientCookie(
    res: Response,
    name: string,
    value: string,
    customOptions?: Partial<CookieOptions>
  ): void {
    this.setCookie(res, name, value, {
      ...customOptions,
      httpOnly: false
    });
  }

  /**
   * הגדרת Session Cookie מאובטח
   */
  public setSessionCookie(
    res: Response,
    name: string,
    value: string,
    maxAge: number = 24 * 60 * 60 // 24 שעות
  ): void {
    this.setCookie(res, name, value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge,
      path: '/'
    });
  }

  /**
   * הגדרת Auth Cookie מאובטח
   */
  public setAuthCookie(
    res: Response,
    name: string,
    value: string,
    maxAge: number = 7 * 24 * 60 * 60 // שבוע
  ): void {
    this.setCookie(res, name, value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge,
      path: '/'
    });
  }

  /**
   * הגדרת Cache Cookie (לא HttpOnly לגישה מה-Frontend)
   */
  public setCacheCookie(
    res: Response,
    name: string,
    value: string,
    maxAge: number = 5 * 60 // 5 דקות
  ): void {
    this.setCookie(res, name, value, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge,
      path: '/'
    });
  }

  /**
   * מחיקת Cookie
   */
  public clearCookie(res: Response, name: string, path: string = '/'): void {
    res.clearCookie(name, { path });
  }

  /**
   * מחיקת כל ה-Cookies של האפליקציה
   */
  public clearAllCookies(res: Response): void {
    const cookieNames = [
      'ladances-auth-token',
      'ladances-refresh-token',
      'ladances-session',
      'ladances-profile-cache',
      'ladances-cart-cache',
      'ladances-classes-cache',
      'ladances-sessions-cache'
    ];

    cookieNames.forEach(name => {
      this.clearCookie(res, name);
    });
  }

  /**
   * קבלת Cookie מה-Request
   */
  public getCookie(req: Request, name: string): string | undefined {
    return req.cookies?.[name];
  }

  /**
   * בדיקה אם Cookie קיים
   */
  public hasCookie(req: Request, name: string): boolean {
    return !!this.getCookie(req, name);
  }

  /**
   * קבלת כל ה-Cookies
   */
  public getAllCookies(req: Request): Record<string, string> {
    return req.cookies || {};
  }
}

// יצירת instance יחיד
export const cookieManager = CookieManager.getInstance();

/**
 * פונקציות עזר מהירות
 */
export const setSecureCookie = (
  res: Response,
  name: string,
  value: string,
  options?: Partial<CookieOptions>
) => cookieManager.setCookie(res, name, value, options);

export const setClientCookie = (
  res: Response,
  name: string,
  value: string,
  options?: Partial<CookieOptions>
) => cookieManager.setClientCookie(res, name, value, options);

export const setSessionCookie = (
  res: Response,
  name: string,
  value: string,
  maxAge?: number
) => cookieManager.setSessionCookie(res, name, value, maxAge);

export const setAuthCookie = (
  res: Response,
  name: string,
  value: string,
  maxAge?: number
) => cookieManager.setAuthCookie(res, name, value, maxAge);

export const setCacheCookie = (
  res: Response,
  name: string,
  value: string,
  maxAge?: number
) => cookieManager.setCacheCookie(res, name, value, maxAge);

export const clearCookie = (
  res: Response,
  name: string,
  path?: string
) => cookieManager.clearCookie(res, name, path);

export const clearAllCookies = (res: Response) => cookieManager.clearAllCookies(res);

export const getCookie = (req: Request, name: string) => cookieManager.getCookie(req, name);

export const hasCookie = (req: Request, name: string) => cookieManager.hasCookie(req, name);
