import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { Link } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FDF9F6]">
      <Navbar />
      <main className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
            <h1 className="text-3xl md:text-4xl font-bold text-[#4B2E83] mb-8 text-center font-agrandir-grand">
              מדיניות פרטיות
            </h1>
            
            <div className="prose prose-lg max-w-none text-right" dir="rtl">
              <p className="text-gray-600 mb-6">
                <strong>תאריך עדכון אחרון:</strong> 26 באוגוסט 2025
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#4B2E83] mb-4 font-agrandir-text-bold">
                  1. מבוא ומחויבות משפטית
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  ברוכים הבאות לאתר 'Ladances' (www.ladances.com). אנו מחויבים להגן על פרטיותכן ולשמור על המידע האישי שלכן.
                  מדיניות פרטיות זו מסבירה כיצד אנו אוספים, משתמשים ומגנים על המידע שלכן בהתאם לחוק הגנת הפרטיות התשמ"א-1981,
                  תקנות הגנת הפרטיות (אבטחת מידע) התשע"ז-2017, תקנות הגנת הפרטיות (העברת מידע לחו"ל) התשס"א-2001,
                  ו-General Data Protection Regulation (GDPR) של האיחוד האירופי.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  <strong>מחויבות משפטית:</strong> מדיניות זו מהווה חלק בלתי נפרד מתנאי השימוש באתר ויש לה תוקף משפטי מחייב.
                </p>
                <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                  <p className="text-gray-700 text-sm">
                    <strong>הערה חשובה:</strong> האתר והשירותים מיועדים לנשים בלבד. רישום לשיעורים ורכישת מוצרים מותנה באישור 
                    זהות נשית בהתאם למדיניות הסטודיו. מידע זה נאסף ומעובד בהתאם לחוק הישראלי ולמדיניות הפרטיות שלנו.
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#4B2E83] mb-4 font-agrandir-text-bold">
                  2. איזה מידע אנו אוספים ומדוע
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-[#4B2E83] mb-2">מידע אישי (Personal Data):</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 mr-4">
                      <li><strong>שם מלא</strong> - נדרש לזיהוי ורישום לשיעורים</li>
                      <li><strong>כתובת דוא"ל</strong> - נדרש לתקשורת ואימות חשבון</li>
                      <li><strong>מספר טלפון</strong> - נדרש לתקשורת דחופה ושינויים בשיעורים</li>
                      <li><strong>כתובת מגורים</strong> - נדרש להזמנת מוצרים וניהול חשבון</li>
                      <li><strong>תאריך לידה</strong> - נדרש לקביעת שיעורים מותאמים לגיל</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[#4B2E83] mb-2">מידע טכני (Technical Data):</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 mr-4">
                      <li><strong>כתובת IP</strong> - נדרש לאבטחה ומניעת הונאות</li>
                      <li><strong>סוג דפדפן ומערכת הפעלה</strong> - נדרש לתמיכה טכנית</li>
                      <li><strong>מידע על שימוש באתר</strong> - נדרש לשיפור השירותים</li>
                      <li><strong>Cookies וטכנולוגיות דומות</strong> - נדרש לפעולת האתר הבסיסית</li>
                      <li><strong>מיקום גיאוגרפי</strong> - נדרש לשירותים מותאמים (אופציונלי)</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[#4B2E83] mb-2">מידע עסקי (Business Data):</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 mr-4">
                      <li><strong>היסטוריית הזמנות</strong> - נדרש לניהול חשבון ושירות לקוחות</li>
                      <li><strong>העדפות שיעורים</strong> - נדרש לשירות מותאם אישית</li>
                      <li><strong>תשלומים ותשלומי מע"מ</strong> - נדרש לניהול פיננסי</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#4B2E83] mb-4 font-agrandir-text-bold">
                  3. בסיס משפטי לעיבוד המידע (Legal Basis)
                </h2>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h3 className="text-xl font-semibold text-[#4B2E83] mb-2">בהתאם ל-GDPR ו-POPIA:</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 mr-4">
                    <li><strong>ביצוע חוזה (Contract Performance):</strong> מידע נדרש לרישום ושיעורי ריקוד</li>
                    <li><strong>אינטרס לגיטימי (Legitimate Interest):</strong> שיפור שירותים ואבטחה</li>
                    <li><strong>הסכמה מפורשת (Explicit Consent):</strong> שיווק וניתוח מתקדם</li>
                    <li><strong>חובה חוקית (Legal Obligation):</strong> שמירת רשומות פיננסיות ומע"מ</li>
                    <li><strong>אינטרס חיוני (Vital Interest):</strong> בטיחות במהלך שיעורים</li>
                  </ul>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#4B2E83] mb-4 font-agrandir-text-bold">
                  4. כיצד אנו משתמשים במידע
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-[#4B2E83] mb-2">שימוש ראשוני (Primary Use):</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 mr-4">
                      <li>רישום ותשלום לשיעורי ריקוד</li>
                      <li>ניהול חשבון משתמש ומערכת תשלומים</li>
                      <li>שליחת עדכונים על שיעורים ושינויים</li>
                      <li>תמיכה טכנית ופתרון בעיות</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[#4B2E83] mb-2">שימוש משני (Secondary Use):</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 mr-4">
                      <li>שיפור השירותים והתאמה אישית</li>
                      <li>ניתוח מגמות ושימוש באתר</li>
                      <li>שליחת הודעות שיווקיות (בהסכמה בלבד)</li>
                      <li>מחקר ופיתוח שירותים חדשים</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[#4B2E83] mb-2">שימוש באבטחה (Security Use):</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 mr-4">
                      <li>מניעת הונאות ופעילות חשודה</li>
                      <li>אימות זהות משתמשים</li>
                      <li>ניטור פעילות לא תקינה</li>
                      <li>גיבוי ושחזור מידע</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#4B2E83] mb-4 font-agrandir-text-bold">
                  5. שיתוף מידע עם צדדים שלישיים
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  אנו לא מוכרים, משכירים או חולקים את המידע האישי שלכם עם צדדים שלישיים, למעט:
                </p>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-[#4B2E83] mb-2">ספקי שירות חיוניים (Essential Service Providers):</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 mr-4">
                      <li><strong>מערכות תשלום:</strong> Stripe, PayPal (עיבוד תשלומים מאובטח)</li>
                      <li><strong>אירוח אתר:</strong> Vercel, Netlify (אירוח מאובטח)</li>
                      <li><strong>מסד נתונים:</strong> Supabase (ניהול משתמשים מאובטח)</li>
                      <li><strong>שירותי אימייל:</strong> SendGrid, Mailgun (שליחת הודעות)</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[#4B2E83] mb-2">חובות חוקיות (Legal Obligations):</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 mr-4">
                      <li>בקשות מבית משפט או רשויות אכיפה</li>
                      <li>דרישות מס ומע"מ</li>
                      <li>בקשות לפי חוק חופש המידע</li>
                      <li>בקשות לפי חוק הגנת הפרטיות</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[#4B2E83] mb-2">הסכמה מפורשת (Explicit Consent):</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 mr-4">
                      <li>שיתוף עם שותפים עסקיים (רק בהסכמה)</li>
                      <li>מחקר אקדמי (רק בהסכמה)</li>
                      <li>שיווק משותף (רק בהסכמה)</li>
                    </ul>
                  </div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                  <p className="text-gray-700 text-sm">
                    <strong>הערה חשובה:</strong> כל ספקי השירות שלנו חתומים על הסכמי עיבוד נתונים (DPA) 
                    ועומדים בתקני אבטחה בינלאומיים (ISO 27001, SOC 2).
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#4B2E83] mb-4 font-agrandir-text-bold">
                  6. Cookies וטכנולוגיות אחסון - פירוט מלא
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-[#4B2E83] mb-2">Cookies חיוניים (Essential Cookies):</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 mr-4">
                      <li><strong>Session Cookies:</strong> ניהול התחברות מאובטח (HttpOnly, Secure)</li>
                      <li><strong>Authentication Cookies:</strong> אימות זהות משתמשים (HttpOnly, Secure)</li>
                      <li><strong>CSRF Protection:</strong> מניעת התקפות CSRF (SameSite=Strict)</li>
                      <li><strong>Security Cookies:</strong> הגנה מפני התקפות אבטחה</li>
                    </ul>
                    <p className="text-gray-700 text-sm mt-2">
                      <strong>משך חיים:</strong> עד סיום הפעלת הדפדפן או התנתקות
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[#4B2E83] mb-2">Cookies לשיפור ביצועים (Performance Cookies):</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 mr-4">
                      <li><strong>Cache Cookies:</strong> שמירת נתונים לשיפור מהירות</li>
                      <li><strong>Preference Cookies:</strong> שמירת העדפות משתמש</li>
                      <li><strong>Analytics Cookies:</strong> ניתוח שימוש באתר (אנונימי)</li>
                      <li><strong>Shopping Cart:</strong> ניהול סל קניות זמני</li>
                    </ul>
                    <p className="text-gray-700 text-sm mt-2">
                      <strong>משך חיים:</strong> עד 30 ימים (ניתן למחיקה בכל עת)
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[#4B2E83] mb-2">localStorage (Supabase Auth):</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 mr-4">
                      <li><strong>Access Tokens:</strong> tokens לאימות משתמשים (לא סיסמאות גלויות)</li>
                      <li><strong>Refresh Tokens:</strong> חידוש אוטומטי של התחברות</li>
                      <li><strong>User Preferences:</strong> העדפות משתמש מותאמות אישית</li>
                      <li><strong>Session Data:</strong> נתוני פעילות זמניים</li>
                    </ul>
                    <p className="text-gray-700 text-sm mt-2">
                      <strong>משך חיים:</strong> עד התנתקות או מחיקה ידנית
                    </p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-xl font-semibold text-[#4B2E83] mb-2">אבטחה מתקדמת:</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 mr-4">
                      <li><strong>HttpOnly:</strong> מניעת גישה מ-JavaScript (XSS protection)</li>
                      <li><strong>Secure:</strong> העברה רק דרך HTTPS</li>
                      <li><strong>SameSite=Strict:</strong> מניעת CSRF attacks</li>
                      <li><strong>Expiration:</strong> תוקף מוגבל ומוגדר</li>
                      <li><strong>Encryption:</strong> הצפנה מתקדמת של כל הנתונים</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#4B2E83] mb-4 font-agrandir-text-bold">
                  7. אבטחת מידע מתקדמת
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-[#4B2E83] mb-2">הצפנה ואבטחה (Encryption & Security):</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 mr-4">
                      <li><strong>SSL/TLS 1.3:</strong> הצפנה מתקדמת לכל התקשורת</li>
                      <li><strong>AES-256:</strong> הצפנה מתקדמת של נתונים רגישים</li>
                      <li><strong>RSA-4096:</strong> מפתחות ציבוריים מאובטחים</li>
                      <li><strong>Hashing:</strong> סיסמאות מוצפנות עם salt מתקדם</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[#4B2E83] mb-2">אבטחה פיזית ולוגית:</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 mr-4">
                      <li><strong>Data Centers:</strong> מרכזי נתונים מאובטחים עם ISO 27001</li>
                      <li><strong>Access Control:</strong> בקרת גישה מתקדמת עם MFA</li>
                      <li><strong>Monitoring:</strong> ניטור מתמיד של פעילות חשודה</li>
                      <li><strong>Backup:</strong> גיבוי מאובטח עם הצפנה</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[#4B2E83] mb-2">תאימות תקנים בינלאומיים:</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 mr-4">
                      <li><strong>ISO 27001:</strong> תקן אבטחת מידע בינלאומי</li>
                      <li><strong>SOC 2 Type II:</strong> תקן אבטחה אמריקאי</li>
                      <li><strong>GDPR:</strong> תקן פרטיות אירופי</li>
                      <li><strong>POPIA:</strong> תקן פרטיות דרום אפריקאי</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#4B2E83] mb-4 font-agrandir-text-bold">
                  8. זכויותיכם המלאות - בהתאם לחוק
                </h2>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <h3 className="text-xl font-semibold text-[#4B2E83] mb-2">זכויות לפי חוק הגנת הפרטיות הישראלי:</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 mr-4">
                    <li><strong>זכות לדעת:</strong> לדעת איזה מידע נאסף ועל ידי מי</li>
                    <li><strong>זכות לגישה:</strong> לקבל העתק של המידע שלכם</li>
                    <li><strong>זכות לתיקון:</strong> לתקן מידע שגוי או לא מעודכן</li>
                    <li><strong>זכות למחיקה:</strong> למחוק מידע (בכפוף למגבלות חוקיות)</li>
                    <li><strong>זכות להתנגדות:</strong> להתנגד לשימוש במידע למטרות שיווק</li>
                  </ul>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h3 className="text-xl font-semibold text-[#4B2E83] mb-2">זכויות נוספות לפי GDPR:</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 mr-4">
                    <li><strong>זכות לניידות:</strong> לקבל את המידע בפורמט מובנה</li>
                    <li><strong>זכות להגבלה:</strong> להגביל עיבוד המידע</li>
                    <li><strong>זכות לאוטומציה:</strong> להתנגד לקבלת החלטות אוטומטיות</li>
                    <li><strong>זכות לשכחה:</strong> למחיקה מלאה של המידע</li>
                    <li><strong>זכות לתלונה:</strong> להגיש תלונה לרשות המפקחת</li>
                  </ul>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="text-xl font-semibold text-[#4B2E83] mb-2">זכויות Cookies ו-localStorage:</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 mr-4">
                    <li><strong>מחיקת Cookies:</strong> דרך הגדרות הדפדפן בכל עת</li>
                    <li><strong>מחיקת localStorage:</strong> דרך Developer Tools או התנתקות</li>
                    <li><strong>בקרה על Cookies:</strong> בחירת סוגי Cookies רצויים</li>
                    <li><strong>מחיקה אוטומטית:</strong> מחיקה אוטומטית ביציאה מהאתר</li>
                  </ul>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#4B2E83] mb-4 font-agrandir-text-bold">
                  9. מחיקת מידע אישי - תהליך מפורט
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-[#4B2E83] mb-2">מחיקה אוטומטית:</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 mr-4">
                      <li><strong>התנתקות מהאתר:</strong> כל ה-tokens והמידע ב-localStorage נמחקים אוטומטית</li>
                      <li><strong>פג תוקף Session:</strong> מחיקה אוטומטית לאחר 30 דקות של חוסר פעילות</li>
                      <li><strong>פג תוקף Cookies:</strong> מחיקה אוטומטית לפי תאריך התפוגה</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[#4B2E83] mb-2">מחיקה ידנית:</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 mr-4">
                      <li><strong>מחיקת Cookies:</strong> דרך הגדרות הדפדפן → Privacy & Security → Cookies</li>
                      <li><strong>מחיקת localStorage:</strong> דרך Developer Tools → Application → Storage</li>
                      <li><strong>מחיקת Cache:</strong> דרך הגדרות הדפדפן → Privacy & Security → Clear Data</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[#4B2E83] mb-2">מחיקה דרך האתר:</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 mr-4">
                      <li><strong>הגדרות חשבון:</strong> מחיקת מידע אישי דרך הגדרות החשבון</li>
                      <li><strong>בקשה ישירה:</strong> פנייה אלינו במייל privacy@ladances.com</li>
                      <li><strong>טופס מחיקה:</strong> מילוי טופס מחיקה באתר</li>
                    </ul>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-gray-700 text-sm">
                      <strong>הערה חשובה:</strong> מידע חיוני לפעולת האתר (כמו tokens לאימות) יישמר עד להתנתקות, 
                      כנדרש לצורך אבטחה ופעולת האתר. מידע פיננסי יישמר לפי דרישות החוק (7 שנים).
                    </p>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#4B2E83] mb-4 font-agrandir-text-bold">
                  10. העברת מידע לחו"ל - בהתאם לחוק
                </h2>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h3 className="text-xl font-semibold text-[#4B2E83] mb-2">מידע על העברות לחו"ל:</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 mr-4">
                    <li><strong>אירוח אתר:</strong> Vercel (ארה"ב) - עם הסכמי עיבוד נתונים</li>
                    <li><strong>מסד נתונים:</strong> Supabase (אירופה) - עם תאימות GDPR מלאה</li>
                    <li><strong>שירותי אימייל:</strong> SendGrid (ארה"ב) - עם הסכמי אבטחה</li>
                    <li><strong>תשלומים:</strong> Stripe (אירופה) - עם תאימות GDPR מלאה</li>
                  </ul>
                  <p className="text-gray-700 text-sm mt-2">
                    <strong>הגנות:</strong> כל העברות מתבצעות עם הסכמי עיבוד נתונים (DPA) ותאימות לתקנים בינלאומיים.
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#4B2E83] mb-4 font-agrandir-text-bold">
                  11. שינויים במדיניות ועדכונים
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  אנו עשויים לעדכן מדיניות זו מעת לעת בהתאם לשינויים בחוק, טכנולוגיה או שירותים.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-xl font-semibold text-[#4B2E83] mb-2">תהליך עדכון:</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 mr-4">
                    <li><strong>הודעה מוקדמת:</strong> הודעה על שינויים 30 ימים מראש</li>
                    <li><strong>עדכון באתר:</strong> פרסום השינויים בדף זה</li>
                    <li><strong>הודעה במייל:</strong> שליחת הודעה לכל המשתמשים הרשומים</li>
                    <li><strong>אישור הסכמה:</strong> דרישה לאישור הסכמה לשינויים משמעותיים</li>
                  </ul>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#4B2E83] mb-4 font-agrandir-text-bold">
                  12. יצירת קשר ופניות
                </h2>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-xl font-semibold text-[#4B2E83] mb-2">פניות כלליות:</h3>
                    <p className="text-gray-700">
                      <strong>דוא"ל:</strong> info@ladances.com<br />
                      <strong>טלפון:</strong> 03-1234567
                    </p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h3 className="text-xl font-semibold text-[#4B2E83] mb-2">פניות פרטיות דחופות:</h3>
                    <p className="text-gray-700">
                      <strong>דוא"ל:</strong> privacy@ladances.com<br />
                      <strong>זמן תגובה:</strong> עד 24 שעות
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="text-xl font-semibold text-[#4B2E83] mb-2">פניות נגישות:</h3>
                    <p className="text-gray-700">
                      <strong>דוא"ל:</strong> accessibility@ladances.com<br />
                      <strong>זמן תגובה:</strong> עד 48 שעות
                    </p>
                    <div className="mt-2">
                      <Link 
                        to="/accessibility-statement" 
                        className="inline-flex items-center gap-2 text-[#4B2E83] hover:text-[#EC4899] font-medium underline decoration-2 underline-offset-2 transition-all duration-200"
                        aria-label="פירוט מלא על נגישות האתר"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        לפרטים מלאים על נגישות האתר
                      </Link>
                    </div>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#4B2E83] mb-4 font-agrandir-text-bold">
                  13. תלונות ורשויות מפקחות
                </h2>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="text-xl font-semibold text-[#4B2E83] mb-2">זכות להגיש תלונה:</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 mr-4">
                    <li><strong>ישראל:</strong> רשם מאגרי מידע, משרד המשפטים</li>
                    <li><strong>אירופה:</strong> הרשות המפקחת הרלוונטית במדינת החבר</li>
                    <li><strong>דרום אפריקה:</strong> Information Regulator</li>
                    <li><strong>ארה"ב:</strong> Federal Trade Commission (FTC)</li>
                  </ul>
                  <p className="text-gray-700 text-sm mt-2">
                    <strong>הערה:</strong> אנו ממליצים ליצור קשר ישיר איתנו לפני הגשת תלונה לרשות מפקחת.
                  </p>
                </div>
              </section>

              <div className="border-t border-gray-200 pt-4">
                <p className="text-gray-600 text-sm text-center">
                  מדיניות זו מתעדכנת מעת לעת בהתאם לשינויים בחוק ובטכנולוגיה. 
                  עדכון אחרון: 26 באוגוסט 2025. מדיניות זו מהווה חלק בלתי נפרד מתנאי השימוש באתר.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy; 