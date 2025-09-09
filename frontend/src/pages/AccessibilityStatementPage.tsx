import React from 'react';

const AccessibilityStatementPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">הצהרת נגישות</h1>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">התאמות הנגישות באתר</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          אנו שואפים להבטיח שאתר האינטרנט שלנו יהיה נגיש לכלל המשתמשים, ללא קשר ליכולותיהם. 
          השקענו מאמצים רבים להנגיש את האתר בהתאם להמלצות התקן הישראלי (ת"י 5568) ולרמת AA של הנחיות הנגישות לתוכן אינטרנט (WCAG 2.0).
        </p>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">להלן חלק מההתאמות שבוצעו:</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>ניווט מקלדת מלא: ניתן לנווט בכל חלקי האתר באמצעות המקלדת בלבד.</li>
          <li>תמיכה בקוראי מסך: האתר מותאם לעבודה עם קוראי מסך פופולריים.</li>
          <li>היררכיית כותרות סמנטית: מבנה האתר כולל כותרות היררכיות ברורות לניווט קל.</li>
          <li>תיאורי תמונה (Alt Text): לכל התמונות המשמעותיות באתר נוספו תיאורי טקסט חלופיים.</li>
          <li>ניגודיות צבעים מספקת: הקפדה על יחסי ניגודיות גבוהים מספיק בין טקסט לרקע.</li>
          <li>טקסט תיאורי לקישורים וכפתורים: כל הקישורים והכפתורים מכילים טקסט תיאורי וברור.</li>
          <li>טיפול בשגיאות טפסים: הודעות שגיאה בטפסים ברורות ונגישות לקוראי מסך.</li>
          <li>שדות חובה ברורים: שדות חובה בטפסים מזוהים באופן ברור.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">מגבלות נגישות ידועות</h2>
        <p className="text-gray-700 leading-relaxed">
          חרף מאמצינו להנגיש את כל חלקי האתר, ייתכנו חלקים שעדיין אינם נגישים באופן מלא. אנו ממשיכים לפעול לשיפור הנגישות וטיפול בכל ליקוי שעשוי להתגלות.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">פנייה לרכזת הנגישות</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          אם נתקלתם בבעיית נגישות באתר או שיש לכם הצעות לשיפור, נשמח שתצרו עמנו קשר:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li><strong>שם רכזת הנגישות:</strong> אביגיל דנס סטודיו</li>
          <li><strong>טלפון:</strong> 05X-XXXXXXX</li>
          <li><strong>דוא"ל:</strong> accessibility@example.com</li>
          <li><strong>שעות פעילות:</strong> ימים א-ה, 9:00-17:00</li>
        </ul>
      </section>
    </div>
  );
};

export default AccessibilityStatementPage;
