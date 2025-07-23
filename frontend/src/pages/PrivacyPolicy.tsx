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
                  5. אבטחת מידע
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  אנו נוקטים באמצעי אבטחה מתקדמים להגנה על המידע שלכם:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mr-4">
                  <li>הצפנה מתקדמת (SSL/TLS)</li>
                  <li>גיבוי מאובטח</li>
                  <li>גישה מוגבלת למידע</li>
                  <li>ניטור מתמיד</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#4B2E83] mb-4 font-agrandir-text-bold">
                  6. זכויותיכם
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
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#4B2E83] mb-4 font-agrandir-text-bold">
                  7. Cookies
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  אנו משתמשים ב-Cookies לשיפור חוויית השימוש באתר. ניתן להשבית Cookies בהגדרות הדפדפן,
                  אך הדבר עלול להשפיע על פונקציונליות האתר.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#4B2E83] mb-4 font-agrandir-text-bold">
                  8. שינויים במדיניות
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  אנו עשויים לעדכן מדיניות זו מעת לעת.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#4B2E83] mb-4 font-agrandir-text-bold">
                  9. יצירת קשר
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  לשאלות או בקשות בנוגע למדיניות פרטיות זו, ניתן ליצור קשר:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">
                    <strong>דוא"ל:</strong> privacy@ladance.co.il<br />
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