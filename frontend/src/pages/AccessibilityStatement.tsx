import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { Link } from 'react-router-dom';

const AccessibilityStatement: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FDF9F6]">
      <Navbar />
      <main className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
            <h1 className="text-3xl md:text-4xl font-bold text-[#4B2E83] mb-8 text-center font-agrandir-grand">
              הצהרת נגישות
            </h1>
            
            <div className="prose prose-lg max-w-none text-right" dir="rtl">
              <p className="text-gray-600 mb-6">
                <strong>תאריך עדכון אחרון:</strong> 26 באוגוסט 2025
              </p>

              <p className="text-[#2B2B2B] mb-6">
                אנחנו מחויבים להנגשת האתר בהתאם לתקן הישראלי (ת"י 5568) והנחיות WCAG 2.1 רמה AA. 
                הצהרה זו מהווה חלק מהתחייבותנו לספק שירותים נגישים לכל המשתמשות.
              </p>
              
              <div className="bg-pink-50 border border-pink-200 rounded-lg p-4 mb-6">
                <p className="text-[#2B2B2B] text-sm">
                  <strong>הערה חשובה:</strong> האתר והשירותים מיועדים לנשים בלבד. הצהרת נגישות זו חלה על כל המשתמשות 
                  באתר ויישום תכונות הנגישות מותנה באישור זהות נשית בהתאם למדיניות הסטודיו.
                </p>
              </div>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#4B2E83] mb-4 font-agrandir-text-bold">
                  פרטי הארגון
                </h2>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                  <p className="text-[#2B2B2B] mb-2"><strong>שם הארגון:</strong> Ladances (www.ladances.com)</p>
                  <p className="text-[#2B2B2B] mb-2"><strong>כתובת:</strong> יוסף לישנסקי 6, ראשון לציון</p>
                  <p className="text-[#2B2B2B] mb-2"><strong>אימייל:</strong> info@ladances.com</p>
                  <p className="text-[#2B2B2B] mb-2"><strong>טלפון:</strong> 03-1234567</p>
                  <p className="text-[#2B2B2B] mb-2"><strong>שעות פעילות:</strong> ימים א'-ה' 9:00-18:00</p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#4B2E83] mb-4 font-agrandir-text-bold">
                  תכונות נגישות באתר
                </h2>
                <ul className="list-disc pr-6 space-y-1 text-[#2B2B2B] mb-6">
                  <li><strong>ניווט מקלדת:</strong> תמיכה מלאה בניווט באמצעות מקלדת (Tab, Enter, Space, Escape)</li>
                  <li><strong>תמיכה בקוראי מסך:</strong> ARIA מלא, היררכיית כותרות נכונה, תיאורים מתאימים</li>
                  <li><strong>תמונות נגישות:</strong> טקסט חלופי לתמונות משמעותיות, סימון תמונות דקורטיביות</li>
                  <li><strong>טפסים נגישים:</strong> תוויות ברורות, הודעות שגיאה מקושרות, שדות חובה מסומנים</li>
                  <li><strong>מודלים נגישים:</strong> focus trap, סגירה במקלדת, תיאורים מתאימים</li>
                  <li><strong>ניגודיות צבעים:</strong> עומד בתקן AA (4.5:1) ללא תלות בצבע בלבד</li>
                  <li><strong>התאמות תנועה:</strong> תמיכה ב-prefers-reduced-motion, כפתורי pause/play</li>
                  <li><strong>הגדלת טקסט:</strong> תמיכה בהגדלת טקסט עד 200% ללא אובדן פונקציונליות</li>
                  <li><strong>ניווט עקבי:</strong> מבנה אחיד בכל הדפים, ניווט ברור ועקבי</li>
                  <li><strong>Cookies נגישים:</strong> באנר הסכמה נגיש עם תמיכה מלאה במקלדת וקוראי מסך</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#4B2E83] mb-4 font-agrandir-text-bold">
                  התחייבויות לנגישות
                </h2>
                <ul className="list-disc pr-6 space-y-1 text-[#2B2B2B] mb-6">
                  <li>המשך שיפור הנגישות בהתאם לטכנולוגיות חדשות</li>
                  <li>הכשרת צוות למודעות לנגישות ושימוש בכלי נגישות</li>
                  <li>בדיקות נגישות תקופתיות וטיפול בבעיות שזוהו</li>
                  <li>התאמת האתר לצרכי משתמשים עם מוגבלויות שונות</li>
                  <li>שמירה על תקני נגישות בעדכונים עתידיים</li>
                  <li>עדכון הצהרת נגישות זו לפחות פעם בשנה</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#4B2E83] mb-4 font-agrandir-text-bold">
                  מגבלות ידועות
                </h2>
                <ul className="list-disc pr-6 space-y-1 text-[#2B2B2B] mb-6">
                  <li>חלק מהתמונות היסטוריות עשויות להיות ללא תיאור מלא</li>
                  <li>סרטוני וידאו ישנים עשויים להיות ללא כתוביות</li>
                  <li>במקרים נדירים, ייתכן עיכוב קצר בתגובה לפעולות מקלדת מורכבות</li>
                  <li>חלק מהאנימציות עשויות להיות מהירות מדי למשתמשים עם רגישות לתנועה</li>
                </ul>
                <p className="text-[#2B2B2B] mb-6">
                  אם נתקלת בבעיה כלשהי בנגישות, נשמח שתדווחי לנו כדי שנוכל לתקן במהירות. 
                  כל פנייה תיבדק ותטופל בהתאם לתקן הישראלי.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#4B2E83] mb-4 font-agrandir-text-bold">
                  הליך פנייה לנגישות - תהליך מפורט
                </h2>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <h3 className="font-bold text-[#4B2E83] mb-3">שלבי הטיפול בפניות נגישות:</h3>
                  <ol className="list-decimal pr-6 space-y-2 text-[#2B2B2B] text-sm">
                    <li><strong>קבלת פנייה:</strong> פנייה מתקבלת במייל, טלפון או טופס באתר</li>
                    <li><strong>אישור קבלה:</strong> אישור קבלה נשלח תוך 24 שעות</li>
                    <li><strong>בדיקה ראשונית:</strong> בדיקה ראשונית מתבצעת תוך 48 שעות</li>
                    <li><strong>תכנון פתרון:</strong> תכנון פתרון מפורט תוך שבוע ימים</li>
                    <li><strong>יישום פתרון:</strong> יישום הפתרון תוך שבועיים ימים</li>
                    <li><strong>בדיקת איכות:</strong> בדיקת איכות ונגישות הפתרון</li>
                    <li><strong>עדכון הפונה:</strong> עדכון מפורט על הפתרון שהוחל</li>
                  </ol>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <p className="text-[#2B2B2B] mb-2"><strong>זמן תגובה מובטח:</strong> עד 48 שעות</p>
                  <p className="text-[#2B2B2B] mb-2"><strong>זמן טיפול:</strong> עד שבועיים ימים</p>
                  <p className="text-[#2B2B2B] mb-2"><strong>מעקב:</strong> עדכון שוטף על התקדמות הטיפול</p>
                  <p className="text-[#2B2B2B] mb-2"><strong>תיעוד:</strong> כל פנייה מתועדת ומטופלת במערכת ייעודית</p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#4B2E83] mb-4 font-agrandir-text-bold">
                  יצירת קשר בנושא נגישות
                </h2>
               

                <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
                  <h3 className="font-bold text-[#4B2E83] mb-2">טופס פנייה לנגישות באתר</h3>
                  <p className="text-[#2B2B2B] text-sm mb-2">
                    ניתן למלא טופס פנייה לנגישות ישירות באתר תחת "צור קשר" ← ולכתוב בנושא: "פנייה לנגישות"
                  </p>
                  <p className="text-[#2B2B2B] text-sm">
                    הטופס כולל שדות נגישים עם תיאורים מפורטים ותמיכה מלאה במקלדת
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#4B2E83] mb-4 font-agrandir-text-bold">
                  נגישות שירותים פיזיים - מידע חשוב
                </h2>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <h3 className="font-bold text-[#4B2E83] mb-2">הסטודיו אינו נגיש לנכים:</h3>
                  <p className="text-[#2B2B2B] text-sm mb-2">
                    חשוב לציין שהסטודיו שלנו ממוקם בקומה עליונה עם גישה באמצעות מדרגות בלבד. 
                    אין רמפה נגישה או מעלית לסטודיו.
                  </p>
                  <ul className="list-disc pr-6 space-y-1 text-[#2B2B2B] text-sm">
                    <li><strong>גישה לסטודיו:</strong> מדרגות בלבד - אין רמפה נגישה</li>
                    <li><strong>מעלית:</strong> לא קיימת מעלית בבניין</li>
                    <li><strong>שירותים:</strong> שירותים רגילים בקומה העליונה</li>
                    <li><strong>חניה:</strong> חניה רגילה ללא מקומות נגישים</li>
                  </ul>
                  <div className="mt-3">
                    <Link 
                      to="/physical-accessibility" 
                      className="inline-flex items-center gap-2 text-[#4B2E83] hover:text-[#EC4899] font-medium underline decoration-2 underline-offset-2 transition-all duration-200"
                      aria-label="פירוט מלא על מצב נגישות פיזית"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      לפרטים מלאים על מצב נגישות פיזית
                    </Link>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#4B2E83] mb-4 font-agrandir-text-bold">
                  Cookies ונגישות
                </h2>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-[#2B2B2B] text-sm mb-2">
                    <strong>באנר Cookies נגיש:</strong> באנר הסכמה לשימוש ב-Cookies עומד בתקני נגישות מלאים
                  </p>
                  <ul className="list-disc pr-6 space-y-1 text-[#2B2B2B] text-sm">
                    <li>תמיכה מלאה בניווט מקלדת (Tab, Enter, Escape)</li>
                    <li>תיאורים מפורטים לקוראי מסך</li>
                    <li>ניגודיות צבעים עומדת בתקן AA</li>
                    <li>טקסט ברור וקריא ללא תלות בצבע</li>
                    <li>כפתורים בגודל מינימלי של 44x44 פיקסלים</li>
                    <li>אפשרות לסגירה רק לאחר בחירה מודעת</li>
                  </ul>
                </div>
              </section>

              

              <div className="border-t border-gray-200 pt-4">
                <p className="text-gray-600 text-sm text-center">
                  הצהרה זו מתעדכנת מעת לעת בהתאם לשיפורים בנגישות האתר והשירותים. 
                  עדכון אחרון: 26 באוגוסט 2025. הצהרה זו מהווה חלק בלתי נפרד מתנאי השימוש באתר.
                </p>
                <div className="mt-3 text-center">
                  <Link 
                    to="/physical-accessibility" 
                    className="inline-flex items-center gap-2 text-[#4B2E83] hover:text-[#EC4899] font-medium underline decoration-2 underline-offset-2 transition-all duration-200"
                    aria-label="פירוט מלא על מצב נגישות לנכים"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    לפרטים מלאים על מצב נגישות לנכים
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AccessibilityStatement;
