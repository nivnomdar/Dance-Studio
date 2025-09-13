import React from 'react';
import { motion } from 'framer-motion';

const AccessibilityStatementPage = () => {
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      className="min-h-screen bg-gray-50 py-8 sm:py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-4xl mx-auto bg-white p-6 sm:p-8 rounded-lg shadow-md">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#4B2E83] mb-4 sm:mb-6 font-agrandir-grand">הצהרת נגישות</h1>

        <section className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3">מחויבותנו לנגישות</h2>
          <p className="text-gray-700 leading-relaxed">
            אנו בסטודיו אביגיל למחול מחויבות להבטיח ששירותינו יהיו נגישים למגוון הרחב ביותר של משתמשות,
            ללא קשר ליכולותיהן. אנו שואפות לספק חווית גלישה שוויונית, מכבדת ומהנה לכולן.
            אנו פועלות רבות כדי שהאתר שלנו יעמוד בדרישות הנגישות, תוך התאמה לתקן הישראלי ת"י 5568
            (הנגשת אתרי אינטרנט) ולעקרונות המנחים של WCAG 2.0 ברמת AA.
          </p>
        </section>

        <section className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3">פעולות נגישות שבוצעו</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700 leading-relaxed">
            <li>מבנה סמנטי: שימוש נכון בתגי HTML כגון כותרות (H1-H6), רשימות, וטקסטים חלופיים לתמונות (alt text).</li>
            <li>ניווט מקלדת: כל האלמנטים האינטראקטיביים באתר ניתנים לגישה ולתפעול באמצעות מקלדת בלבד.</li>
            <li>ניגודיות צבעים: הקפדה על יחסי ניגודיות גבוהים מספיק בין טקסט לרקע, בהתאם לדרישות WCAG 2.0 AA.</li>
            <li>התאמה למסכי קורא: האתר מותאם לעבודה עם תוכנות קורא מסך, כולל שימוש בתכונות ARIA.</li>
            <li>עיצוב רספונסיבי: האתר מותאם לגדלי מסך שונים ולמכשירים ניידים.</li>
          </ul>
        </section>

        <section className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3">מגבלות נגישות ידועות</h2>
          <p className="text-gray-700 leading-relaxed">
            אנו עושות את מירב המאמצים להנגיש את כל חלקי האתר. ייתכנו מקרים שבהם
            בשל מגבלות טכנולוגיות או תוכני צד שלישי (כמו סרטונים חיצוניים), חלקים מסוימים
            לא יהיו נגישים לחלוטין. אנו פועלות לתיקון מגבלות אלו בהקדם האפשרי.
          </p>
        </section>

        <section className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3">פנייה לרכזת נגישות</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            אם נתקלת בקשיי נגישות באתר, או אם יש לך הערות, הצעות או שאלות בנושא,
            נשמח לשמוע ממך. אנא צרי קשר עם רכזת הנגישות שלנו:
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li>שם: [שם רכזת נגישות]</li>
            <li>טלפון: [מספר טלפון]</li>
            <li>דוא"ל: [כתובת דוא"ל]</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-3">
            אנו מתחייבות לעשות כל שביכולתנו לטפל בפנייתך במהירות וביעילות.
          </p>
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3">עדכון הצהרת הנגישות</h2>
          <p className="text-gray-700 leading-relaxed">
            הצהרת נגישות זו עודכנה לאחרונה ב-13 בספטמבר 2025.
            אנו נמשיך לבצע עדכונים ושיפורים בנגישות האתר באופן שוטף.
          </p>
        </section>
      </div>
    </motion.div>
  );
};

export default AccessibilityStatementPage;
