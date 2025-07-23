import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FDF9F6]">
      <Navbar />
      <main className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
            <h1 className="text-3xl md:text-4xl font-bold text-[#4B2E83] mb-8 text-center font-agrandir-grand">
              תנאי שימוש
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
                  ברוכים הבאים לאתר "אביגיל דאנס סטודיו". שימוש באתר זה מהווה הסכמה לתנאי השימוש המפורטים להלן.
                  תנאים אלה חלים על כל השימוש באתר ובשירותים הניתנים דרכו.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#4B2E83] mb-4 font-agrandir-text-bold">
                  2. הגדרות
                </h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-700 leading-relaxed">
                      <strong>"האתר"</strong> - אתר האינטרנט של אביגיל דאנס סטודיו
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-700 leading-relaxed">
                      <strong>"השירותים"</strong> - שירותי רישום לשיעורי ריקוד, מידע על שיעורים וכל שירות אחר הניתן באתר
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-700 leading-relaxed">
                      <strong>"המשתמש"</strong> - כל אדם המשתמש באתר או בשירותים
                    </p>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#4B2E83] mb-4 font-agrandir-text-bold">
                  3. רישום וחשבון משתמש
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-700 leading-relaxed">
                    לרישום לשיעורים נדרש ליצור חשבון משתמש. המשתמש מתחייב:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 mr-4">
                    <li>לספק מידע מדויק ומלא</li>
                    <li>לשמור על סודיות פרטי ההתחברות</li>
                    <li>להודיע מיד על כל שימוש לא מורשה בחשבון</li>
                    <li>לא להעביר את החשבון לאחרים</li>
                  </ul>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#4B2E83] mb-4 font-agrandir-text-bold">
                  4. הזמנת שיעורים ותשלומים
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-[#4B2E83] mb-2">הזמנות:</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 mr-4">
                      <li>הזמנות מתבצעות דרך האתר בלבד</li>
                      <li>הזמנה תיחשב כמושלמת רק לאחר אישור התשלום</li>
                      <li>שמירת מקום בשיעור מותנית בתשלום מלא</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[#4B2E83] mb-2">תשלומים:</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 mr-4">
                      <li>המחירים מוצגים בשקלים חדשים כולל מע"מ</li>
                      <li>תשלום מתבצע באמצעות כרטיסי אשראי מאובטחים</li>
                      <li>אישור התשלום יישלח בדוא"ל</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#4B2E83] mb-4 font-agrandir-text-bold">
                  5. ביטולים והחזרים
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-[#4B2E83] mb-2">ביטול שיעור:</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 mr-4">
                      <li>ניתן לבטל שיעור עד 48 שעות לפני מועד השיעור</li>
                      <li>ביטול מאוחר יותר לא יזכה בהחזר</li>
                      <li>במקרה של ביטול מצד הסטודיו, יוצע שיעור חלופי או החזר מלא</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[#4B2E83] mb-2">החזרים:</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 mr-4">
                      <li>החזרים יתבצעו תוך 14 ימי עסקים</li>
                      <li>החזר יועבר לאותו אמצעי תשלום ששימש להזמנה</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#4B2E83] mb-4 font-agrandir-text-bold">
                  6. כללי התנהגות
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  המשתמש מתחייב:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mr-4">
                  <li>להתנהג בכבוד כלפי המדריכים והמשתתפים האחרים</li>
                  <li>להגיע לשיעורים בזמן</li>
                  <li>ללבוש בגדים מתאימים לשיעורי ריקוד</li>
                  <li>לא להפריע למהלך השיעור</li>
                  <li>לציית להוראות הבטיחות</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#4B2E83] mb-4 font-agrandir-text-bold">
                  7. אחריות ובריאות
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-700 leading-relaxed">
                    <strong>המשתמש מתחייב:</strong>
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 mr-4">
                    <li>להודיע על בעיות בריאותיות לפני השיעור</li>
                    <li>להפסיק פעילות במקרה של כאב או אי נוחות</li>
                    <li>לקחת אחריות על בריאותו האישית</li>
                  </ul>
                  <p className="text-gray-700 leading-relaxed">
                    הסטודיו לא יישא באחריות לנזקים הנובעים מהשתתפות בשיעורים, למעט במקרים של רשלנות מצד הסטודיו.
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#4B2E83] mb-4 font-agrandir-text-bold">
                  8. קניין רוחני
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  כל התוכן באתר, כולל טקסטים, תמונות, סרטונים ולוגו, הוא קניינה של אביגיל דאנס סטודיו.
                  אסור להעתיק, להפיץ או להשתמש בתוכן ללא אישור בכתב.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#4B2E83] mb-4 font-agrandir-text-bold">
                  9. הגבלת אחריות
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  הסטודיו לא יישא באחריות לנזקים עקיפים, תוצאתיים או מיוחדים הנובעים משימוש בשירותים.
                  האחריות מוגבלת לסכום התשלום ששולם עבור השירות הספציפי.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#4B2E83] mb-4 font-agrandir-text-bold">
                  10. שינויים בתנאים
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  הסטודיו רשאי לעדכן תנאים אלה מעת לעת. שינויים יפורסמו באתר ויישלחו למשתמשים בדוא"ל.
                  המשך השימוש באתר לאחר פרסום השינויים מהווה הסכמה לתנאים החדשים.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#4B2E83] mb-4 font-agrandir-text-bold">
                  11. דין שיפוט ופתרון מחלוקות
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  תנאים אלה כפופים לדין הישראלי. כל מחלוקת תיפתר בבית המשפט המוסמך בתל אביב-יפו.
                  במקרה של מחלוקת, ייעשה ניסיון לפתור אותה בדרכי שלום לפני פנייה לבית המשפט.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#4B2E83] mb-4 font-agrandir-text-bold">
                  12. יצירת קשר
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  לשאלות או הבהרות בנוגע לתנאי השימוש, ניתן ליצור קשר:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">
                    <strong>דוא"ל:</strong> terms@ladance.co.il<br />
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

export default TermsOfService; 