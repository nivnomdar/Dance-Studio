import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

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
                <strong>תאריך עדכון אחרון:</strong> 23 ביולי 2025
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#4B2E83] mb-4 font-agrandir-text-bold">
                  1. מבוא
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  ברוכים הבאים לאתר "אביגיל דאנס סטודיו". אנו מחויבים להגן על פרטיותכם ולשמור על המידע האישי שלכם.
                  מדיניות פרטיות זו מסבירה כיצד אנו אוספים, משתמשים ומגנים על המידע שלכם בהתאם לחוק הגנת הפרטיות התשמ"א-1981.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#4B2E83] mb-4 font-agrandir-text-bold">
                  2. איזה מידע אנו אוספים
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-[#4B2E83] mb-2">מידע אישי:</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 mr-4">
                      <li>שם מלא</li>
                      <li>כתובת דוא"ל</li>
                      <li>מספר טלפון</li>
                      <li>כתובת מגורים</li>
                      <li>תאריך לידה (לצורך קביעת שיעורים)</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[#4B2E83] mb-2">מידע טכני:</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 mr-4">
                      <li>כתובת IP</li>
                      <li>סוג דפדפן ומערכת הפעלה</li>
                      <li>מידע על שימוש באתר</li>
                      <li>Cookies וטכנולוגיות דומות</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#4B2E83] mb-4 font-agrandir-text-bold">
                  3. כיצד אנו משתמשים במידע
                </h2>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mr-4">
                  <li>לספק שירותי רישום ותשלום לשיעורי ריקוד</li>
                  <li>לשלוח עדכונים על שיעורים ושינויים</li>
                  <li>לשפר את השירותים שלנו</li>
                  <li>לענות לפניות ותמיכה</li>
                  <li>לשלוח הודעות שיווקיות (בהסכמה בלבד)</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#4B2E83] mb-4 font-agrandir-text-bold">
                  4. שיתוף מידע
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  אנו לא מוכרים, משכירים או חולקים את המידע האישי שלכם עם צדדים שלישיים, למעט:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mr-4">
                  <li>ספקי שירות חיוניים (כגון מערכות תשלום)</li>
                  <li>כאשר נדרש על פי חוק</li>
                  <li>בהסכמה מפורשת</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#4B2E83] mb-4 font-agrandir-text-bold">
                  5. Cookies וטכנולוגיות דומות
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  אנו משתמשים בטכנולוגיות אחסון שונות כדי לשפר את חוויית המשתמש באתר שלנו:
                </p>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-[#4B2E83] mb-2">Cookies חיוניים:</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 mr-4">
                      <li>Cookies לאימות משתמשים (HttpOnly, Secure)</li>
                      <li>Cookies לניהול session מאובטח</li>
                      <li>Cookies לפעולת האתר הבסיסית</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[#4B2E83] mb-2">Cookies לשיפור ביצועים:</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 mr-4">
                      <li>Cache של נתונים לשיפור מהירות</li>
                      <li>שמירת העדפות משתמש</li>
                      <li>ניהול סל קניות זמני</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[#4B2E83] mb-2">localStorage (Supabase Auth):</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 mr-4">
                      <li>Tokens לאימות משתמשים (לא סיסמאות גלויות)</li>
                      <li>נדרש לצורך אבטחת התחברות OAuth2 (PKCE)</li>
                      <li>נמחק אוטומטית ביציאה מהאתר</li>
                      <li>מוגן עם HTTPS ו-expiration מוגבל</li>
                    </ul>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    כל הטכנולוגיות שלנו מוגדרות עם אפשרויות אבטחה מתקדמות: HttpOnly, Secure (HTTPS), 
                    SameSite=Strict למניעת CSRF, ותוקף מוגבל. אתם יכולים לשלוט ב-Cookies דרך הגדרות הדפדפן.
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#4B2E83] mb-4 font-agrandir-text-bold">
                  6. אבטחת מידע
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  אנו נוקטים באמצעי אבטחה מתקדמים להגנה על המידע שלכם:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mr-4">
                  <li>הצפנה מתקדמת (SSL/TLS)</li>
                  <li>גיבוי מאובטח</li>
                  <li>גישה מוגבלת למידע</li>
                  <li>ניטור מתמיד</li>
                  <li>Cookies מאובטחים עם HttpOnly ו-Secure</li>
                  <li>מניעת CSRF עם SameSite=Strict</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#4B2E83] mb-4 font-agrandir-text-bold">
                  7. זכויותיכם
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  בהתאם לחוק הגנת הפרטיות, יש לכם הזכות:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mr-4">
                  <li>לדעת איזה מידע נאסף עליכם</li>
                  <li>לתקן מידע שגוי</li>
                  <li>למחוק מידע (בכפוף למגבלות חוקיות)</li>
                  <li>להתנגד לשימוש במידע למטרות שיווק</li>
                  <li>לבקש העתק של המידע שלכם</li>
                  <li>למחוק מידע אישי כולל cookies ו-localStorage לפי בקשה</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#4B2E83] mb-4 font-agrandir-text-bold">
                  8. מחיקת מידע אישי
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  אתם יכולים למחוק מידע אישי שלכם במספר דרכים:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mr-4">
                  <li><strong>התנתקות מהאתר:</strong> כל ה-tokens והמידע ב-localStorage נמחקים אוטומטית</li>
                  <li><strong>מחיקת Cookies:</strong> דרך הגדרות הדפדפן → Privacy & Security → Cookies</li>
                  <li><strong>מחיקת localStorage:</strong> דרך Developer Tools → Application → Storage</li>
                  <li><strong>בקשה ישירה:</strong> פנייה אלינו במייל privacy@ladances.com</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  <strong>הערה:</strong> מידע חיוני לפעולת האתר (כמו tokens לאימות) יישמר עד להתנתקות, 
                  כנדרש לצורך אבטחה ופעולת האתר.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#4B2E83] mb-4 font-agrandir-text-bold">
                  9. שינויים במדיניות
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  אנו עשויים לעדכן מדיניות זו מעת לעת.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#4B2E83] mb-4 font-agrandir-text-bold">
                  10. יצירת קשר
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  לשאלות או בקשות בנוגע למדיניות פרטיות זו, ניתן ליצור קשר:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">
                    <strong>דוא"ל:</strong> privacy@ladances.com<br />
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy; 