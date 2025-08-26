import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { Link } from 'react-router-dom';

const PhysicalAccessibility: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FDF9F6]">
      <Navbar />
      <main className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
            <h1 className="text-3xl md:text-4xl font-bold text-[#4B2E83] mb-8 text-center font-agrandir-grand">
              נגישות שירותים פיזיים - סטודיו
            </h1>
            
            <div className="prose prose-lg max-w-none text-right" dir="rtl">
              <p className="text-gray-600 mb-6">
                <strong>תאריך עדכון אחרון:</strong> 26 באוגוסט 2025
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-[#2B2B2B] text-sm">
                  <strong>מחויבות משפטית:</strong> דף זה מהווה חלק מהצהרת הנגישות של Ladances 
                  ועומד בדרישות תקן ישראלי 5568 וחוק שוויון זכויות לאנשים עם מוגבלות התשנ"ח-1998.
                </p>
              </div>
              
              

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#4B2E83] mb-4 font-agrandir-text-bold">
                  מידע כללי על הסטודיו
                </h2>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                  <p className="text-[#2B2E83] mb-2"><strong>שם הסטודיו:</strong> Ladances</p>
                  <p className="text-[#2B2E83] mb-2"><strong>כתובת:</strong> יוסף לישנסקי 6, ראשון לציון</p>
                  <p className="text-[#2B2E83] mb-2"><strong>שעות פעילות:</strong> ימים א'-ה' 9:00-22:00, ו' 9:00-15:00</p>
                  <p className="text-[#2B2E83] mb-2"><strong>טלפון:</strong> 03-1234567</p>
                  <p className="text-[#2B2E83] mb-2"><strong>אימייל:</strong> accessibility@ladances.com</p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#4B2E83] mb-4 font-agrandir-text-bold">
                  מצב נגישות פיזית - מידע חשוב
                </h2>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <h3 className="text-xl font-semibold text-[#4B2E83] mb-3">הסטודיו אינו נגיש פיזית:</h3>
                  <p className="text-[#2B2E83] mb-3">
                    חשוב לציין שהסטודיו שלנו ממוקם בקומה עליונה עם גישה באמצעות מדרגות בלבד. 
                    אין רמפה נגישה או מעלית לסטודיו.
                  </p>
                  <ul className="list-disc list-inside text-[#2B2E83] space-y-1 mr-4">
                    <li><strong>גישה לסטודיו:</strong> מדרגות בלבד - אין רמפה נגישה</li>
                    <li><strong>מעלית:</strong> לא קיימת מעלית בבניין</li>
                    <li><strong>שירותים:</strong> שירותים רגילים בקומה העליונה</li>
                    <li><strong>חניה:</strong> חניה רגילה+ חניית נכים נגישה אחת</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <h3 className="text-xl font-semibold text-[#4B2E83] mb-3">התאמות אלטרנטיביות:</h3>
                  <p className="text-[#2B2E83] mb-3">
                    למרות המגבלות הפיזיות, אנו מציעים פתרונות אלטרנטיביים:
                  </p>
                  <ul className="list-disc list-inside text-[#2B2E83] space-y-1 mr-4">
                    <li><strong>שיעורים מקוונים:</strong> שיעורי ריקוד מקוונים עם מדריכים מקצועיים</li>
                    <li><strong>סדנאות מיוחדות:</strong> סדנאות במקומות נגישים לפי תיאום מראש</li>
                    <li><strong>תמיכה טכנית:</strong> תמיכה טכנית בשיעורים מקוונים</li>
                  </ul>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#4B2E83] mb-4 font-agrandir-text-bold">
                  נגישות דיגיטלית - תמיכה מלאה
                </h2>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <h3 className="text-xl font-semibold text-[#4B2E83] mb-3">האתר נגיש לחלוטין:</h3>
                  <ul className="list-disc list-inside text-[#2B2E83] space-y-1 mr-4">
                    <li><strong>תמיכה במקלדת:</strong> ניווט מלא באמצעות מקלדת</li>
                    <li><strong>קוראי מסך:</strong> תמיכה מלאה בקוראי מסך</li>
                    <li><strong>ניגודיות צבעים:</strong> עומד בתקן AA</li>
                    <li><strong>הגדלת טקסט:</strong> תמיכה בהגדלה עד 200%</li>
                    <li><strong>תיאורים לתמונות:</strong> טקסט חלופי לכל התמונות</li>
                    <li><strong>טפסים נגישים:</strong> טפסים עם תוויות ברורות</li>
                  </ul>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h3 className="text-xl font-semibold text-[#4B2E83] mb-3">שירותים מקוונים נגישים:</h3>
                  <ul className="list-disc list-inside text-[#2B2E83] space-y-1 mr-4">
                    <li><strong>רישום מקוון:</strong> רישום לשיעורים דרך האתר</li>
                    <li><strong>תשלומים מקוונים:</strong> תשלומים מאובטחים דרך האתר</li>
                    <li><strong>צ'אט תמיכה:</strong> תמיכה מקוונת נגישה</li>
                    <li><strong>אימייל נגיש:</strong> תכתובת נגישה</li>
                    <li><strong>חנות נגישה: </strong>חנות מקוונת נגישה</li>

</ul>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#4B2E83] mb-4 font-agrandir-text-bold">
                  יצירת קשר לנגישות
                </h2>
              

                <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
                  <h3 className="font-bold text-[#4B2E83] mb-2">טופס פנייה לנגישות באתר</h3>
                  <p className="text-[#2B2E83] text-sm mb-2">
                    ניתן למלא טופס פנייה לנגישות ישירות באתר תחת "צור קשר".
                  </p>
                  <p className="text-[#2B2E83] text-sm">
                    הטופס כולל שדות נגישים עם תיאורים מפורטים ותמיכה מלאה במקלדת.
                  </p>
                </div>
              </section>

             
              <div className="border-t border-gray-200 pt-4">
                <p className="text-gray-600 text-sm text-center">
                  דף זה מתעדכן מעת לעת בהתאם לשיפורים בנגישות הסטודיו. 
                  עדכון אחרון: 26 באוגוסט 2025. דף זה מהווה חלק בלתי נפרד מהצהרת הנגישות של האתר.
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

export default PhysicalAccessibility;
